import type { Specification } from './Specification'

/**
 * 產品基礎接口
 * 包含產品的基本信息
 * 
 * @property id - 產品唯一識別碼
 * @property spuCode - 產品編號 (SPU Code)，標準產品單元的編碼
 * @property name - 產品名稱，用於列表頁、詳情頁展示
 * @property price - 產品價格，產品的基礎售價
 * @property categoryId - 類別 ID，產品所屬的分類 ID
 * @property brandId - 品牌 ID，產品所屬的品牌 ID
 * @property mainImageUrl - 主圖 URL，產品主要展示圖片的網址
 * @property tags - 標籤陣列，用於標記產品特性的關鍵字
 * @property status - 產品狀態，表示產品當前的生命週期狀態
 * @property createdAt - 建立時間，產品資料建立的時間戳
 */
export interface ProductBase {
  id: number;
  spuCode: string;
  name: string;
  price: number;
  categoryId?: number | null;
  brandId?: number | null;
  mainImageUrl?: string | null;
  tags: string[];
  status: 'active' | 'inactive' | 'draft' | 'pending';
  createdAt: string;
}

/**
 * 產品完整接口
 * 繼承 ProductBase 並包含更多詳細信息
 * 
 * @property description - 商品詳細描述，用於商品詳細頁面和 SEO 優化
 * @property detailImages - 商品詳情圖陣列，用於商品詳細頁圖片輪播
 * @property videoUrl - 商品介紹影片網址，用於商品詳細頁影片播放
 * @property specs - 商品規格參數，用於商品篩選和比較功能
 */
export interface Product extends ProductBase {
  description?: string | null;
  detailImages: string[];
  videoUrl?: string | null;
  specs: Specification[];
}