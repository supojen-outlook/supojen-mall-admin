/**
 * 優惠券接口
 * 
 * @property id - 優惠券唯一識別碼
 * @property couponCode - 優惠券代碼，用戶輸入
 * @property name - 優惠券名稱，如：VIP專屬85折
 * @property description - 優惠券描述
 * @property userId - 指定給特定用戶，NULL 表示不指定
 * @property discountRate - 折扣率，如：15.00 表示 85折 (0-100)
 * @property scopeType - 適用範圍：all全部/product商品/category類別/brand品牌
 * @property scopeId - 根據 scopeType 對應到不同表的 ID
 * @property isUsed - 是否已使用
 * @property usedAt - 使用時間
 * @property orderId - 使用的訂單 ID
 * @property validFrom - 有效開始時間
 * @property validUntil - 有效截止時間，NULL 表示永久有效
 * @property createdAt - 記錄建立時間
 */
export interface Coupon {
  id: number;
  couponCode: string;
  name: string;
  description?: string | null;
  userId?: number | null;
  discountRate: number;
  scopeType: 'all' | 'product' | 'category' | 'brand';
  scopeId?: number | null;
  isUsed: boolean;
  usedAt?: string | null;
  orderId?: number | null;
  validFrom: string;
  validUntil?: string | null;
  createdAt: string;
}
