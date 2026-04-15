import type { Specification } from './Specification';

export type OrderStatus = 'created' | 'paid' | 'shipped' | 'completed' | 'closed';

/**
 * 訂單項目價格快照
 * 
 * @property productName - 商品名稱（快照）
 * @property skuAttributes - SKU 屬性（快照）
 * @property unitPrice - 原始單價（快照）
 * @property quantity - 數量
 * @property subtotal - 小計金額（unitPrice * quantity）
 */
export interface ItemPriceSnapshot {
  productName: string;
  skuAttributes: Specification[];
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

/**
 * 促銷規則快照
 * 
 * @property ruleType - 規則類型
 * @property tabName - 規則名稱/標籤
 * @property discountAmount - 折扣金額
 */
export interface PromotionRuleSnapshot {
  ruleType: string;
  tabName: string;
  discountAmount: number;
}

/**
 * 優惠券快照
 * 
 * @property name - 優惠券名稱
 * @property discountAmount - 折扣金額
 */
export interface CouponSnapshot {
  name: string;
  discountAmount: number;
}

/**
 * 訂單快照信息
 * 
 * @property itemPrices - 商品價格快照集合，Key: OrderItem.Id
 * @property promotionRules - 使用的促銷規則快照集合
 * @property coupon - 使用的優惠券快照
 * @property shippingFee - 運費
 * @property totalTaxAmount - 稅金總額
 */
export interface OrderSnapshot {
  itemPrices: Record<number, ItemPriceSnapshot>;
  promotionRules: PromotionRuleSnapshot[];
  coupon?: CouponSnapshot | null;
  shippingFee: number;
  totalTaxAmount: number;
}

/**
 * Order API 回應模型
 * 
 * 訂單實體，記錄完整的訂單信息，包含金額、狀態、時間軸和快照信息
 * 
 * @property id - 訂單唯一識別碼，主鍵
 * @property orderNumber - 訂單編號，用於查詢和物流，唯一約束
 * @property userId - 顧客 ID，關聯到 users 表
 * @property status - 訂單狀態：created已建立/paid已付款/shipped已出貨/completed已完成/closed已關閉
 * @property totalAmount - 訂單總金額（必須 >= 0）
 * @property discountAmount - 折扣金額（必須 >= 0，預設 0）
 * @property taxAmount - 稅金金額（必須 >= 0，預設 0）
 * @property shippingAmount - 運費金額（必須 >= 0，預設 0）
 * @property createdAt - 訂單建立時間
 * @property paidAt - 付款時間（必須 >= createdAt）
 * @property shippedAt - 出貨時間（必須 >= paidAt）
 * @property completedAt - 完成時間（必須 >= shippedAt）
 * @property snapshot - 訂單快照，記錄當時的商品資訊、價格等，儲存格式 JSONB
 */
export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  status: OrderStatus;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  createdAt: string;
  paidAt?: string | null;
  shippedAt?: string | null;
  completedAt?: string | null;
  snapshot?: OrderSnapshot | null;
}
