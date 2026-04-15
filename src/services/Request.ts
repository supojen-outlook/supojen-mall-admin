import axios, { type Method, type AxiosRequestConfig } from "axios";
import { useAccountStore } from "@/stores";
import { getValidToken, clearToken } from './antiforgery';

/**
 * ============================================
 * ⭐ API 錯誤類 (ApiError)
 * ============================================
 * 
 * 自定義 API 錯誤類，用於統一封裝後端返回的錯誤信息。
 * 繼承自原生 Error 類，添加靜態工廠方法便於從 Axios 錯誤創建實例。
 * 
 * @class ApiError
 * @extends Error
 * 
 * @example
 * ```ts
 * throw new ApiError('用戶未登入');
 * 
 * // 從 Axios 錯誤創建
 * throw ApiError.fromAxiosError(error, '請求失敗');
 * ```
 */
class ApiError extends Error {
  /**
   * 創建 API 錯誤實例
   * @param message - 錯誤消息，會顯示給用戶
   */
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }

  /**
   * 從 Axios 錯誤創建 ApiError 實例
   * 
   * 優先使用後端返回的錯誤標題 (response.data.title)，
   * 如果不存在則使用預設錯誤消息。
   * 
   * @param error - Axios 錯誤對象
   * @param defaultMessage - 預設錯誤消息（當後端未返回具體錯誤時使用）
   * @returns ApiError 實例
   */
  static fromAxiosError(error: any, defaultMessage: string): ApiError {
    const message = error.response?.data?.title || defaultMessage;
    return new ApiError(message);
  }
}

/**
 * API 全域配置
 * 
 * @property BASE_URL - API 服務器基礎 URL，所有 API 請求都會基於此地址
 */
const API_CONFIG = {
  BASE_URL: 'https://localhost:7175'
}

/**
 * 建立 Axios 實例
 * 
 * 所有的 API 請求都會透過這個實例發送，統一管理配置和攔截器
 * 
 * @property baseURL - API 基礎 URL
 * @property timeout - 請求超時時間（10秒）
 * @property withCredentials - 攜帶認證 Cookie，確保跨域請求能正確傳遞憑證
 * @property headers - 預設請求頭，設置為 JSON 格式
 */
const worker = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  withCredentials: true, // 確保攜帶 Cookie (包含 Antiforgery Cookie)
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * ============================================
 * ⭐ 請求攔截器 (Request Interceptor)
 * ============================================
 * 
 * 在每個請求發出之前自動執行，主要功能：
 * 1. 自動管理並附加防偽令牌
 * 2. 確保只有會改變伺服器狀態的請求才添加令牌
 * 
 * @param config - Axios 請求配置對象
 * @returns Promise - 返回修改後的配置，繼續請求流程
 */
worker.interceptors.request.use(async config => {
  // 僅針對會改變伺服器狀態的請求方法添加令牌
  // 這些方法通常需要 CSRF 保護
  const stateChangingMethods = ['post', 'put', 'delete', 'patch'];
  const currentMethod = config.method?.toLowerCase() || '';

  if (stateChangingMethods.includes(currentMethod)) {
    // 獲取有效的令牌（如果過期會在此處自動非同步刷新）
    const token = await getValidToken();
    if (token) {
      // 將令牌添加到請求頭，用於 CSRF 保護
      config.headers['X-CSRF-TOKEN'] = token;
    } else {
      // 如果無法獲取令牌，記錄警告但不阻止請求
      console.warn('⚠️ 無法獲取有效的防偽令牌，請求可能被伺服器拒絕');
    }
  }
  
  return config;
}, error => {
  // 攔截器錯誤處理，通常很少發生
  return Promise.reject(error);
});

/**
 * ============================================
 * ⭐ 響應攔截器 (Response Interceptor)
 * ============================================
 * 
 * 統一處理所有 API 響應，包括：
 * 1. 401 身分驗證失敗 - 自動登出並重導向登入頁面
 * 2. 400 防偽驗證失敗 - 清除本地令牌緩存
 * 3. 其他錯誤 - 統一錯誤處理流程
 * 
 * @param response - 成功的響應對象
 * @param error - 失敗的錯誤對象
 * @returns Promise - 成功時返回響應，失敗時返回拒絕的 Promise
 */
worker.interceptors.response.use(
  response => response,
  error => {
    // 1. 統一處理 401 身分驗證失敗
    if (error.response?.status === 401) {
      // 清除用戶狀態並重導向到登入頁面
      useAccountStore().logout();
      window.location.href = '/login';
    }
    
    // 2. ⭐ 統一處理防偽驗證失敗 (通常為 400 且含有 Antiforgery 關鍵字)
    if (error.response?.status === 400 && 
        error.response?.data?.detail?.toLowerCase().includes('antiforgery')) {
      console.log('🛑 防偽驗證失敗，正在清除本地令牌緩存');
      // 清除可能已過期的本地令牌
      clearToken();
    }
    
    // 3. 其他錯誤交由調用方處理
    return Promise.reject(error);
  }
);

