import type { Shipment, ShipmentMethod } from '@/model'
import { request } from './Request'

/**
 * 獲取訂單項目物流信息
 * 
 * @param orderId - 訂單 ID，必填
 * @returns Promise<Shipment> - 訂單相關的物流
 */
export async function getOrderShipment(orderId: number): Promise<Shipment> {
  return await request<Shipment>('/api/orders/shipment', 'GET', { orderId })
}

/**
 * 更新訂單物流信息
 * 
 * @param data - 物流更新數據
 * @param data.orderId - 訂單 ID，必填
 * @param data.method - 物流方式：post中華郵政/seven-11/family全家
 * @param data.trackingNumber - 物流追蹤編號
 * @param data.shippingAddress - 寄送地址
 * @param data.recipientName - 收件人姓名
 * @param data.recipientPhone - 收件人電話
 * @returns Promise<Shipment[]> - 更新後的物流單列表
 */
export async function updateOrderShipment(data: {
  orderId: number;
  method: ShipmentMethod;
  trackingNumber: string;
  shippingAddress: string;
  recipientName: string;
  recipientPhone: string;
}): Promise<Shipment> {
  return await request<Shipment>('/api/orders/shipment', 'PUT', data)
}
