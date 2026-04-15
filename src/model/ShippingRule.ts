import type { ShippingRuleCondition } from "./ShippingRuleCondition";


/**
 * ShippingRule API 回應模型
 * 
 * @property id - 規則唯一識別碼
 * @property name - 規則名稱
 * @property description - 規則描述
 * @property condition - 運費規則條件
 * @property shippingFee - 運費金額
 * @property isActive - 是否啟用
 * @property priority - 優先級，數字越小優先級越高
 * @property createdAt - 記錄建立時間
 * @property updatedAt - 記錄更新時間
 */
export interface ShippingRule {
  id: number;
  name: string;
  description?: string | null;
  condition?: ShippingRuleCondition | null;
  shippingFee: number;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt?: string | null;
}
