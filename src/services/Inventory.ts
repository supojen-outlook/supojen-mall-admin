import { request } from './Request'
import type { Pagination, Inventory } from '@/model'

/**
 * 創建庫存記錄
 * 
 * @param data - 庫存創建數據
 * @param data.skuId - SKU ID，必填，必須是資料庫中已存在的 SKU ID
 * @param data.locationId - 儲位 ID，必填，必須是資料庫中已存在的儲位 ID
 * @param data.quantity - 初始庫存數量，必填，必須 >= 0
 * @returns Promise<Inventory> - 創建的庫存記錄
 */
export async function createInventory(data: {
  skuId: number;
  locationId: number;
  quantity: number;
}): Promise<Inventory> {
  return await request<Inventory>('/api/inventories', 'POST', data)
}

/**
 * 獲取庫存記錄分頁列表
 * 
 * @param params - 查詢參數
 * @param params.skuId - SKU ID，可選，篩選特定 SKU 的庫存
 * @param params.locationId - 儲位 ID，可選，篩選特定儲位的庫存
 * @param params.size - 每頁數量，可選，預設值：10
 * @param params.cursor - 當前頁面的游標，可選
 * @returns Promise<Pagination<Inventory>> - 分頁庫存記錄列表
 */
export async function getInventories(params?: {
  skuId?: number;
  locationId?: number;
  size?: number;
  cursor?: string;
}): Promise<Pagination<Inventory>> {
  return await request<Pagination<Inventory>>('/api/inventories', 'GET', params)
}

/**
 * 更新庫存記錄
 * 
 * @param data - 庫存更新數據
 * @param data.id - 庫存記錄 ID，必填，必須是資料庫中已存在的庫存記錄 ID
 * @param data.quantityOnHand - 實際庫存數量，可選，必須 >= 0
 * @returns Promise<Inventory> - 更新後的庫存記錄
 */
export async function updateInventory(data: {
  id: number;
  quantityOnHand?: number;
}): Promise<Inventory> {
  return await request<Inventory>(`/api/inventories`, 'PUT', data)
}

/**
 * 刪除庫存記錄
 * 
 * @param id - 庫存記錄 ID，必填，必須是資料庫中已存在的庫存記錄 ID
 * @returns Promise<void> - 無返回內容
 */
export async function deleteInventory(id: number): Promise<void> {
  return await request<void>(`/api/inventories/${id}`, 'DELETE')
}
