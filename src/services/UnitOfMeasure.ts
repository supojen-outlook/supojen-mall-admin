import type { Pagination, UnitOfMeasure } from '@/model'
import { request } from './Request'

/**
 * 獲取計量單位列表
 * 
 * @param params 查詢參數
 * @param params.search - 搜索關鍵字，可搜尋單位代碼或名稱
 * @returns 返回計量單位分頁列表
 */
export async function getUnitOfMeasures(params?: {
  search?: string;
}): Promise<Pagination<UnitOfMeasure>> {
  return await request<Pagination<UnitOfMeasure>>('/api/unit-of-measures', 'GET', params)
}
