import type { PromotionScope } from '@/model'
import { request } from './Request'

/**
 * 查詢促銷活動的所有範圍
 * @param params 查詢參數
 * @param params.promotionId - 促銷活動 ID（必填）
 * @returns 返回促銷範圍列表
 */
export async function getPromotionScopes(params: {
  promotionId: number;
}): Promise<PromotionScope[]> {
  return await request<PromotionScope[]>('/api/promotions/scopes', 'GET', params)
}

/**
 * 新增促銷範圍
 * @param params 新增參數
 * @param params.promotionId - 促銷活動 ID（必填）
 * @param params.scopeType - 範圍類型：product/category/brand/all（必填）
 * @param params.scopeId - 範圍 ID（必填，all 時為 0）
 * @param params.isExclude - 是否排除（必填）
 * @returns 返回新增的促銷範圍
 */
export async function createPromotionScope(params: {
  promotionId: number;
  scopeType: 'product' | 'category' | 'brand' | 'all';
  scopeId: number;
  isExclude: boolean;
}): Promise<PromotionScope> {
  return await request<PromotionScope>('/api/promotions/scopes', 'POST', params)
}

/**
 * 刪除促銷範圍
 * @param params 刪除參數
 * @param params.scopeId - 範圍 ID（必填）
 * @returns 刪除成功返回 null
 */
export async function deletePromotionScope(params: {
  scopeId: number;
}): Promise<null> {
  return await request<null>('/api/promotions/scopes', 'DELETE', params)
}
