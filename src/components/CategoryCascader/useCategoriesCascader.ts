import { ref } from 'vue';
import {
  getCategories,
  getCategoryPath
} from '@/services/Category';
import type { CascaderOption, CascaderProps } from 'element-plus';

/**
 * 提供多選分類級聯選擇器相關的邏輯
 * @param leafOnly 是否只顯示葉子節點
 * @returns {Object} 包含 loading 狀態和 cascaderProps 的響應式對象
 */
export function useCategoriesCascader(leafOnly: boolean = false) {
  // 加載狀態
  const loading = ref(false)

  /**
   * Element Plus 級聯選擇器的配置項
   * 使用 lazy 模式動態加載子節點，支援多選
   */
  const cascaderProps = ref<CascaderProps>({
    // 啟用懶加載
    lazy: true,
    // 單選模式
    multiple: false,
    // 設置為 true 表示啟用嚴格選擇模式：
    // - 每個節點可以獨立選擇，不受父子節點關聯影響
    // - 父節點和子節點都可以被選中
    // - 選擇父節點不會自動選擇子節點（需要手動處理）
    checkStrictly: true,     // 嚴格模式，允許獨立選擇每個節點
    /**
     * 懶加載節點的異步函數
     * @param node 當前節點信息
     * @param resolve 回調函數，用於返回子節點數據
     */
    async lazyLoad(node, resolve: (nodes: CascaderOption[]) => void) {
      try {
        const { level, data } = node;
        let nodes: CascaderOption[] = [];  // Explicitly type the nodes array

        if (level === 0) {
          // 加載根節點（level 1 的分類）
          const rootCategories = await getCategories({
            level: 1,
            size: 1000 // 獲取所有 level 1 分類
          });
          nodes = rootCategories.list.map(category => ({
            value: category.id,
            label: category.name,
            leaf: category.isLeaf,
            ...category // Spread the rest of the properties
          } as CascaderOption));
        } else {
          // 加載子節點
          const children = await getCategories({
            parentId: data.value as number,
            size: 1000 // 獲取所有子節點
          });
          nodes = children.list.map(category => ({
            value: category.id,
            label: category.name,
            leaf: category.isLeaf,
            ...category // Spread the rest of the properties
          } as CascaderOption));
        }

        nodes = nodes.map(node => {
          // 根據 leafOnly 參數決定是否只允許選擇葉子節點
          const shouldDisable = leafOnly && !node.leaf;
          
          return {
            ...node,
            // 如果 leafOnly 為 true 且不是葉子節點，則禁用該節點
            disabled: shouldDisable
          };
        });

        resolve(nodes);
      } catch (error) {
        console.error('加載類別失敗:', error);
        resolve([]);
      }
    }
  });

  /**
   * 根據分類ID獲取從根節點到該分類的完整路徑
   * 
   * @param id - 要查詢的分類ID
   * @returns 返回一個 Promise，解析為包含從根節點到該分類的ID路徑陣列
   *          如果獲取路徑失敗，則返回包含原始ID的陣列作為回退
   * @example
   * // 返回範例: [1, 5, 12] 表示根節點(1) -> 一級分類(5) -> 當前分類(12)
   * const path = await getPath(12);
   */
  async function getPath(id: number): Promise<number[]> {
    try {
      const response = await getCategoryPath(id);
      return response || [id];
    } catch (error) {
      console.error('獲取類別路徑失敗:', error);
      return [id]; // 如果出錯，返回單個 ID 作為回退
    }
  }

  /**
   * 批量獲取多個分類ID的完整路徑
   * 
   * @param ids - 要查詢的分類ID陣列
   * @returns 返回一個 Promise，解析為包含所有路徑的二維陣列
   * @example
   * // 返回範例: [[1, 5, 12], [1, 6, 15]] 表示兩個分類的完整路徑
   * const paths = await getPaths([12, 15]);
   */
  async function getPaths(ids: number[]): Promise<number[][]> {
    try {
      // 並行獲取所有路徑
      const paths = await Promise.all(
        ids.map(id => getPath(id))
      );
      return paths.filter(path => path && path.length > 0);
    } catch (error) {
      console.error('批量獲取類別路徑失敗:', error);
      // 如果出錯，返回單個 ID 作為回退
      return ids.map(id => [id]);
    }
  }

  /**
   * 獲取指定父節點下的所有子節點ID（遞歸）
   * @param parentId 父節點ID
   * @returns 返回所有子節點ID陣列
   */
  async function getAllChildIds(parentId: number): Promise<number[]> {
    try {
      const children = await getCategories({
        parentId: parentId,
        size: 1000
      });
      let allChildIds: number[] = [];
      
      for (const child of children.list) {
        allChildIds.push(child.id);
        // 如果這個子節點還有子節點，遞歸獲取
        if (!child.isLeaf) {
          const grandChildIds = await getAllChildIds(child.id);
          allChildIds = allChildIds.concat(grandChildIds);
        }
      }
      
      return allChildIds;
    } catch (error) {
      console.error('獲取子節點失敗:', error);
      return [];
    }
  }

  return {
    loading,        // 加載狀態
    cascaderProps,  // 級聯選擇器配置
    getPath,        // 獲取單個類別路徑的方法
    getPaths,       // 批量獲取類別路徑的方法
    getAllChildIds  // 獲取所有子節點ID的方法
  }
}
