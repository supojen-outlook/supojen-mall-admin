import type { Pagination, Tag } from '@/model'
import { request } from './Request'

/**
 * 獲取標籤列表
 * 
 * @returns 返回標籤分頁列表
 */
export async function getTags(): Promise<Pagination<Tag>> {
  return await request<Pagination<Tag>>('/api/tags', 'GET')
}
