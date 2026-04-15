import type { Asset, AssetTargetType, Pagination } from "@/model";
import { request } from "./Request"


/**
 * 分頁查詢媒體檔案
 * @param params 分頁查詢參數
 * @param params.targetType - 關聯目標類型，如 "product", "category", "brand"；null 表示孤兒資源
 * @param params.isTargetIdNull - 是否查詢孤兒資源
 * @param params.cursor - 分頁游標，用於繼續查詢
 * @param params.size - 每頁數量，預設 10
 * @returns 分頁結果
 */
export async function getAssets(params:{
    targetType?: AssetTargetType | null;
    isTargetIdNull?: boolean;
    cursor?: string;
    size?: number;
}) {
  return await request<Pagination<Asset>>('/api/assets', 'GET', params)
}

/**
 * 更新媒體檔案
 * @param params 更新參數
 * @param params.url - 更新後的公開存取網址
 * @param params.targetType - 更新後的關聯目標類型
 * @param params.targetId - 更新後的關聯目標的 ID
 * @returns 更新結果
 */
export async function updateAsset(params: {
  url: string,
  targetType: AssetTargetType,
  targetId: number,
}) {
  return await request<Asset>('/api/assets', 'PUT', params)
}

/**
 * 刪除媒體檔案
 * @param params 刪除參數
 * @param params.url - 要刪除的媒體檔案 URL
 * @returns 刪除結果
 */
export async function deleteAsset(params: {
  url: string,
}) {
  return await request<Asset>(`/api/assets?url=${params.url}`, 'DELETE')
}