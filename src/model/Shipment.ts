export type ShipmentMethod = 'post' | 'seven' | 'family';

/**
 * Shipment API 回應模型
 * 
 * 物流單實體，記錄訂單項目的物流信息，包含物流方式、追蹤編號、寄送地址和收件人資訊
 * 
 * @property id - 物流單唯一識別碼，主鍵
 * @property orderItemId - 訂單項目 ID，外鍵（級聯刪除）
 * @property method - 物流方式：post中華郵政/seven-11/family全家
 * @property trackingNumber - 物流追蹤編號，用於追蹤包裹運送狀態
 * @property shippingAddress - 寄送地址
 * @property recipientName - 收件人姓名
 * @property recipientPhone - 收件人電話
 * @property shipDate - 出貨日期，記錄實際出貨的日期時間
 * @property deliveredDate - 送達日期，記錄實際送達的日期時間
 * @property createdAt - 記錄建立時間
 */
export interface Shipment {
  id: number;
  orderItemId: number;
  method: ShipmentMethod | null;
  trackingNumber: string | null;
  shippingAddress: string | null;
  recipientName: string;
  recipientPhone: string;
  shipDate: string | null;
  deliveredDate: string | null;
  createdAt: string;
}
