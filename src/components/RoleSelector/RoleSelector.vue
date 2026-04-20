<!--
  RoleSelector 組件

  功能：
  - 提供一個可搜索的角色選擇器
  - 支持多選角色
  - 顯示角色代碼和名稱

  特性：
  - 使用 Element Plus 的 Select 組件封裝
  - 支持異步加載和搜索
  - 響應式設計，適配不同屏幕尺寸
-->
<template>
  <el-select
    v-model="selectedValues"
    multiple
    filterable
    remote
    :remote-method="handleSearch"
    :loading="loading"
    clearable
    popper-class="role-selector-popper"
    @visible-change="handleVisibleChange"
    placeholder="請選擇角色"
    class="w-full"
  >
    <el-option
      v-for="item in roleOptions"
      :key="item.id"
      :label="item.name"
      :value="item.id"
    >
      <el-tooltip
        :content="item.description || '沒有描述'"
        placement="top"
        :disabled="!item.description"
        popper-class="role-tooltip"
      >
        <div class="option-content">
          <span class="option-name">{{ item.name }}</span>
          <el-tag
            size="small"
            class="option-code">
            {{ item.code }}
          </el-tag>
        </div>
      </el-tooltip>
    </el-option>
  </el-select>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ElSelect, ElOption, ElTooltip, ElTag } from 'element-plus'
import { getRoles } from '@/services/Role'
import type { Role } from '@/model'

/**
 * 組件屬性定義
 * @property {number[]} modelValue - 雙向綁定的選中值（角色 ID 陣列）
 */
const props = defineProps({
  modelValue: {
    type: Array as () => number[],
    default: () => []
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
const selectedValues = ref<number[]>([])
const roleOptions = ref<Role[]>([])
const searchKeyword = ref('')
const pageSize = 50

/**
 * 監聽選中值變化
 * 當 selectedValues 變化時，觸發 update:modelValue 事件
 * 實現 v-model 雙向綁定
 */
watch(selectedValues, (newVal) => {
  emit('update:modelValue', newVal)
})

/**
 * 監聽外部傳入的 modelValue 變化
 * 當外部傳入的 modelValue 變化時，同步更新組件內部狀態
 */
watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(selectedValues.value)) {
    selectedValues.value = newVal || []
  }
})

/**
 * 加載角色數據
 */
const loadRoles = async () => {
  try {
    loading.value = true

    const params = {
      search: searchKeyword.value || undefined,
      size: pageSize
    }

    const result = await getRoles(params)
    roleOptions.value = result.list

  } catch (error) {
    console.error('加載角色失敗:', error)
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
  loadRoles()
}

/**
 * 處理下拉框顯示/隱藏
 * @param {boolean} visible - 是否顯示
 */
const handleVisibleChange = (visible: boolean) => {
  if (visible) {
    if (roleOptions.value.length === 0) {
      loadRoles()
    }
  }
}

/**
 * 組件掛載時初始化
 */
onMounted(() => {
  selectedValues.value = props.modelValue || []
  // 如果有初始值，加載角色列表以顯示正確的名稱
  if (props.modelValue?.length > 0) {
    loadRoles()
  }
})
</script>

<style scoped>
.option-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.option-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px;
}

.option-code {
  background-color: #e1f3ff;
  color: #409eff;
  border-color: #b3d8ff;
  font-weight: 600;
  min-width: 60px;
  text-align: center;
}

.w-full {
  width: 100%;
}
</style>

<style>
.role-selector-popper {
  z-index: 9999 !important;
}

.role-selector-popper .el-select-dropdown__wrap {
  max-height: 274px;
}

.role-tooltip {
  max-width: 300px !important;
  line-height: 1.4 !important;
  white-space: pre-wrap !important;
  word-break: break-word !important;
  z-index: 10000 !important;
}
</style>
