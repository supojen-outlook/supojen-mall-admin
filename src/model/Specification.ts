import type { AttributeInputType } from '@/model'

/**
 * 規格參數模型
 * 
 * 用於定義產品的彈性規格參數，支援產品篩選和比較功能
 * 
 * @property keyId - 屬性鍵值 ID，對應到 AttributeKey 的 ID
 * @property valueId - 屬性值 ID，對應到 AttributeValue 的 ID
 * @property name - 屬性名稱，如：重量、材質、尺寸等
 * @property value - 屬性值，如：1.2kg、陶瓷、L等
 * @property unit - 屬性單位，可為空，如：kg、cm、mm等
 * @property inputType - 輸入類型，如：text、number、select、checkbox等
 */
export interface Specification {
  keyId: number;
  valueId: number | null;
  name: string;
  value: string | null;
  unit: string | null;
  inputType: AttributeInputType;
}