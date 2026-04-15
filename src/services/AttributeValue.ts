import type { AttributeValue, Pagination } from '@/model'
import { request } from './Request'

/**
 * 根據屬性鍵值 ID 獲取屬性值列表
 * @param params 查詢參數
 * @param params.id - 屬性鍵值 ID，用於獲取該屬性的所有值
 * @returns 返回屬性值列表
 */
export async function getAttributeValues(params: {
  id: number;
}): Promise<Pagination<AttributeValue>> {
  return await request<Pagination<AttributeValue>>('/api/attributes/values', 'GET', params)
}

/**
 * 更新屬性值
 * @param data 更新數據
 * @param data.id - 屬性值唯一識別碼
 * @param data.value - 屬性值內容，如：紅色、XL
 * @param data.sortOrder - 排序順序，數字越小越前面
 * @param data.description - 屬性值詳細描述
 * @returns 返回更新後的屬性值
 */
export async function updateAttributeValue(data: {
  id: number;
  value: string;
  sortOrder: number;
  description?: string;
}): Promise<AttributeValue> {
  return await request<AttributeValue>('/api/attributes/values', 'PUT', data)
}

/**
 * 刪除屬性值
 * @param params 刪除參數
 * @param params.id - 屬性值唯一識別碼
 * @returns 返回刪除結果
 */
export async function deleteAttributeValue(params: {
  id: number;
}): Promise<void> {
  return await request<void>('/api/attributes/values', 'DELETE', params)
}
