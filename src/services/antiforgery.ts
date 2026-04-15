import axios from 'axios';
import { API_CONFIG } from './Request';

/**
 * 防偽令牌管理服務
 * 負責儲存、檢查過期以及自動刷新 ASP.NET Core 的 RequestToken
 */

let currentRequestToken = '';
let tokenExpireTime = 0;

/**
 * 初始化或重新獲取防偽令牌
 * 從後端 API 獲取最新的 requestToken 並儲存在記憶體中
 */
export const initAntiforgery = async () => {
  try {
    // 清除舊 Token，確保獲取新 Token
    currentRequestToken = '';
    tokenExpireTime = 0;
    
    const response = await axios.get(`${API_CONFIG.BASE_URL}/api/antiforgery/token`, {
      withCredentials: true // 重要：確保能攜帶和接收 Cookie
    });
    
    // 儲存後端回傳的 requestToken 欄位
    currentRequestToken = response.data.requestToken;
    
    // 設置過期時間（建議設為 15 分鐘，通常比後端 Session 稍短以保安全）
    tokenExpireTime = Date.now() + 15 * 60 * 1000;
    
    return currentRequestToken;
  } catch (error) {
    console.error('❌ 獲取防偽令牌失敗:', error);
    // 清除可能無效的 Token
    currentRequestToken = '';
    tokenExpireTime = 0;
    return null;
  }
};

/**
 * 檢查當前令牌是否已過期
 */
export const isTokenExpired = () => {
  return Date.now() >= tokenExpireTime;
};

/**
 * 獲取有效的令牌
 * 如果令牌不存在或已過期，會自動呼叫 API 進行刷新
 */
export const getValidToken = async () => {
  if (!currentRequestToken || isTokenExpired()) {
    console.log('🔄 令牌不存在或已過期，正在自動刷新...');
    await initAntiforgery();
  }
  return currentRequestToken;
};

/**
 * 清除令牌狀態
 * 通常在收到 400 Antiforgery 相關錯誤時調用
 */
export const clearToken = () => {
  currentRequestToken = '';
  tokenExpireTime = 0;
};
