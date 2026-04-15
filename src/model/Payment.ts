export type PaymentMethod = 'credit_card_one_time' | 'atm_virtual' | 'taiwan_pay' | 'cash';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

/**
 * Payment API 回應模型
 * 
 * 付款記錄實體，記錄訂單的付款信息，包含付款方式、金流資訊、付款狀態和時間軸
 * 
 * @property id - 付款記錄唯一識別碼，主鍵
 * @property orderId - 訂單 ID，外鍵（有付款記錄的訂單不能被刪除）
 * @property method - 付款方式：credit_card_one_time一次付清信用卡/atm_virtual虛擬帳號轉帳/taiwan_pay台灣支付/cash現金
 * @property transactionId - 金流平台交易編號，用於對帳和查詢
 * @property amount - 付款金額（必須 > 0）
 * @property status - 付款狀態：pending處理中/paid已付款/failed失敗/refunded已退款
 * @property createdAt - 記錄建立時間
 * @property paidAt - 付款時間（必須 >= createdAt）
 * @property refundedAt - 退款時間（必須 >= paidAt）
 * @property snapshot - 金流平台回傳的完整交易資訊，儲存格式 JSONB
 */
export interface Payment {
  id: number;
  orderId: number;
  method: PaymentMethod;
  transactionId: string | null;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  paidAt: string | null;
  refundedAt: string | null;
  snapshot: Record<string, any> | null;
}
