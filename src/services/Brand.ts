import type { Brand, Pagination } from '@/model'
import { request } from './Request'

/**
 * 查詢品牌總數量
 * @returns 返回符合條件的品牌總數量
 */
export async function getBrandCount(): Promise<number> {
  return await request<number>('/api/brands/count', 'GET')
}

/**
 * 獲取品牌路徑
 * @param id 品牌 ID
 * @returns 返回品牌路徑
 */
export async function getBrandPath(id: number): Promise<number[]> {
  return await request<number[]>(`/api/brands/${id}/path`, 'get');
}

/**
 * 獲取品牌列表
 * @param params 查詢參數
 * @param params.parentId - 父品牌 ID，用於查詢指定父品牌下的子品牌
 * @param params.search - 搜尋關鍵字，會在 Name、Slug 中搜尋
 * @param params.status - 品牌狀態，用於篩選啟用或停用的品牌
 * @param params.cursor - 分頁游標，用於分頁
 * @param params.size - 每頁資料筆數，預設 1000
 * @param params.isLeaf - 是否為葉子節點
 * @param params.level - 指定的層級
 * @param params.ids - 指定的品牌 ID 陣列
 * @returns 返回品牌列表
 */
export async function getBrands(params?: {
  parentId?: number;
  search?: string;
  status?: 'active' | 'inactive';
  cursor?: string;
  size?: number;
  isLeaf?: boolean;
  level?: number;
  ids?: number[];
}): Promise<Pagination<Brand>> {
  return await request<Pagination<Brand>>('/api/brands', 'GET', params)
}

/**
 * 創建品牌
 * @param params 創建參數
 * @param params.name - 品牌顯示名稱（必填）
 * @param params.status - 品牌狀態，預設 'active'
 * @param params.slug - URL 友好名稱，用於 SEO 優化
 * @param params.sortOrder - 同層級間的排序順序，數字越小越前面
 * @param params.parentId - 上層品牌 ID，NULL 表示根品牌
 * @param params.description - 品牌詳細描述
 * @param params.logoUrl - 品牌標誌圖片網址
 * @param params.isLeaf - 是否為葉節點（沒有子品牌）
 * @returns 返回創建的品牌
 */
export async function createBrand(params: {
  name: string;
  status: 'active' | 'inactive';
  slug?: string;
  sortOrder?: number;
  parentId?: number | null;
  description?: string;
  logoUrl?: string;
  isLeaf: boolean;
}): Promise<Brand> {
  return await request<Brand>('/api/brands', 'POST', params)
}

/**
 * 更新品牌
 * @param params 更新參數
 * @param params.id - 品牌 ID（必填）
 * @param params.name - 品牌顯示名稱
 * @param params.status - 品牌狀態
 * @param params.slug - URL 友好名稱，用於 SEO 優化
 * @param params.sortOrder - 同層級間的排序順序，數字越小越前面
 * @param params.parentId - 上層品牌 ID，NULL 表示根品牌
 * @param params.description - 品牌詳細描述
 * @param params.logoUrl - 品牌標誌圖片網址
 * @param params.isLeaf - 是否為葉節點（沒有子品牌）
 * @returns 返回更新後的品牌
 */
export async function updateBrand(params: {
  id: number;
  name?: string;
  status?: 'active' | 'inactive';
  slug?: string;
  sortOrder?: number;
  parentId?: number | null;
  description?: string;
  logoUrl?: string;
  isLeaf?: boolean;
}): Promise<Brand> {
  return await request<Brand>('/api/brands', 'PUT', params)
}

/**
 * 刪除品牌
 * @param params 刪除參數
 * @param params.id - 品牌 ID（必填）
 * @returns 刪除成功返回 null
 * @throws 當品牌不存在、有子品牌或有產品使用此品牌時拋出錯誤
 */
export async function deleteBrand(params: {
  id: number;
}): Promise<null> {
  return await request<null>('/api/brands', 'DELETE', params)
}
