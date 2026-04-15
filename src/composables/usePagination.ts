import { ref, type Ref } from 'vue'
import type { Pagination } from '@/model'

/**
 * 分頁列表配置選項
 * 用於配置 usePagination 的行為
 * 
 * @template T 列表項目的類型
 * @template F 過濾條件的類型，默認為 any
 */
interface PaginationListOptions<T, F = any> {
  /** 獲取分頁列表資料的異步函數，必須返回 Pagination<T> 格式 */
  fetchList: (params: any) => Promise<Pagination<T>>
  /** 默認的過濾條件 */
  defaultFilters?: F
  /** 每頁顯示的記錄數，默認為 10 */
  pageSize?: number
  /** 默認排序字段，可以為 null */
  sortBy?: string | null
  /** 默認排序方向，'asc' 為升序，'desc' 為降序，可以為 null */
  sortDirection?: 'asc' | 'desc' | null
}

/**
 * 分頁狀態接口
 * 定義分頁相關的狀態屬性
 */
interface PaginationListState {
  /** 當前頁面的游標，用於獲取下一頁資料，null 表示第一頁 */
  cursor: string | null
  /** 每頁顯示的記錄數 */
  pageSize: number
  /** 當前頁碼，從 1 開始 */
  currentPage: number
  /** 當前排序字段，null 表示不排序 */
  sortBy: string | null
  /** 當前排序方向，null 表示不排序 */
  sortDirection?: 'asc' | 'desc' | null
  /** 是否正在載入資料 */
  isLoading: boolean
  /** 是否還有更多資料可以載入 */
  hasMore: boolean
}

/**
 * 分頁管理組合式函數
 * 封裝了基於游標的分頁邏輯，配合 Element Plus 分頁組件使用
 * 
 * 特點：
 * - 使用游標（cursor）進行分頁，而不是傳統的頁碼
 * - 支援排序和過濾功能
 * - 完美配合 Element Plus 的分頁組件
 * - 自動處理載入狀態和錯誤
 * 
 * @template T 列表項目的類型
 * @template F 過濾條件的類型，默認為 any
 * @param {Object} options 配置選項
 * @param {Function} options.fetchList 獲取列表資料的函數
 * @param {F} [options.defaultFilters={}] 默認過濾條件
 * @param {number} [options.pageSize=10] 每頁顯示條數
 * @param {string|null} [options.sortBy=null] 默認排序字段
 * @param {string|null} [options.sortDirection=null] 默認排序方向
 * @returns {Object} 返回狀態和方法
 */
