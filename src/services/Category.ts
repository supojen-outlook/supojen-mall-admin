import type { Category, CategoryStatus, Pagination } from "@/model"
import { request } from "./Request"

/**
 * 查詢系統中的產品類別列表
 * @param params 查詢參數
 * @param params.parentId 父類別 ID（可選），用於查詢指定父類別下的子類別
 * @param params.level 類別層級（可選），用於查詢指定層級的類別
 * @param params.status 類別狀態（可選），用於篩選啟用或停用的類別
 * @param params.search 搜尋關鍵字（可選），會在 Name、Slug 中搜尋
 * @param params.cursor 分頁游標（可選），用於分頁
 * @param params.isLeaf 是否為葉子節點（可選）
 * @param params.size 每頁資料筆數（可選），預設 1000
 * @returns 返回產品類別列表
 */
export async function getCategories(params?: {
  parentId?: number;
  level?: number;
  status?: CategoryStatus;
  search?: string;
  cursor?: string;
  isLeaf?: boolean;
  size?: number;
}): Promise<Pagination<Category>> {
  return await request<Pagination<Category>>('/api/categories', 'GET', params)
}

/**
 * 查詢產品類別總數量
 * @returns 返回符合條件的產品類別總數量
 */
export async function getCategoryCount(): Promise<number> {
  return await request<number>('/api/categories/count', 'GET')
}

/**
 * 獲取類別路徑
 * @param id 類別 ID
 * @returns 返回類別路徑
 */
export async function getCategoryPath(id: number): Promise<number[]> {
  return await request<number[]>(`/api/categories/${id}/path`, 'get');
}

/**
 * 添加產品類別
 * @param params 添加類別參數
 * @param params.name 類別名稱
 * @param params.slug 類別 slug（可選）
 * @param params.sortOrder 類別排序（可選）
 * @param params.status 類別狀態
 * @param params.parentId 父類別 ID（可選）
 * @param params.imageUrl 類別圖片 URL（可選）
 * @param params.isLeaf 是否為葉子節點
 * @returns 返回添加的產品類別
 */
export async function addCategory(params: {
  name: string;
  slug?: string;
  sortOrder?: number;
  status: 'active' | 'inactive';
  parentId?: number;
  imageUrl?: string;
  isLeaf: boolean;
}): Promise<Category> {
  return await request<Category>('/api/categories', 'post', params,'添加分類失敗')
}

/**
 * 更新指定的產品類別
 * @param params 更新類別參數
 * @param params.id 類別 ID（必填）
 * @param params.name 類別名稱（可選）
 * @param params.slug 類別 slug（可選）
 * @param params.parentId 父類別 ID（可選）
 * @param params.sortOrder 類別排序（可選）
 * @param params.status 類別狀態（可選）
 * @param params.imageUrl 類別圖片 URL（可選）
 * @param params.isLeaf 是否為葉子節點（可選）
 * @param params.attributeKeyIds 類別屬性鍵值 ID 陣列（可選）
 * @returns 更新成功返回 null
 * @throws 當類別不存在或更新失敗時拋出錯誤
 */
export async function updateCategory(params: {
  id: number;
  name?: string;
  slug?: string;
  parentId?: number;
  sortOrder?: number;
  status?: 'active' | 'inactive';
  imageUrl?: string;
  isLeaf?: boolean;
  attributeKeyIds?: number[];
}): Promise<null> {
  return await request<null>('/api/categories', 'PUT', params, '更新分類失敗')
}

/**
 * 刪除指定的產品類別
 * @param params 刪除類別參數
 * @param params.id 類別 ID（必填）
 * @returns 刪除成功返回 null
 * @throws 當類別不存在、有子類別或有產品使用此類別時拋出錯誤
 */
export async function deleteCategory(params: {
  id: number;
}): Promise<null> {
  return await request<null>('/api/categories', 'DELETE', params, '刪除分類失敗')
}


/**
 * 添加分類屬性
 * @param params 添加分類屬性參數
 * @param params.categoryId 類別 ID（必填）
 * @param params.attributeKeyId 屬性鍵值 ID（必填）
 * @returns 添加成功返回 null
 * @throws 當類別不存在或添加失敗時拋出錯誤
 */
export async function addCategoryAttribute(params: {
  categoryId: number;
  attributeKeyId: number;
}): Promise<null> {
  return await request<null>('/api/categories/attributes', 'POST', params, '添加分類屬性失敗')
}


/**
 * 刪除分類屬性
 * @param params 刪除分類屬性參數
 * @param params.categoryId 類別 ID（必填）
 * @param params.attributeKeyId 屬性鍵值 ID（必填）
 * @returns 刪除成功返回 null
 * @throws 當類別不存在或刪除失敗時拋出錯誤
 */
export async function deleteCategoryAttribute(params: {
  categoryId: number;
  attributeKeyId: number;
}): Promise<null> {
  return await request<null>('/api/categories/attributes', 'DELETE', params, '刪除分類屬性失敗')
}

