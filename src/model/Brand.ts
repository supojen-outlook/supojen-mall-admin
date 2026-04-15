/**
 * Brand API 回應模型
 * 
 * 品牌實體，用於管理系統中的品牌資訊
 * 
 * @property id - 品牌唯一識別碼
 * @property name - 品牌顯示名稱
 * @property slug - URL 友好名稱，用於 SEO 優化
 * @property parentId - 上層品牌 ID，NULL 表示根品牌
 * @property level - 所在層級：根品牌為 1，子品牌遞增
 * @property isLeaf - 是否為葉節點（沒有子品牌）
 * @property pathCache - 從根到目前節點的所有 ID 陣列，如：[1,5,8]
 * @property pathText - 從根到目前節點的路徑文字，如：'/精品/時尚/服飾'
 * @property logoUrl - 品牌標誌圖片網址
 * @property description - 品牌詳細描述
 * @property sortOrder - 同層級間的排序順序，數字越小越前面
 * @property status - 品牌狀態：active啟用，inactive停用
 * @property createdAt - 品牌建立時間
 */
export interface Brand {
  id: number;
  name: string;
  slug?: string;
  parentId?: number | null;
  level: number;
  isLeaf: boolean;
  pathCache: number[];
  pathText: string;
  logoUrl?: string;
  description?: string;
  sortOrder: number;
  status: 'active' | 'inactive';
  createdAt: string;
}
