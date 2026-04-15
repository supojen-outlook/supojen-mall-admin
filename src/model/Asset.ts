export type AssetTargetType = 'product' | 'category' | 'brand';
export type AssetMediaType = 'image' | 'video';

/**
 * Asset API 回應模型
 * 
 * 資源實體，用於管理系統中的媒體檔案（如圖片、影片），支援多態關聯至不同類型的目標實體。
 * 
 * @property id - 資源唯一識別碼 (BIGSERIAL)
 * @property targetType - 關聯目標類型，如 "product", "category", "brand"；null 表示孤兒資源
 * @property targetId - 關聯目標的 ID；null 表示孤兒資源
 * @property mediaType - 媒體檔案類型，如 "image", "video"
 * @property url - 檔案的公開存取網址 (S3 或 CDN)
 * @property fileSizeBytes - 檔案大小，單位為位元組
 * @property bucket - AWS S3 存儲桶名稱
 * @property key - AWS S3 物件鍵
 */
export interface Asset {
  id: number;
  targetType: AssetTargetType | null;
  targetId: number | null;
  mediaType: AssetMediaType;
  url: string;
  fileSizeBytes: number;
  bucket: string;
  key: string;
}
