import type { Pagination, ShippingRule, ShippingRuleCondition } from '@/model'
import { request } from './Request'

/**
 * 獲取運費規則列表
 * 
 * @param params - 查詢參數
 * @param params.size - 每頁大小，預設 20
 * @param params.cursor - 分頁遊標，用於獲取下一頁
 * @param params.search - 搜尋關鍵字，可搜索規則名稱
 * @param params.isActive - 是否啟用，用於篩選
 * @returns Promise<Pagination<ShippingRule>> - 分頁的運費規則列表
 */
export async function getShippingRules(params?: {
  size?: number;
  cursor?: string;
  search?: string;
  isActive?: boolean;
}): Promise<Pagination<ShippingRule>> {
  // 過濾掉空值、null 和 undefined 的參數
  const filteredParams = params ? Object.fromEntries(
    Object.entries(params).filter(([_, value]) => 
      value !== undefined && value !== null && value !== ''
    )
  ) : {};
  
  return await request<Pagination<ShippingRule>>('/api/shipping-rules', 'GET', filteredParams)
}

/**
 * 創建運費規則
 * 
 * @param data - 運費規則數據
 * @param data.name - 規則名稱，必填
 * @param data.description - 規則描述，可選
 * @param data.condition - 運費規則條件，可選
 * @param data.shippingFee - 運費金額，必填（必須大於或等於 0）
 * @param data.isActive - 是否啟用，預設 true
 * @returns Promise<ShippingRule> - 創建成功的完整運費規則信息
 */
export async function createShippingRule(data: {
  name: string;
  description?: string | null;
  condition?: ShippingRuleCondition | null;
  shippingFee: number;
  isActive?: boolean;
}): Promise<ShippingRule> {
  return await request<ShippingRule>('/api/shipping-rules', 'POST', data)
}

/**
 * 更新運費規則
 * 
 * @param data - 運費規則更新數據
 * @param data.id - 規則 ID，必填
 * @param data.name - 規則名稱
 * @param data.description - 規則描述
 * @param data.condition - 運費規則條件
 * @param data.shippingFee - 運費金額
 * @param data.isActive - 是否啟用
 * @returns Promise<ShippingRule> - 更新成功的完整運費規則信息
 */
export async function updateShippingRule(data: {
  id: number;
  name?: string;
  description?: string | null;
  condition?: ShippingRuleCondition | null;
  shippingFee?: number;
  isActive?: boolean;
}): Promise<ShippingRule> {
  return await request<ShippingRule>('/api/shipping-rules', 'PUT', data)
}

/**
 * 刪除運費規則
 * 
 * @param id - 運費規則 ID
 * @returns Promise<void> - 無返回值，表示刪除成功
 */
export async function deleteShippingRule(id: number): Promise<void> {
  return await request<void>('/api/shipping-rules', 'DELETE', { id })
}
