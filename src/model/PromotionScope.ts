/**
 * 促銷活動範圍接口
 * 定義促銷活動適用的範圍，可以是商品、類別、品牌或全館
 * 
 * @property id - 範圍記錄唯一識別碼
 * @property promotionId - 所屬促銷活動 ID
 * @property scopeType - 範圍類型：product商品/category類別/brand品牌/all全館
 * @property scopeId - 範圍 ID（對應商品/類別/品牌 ID，all時為0）
 * @property isExclude - 是否排除
 * @property createdAt - 記錄建立時間
 */
export interface PromotionScope {
  id: number;
  promotionId: number;
  scopeType: 'product' | 'category' | 'brand' | 'all';
  scopeId: number;
  isExclude: boolean;
  createdAt: string;
}
