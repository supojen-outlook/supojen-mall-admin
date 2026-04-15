<!-- 
  AttributeKeySelector 組件
  
  功能：
  - 提供一個可搜索、可滾動加載的屬性鍵值選擇器
  - 支持多選和遠程搜索
  - 滾動到底部自動加載更多選項
  - 鼠標懸停顯示屬性描述
  
  特性：
  - 使用 Element Plus 的 Select 組件封裝
  - 支持異步加載和搜索
  - 優化大量數據加載性能
  - 響應式設計，適配不同屏幕尺寸
-->
<template>
  <el-select
    ref="selectRef"
    v-model="selectedValue"
    filterable
    remote
    :remote-method="handleSearch"
    :loading="loading"
    :remote-show-suffix="true"
    clearable
    popper-class="attribute-key-selector-popper"
    @visible-change="handleVisibleChange"
    placeholder="請選擇屬性"
    class="w-full"
  >
    <el-option
      v-for="item in attributeKeyOptions"
      :key="item.id"
      :label="item.name"
      :value="item.id"
    >
      <el-tooltip
        :content="item.description || '沒有描述'"
        placement="top"
        :disabled="!item.description"
        popper-class="attribute-key-tooltip"
      >
        <div class="option-content">
          <span class="option-name">{{ item.name }}</span>
          <el-tag 
            v-if="item.inputType" 
            :type="getInputTypeTagType(item.inputType)" 
            size="small" 
            class="option-tag">
            {{ getInputTypeText(item.inputType) }}
          </el-tag>
        </div>
      </el-tooltip>
    </el-option>
    <template #footer v-if="hasMore">
      <div class="loading-more" v-loading="loadingMore">
        <span v-if="!loadingMore">滾動加載更多</span>
      </div>
    </template>
  </el-select>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElSelect, ElOption, ElTooltip, ElTag } from 'element-plus'
import { getAttributeKeys } from '@/services/AttributeKey'
import type { AttributeKey } from '@/model'

/**
 * 組件屬性定義
 * @property {number | null} modelValue - 雙向綁定的選中值（屬性鍵值 ID）
 */
const props = defineProps({
  modelValue: {
    type: Number as () => number | null,
    default: null
  }
})

/**
 * 定義組件事件
 * @event update:modelValue - 當選中值變化時觸發，用於 v-model 雙向綁定
 */
const emit = defineEmits(['update:modelValue'])

/*
 * 狀態管理
 */
const selectRef = ref()
const loading = ref(false)
const loadingMore = ref(false)
const selectedValue = ref<number | null>(null)
const attributeKeyOptions = ref<AttributeKey[]>([])
const hasMore = ref(true)
const currentCursor = ref<string>('')
const searchKeyword = ref('')
const pageSize = 10

/*
 * 輸入類型標籤樣式
 */
const getInputTypeTagType = (type: string): "primary" | "success" | "warning" | "info" => {
  const typeMap: Record<string, "primary" | "success" | "warning" | "info"> = {
    'select': 'primary',
    'text': 'success',
    'number': 'warning',
    'checkbox': 'info'
  }
  return typeMap[type] || 'info'
}

const getInputTypeText = (type: string) => {
  const textMap = {
    'select': '下拉選單',
    'text': '文字',
    'number': '數字',
    'checkbox': '複選框'
  }
  return textMap[type as keyof typeof textMap] || type
}

/**
 * 監聽選中值變化
 * 當 selectedValue 變化時，觸發 update:modelValue 事件
 * 實現 v-model 雙向綁定
 */
watch(selectedValue, (newVal) => {
  emit('update:modelValue', newVal)
})

/**
 * 監聽外部傳入的 modelValue 變化
 * 當外部傳入的 modelValue 變化時，同步更新組件內部狀態
 */
watch(() => props.modelValue, (newVal) => {
  if (newVal !== selectedValue.value) {
    selectedValue.value = newVal
  }
})

/**
 * 加載屬性鍵值數據
 * @param {boolean} loadMore - 是否為加載更多操作
 */
const loadAttributeKeys = async (loadMore: boolean = false) => {
  try {
    if (loadMore) {
      loadingMore.value = true
    } else {
      loading.value = true
      currentCursor.value = ''
      attributeKeyOptions.value = []
    }

    const params = {
      size: pageSize,
      cursor: loadMore ? currentCursor.value : undefined,
      search: searchKeyword.value,
    }

    const result = await getAttributeKeys(params)
    
    if (loadMore) {
      attributeKeyOptions.value = [...attributeKeyOptions.value, ...result.list]
    } else {
      attributeKeyOptions.value = result.list
    }

    currentCursor.value = result.cursor || ''
    hasMore.value = !!result.cursor  // 有 cursor 表示還有更多數據

  } catch (error) {
    console.error('加載屬性鍵值失敗:', error)
  } finally {
    if (loadMore) {
      loadingMore.value = false
    } else {
      loading.value = false
    }
  }
}

