import type { Pagination, Order, OrderItem } from '@/model'
import { request } from './Request'

/**
 * 獲取訂單列表
 * 
 * @param params - 查詢參數
 * @param params.userId - 顧客 ID，用於篩選特定用戶的訂單
 * @param params.status - 訂單狀態：created/paid/shipped/completed/closed
 * @param params.search - 搜尋關鍵字，可搜索訂單編號
 * @param params.cursor - 分頁遊標，用於獲取下一頁
 * @param params.size - 每頁大小，預設 20
 * @returns Promise<Pagination<Order>> - 分頁的訂單列表
 */
export async function getOrders(params?: {
  userId?: number;
  status?: string;
  search?: string;
  cursor?: string;
  size?: number;
}): Promise<Pagination<Order>> {
  // 過濾掉空值、null 和 undefined 的參數
  const filteredParams = params ? Object.fromEntries(
    Object.entries(params).filter(([_, value]) => 
      value !== undefined && value !== null && value !== ''
    )
  ) : {};
  
  return await request<Pagination<Order>>('/api/orders', 'GET', filteredParams)
}

/**
 * 獲取訂單項目
 * 
 * @param orderId - 訂單 ID，必填
 * @returns Promise<Pagination<OrderItem>> - 訂單項目列表
 */
export async function getOrderItems(orderId: number): Promise<Pagination<OrderItem>> {
  return await request<Pagination<OrderItem>>('/api/orders/items', 'GET', { orderId })
}
