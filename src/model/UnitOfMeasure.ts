/**
 * UnitOfMeasure API 回應模型
 * 
 * 計量單位實體，用於定義商品的計量單位，如個、箱、盒、托盤等
 * 
 * @property id - 唯一識別碼
 * @property code - 單位代碼：EA, BOX, CTN, PALLET...
 * @property name - 單位名稱：Each, Box, Carton...
 * @property description - 單位描述
 * @property conversionToBase - 轉換率：此單位等於多少基準單位 (EA)
 * @property createdAt - 建立時間
 */
export interface UnitOfMeasure {
  id: number;
  code: string;
  name: string;
  description: string;
  conversionToBase: number;
  createdAt: string;
}