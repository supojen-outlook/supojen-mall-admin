/**
 * Location API 回應模型
 * 
 * 倉庫位置實體，用於定義倉庫中的各種位置，如區域、儲位、虛擬位置等
 * 
 * @property id - 位置唯一識別碼
 * @property name - 位置名稱，如：A區-貨架01
 * @property locationNumber - 位置編號，用於條碼/RFID 掃描
 * @property locationType - 位置性質：ZONE區域/BIN儲位/INTERNAL虛擬
 * @property zoneType - 區域功能：RECEIVING收貨/STORAGE儲存/PICKING揀貨/PACKING包裝/SHIPPING出貨/QA品檢/RETURNING退貨
 * @property parentId - 上層位置 ID，NULL 表示根區域
 * @property level - 所在層級：1為區域，2為儲位
 * @property pathCache - 從根到目前節點的所有 ID 陣列，如：{1,5,8}
 * @property pathText - 從根到目前節點的路徑文字，如：'/A區/A01貨架'
 * @property unitOfMeasureId - 計量單位 ID，如：個、箱、托盤
 * @property maxQuantity - 最大儲存數量
 * @property address - 實體地址（如果跨廠區才需要）
 * @property sortOrder - 排序順序，數字越小越前面
 * @property status - 狀態：active啟用/inactive停用/maintenance維護中
 * @property createdAt - 位置建立時間
 */
export interface Location {
  id: number;
  name: string;
  locationNumber: string | null;
  locationType: LocationType;
  zoneType: ZoneType | null;
  parentId: number | null;
  level: number;
  pathCache: number[];
  pathText: string;
  unitOfMeasureId: number;
  maxQuantity: number | null;
  address: string | null;
  sortOrder: number;
  status: LocationStatus;
  createdAt: string;
}

/**
 * 位置性質枚舉
 */
export type LocationType = 'ZONE' | 'BIN';

/**
 * 區域功能枚舉
 */
export type ZoneType = 'RECEIVING' | 'STORAGE' | 'SHIPPING' | 'RETURNING';

/**
 * 位置狀態枚舉
 */
export type LocationStatus = 'active' | 'inactive' | 'maintenance';
