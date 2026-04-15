import type { Pagination } from '@/model'
import type { Coupon } from '@/model/Coupon'
import { request } from './Request'

/**
 * 獲取優惠券總數
 * 
 * @returns Promise<number> - 優惠券總數
 */
export async function getCouponCount(): Promise<number> {
  return await request<number>('/api/coupons/count', 'GET')
}

/**
 * 獲取優惠券列表
 * 
 * @param params - 查詢參數
 * @param params.size - 每頁大小，預設 20
 * @param params.cursor - 分頁遊標，用於獲取下一頁
 * @param params.userId - 用戶 ID，篩選指定用戶的優惠券
 * @param params.scopeType - 適用範圍類型：all全部/product商品/category類別/brand品牌
 * @param params.scopeId - 根據 scopeType 對應到不同表的 ID
 * @param params.sortDirection - 排序方向：asc升序、desc降序
 * @param params.sortBy - 排序字段：id、couponCode、name、discountRate、createdAt
 * @returns Promise<Pagination<Coupon>> - 分頁的優惠券列表
 */
export async function getCoupons(params?: {
  size?: number;
  cursor?: string;
  userId?: number;
  scopeType?: 'all' | 'product' | 'category' | 'brand';
  scopeId?: number;
  sortDirection?: 'asc' | 'desc';
  sortBy?: 'id' | 'couponCode' | 'name' | 'discountRate' | 'createdAt';
}): Promise<Pagination<Coupon>> {
  // 過濾掉空值、null 和 undefined 的參數
  const filteredParams = params ? Object.fromEntries(
    Object.entries(params).filter(([_, value]) => 
      value !== undefined && value !== null && value !== ''
    )
  ) : {};
  
  return await request<Pagination<Coupon>>('/api/coupons', 'GET', filteredParams)
}

/**
 * 獲取優惠券詳情
 * 
 * @param id - 優惠券 ID
 * @returns Promise<Coupon> - 完整的優惠券信息
 */
export async function getCoupon(id: number): Promise<Coupon> {
  return await request<Coupon>(`/api/coupons/${id}`, 'GET')
}

/**
 * 創建優惠券
 * 
 * @param data - 優惠券數據
 * @param data.couponCode - 優惠券代碼，用戶輸入
 * @param data.name - 優惠券名稱
 * @param data.description - 優惠券描述，可選
 * @param data.userId - 指定給特定用戶，NULL 表示不指定
 * @param data.discountRate - 折扣率，如：15.00 表示 85折 (0-100)
 * @param data.scopeType - 適用範圍：all全部/product商品/category類別/brand品牌
 * @param data.scopeId - 根據 scopeType 對應到不同表的 ID，可選
 * @returns Promise<Coupon> - 創建成功的完整優惠券信息
 */
export async function createCoupon(data: {
  couponCode: string;
  name: string;
  description?: string;
  userId?: number | null;
  discountRate: number;
  scopeType: 'all' | 'product' | 'category' | 'brand';
  scopeId?: number | null;
  validFrom: string;
  validUntil?: string | null;
}): Promise<Coupon> {
  return await request<Coupon>('/api/coupons', 'POST', data)
}

/**
 * 更新優惠券
 * 
 * @param data - 優惠券更新數據
 * @param data.id - 優惠券 ID，必填
 * @param data.couponCode - 優惠券代碼
 * @param data.name - 優惠券名稱
 * @param data.description - 優惠券描述，可選
 * @param data.userId - 指定給特定用戶，NULL 表示不指定
 * @param data.discountRate - 折扣率，如：15.00 表示 85折 (0-100)
 * @param data.scopeType - 適用範圍：all全部/product商品/category類別/brand品牌
 * @param data.scopeId - 根據 scopeType 對應到不同表的 ID，可選
 * @returns Promise<Coupon> - 更新成功的完整優惠券信息
 */
export async function updateCoupon(data: {
  id: number;
  couponCode?: string;
  name?: string;
  description?: string;
  userId?: number | null;
  discountRate?: number;
  scopeType?: 'all' | 'product' | 'category' | 'brand';
  scopeId?: number | null;
  validFrom?: string;
  validUntil?: string | null;
}): Promise<Coupon> {
  return await request<Coupon>('/api/coupons', 'PUT', data)
}

/**
 * 刪除優惠券
 * 
 * @param id - 優惠券 ID
 * @returns Promise<void> - 無返回值，表示刪除成功
 */
export async function deleteCoupon(id: number): Promise<void> {
  return await request<void>('/api/coupons', 'DELETE', { id })
}
