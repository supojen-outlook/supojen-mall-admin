import type { PromotionRule } from '@/model'
import { request } from './Request'

/**
 * 查詢促銷活動的所有規則
 * @param params 查詢參數
 * @param params.promotionId - 促銷活動 ID（必填）
 * @returns 返回促銷規則列表
 */
export async function getPromotionRules(params: {
  promotionId: number;
}): Promise<PromotionRule[]> {
  return await request<PromotionRule[]>('/api/promotions/rules', 'GET', params)
}

/**
 * 新增促銷規則
 * @param params 新增參數
 * @param params.promotionId - 促銷活動 ID（必填）
 * @param params.tabName - 規則名稱/標籤（必填）
 * @param params.ruleType - 規則類型：full_reduction/discount/gift/free_shipping（必填）
 * @param params.thresholdAmount - 滿額門檻
 * @param params.discountAmount - 折抵金額（滿減規則專用）
 * @param params.giftItemId - 贈品商品 ID（贈品規則專用）
 * @returns 返回新增的促銷規則
 */
export async function createPromotionRule(params: {
  promotionId: number;
  tabName: string;
  ruleType: 'full_reduction' | 'discount' | 'gift' | 'free_shipping';
  thresholdAmount?: number | null;
  discountAmount?: number | null;
  giftItemId?: number | null;
}): Promise<PromotionRule> {
  return await request<PromotionRule>('/api/promotions/rules', 'POST', params)
}

/**
 * 更新促銷規則
 * @param params 更新參數
 * @param params.ruleId - 規則 ID（必填）
 * @param params.tabName - 規則名稱/標籤
 * @param params.ruleType - 規則類型：full_reduction/discount/gift/free_shipping
 * @param params.thresholdAmount - 滿額門檻
 * @param params.discountAmount - 折抵金額（滿減規則專用）
 * @param params.giftItemId - 贈品商品 ID（贈品規則專用）
 * @returns 返回更新後的促銷規則
 */
export async function updatePromotionRule(params: {
  ruleId: number;
  tabName?: string;
  ruleType?: 'full_reduction' | 'discount' | 'gift' | 'free_shipping';
  thresholdAmount?: number | null;
  discountAmount?: number | null;
  giftItemId?: number | null;
}): Promise<PromotionRule> {
  return await request<PromotionRule>('/api/promotions/rules', 'PUT', params)
}

/**
 * 刪除促銷規則
 * @param params 刪除參數
 * @param params.ruleId - 規則 ID（必填）
 * @returns 刪除成功返回 null
 */
export async function deletePromotionRule(params: {
  ruleId: number;
}): Promise<null> {
  return await request<null>('/api/promotions/rules', 'DELETE', params)
}
