<!-- 
  UnitOfMeasureSelector 組件
  
  功能：
  - 提供一個可搜索、可滾動加載的計量單位選擇器
  - 支持遠程搜索和滾動加載
  - 顯示單位代碼、名稱和轉換率
  - 鼠標懸停顯示單位描述
  
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
    popper-class="unit-of-measure-selector-popper"
    @visible-change="handleVisibleChange"
    placeholder="請選擇計量單位"
    class="w-full"
  >
    <el-option
      v-for="item in unitOfMeasureOptions"
      :key="item.id"
      :label="item.name"
      :value="item.id"
    >
      <el-tooltip
        :content="item.description || '沒有描述'"
        placement="top"
        :disabled="!item.description"
        popper-class="unit-of-measure-tooltip"
      >
        <div class="option-content">
          <span class="option-name">{{ item.name }}</span>
          <el-tag 
            size="small" 
            class="option-code">
            {{ item.code }}
          </el-tag>
          <el-tag 
            v-if="item.conversionToBase > 1" 
            type="warning" 
            size="small" 
            class="option-conversion">
            = {{ item.conversionToBase }} EA
          </el-tag>
        </div>
      </el-tooltip>
    </el-option>
  </el-select>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ElSelect, ElOption, ElTooltip, ElTag } from 'element-plus'
import { getUnitOfMeasures } from '@/services/UnitOfMeasure'
import type { UnitOfMeasure } from '@/model'

/**
 * 組件屬性定義
 * @property {number | null} modelValue - 雙向綁定的選中值（計量單位 ID）
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
const loading = ref(false)
const selectedValue = ref<number | null>(null)
const unitOfMeasureOptions = ref<UnitOfMeasure[]>([])
const searchKeyword = ref('')
const pageSize = 20

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
 * 加載計量單位數據
 */
const loadUnitOfMeasures = async () => {
  try {
    loading.value = true

    const params = {
      search: searchKeyword.value || undefined,
      size: pageSize
    }

    const result = await getUnitOfMeasures(params)
    unitOfMeasureOptions.value = result.list

  } catch (error) {
    console.error('加載計量單位失敗:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 處理搜索
 * @param {string} query - 搜索關鍵字
 */
const handleSearch = (query: string) => {
  searchKeyword.value = query
  loadUnitOfMeasures()
}

/**
 * 處理下拉框顯示/隱藏
 * @param {boolean} visible - 是否顯示
 */
const handleVisibleChange = (visible: boolean) => {
  if (visible) {
    if (unitOfMeasureOptions.value.length === 0) {
      loadUnitOfMeasures()
    }
  }
}

/**
 * 組件掛載時初始化
 */
onMounted(() => {
  // 如果有初始值，可以預加載數據
  if (props.modelValue) {
    loadUnitOfMeasures()
  }
})
</script>

<style scoped>
.option-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.option-name {
  flex: 1;
  font-weight: 500;
  color: #303133;
}

.option-code {
  background-color: #e1f3ff;
  color: #409eff;
  border-color: #b3d8ff;
  font-weight: 600;
  min-width: 50px;
  text-align: center;
}

.option-conversion {
  background-color: #fdf6ec;
  color: #e6a23c;
  border-color: #f5dab1;
  font-size: 0.75rem;
}

.w-full {
  width: 100%;
}
</style>
