import type { Payment } from '@/model'
import { request } from './Request'

/**
 * 獲取訂單付款信息
 * 
 * @param orderId - 訂單 ID，必填
 * @returns Promise<Payment> - 訂單相關的付款記錄
 */
export async function getOrderPayment(orderId: number): Promise<Payment> {
  return await request<Payment>('/api/orders/payment', 'GET', { orderId })
}
