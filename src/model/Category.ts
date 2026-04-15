export type CategoryStatus = 'active' | 'inactive';

/**
 * Category API 回應模型
 * 
 * 產品類別實體，用於定義商品的多層級分類結構，支援無限層級的商品分類
 * 
 * @property id - 類別唯一識別碼
 * @property name - 類別顯示名稱
 * @property slug - URL 友好名稱，用於 SEO 優化
 * @property parentId - 上層類別 ID，null 表示根類別
 * @property level - 所在層級：根類別為 1，子類別遞增，由觸發器自動維護
 * @property isLeaf - 是否為葉節點（沒有子類別），由觸發器自動維護
 * @property pathCache - 從根到目前節點的所有 ID 陣列，如：[1,5,8]，由觸發器自動維護
 * @property pathText - 從根到目前節點的路徑文字，如：'/3C/手機/智慧型手機'，由觸發器自動維護
 * @property sortOrder - 同層級間的排序順序，數字越小越前面
 * @property status - 類別狀態：active啟用，inactive停用
 * @property imageUrl - 類別代表圖片網址
 * @property createdAt - 類別建立時間
 */
export interface Category {
  id: number;
  name: string;
  slug: string | null;
  parentId: number | null;
  level: number;
  isLeaf: boolean;
  pathCache: number[];
  pathText: string;
  sortOrder: number;
  status: CategoryStatus;
  imageUrl: string | null;
  createdAt: string;
}