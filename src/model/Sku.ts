export type SkuStatus = 'active' | 'inactive';

/**
 * SKU API 回應模型
 * 
 * 庫存單位實體，用於管理多規格商品的庫存和訂單處理
 * 
 * @property id - SKU 唯一識別碼
 * @property skuCode - SKU 編碼，用於庫存管理和訂單系統，必須唯一
 * @property name - SKU 顯示名名稱，範例：iPhone 14 黑色 128G
 * @property productId - 所屬商品 ID，外鍵指向 products.id
 * @property price - SKU 銷售價格，可覆蓋商品基礎價格，必須 >= 0
 * @property stockQuantity - 實際庫存數量，必須 >= 0
 * @property reservedStock - 預占庫存（已下單未付款），必須 >= 0 且 <= StockQuantity
 * @property specs - SKU 規格組合，JSON 格式，範例：{"顏色":"黑色","尺寸":"XL"}
 * @property imageUrl - SKU 專屬圖片 URL，可為 null，未設定時使用商品圖片
 * @property unitOfMeasureId - 計量單位 ID，外鍵指向 unit_of_measures.id
 * @property isDefault - 是否為預設 SKU，商品頁面預先顯示的 SKU，每個商品只能有一個預設 SKU
 * @property status - SKU 狀態：active啟用，inactive停用，預設值：active
 * @property createdAt - SKU 建立時間
 */
export interface Sku {
  id: number;
  skuCode: string;
  name: string;
  productId: number;
  price: number;
  stockQuantity: number;
  reservedStock: number;
  specs: import('./Specification').Specification[];
  imageUrl: string | null;
  unitOfMeasureId: number | null;
  isDefault: boolean;
  status: SkuStatus;
  createdAt: string;
}
