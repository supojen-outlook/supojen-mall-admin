export type AttributeStatus = 'active' | 'inactive';
export type AttributeInputType = 'select' | 'text' | 'number' | 'checkbox';

/**
 * AttributeKey API 回應模型
 * 
 * 產品屬性鍵值實體，用於定義商品的各種屬性，如顏色、尺寸、材質等
 * 
 * @property id - 屬性唯一識別碼
 * @property name - 屬性顯示名稱，如：顏色、尺寸
 * @property description - 屬性詳細描述
 * @property forSales - 是否為銷售屬性：TRUE用於SKU生成/FALSE僅為描述
 * @property inputType - 前端輸入類型：select下拉選單/text文字/number數字/checkbox複選框
 * @property isRequired - 是否為必填屬性
 * @property unit - 單位，如：cm(公分)、g(公克)
 * @property sortOrder - 同層級間的排序順序，數字越小越前面
 * @property status - 屬性狀態：active啟用，inactive停用
 * @property createdAt - 屬性建立時間
 */
export interface AttributeKey {
  id: number;
  name: string;
  description: string | null;
  forSales: boolean;
  inputType: AttributeInputType;
  isRequired: boolean;
  unit: string | null;
  sortOrder: number;
  status: AttributeStatus;
  createdAt: string;
}