/**
 * 處理陣列參數，將陣列轉換為逗號分隔的字符串
 * 
 * 這個函數解決了 Axios 默認將陣列參數轉換為 `ids[]=1&ids[]=2` 格式的問題
 * 將其轉換為後端期望的 `ids=1,2` 格式
 * 
 * @param params - 原始參數對象
 * @returns 處理後的參數對象，陣列參數已轉換為字符串
 */
function processArrayParams(params: any): any {
  if (!params) return params;
  
  const processed = { ...params };
  
  // 遍歷所有參數，檢查是否為陣列
  Object.keys(processed).forEach(key => {
    if (Array.isArray(processed[key])) {
      // 將陣列轉換為逗號分隔的字符串
      // 例如：[1, 2, 3] → "1,2,3"
      processed[key] = processed[key].join(',');
    }
  });
  
  return processed;
}

/**
 * ============================================
 * ⭐ 統一請求函數 (request)
 * ============================================
 * 
 * 所有 API 服務的核心請求函數，提供統一的請求介面和錯誤處理。
 * 
 * 核心功能：
 * 1. 參數過濾 - 自動移除 undefined、null、空字符串
 * 2. 陣列處理 - GET 請求將陣列轉為逗號分隔字符串
 * 3. 方法區分 - GET/DELETE 使用 query string，POST/PUT 使用 body
 * 4. 錯誤封裝 - 將 Axios 錯誤轉換為 ApiError，提取後端錯誤信息
 * 
 * @template T - 響應數據類型，由調用方指定
 * 
 * @param path - API 路徑，例如 '/api/products'、'/api/users/123'
 * @param method - HTTP 請求方法：'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
 * @param params - 請求參數對象
 *   - GET/DELETE：參數會轉為 URL query string (?key=value)
 *   - POST/PUT/PATCH：參數會作為 JSON body 發送
 * @param _errMessage - 預設錯誤消息，當後端未返回具體錯誤時使用
 * 
 * @returns Promise<T> - 返回指定類型的響應數據
 * 
 * @throws {ApiError} - 當請求失敗時拋出，包含後端返回的錯誤信息
 * 
 * @example
 * ```ts
 * // GET 請求
 * const users = await request<User[]>('/api/users', 'GET', { page: 1 });
 * 
 * // POST 請求
 * const newUser = await request<User>('/api/users', 'POST', { name: 'John' });
 * 
 * // 帶陣列參數的 GET 請求（自動轉換為逗號分隔）
 * const result = await request<Product[]>('/api/products', 'GET', { ids: [1, 2, 3] });
 * // 實際發送：/api/products?ids=1,2,3
 * 
 * // 錯誤處理
 * try {
 *   await request('/api/protected', 'GET');
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     ElMessage.error(error.message);
 *   }
 * }
 * ```
 */
async function request<T = void>(
  path: string, 
  method: Method, 
  params: any = {},
  _errMessage: string = '請求失敗'
): Promise<T> {
  try {
    // 第一步：過濾掉空值、null 和 undefined 的參數
    // 這確保不會將無用的空參數添加到 URL 或請求體中
    const filteredParams = params ? Object.fromEntries(
      Object.entries(params).filter(([_, value]) => 
        value !== undefined && value !== null && value !== ''
      )
    ) : {};

    // 第二步：處理陣列參數
    // 將所有陣列參數轉換為逗號分隔的字符串
    // 例如：{ ids: [1, 2, 3] } → { ids: "1,2,3" }
    const processedParams = processArrayParams(filteredParams);

    // 第三步：構建 Axios 請求配置
    const upperMethod = method.toString().toUpperCase();
    const config: AxiosRequestConfig = {
      method: upperMethod,
      url: path
    };

    // 第四步：根據請求方法區分參數傳遞方式
    if (['GET', 'DELETE'].includes(upperMethod)) {
      // GET 和 DELETE 請求：參數作為 query string 傳遞
      // 處理後的參數會被 Axios 序列化為 URL 查詢參數
      // 例如：{ ids: "1,2,3" } → ?ids=1,2,3
      config.params = processedParams;
    } else {
      // POST、PUT、PATCH 請求：參數作為 request body 傳遞
      // 對於這些請求，我們保持陣列的原始格式
      config.data = params; // 使用原始參數，不進行陣列處理
    }

    // 第五步：發送請求並返回響應
    const response = await worker.request(config);
    return response.data as T;

  } catch (err: any) {
    // 將原始 Axios 錯誤轉換為 ApiError
    // 這確保所有調用方都能獲得統一的錯誤格式和後端錯誤信息
    throw ApiError.fromAxiosError(err, _errMessage);
  }
} 

/**
 * ============================================
 * 導出的 API 配置和工具
 * ============================================
 * 
 * @exports request - 統一請求函數，所有 API 服務的基礎
 * @exports worker - Axios 實例，用於需要自定義配置的場景（如文件上傳進度監控）
 * @exports API_CONFIG - API 配置對象，包含 BASE_URL 等全局配置
 */
export {
  request,      // 統一的請求函數，推薦所有服務使用
  worker,       // Axios 實例，供特殊場景使用（如文件上傳、進度監控）
  API_CONFIG    // API 配置，供其他地方引用基礎 URL 等配置
};
