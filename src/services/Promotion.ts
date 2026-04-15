import type { Pagination, Promotion } from '@/model'
import { request } from './Request'

/**
 * 查詢促銷活動總數
 * @returns 返回促銷活動總數
 */
export async function getPromotionCount(): Promise<number> {
  return await request<number>('/api/promotions/count', 'GET')
}

/**
 * 查詢促銷活動列表
 * @param params 查詢參數
 * @param params.search - 搜尋關鍵字
 * @param params.sortBy - 排序欄位
 * @param params.sortDirection - 排序方向 asc/desc
 * @param params.cursor - 分頁游標
 * @param params.size - 每頁資料筆數
 * @returns 返回促銷活動列表
 */
export async function getPromotions(params?: {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  cursor?: string;
  size?: number;
}): Promise<Pagination<Promotion>> {
  return await request<Pagination<Promotion>>('/api/promotions', 'GET', params)
}

/**
 * 新增促銷活動
 * @param params 新增參數
 * @param params.name - 促銷活動名稱（必填）
 * @param params.description - 促銷活動描述
 * @param params.startDate - 促銷開始時間 (ISO 8601 格式)
 * @param params.endDate - 促銷結束時間 (ISO 8601 格式)
 * @param params.channel - 適用通路：app/web/all
 * @param params.userScope - 適用會員：all/bronze/silver/gold/vip
 * @param params.limitPerUser - 每人可使用次數，null 表示不限制
 * @param params.limitTotal - 總可使用次數，null 表示不限制
 * @returns 返回新增的促銷活動
 */
export async function createPromotion(params: {
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  channel: 'app' | 'web' | 'all';
  userScope: 'all' | 'bronze' | 'silver' | 'gold' | 'vip';
  limitPerUser?: number | null;
  limitTotal?: number | null;
}): Promise<Promotion> {
  return await request<Promotion>('/api/promotions', 'POST', params)
}

/**
 * 更新促銷活動
 * @param params 更新參數
 * @param params.id - 促銷活動 ID（必填）
 * @param params.name - 促銷活動名稱
 * @param params.description - 促銷活動描述
 * @param params.startDate - 促銷開始時間
 * @param params.endDate - 促銷結束時間
 * @param params.channel - 適用通路
 * @param params.userScope - 適用會員
 * @param params.limitPerUser - 每人可使用次數
 * @param params.limitTotal - 總可使用次數
 * @returns 返回更新後的促銷活動
 */
export async function updatePromotion(params: {
  id: number;
  name?: string;
  description?: string | null;
  startDate?: string;
  endDate?: string;
  channel?: 'app' | 'web' | 'all';
  userScope?: 'all' | 'bronze' | 'silver' | 'gold' | 'vip';
  limitPerUser?: number | null;
  limitTotal?: number | null;
}): Promise<Promotion> {
  return await request<Promotion>('/api/promotions', 'PUT', params)
}

/**
 * 刪除促銷活動
 * @param params 刪除參數
 * @param params.id - 促銷活動 ID（必填）
 * @returns 刪除成功返回 null
 */
export async function deletePromotion(params: {
  id: number;
}): Promise<null> {
  return await request<null>('/api/promotions', 'DELETE', params)
}