/**
 * 處理搜索
 * @param {string} query - 搜索關鍵字
 */
const handleSearch = (query: string) => {
  searchKeyword.value = query
  loadAttributeKeys(false)
}

/**
 * 處理下拉框顯示/隱藏事件
 * @param {boolean} visible - 下拉框是否可見
 */
const handleVisibleChange = (visible: boolean) => {
  if (visible) {
    // 當下拉框顯示時，確保加載屬性選項
    if (attributeKeyOptions.value.length === 0) {
      loadAttributeKeys(false)
    }
    // 延遲設置滾動監聽，確保下拉框已渲染
    setTimeout(setupScrollListener, 100)
  } else {
    // 下拉框隱藏時清理監聽
    cleanupScrollListener()
  }
}

/**
 * 滾動事件處理函數
 * 當用戶滾動到容器底部時觸發加載更多
 */
const handleScroll = () => {
  if (!scrollElement) return
  
  const { scrollTop, scrollHeight, clientHeight } = scrollElement
  
  // 當滾動到底部時觸發加載
  if (Math.ceil(scrollTop + clientHeight) >= scrollHeight) {
    if (!loadingMore.value && hasMore.value) {
      loadAttributeKeys(true)
    }
  }
}

/**
 * 清理滾動監聽和 DOM 觀察者
 * 防止內存洩漏
 */
const cleanupScrollListener = () => {
  if (scrollElement) {
    scrollElement.removeEventListener('scroll', handleScroll)
    scrollElement = null
  }
  if (observer) {
    observer.disconnect()
    observer = null
  }
}

/**
 * 設置滾動監聽
 * 1. 清理舊的監聽
 * 2. 獲取下拉框滾動容器
 * 3. 添加滾動事件監聽
 * 4. 設置 DOM 變化觀察者，處理動態加載的內容
 */
const setupScrollListener = () => {
  cleanupScrollListener() // 先清理舊的監聽
  
  nextTick(() => {
    if (!selectRef.value) return
    
    // 獲取下拉框元素
    const dropdown = document.querySelector('.attribute-key-selector-popper .el-select-dropdown')
    if (!dropdown) return
    
    const wrap = dropdown.querySelector<HTMLElement>('.el-select-dropdown__wrap')
    if (!wrap) return
    
    scrollElement = wrap
    wrap.addEventListener('scroll', handleScroll)
    
    // 監聽下拉框內容變化
    observer = new MutationObserver(() => {
      // 如果滾動元素被替換，重新設置監聽
      if (!wrap.isConnected) {
        cleanupScrollListener()
        setupScrollListener()
      }
    })
    
    observer.observe(dropdown, {
      childList: true,
      subtree: true
    })
  })
}

// 組件掛載時初始化選中值並加載第一頁數據
onMounted(() => {
  selectedValue.value = props.modelValue
})

// 組件卸載前清理事件監聽，防止內存洩漏
onBeforeUnmount(() => {
  cleanupScrollListener()
})

// 滾動元素和觀察者引用
let scrollElement: HTMLElement | null = null
let observer: MutationObserver | null = null
</script>

<style scoped>
/* 
 * 選項內容樣式
 */
.option-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0;
}

.option-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px;
}

  .option-tag {
  margin-left: 8px;
  flex-shrink: 0;
}

/* 
 * 加載更多提示的樣式
 */
.loading-more {
  padding: 12px 0;
  text-align: center;
  color: #909399;
  font-size: 12px;
}
</style>

<style>
/* 
 * 全局樣式
 * 使用 :global 修飾符確保樣式在 scoped 模式下仍然生效
 */
.attribute-key-selector-popper {
  z-index: 9999 !important;  /* 確保下拉框在最上層 */
}

.attribute-key-selector-popper .el-select-dropdown__wrap {
  max-height: 274px;  /* 限制下拉框最大高度 */
}

.attribute-key-tooltip {
  max-width: 300px !important;
  line-height: 1.4 !important;
  white-space: pre-wrap !important;
  word-break: break-word !important;
  z-index: 10000 !important;
}
</style>