export function usePagination<T, F = any>(options: PaginationListOptions<T, F>) {
  const {
    fetchList,                    // 獲取分頁資料的異步函數
    defaultFilters = {} as F,     // 默認的過濾條件
    pageSize = 10,                // 每頁顯示的記錄數，默認為 10
    sortBy = null,                // 排序字段，默認為 null（不排序）
    sortDirection = null          // 排序方向，默認為 null（不排序）
  } = options

  // 響應式狀態
  const items = ref<T[]>([]) as Ref<T[]>           // 當前頁面的資料列表
  const loading = ref(false)                        // 全局載入狀態
  const filters = ref<F>({ ...defaultFilters })     // 過濾條件

  // 分頁狀態
  const pagination = ref<PaginationListState>({
    cursor: null,              // 當前游標，null 表示第一頁
    pageSize,                  // 每頁條數
    currentPage: 1,            // 當前頁碼
    sortBy,                    // 排序字段
    sortDirection,             // 排序方向
    isLoading: false,          // 分頁載入狀態
    hasMore: true,             // 是否還有更多資料
  })

  /**
   * 重置分頁狀態到初始值
   * 這會清空游標、重置頁碼為 1，並清空資料列表
   */
  const resetPagination = () => {
    pagination.value = {
      cursor: null,
      pageSize,
      currentPage: 1,
      sortBy,
      sortDirection,
      isLoading: false,
      hasMore: true,
    }
    items.value = []  // 清空資料列表
  }

  /**
   * 更新分頁狀態
   * @param updates 要更新的分頁狀態屬性，使用部分更新方式
   * @example
   * // 更新當前頁碼和每頁條數
   * updatePagination({ currentPage: 2, pageSize: 20 })
   */
  const updatePagination = (updates: Partial<PaginationListState>) => {
    pagination.value = { ...pagination.value, ...updates }
  }

  /**
   * 載入當前頁面的資料
   * 根據當前的分頁狀態、過濾條件和排序設定獲取資料
   * 
   * 工作流程：
   * 1. 檢查是否正在載入，避免重複請求
   * 2. 設定載入狀態
   * 3. 準備 API 請求參數
   * 4. 調用 fetchList 獲取資料
   * 5. 更新狀態（資料列表、游標、是否有更多資料）
   * 6. 清除載入狀態
   */
  const loadItems = async () => {
    if (pagination.value.isLoading) return  // 避免重複載入

    try {
      pagination.value.isLoading = true
      loading.value = true

      // 準備 API 請求參數
      const params: any = {
        ...filters.value,              // 過濾條件
        size: pagination.value.pageSize // 每頁條數
      }

      // 如果有游標，加入參數（用於獲取指定頁面的資料）
      if (pagination.value.cursor) {
        params.cursor = pagination.value.cursor
      }

      // 如果有排序設定，加入參數
      if (pagination.value.sortBy) {
        params.sortBy = pagination.value.sortBy
        params.sortDirection = pagination.value.sortDirection
      }

      // 調用 API 獲取資料
      const result = await fetchList(params)
      
      // 更新資料列表
      items.value = result.list
      
      // 更新游標（用於下一頁請求）
      pagination.value.cursor = result.cursor
      
      // 判斷是否還有更多資料（cursor 為 null 表示沒有下一頁）
      pagination.value.hasMore = result.cursor !== null

    } catch (error) {
      console.error('Failed to load items:', error)
      throw error
    } finally {
      pagination.value.isLoading = false
      loading.value = false
    }
  }

  /**
   * 處理頁碼變化
   * @param page 新的頁碼
   * 
   * 工作流程：
   * 1. 檢查新頁碼是否與當前頁相同，相同則不處理
   * 2. 如果是第一頁，重置游標為 null
   * 3. 更新當前頁碼
   * 4. 載入新頁面的資料
   * 
   * 注意：這個函數專門為 Element Plus 分頁組件設計
   */
  const handlePageChange = async (page: number) => {
    if (page === pagination.value.currentPage) return  // 避免重載
    
    // 如果是第一頁，重置游標
    if (page === 1) {
      pagination.value.cursor = null
    }
    
    pagination.value.currentPage = page
    await loadItems()
  }

  /**
   * 處理搜索
   * 重置分頁狀態並重新載入資料
   * 
   * 工作流程：
   * 1. 重置分頁狀態（回到第一頁）
   * 2. 載入符合搜索條件的資料
   */
  const handleSearch = async () => {
    resetPagination()
    await loadItems()
  }

  /**
   * 處理排序變化
   * @param sort 排序設定
   * @param sort.prop 排序字段
   * @param sort.order 排序方向 'ascending' | 'descending' | null
   * 
   * 工作流程：
   * 1. 更新排序設定
   * 2. 重置分頁狀態（排序變化需要回到第一頁）
   * 3. 載入排序後的資料
   */
  const handleSortChange = async ({ prop, order }: { prop: string; order: 'ascending' | 'descending' | null }) => {
    pagination.value.sortBy = prop
    pagination.value.sortDirection = order === 'ascending' ? 'asc' : order === 'descending' ? 'desc' : null
    resetPagination()
    await loadItems()
  }

  /**
   * 處理每頁條數變化
   * @param size 新的每頁條數
   * 
   * 工作流程：
   * 1. 更新每頁條數
   * 2. 重置分頁狀態（條數變化需要回到第一頁）
   * 3. 載入新條數設定下的資料
   */
  const handleSizeChange = async (size: number) => {
    pagination.value.pageSize = size
    resetPagination()
    await loadItems()
  }

  /**
   * 重新整理列表
   * 保持當前的過濾條件和排序設定，重新載入第一頁資料
   */
  const refreshList = async () => {
    resetPagination()
    await loadItems()
  }

  /**
   * 重置過濾條件
   * 將過濾條件恢復為默認值並重新載入資料
   */
  const resetFilters = async () => {
    filters.value = { ...defaultFilters }
    await refreshList()
  }

  /**
   * 處理頁碼變化（別名，保持向後兼容）
   * @param page 新的頁碼
   */
  const handleCurrentChange = handlePageChange

  return {
    // 狀態
    items,               // 當前頁面的資料列表
    loading,             // 全局載入狀態
    filters,             // 過濾條件
    pagination,          // 分頁狀態

    // 方法
    loadItems,           // 載入當前頁面資料
    handlePageChange,    // 處理頁碼變化（Element Plus 分頁組件）
    handleCurrentChange, // 處理頁碼變化（別名，保持向後兼容）
    handleSearch,        // 處理搜索
    handleSortChange,    // 處理排序變化
    handleSizeChange,    // 處理每頁條數變化
    refreshList,         // 重新整理列表
    resetFilters,        // 重置過濾條件
    resetPagination,     // 重置分頁狀態
    updatePagination     // 更新分頁狀態
  }
}

export type UsePaginationReturn = ReturnType<typeof usePagination>
