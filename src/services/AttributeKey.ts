import type { AttributeKey, Pagination } from '@/model'
import { request } from './Request'

/**
 * 查詢屬性鍵值總數量
 * @returns 返回符合條件的屬性鍵值總數量
 */
export async function getAttributeKeyCount(): Promise<number> {
  return await request<number>('/api/attributes/keys/count', 'GET')
}

/**
 * 獲取屬性鍵值列表
 * @param params 查詢參數
 * @param params.size - 每頁資料筆數，預設 1000
 * @param params.cursor - 分頁游標，用於分頁
 * @param params.search - 搜尋關鍵字，會在 Name、Description 中搜尋
 * @param params.status - 屬性鍵值狀態，用於篩選啟用或停用的屬性鍵值
 * @param params.ids - 指定的屬性鍵值 ID 陣列
 * @param params.categoryId - 分類 ID，用於篩選特定分類的屬性鍵值
 * @param params.forSales - 是否為銷售屬性，用於篩選銷售屬性
 * @returns 返回屬性鍵值列表
 */
export async function getAttributeKeys(params?: {
  size?: number;
  cursor?: string;
  search?: string;
  status?: 'active' | 'inactive';
  ids?: number[];
  categoryId?: number;
  forSales?: boolean;
}): Promise<Pagination<AttributeKey>> {
  return await request<Pagination<AttributeKey>>('/api/attributes/keys', 'GET', params)
}

/**
 * 創建屬性鍵值
 * @param data 屬性鍵值數據
 * @param data.name - 屬性顯示名稱，如：顏色、尺寸
 * @param data.description - 屬性詳細描述
 * @param data.inputType - 前端輸入類型：select下拉選單/text文字/number數字/checkbox複選框
 * @param data.isRequired - 是否為必填屬性
 * @param data.forSales - 是否為銷售屬性：TRUE用於SKU生成/FALSE僅為描述
 * @param data.status - 屬性狀態：active啟用，inactive停用
 * @returns 返回創建的屬性鍵值
 */
export async function createAttributeKey(data: {
  name: string;
  description?: string;
  inputType: 'select' | 'text' | 'number' | 'checkbox';
  isRequired: boolean;
  forSales: boolean;
  status: 'active' | 'inactive';
}): Promise<AttributeKey> {
  return await request<AttributeKey>('/api/attributes/keys', 'POST', data)
}

/**
 * 更新屬性鍵值
 * @param data 屬性鍵值更新數據
 * @param data.id - 屬性唯一識別碼
 * @param data.name - 屬性顯示名稱，如：顏色、尺寸
 * @param data.description - 屬性詳細描述
 * @param data.inputType - 前端輸入類型：select下拉選單/text文字/number數字/checkbox複選框
 * @param data.isRequired - 是否為必填屬性
 * @param data.status - 屬性狀態：active啟用，inactive停用
 * @param data.forSales - 是否為銷售屬性：TRUE用於SKU生成/FALSE僅為描述
 * @param data.unit - 單位，如：cm(公分)、g(公克)
 * @returns 返回更新後的屬性鍵值
 */
export async function updateAttributeKey(data: {
  id: number;
  name: string;
  description?: string;
  inputType: 'select' | 'text' | 'number' | 'checkbox';
  isRequired: boolean;
  status: 'active' | 'inactive';
  forSales: boolean;
  unit?: string;
}): Promise<AttributeKey> {
  return await request<AttributeKey>('/api/attributes/keys', 'PUT', data)
}

/**
 * 刪除屬性鍵值
 * @param params 刪除參數
 * @param params.id - 要刪除的屬性鍵值 ID
 * @returns 返回刪除結果
 */
export async function deleteAttributeKey(params: {
  id: number;
}): Promise<void> {
  return await request<void>('/api/attributes/keys', 'DELETE', params)
}
