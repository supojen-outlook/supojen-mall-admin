export type PickItemStatus = 'allocated' | 'picked' | 'cancelled';

/**
 * PickItem API 回應模型
 *
 * 揀貨項目實體，記錄倉庫揀貨作業的詳細信息，包含數量追蹤、狀態管理和時間戳
 *
 * @property id - 揀貨項目唯一識別碼，主鍵
 * @property orderId - 關聯的訂單 ID，外鍵（級聯刪除）
 * @property orderItemId - 關聯的訂單項目 ID，外鍵（級聯刪除）
 * @property locationId - 儲位/貨架 ID，外鍵（刪除儲位時禁止刪除揀貨項目）
 * @property quantityToPick - 應揀貨數量（必須 > 0）
 * @property quantityPicked - 實際已揀貨數量（必須 >= 0，且 <= quantityToPick，預設 0）
 * @property status - 揀貨狀態：allocated已分配/picked已完成/cancelled已取消
 * @property createdAt - 記錄建立時間
 * @property pickedAt - 實際完成揀貨的時間
 */
export interface PickItem {
  id: number;
  orderId: number;
  orderItemId: number;
  locationId: number;
  quantityToPick: number;
  quantityPicked: number;
  status: PickItemStatus;
  createdAt: string;
  pickedAt: string | null;
}
