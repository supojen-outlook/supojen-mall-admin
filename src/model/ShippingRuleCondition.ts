/**
 * 運費規則條件基礎接口
 * 
 * @property ruleType - 規則類型：quantity | amount
 * @property minAmount - 最小金額或數量（可選）
 * @property maxAmount - 最大金額或數量（可選）
 */
export interface ShippingRuleConditionBase {
  ruleType: string;
  minAmount?: number | null;
  maxAmount?: number | null;
}

/**
 * 按數量計算的運費條件
 * 
 * @property ruleType - 固定為 "quantity"
 */
export interface QuantityShippingCondition extends ShippingRuleConditionBase {
  ruleType: 'quantity';
}

/**
 * 按金額計算的運費條件
 * 
 * @property ruleType - 固定為 "amount"
 */
export interface AmountShippingCondition extends ShippingRuleConditionBase {
  ruleType: 'amount';
}

/**
 * 運費規則條件聯合類型
 */
export type ShippingRuleCondition = 
  | QuantityShippingCondition 
  | AmountShippingCondition;