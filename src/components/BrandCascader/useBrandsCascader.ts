import { ref } from 'vue';
import {
  getBrands,
  getBrandPath
} from '@/services/Brand';
import type { CascaderOption, CascaderProps } from 'element-plus';

/**
 * 提供多選品牌級聯選擇器相關的邏輯
 * @param leafOnly 是否只顯示葉子節點
 * @returns {Object} 包含 loading 狀態和 cascaderProps 的響應式對象
 */
export function useBrandsCascader(leafOnly: boolean = false) {
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
          // 加載根節點（level 1 的品牌）
          const rootBrands = await getBrands({
            level: 1,
            size: 1000 // 獲取所有 level 1 品牌
          });
          nodes = rootBrands.list.map(brand => ({
            value: brand.id,
            label: brand.name,
            leaf: brand.isLeaf,
            ...brand // Spread rest of properties
          } as CascaderOption));
        } else {
          // 加載子節點
          const children = await getBrands({
            parentId: data.value as number,
            size: 1000 // 獲取所有子節點
          });
          nodes = children.list.map(brand => ({
            value: brand.id,
            label: brand.name,
            leaf: brand.isLeaf,
            ...brand // Spread rest of properties
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
        console.error('加載品牌失敗:', error);
        resolve([]);
      }
    }
  });

  /**
   * 根據品牌ID獲取從根節點到該品牌的完整路徑
   * 
   * @param id - 要查詢的品牌ID
   * @returns 返回一個 Promise，解析為包含從根節點到該品牌的ID路徑陣列
   *          如果獲取路徑失敗，則返回包含原始ID的陣列作為回退
   * @example
   * // 返回範例: [1, 5, 12] 表示根節點(1) -> 一級品牌(5) -> 當前品牌(12)
   * const path = await getPath(12);
   */
  async function getPath(id: number): Promise<number[]> {
    try {
      const response = await getBrandPath(id);
      return response || [id];
    } catch (error) {
      console.error('獲取品牌路徑失敗:', error);
      return [id]; // 回退到只返回當前ID
    }
  }

  return {
    loading,
    cascaderProps,
    getPath
  }
}
