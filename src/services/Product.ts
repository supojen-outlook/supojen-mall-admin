import type { Pagination, Specification } from '@/model'
import type { ProductBase, Product } from '@/model/Product'
import { request } from './Request'

/**
 * 獲取產品列表
 * 
 * @param params - 查詢參數
 * @param params.size - 每頁大小，預設 20
 * @param params.cursor - 分頁遊標，用於獲取下一頁
 * @param params.search - 搜索關鍵字，可搜索產品名稱、SPU 編碼
 * @param params.categoryId - 類別 ID，篩選指定類別的產品
 * @param params.brandId - 品牌 ID，篩選指定品牌的產品
 * @param params.status - 產品狀態：active上架、inactive下架、draft草稿、pending審核中
 * @param params.sortDirection - 排序方向：asc升序、desc降序
 * @param params.sortBy - 排序字段：id、name、price、createdAt、sortOrder
 * @returns Promise<Pagination<ProductBase>> - 分頁的產品列表
 */
export async function getProducts(params?: {
  size?: number;
  cursor?: string;
  search?: string;
  categoryId?: number;
  brandId?: number;
  status?: 'active' | 'inactive' | 'draft' | 'pending';
  sortDirection?: 'asc' | 'desc';
  sortBy?: 'id' | 'name' | 'price' | 'createdAt' | 'sortOrder';
}): Promise<Pagination<ProductBase>> {
  // 過濾掉空值、null 和 undefined 的參數
  const filteredParams = params ? Object.fromEntries(
    Object.entries(params).filter(([_, value]) => 
      value !== undefined && value !== null && value !== ''
    )
  ) : {};
  
  return await request<Pagination<ProductBase>>('/api/products', 'GET', filteredParams)
}

/**
 * 獲取產品詳情
 * 
 * @param id - 產品 ID
 * @returns Promise<Product> - 完整的產品信息，包含詳細描述、圖片、規格等
 */
export async function getProduct(id: number): Promise<Product> {
  return await request<Product>(`/api/products/${id}`, 'GET')
}

/**
 * 創建產品
 * 
 * @param data - 產品數據
 * @param data.name - 產品名稱，必填
 * @param data.spuCode - 產品編號 (SPU Code)，可選，系統可自動生成
 * @param data.description - 產品詳細描述，可選
 * @param data.mainImageUrl - 產品主圖網址，可選
 * @param data.detailImages - 產品詳情圖陣列，可選
 * @param data.videoUrl - 產品介紹影片網址，可選
 * @param data.categoryId - 類別 ID，可選
 * @param data.brandId - 品牌 ID，可選
 * @param data.status - 產品狀態，必填：active/inactive/draft/pending
 * @param data.price - 產品價格，必填
 * @param data.tags - 產品標籤陣列，必填
 * @param data.specifications - 產品規格參數陣列，必填
 * @returns Promise<Product> - 創建成功的完整產品信息
 */
export async function createProduct(data: {
  name: string;
  spuCode?: string;
  description?: string;
  mainImageUrl?: string;
  detailImages?: string[];
  videoUrl?: string;
  categoryId?: number;
  brandId?: number;
  status: 'active' | 'inactive' | 'draft' | 'pending';
  price: number;
  tags: string[];
  specifications: Specification[];
}): Promise<Product> {
  return await request<Product>('/api/products', 'POST', data)
}

/**
 * 更新產品
 * 
 * @param data - 產品更新數據
 * @param data.id - 產品 ID，必填
 * @param data.name - 產品名稱，可選
 * @param data.spuCode - 產品編號 (SPU Code)，可選
 * @param data.description - 產品詳細描述，可選
 * @param data.mainImageUrl - 產品主圖網址，可選
 * @param data.detailImages - 產品詳情圖陣列，可選
 * @param data.videoUrl - 產品介紹影片網址，可選
 * @param data.categoryId - 類別 ID，可選
 * @param data.brandId - 品牌 ID，可選
 * @param data.status - 產品狀態，可選：active/inactive/draft/pending
 * @param data.price - 產品價格，可選
 * @param data.tags - 產品標籤陣列，可選
 * @param data.specifications - 產品規格參數陣列，可選
 * @returns Promise<Product> - 更新成功的完整產品信息
 */
export async function updateProduct(data: {
  id: number;
  name?: string;
  spuCode?: string;
  description?: string;
  mainImageUrl?: string;
  detailImages?: string[];
  videoUrl?: string;
  categoryId?: number;
  brandId?: number;
  status?: 'active' | 'inactive' | 'draft' | 'pending';
  price?: number;
  tags?: string[];
  specifications?: Specification[];
}): Promise<Product> {
  return await request<Product>(`/api/products/`, 'PUT', data)
}

/**
 * 刪除產品
 * 
 * @param id - 產品 ID
 * @returns Promise<void> - 無返回值，表示刪除成功
 */
export async function deleteProduct(id: number): Promise<void> {
  return await request<void>(`/api/products`, 'DELETE', { id })
}