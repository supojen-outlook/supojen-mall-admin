import type { Location, LocationType, ZoneType, LocationStatus, Pagination } from "@/model"
import { request } from "./Request"

/**
 * 查詢系統中的倉庫位置列表
 * @param params 查詢參數
 * @param params.parentId 父位置 ID（可選），用於查詢指定父位置下的子位置
 * @param params.level 位置層級（可選），用於查詢指定層級的位置
 * @param params.ids 位置 ID 陣列（可選），用於查詢指定位置
 * @param params.status 位置狀態（可選），用於篩選啟用、停用或維護中的位置
 * @param params.locationType 位置性質（可選），用於篩選區域或儲位
 * @param params.zoneType 區域功能（可選），用於篩選儲存、出貨或退貨功能
 * @param params.search 搜尋關鍵字（可選），會在 Name、LocationNumber 中搜尋
 * @param params.cursor 分頁游標（可選），用於分頁
 * @param params.size 每頁資料筆數（可選），預設 1000
 * @returns 返回倉庫位置列表
 */
export async function getLocations(params?: {
  parentId?: number;
  level?: number;
  ids?: number[];
  status?: LocationStatus;
  locationType?: LocationType;
  zoneType?: ZoneType;
  search?: string;
  cursor?: string;
  size?: number;
}): Promise<Pagination<Location>> {  
  return await request<Pagination<Location>>('/api/locations', 'GET', params)
}

/**
 * 查詢倉庫位置總數量
 * @returns 返回符合條件的倉庫位置總數量
 */
export async function getLocationCount(): Promise<number> {
  return await request<number>('/api/locations/count', 'GET')
}

/**
 * 獲取位置路徑
 * @param id 位置 ID
 * @returns 返回位置路徑
 */
export async function getLocationPath(id: number): Promise<number[]> {
  return await request<number[]>(`/api/locations/${id}/path`, 'get');
}

/**
 * 添加倉庫位置
 * @param params 添加位置參數
 * @param params.name 位置名稱（2-50字元），顯示給使用者看的儲位名稱，如："A區"、"A01貨架"、"A01-01"
 * @param params.locationNumber 位置編號（全域唯一），用於條碼/RFID 掃描，如："LOC-A01-01"、"BIN-A01-01"
 * @param params.locationType 位置類型，可選值："ZONE"區域（第一層級）、"BIN"儲位（第二層級）
 * @param params.zoneType 區域類型（可選），僅對 ZONE 類型有意義，可選值："RECEIVING"收貨區、"STORAGE"儲存區、"PICKING"揀貨區、"PACKING"包裝區、"SHIPPING"出貨區、"QA"品檢區、"RETURNING"退貨區
 * @param params.parentId 父級 ID（可選），NULL 表示根區域，父節點必須是 ZONE 類型，子節點必須是 BIN 類型
 * @param params.unitOfMeasureId 計量單位 ID，定義儲位容量的計量單位，如：個、箱、托盤，預設為 1（個）
 * @param params.maxQuantity 最大容量（可選），儲位的最大容量，單位由 UnitOfMeasureId 決定，0 表示無限制
 * @param params.address 實體地址（可選），跨廠區倉庫的實體地址，單一倉庫場景下通常不需要
 * @param params.sortOrder 排序順序（可選），數字越小越前面，預設為 0
 * @param params.status 狀態，可選值："active"啟用（預設）、"inactive"停用、"maintenance"維護中
 * @returns 返回添加的倉庫位置
 */
export async function addLocation(params: {
  name: string;
  locationNumber?: string;
  locationType: LocationType;
  zoneType?: ZoneType;
  parentId?: number;
  unitOfMeasureId: number;
  maxQuantity?: number;
  address?: string;
  sortOrder?: number;
  status: LocationStatus;
}): Promise<Location> {
  // 過濾掉 undefined、null 和空字符串值
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => 
      value !== undefined && value !== null && value !== ''
    )
  );
  
  return await request<Location>('/api/locations', 'post', filteredParams, '添加位置失敗')
}

/**
 * 更新指定的倉庫位置
 * @param params 更新位置參數
 * @param params.id 儲位唯一識別碼（必填），必須是資料庫中已存在的儲位 ID
 * @param params.name 位置名稱（可選），若為 null 保持原值不變，顯示給使用者看的儲位名稱，建議長度 2-50 字元
 * @param params.locationNumber 位置編號（可選），若為 null 保持原值不變，用於條碼/RFID 掃描，全域唯一識別
 * @param params.locationType 位置類型（可選），若為 null 保持原值不變，可選值："ZONE"區域（第一層級）、"BIN"儲位（第二層級）、"INTERNAL"虛擬位置
 * @param params.zoneType 區域類型（可選），若為 null 保持原值不變，僅對 ZONE 類型有意義，可選值："RECEIVING"收貨區、"STORAGE"儲存區、"PICKING"揀貨區、"PACKING"包裝區、"SHIPPING"出貨區、"QA"品檢區、"RETURNING"退貨區
 * @param params.parentId 父級 ID（可選），若為 null 保持原值不變，NULL 表示根區域，父節點必須是 ZONE 類型，子節點必須是 BIN 類型，更新後會自動重新計算路徑
 * @param params.unitOfMeasureId 計量單位 ID（可選），若為 null 保持原值不變，定義儲位容量的計量單位，如：個、箱、托盤
 * @param params.maxQuantity 最大容量（可選），若為 null 保持原值不變，儲位的最大容量，單位由 UnitOfMeasureId 決定，0 表示無限制，不應為負數
 * @param params.address 實體地址（可選），若為 null 保持原值不變，跨廠區倉庫的實體地址，單一倉庫場景下通常不需要
 * @param params.sortOrder 排序順序（可選），若為 null 保持原值不變，數字越小越前面，預設為 0
 * @param params.status 狀態（可選），若為 null 保持原值不變，可選值："active"啟用、"inactive"停用、"maintenance"維護中
 * @returns 更新成功返回 null
 * @throws 當位置不存在或更新失敗時拋出錯誤
 */
export async function updateLocation(params: {
  id: number;
  name?: string;
  locationNumber?: string;
  locationType?: LocationType;
  zoneType?: ZoneType;
  parentId?: number;
  unitOfMeasureId?: number;
  maxQuantity?: number;
  address?: string;
  sortOrder?: number;
  status?: LocationStatus;
}): Promise<null> {
  // 過濾掉 undefined、null 和空字符串值
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => 
      value !== undefined && value !== null && value !== ''
    )
  );
  
  return await request<null>('/api/locations', 'PUT', filteredParams, '更新位置失敗')
}

/**
 * 刪除指定的倉庫位置
 * @param params 刪除位置參數
 * @param params.id 位置 ID（必填）
 * @returns 刪除成功返回 null
 * @throws 當位置不存在或有子位置時拋出錯誤
 */
export async function deleteLocation(params: {
  id: number;
}): Promise<null> {
  return await request<null>('/api/locations', 'DELETE', params, '刪除位置失敗')
}
