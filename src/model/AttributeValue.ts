/**
 * AttributeValue API 回應模型
 * 
 * 產品屬性值實體，用於定義屬性的具體選項，如顏色屬性的紅色、藍色、綠色等
 * 
 * @property id - 屬性值唯一識別碼
 * @property attributeId - 所屬屬性鍵 ID
 * @property value - 屬性值內容，如：紅色、XL
 * @property description - 屬性值詳細描述
 * @property sortOrder - 排序順序，數字越小越前面
 * @property createdAt - 屬性值建立時間
 */
export interface AttributeValue {
  id: number;
  attributeId: number;
  value: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
}
