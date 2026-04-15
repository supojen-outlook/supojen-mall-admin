export type OrderItemStatus = 'pending' | 'shipped' | 'refunded' | 'cancelled';

/**
 * OrderItem API 回應模型
 * 
 * 訂單項目實體，記錄訂單中每個商品的詳細信息，包含商品快照、數量、退貨追蹤和項目狀態
 * 
 * @property id - 訂單項目唯一識別碼，主鍵
 * @property orderId - 所屬訂單 ID，外鍵（級聯刪除）
 * @property productId - 商品 ID，外鍵（有訂單的商品不能被刪除）
 * @property skuId - SKU ID，外鍵（有訂單的 SKU 不能被刪除）
 * @property productName - 下單時的商品名稱（快照）
 * @property productImageUrl - 下單時的商品圖片 URL（快照）
 * @property unitPrice - 下單時的單價（快照，必須 >= 0）
 * @property quantity - 購買數量（必須 > 0）
 * @property returnedQuantity - 已退貨數量（必須 >= 0，且 <= quantity，預設 0）
 * @property status - 項目狀態：pending待處理/shipped已出貨/refunded已退款/cancelled已取消
 * @property createdAt - 項目建立時間
 */
export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  skuId: number;
  productName: string;
  productImageUrl: string;
  unitPrice: number;
  quantity: number;
  returnedQuantity: number;
  status: OrderItemStatus;
  createdAt: string;
}
