/**
 * 促銷活動規則接口
 * 用於定義促銷活動的具體規則，包含滿額減、折扣、贈品、免運等類型
 * 
 * @property id - 規則唯一識別碼
 * @property promotionId - 所屬促銷活動 ID
 * @property tabName - 規則名稱/標籤，例如「滿千送百」、「雙11折扣」
 * @property ruleType - 規則類型：full_reduction滿額減/discount折扣/gift贈品/free_shipping免運
 * @property thresholdAmount - 滿額門檻（例如：1000 表示滿 1000 元）
 * @property thresholdQuantity - 滿件門檻（例如：2 表示買 2 件）
 * @property discountAmount - 折抵金額（滿減規則專用）
 * @property discountRate - 折扣率（折扣規則專用，例如：20.00 表示 20% off）
 * @property maxDiscountAmount - 最高折抵金額（防止折扣無上限）
 * @property giftItemId - 贈品商品 ID（贈品規則專用）
 * @property giftQuantity - 贈品數量，預設值為 1
 * @property createdAt - 記錄建立時間
 */
export interface PromotionRule {
  id: number;
  promotionId: number;
  tabName: string;
  ruleType: 'full_reduction' | 'discount' | 'gift' | 'free_shipping';
  thresholdAmount?: number | null;
  thresholdQuantity?: number | null;
  discountAmount?: number | null;
  discountRate?: number | null;
  maxDiscountAmount?: number | null;
  giftItemId?: number | null;
  giftQuantity: number;
  createdAt: string;
}
