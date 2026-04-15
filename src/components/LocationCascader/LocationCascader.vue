<template>
  <!-- 
    Element Plus 多選級聯選擇器
    - v-model: 雙向綁定選擇的值（多選）
    - :key: 強制重新渲染的鍵，當 cascaderKey 變化時會重新創建組件
    - :props: 級聯選擇器的配置項
    - :show-all-levels: 是否顯示完整路徑
    - @change: 當選擇發生變化時觸發
  -->
  <el-cascader
    v-model="internalValue"
    :key="'cascader-' + cascaderKey"
    :props="cascaderProps"
    :placeholder="placeholder"
    :clearable="clearable"
    :filterable="filterable"
    :disabled="disabled || loading"
    :show-all-levels="true"
    :collapse-tags="collapseTags"
    :max-collapse-tags="maxCollapseTags"
    @change="handleChange"
  />
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useLocationsCascader } from './useLocationsCascader.ts'

// 組件屬性定義
const props = defineProps({
  // 雙向綁定的值，表示當前選擇的節點ID（單選）
  modelValue: {
    type: Number,
    default: undefined
  },
  // 重新加載觸發器，當此值變化時會強制重新渲染
  reloadTrigger: {
    type: Number,
    default: 0
  },
  // 佔位符文本
  placeholder: {
    type: String,
    default: '請選擇位置'
  },
  // 是否可清空
  clearable: {
    type: Boolean,
    default: true
  },
  // 是否可搜索
  filterable: {
    type: Boolean,
    default: true
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  leafOnly: {
    type: Boolean,
    default: false
  },
  // 是否折疊標籤
  collapseTags: {
    type: Boolean,
    default: true
  },
  // 折疊標籤的最大顯示數量
  maxCollapseTags: {
    type: Number,
    default: 3
  }
})

// 監聽 reloadTrigger 變化
watch(() => props.reloadTrigger, () => {
  cascaderKey.value++  // 強制重新渲染
})

// 定義組件事件
const emit = defineEmits([
  'update:modelValue',  // 更新 modelValue 事件
  'change'              // 值變化事件
])

// 從 useLocationsCascader 組合式函數中獲取狀態和方法
const { loading, cascaderProps: baseCascaderProps, getPath } = useLocationsCascader(props.leafOnly)

// 用於強制重新渲染組件的鍵
const cascaderKey = ref(0)

// 內部使用的值，用於 v-model 雙向綁定（單選時為路徑陣列）
const internalValue = ref<number[]>([])

// 合併基礎屬性和本地屬性
const cascaderProps = computed(() => ({
  ...baseCascaderProps.value,  // 從 useLocationsCascader 獲取的基礎屬性
  emitPath: true,              // 返回選中節點的路徑
  nodeKey: 'id'                // 使用 'id' 作為節點的唯一標識
}))

/**
 * 監聽外部 modelValue 的變化
 * 當外部傳入的 modelValue 變化時，更新內部狀態
 */
watch(() => props.modelValue, async (newVal) => {
  if (!newVal || newVal === undefined) {
    internalValue.value = []
  } else {
    try {
      // 獲取位置的完整路徑
      const path = await getPath(newVal)
      internalValue.value = path
    } catch (error) {
      console.error('加載位置路徑失敗:', error)
      // 如果獲取路徑失敗，回退到只設置當前 ID
      internalValue.value = [newVal]
    }
  }
}, { immediate: true }) // 立即執行一次，初始化內部狀態

/**
 * 處理選擇變化的回調函數
 * @param value 選擇的節點路徑陣列
 */
const handleChange = async (value: number[]) => {
  // 提取路徑的最後一個元素作為選中的 ID
  const selectedId = value && value.length > 0 ? value[value.length - 1] : undefined
  
  // 更新內部值
  internalValue.value = value || []
  
  // 如果選擇的值與當前值不同，觸發更新事件
  if (selectedId !== props.modelValue) {
    // 更新 v-model 綁定的值
    emit('update:modelValue', selectedId)
    // 觸發 change 事件
    emit('change', selectedId)
  }
}
</script>
