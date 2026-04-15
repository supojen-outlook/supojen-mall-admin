/**
 * 庫存記錄 API 回應模型
 * 
 * 用於記錄 SKU 在特定位置的庫存數量和狀態變化
 * 
 * @property id - 庫存記錄唯一識別碼
 * @property skuId - SKU ID，關聯到 skus 表
 * @property locationId - 儲位 ID，關聯到 locations 表
 * @property quantityOnHand - 實際庫存數量，不能為負
 * @property quantityReserved - 預占庫存量（已訂未出），不能為負
 * @property quantityAvailable - 可銷售庫存量，計算方式：quantity_on_hand - quantity_reserved，由資料庫觸發器自動維護
 * @property status - 庫存狀態：active啟用/inactive停用，預設值：active
 * @property isAvailable - 是否可用於銷售，預設值：true
 * @property createdAt - 庫存記錄建立時間
 */
export interface Inventory {
  id: number;
  skuId: number;
  locationId: number;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  status: 'active' | 'inactive';
  isAvailable: boolean;
  createdAt: string;
}
