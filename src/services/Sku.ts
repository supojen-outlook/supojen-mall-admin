import { request } from './Request'
import type { Pagination, Sku, Specification } from '@/model'

/**
 * 獲取 SKU 分頁列表
 * 
 * @param params - 查詢參數
 * @param params.productId - 商品 ID，必填，必須是資料庫中已存在的商品 ID
 * @param params.ids - SKU ID 陣列，可選，篩選特定 SKU
 * @returns Promise<Pagination<Sku>> - 分頁 SKU 列表
 */
export async function getSkus(params?: {
  productId?: number;
  ids?: number[];
}): Promise<Pagination<Sku>> {
  return await request<Pagination<Sku>>(`/api/products/skus`, 'GET', params)
}



/**
 * 新增 SKU
 * 
 * @param data - SKU 數據
 * @param data.productId - 所屬商品 ID，必填，必須對應資料庫中存在的商品
 * @param data.name - SKU 顯示名稱，必填，通常包含規格資訊，範例：iPhone 14 黑色 128G
 * @param data.price - SKU 銷售價格，必填，必須 >= 0，可覆蓋商品基礎價格
 * @param data.stockQuantity - 實際庫存數量，必填，必須 >= 0，用於庫存管理和訂單處理
 * @param data.isDefault - 是否為預設 SKU，可選，每個商品只能有一個預設 SKU
 * @param data.imageUrl - SKU 專屬圖片 URL，可選，未設定時使用商品主圖
 * @param data.status - SKU 狀態，可選，active啟用/inactive停用，預設值：active
 * @param data.specifications - SKU 規格陣列，可選，定義該 SKU 的規格參數
 * @param data.unitOfMeasureId - 計量單位 ID，可選，必須對應資料庫中存在的計量單位 ID
 * @returns Promise<Sku> - 創建的 SKU
 */
export async function createSku(data: {
  productId: number;
  name: string;
  price: number;
  stockQuantity: number;
  isDefault?: boolean;
  imageUrl?: string;
  status?: 'active' | 'inactive';
  specifications?: Specification[];
  unitOfMeasureId?: number;
}): Promise<Sku> {
  return await request<Sku>(`/api/products/${data.productId}/skus`, 'POST', data)
}

/**
 * 更新 SKU
 * 
 * @param data - SKU 更新數據
 * @param data.id - SKU ID，必填，必須是資料庫中已存在的 SKU ID
 * @param data.name - SKU 顯示名稱，可選，通常包含規格資訊
 * @param data.price - SKU 銷售價格，可選，必須 >= 0，可覆蓋商品基礎價格
 * @param data.stockQuantity - 實際庫存數量，可選，必須 >= 0，用於庫存管理和訂單處理
 * @param data.status - SKU 狀態，可選，active啟用/inactive停用
 * @param data.isDefault - 是否為預設 SKU，可選，每個商品只能有一個預設 SKU
 * @param data.imageUrl - SKU 專屬圖片 URL，可選，未設定時使用商品主圖
 * @param data.specifications - SKU 規格陣列，可選，完全替換 Sku.Specs
 * @param data.unitOfMeasureId - 計量單位 ID，可選，必須對應資料庫中存在的計量單位 ID
 * @returns Promise<Sku> - 更新後的 SKU
 */
export async function updateSku(data: {
  id: number;
  name?: string;
  price?: number;
  stockQuantity?: number;
  status?: 'active' | 'inactive';
  isDefault?: boolean;
  imageUrl?: string;
  specifications?: Specification[];
  unitOfMeasureId?: number;
}): Promise<Sku> {
  return await request<Sku>(`/api/skus`, 'PUT', data)
}

/**
 * 刪除 SKU
 * 
 * @param id - SKU ID
 * @returns Promise<void>
 */
export async function deleteSku(id: number): Promise<void> {
  return await request<void>(`/api/skus`, 'DELETE', { id })
}