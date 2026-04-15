/**
 * 泛型分頁類別，用於封裝分頁查詢結果
 * 
 * 設計目的：
 * 1. 統一分頁資料的回傳格式
 * 2. 支援 Keyset Pagination（游標分頁）模式
 * 3. 提供型別安全的泛型實作
 * 
 * 使用場景：
 * - 列表頁面的資料載入
 * - 無限滾動（Infinite Scroll）功能
 * - 需要分頁的 API 回應
 * 
 * 設計模式：
 * - 泛型類別：支援任意資料型別
 * - DTO 模式：專門用於資料傳輸
 * 
 * 與傳統分頁的差異：
 * - 傳統分頁：使用 PageNumber 和 PageSize
 * - 此類別：使用 Cursor（游標）實現更高效的分頁
 * 
 * 參考實作：
 * - UnitOfMeasuresQuery：使用 LastCreatedAt 作為游標
 * - RolesQuery：使用 LastId 作為游標
 * 
 * @template T 資料型別參數
 * 使用範例：
 * - Pagination<Product>：商品分頁
 * - Pagination<User>：用戶分頁
 * - Pagination<Order>：訂單分頁
 */
export interface Pagination<T> {
  /**
   * 分頁資料集合
   * 
   * 職責：
   * - 存儲當前頁面的資料項目
   * - 支援任意型別的資料集合
   * 
   * 資料特性：
   * - 可能為空集合（無資料時）
   * - 筆數由查詢時的 Size 參數決定
   * - 通常按時間或 ID 排序
   * 
   * 使用範例：
   * ```typescript
   * const products: Pagination<Product> = {
   *   list: [product1, product2, product3],
   *   cursor: "2023-01-01T00:00:00Z"
   * };
   * ```
   * 
   * 注意事項：
   * - 建議在 UI 層處理空集合情況
   * - 不應修改此集合（唯讀設計會更好）
   */
  list: T[];

  /**
   * 游標字串（用於 Keyset Pagination）
   * 
   * 職責：
   * - 記錄當前頁最後一筆資料的標識
   * - 用於取得下一頁資料
   * 
   * 游標類型：
   * - 時間戳記：如 "2023-01-01T00:00:00Z"
   * - ID：如 "12345"
   * - 編碼字串：如 "eyJpZCI6MTIzNDV9"
   * 
   * 工作原理：
   * 1. 前端記錄當前頁最後一筆資料的游標
   * 2. 下一頁請求時將此游標傳回後端
   * 3. 後端根據游標查詢下一批資料
   * 
   * 使用範例：
   * ```typescript
   * // 第一次請求（無游標）
   * GET /api/products?size=10
   * 
   * // 回應
   * {
   *   "list": [...],
   *   "cursor": "2023-01-01T00:00:00Z"
   * }
   * 
   * // 第二次請求（帶游標）
   * GET /api/products?size=10&cursor=2023-01-01T00:00:00Z
   * ```
   * 
   * 注意事項：
   * - 為 null 時表示沒有下一頁
   * - 應加密或編碼以防止客戶端篡改
   * - 前端不應解析此值，直接傳回即可
   */
  cursor: string | null;
}
