/**
 * 標籤模型
 * 
 * 用於定義產品標籤的數據結構
 * 
 * @property id - 標籤唯一識別碼
 * @property name - 標籤名稱，如：新品、熱銷、限時優惠
 * @property description - 標籤詳細描述，可為 null
 * @property sortOrder - 排序順序，數字越小越前面
 * @property createdAt - 標籤建立時間
 */
export interface Tag {
  id: number;
  name: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
}
