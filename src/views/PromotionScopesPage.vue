<template>
  <div class="promotion-scopes-page">
    <!-- 頁面標題 -->
    <div class="page-header">
      <el-button type="text" @click="handleBack" class="back-button">
        <i class="ri-arrow-left-line"></i> 返回促銷列表
      </el-button>
      <h1>促銷作用域管理</h1>
      <el-button 
        type="primary" 
        @click="showCreateDialog">
        <i class="ri-add-line"></i> 新增作用域
      </el-button>
    </div>

    <div class="scopes-container">
      <el-card class="scopes-list">
        <template #header>
          <div class="card-header">
            <span>作用域列表</span>
            <div class="header-actions">
              <el-select
                v-model="filters.scopeType"
                placeholder="作用域類型"
                clearable
                style="width: 120px"
                @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="指定商品" value="product" />
                <el-option label="指定分類" value="category" />
                <el-option label="指定品牌" value="brand" />
                <el-option label="全館" value="all" />
              </el-select>
              <el-select
                v-model="filters.isExclude"
                placeholder="排除/包含"
                clearable
                style="width: 120px"
                @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="包含" :value="false" />
                <el-option label="排除" :value="true" />
              </el-select>
              <el-input
                v-model="filters.search"
                placeholder="搜尋作用域..."
                clearable
                style="width: 200px"
                @clear="handleSearch"
                @keyup.enter="handleSearch">
                <template #prefix>
                  <i class="ri-search-line"></i>
                </template>
              </el-input>
            </div>
          </div>
        </template>

        <el-table
          v-loading="loading"
          :data="items"
          row-key="id"
          @sort-change="handleSortChange">
          <el-table-column
            prop="scopeType"
            label="作用域類型"
            width="120">
            <template #default="{ row }">
              <el-tag :type="getScopeTypeTagType(row.scopeType)" effect="plain">
                {{ getScopeTypeLabel(row.scopeType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="scopeId"
            label="對象 ID"
            width="100">
            <template #default="{ row }">
              {{ row.scopeId }}
            </template>
          </el-table-column>
          <el-table-column
            prop="scopeName"
            label="對象名稱"
            min-width="200">
            <template #default="{ row }">
              <el-tooltip 
                :content="row.scopeName || row.scopeId.toString()" 
                placement="top" 
                :disabled="!row.scopeName || row.scopeName.length <= 20"
              >
                <div class="text-ellipsis">
                  {{ row.scopeName || `ID: ${row.scopeId}` }}
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            prop="isExclude"
            label="類型"
            width="100">
            <template #default="{ row }">
              <el-tag :type="row.isExclude ? 'danger' : 'success'" effect="plain">
                {{ row.isExclude ? '排除' : '包含' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="120"
            fixed="right">
            <template #default="{ row }">
              <el-popconfirm
                title="確定要刪除這個作用域嗎？"
                @confirm="handleDelete(row.id)">
                <template #reference>
                  <el-button
                    type="danger"
                    link>
                    刪除
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 新增/編輯作用域對話框 -->
    <PromotionScopeForm
      v-model="dialogVisible"
      :mode="dialogMode"
      :initial-data="currentScope"
      :promotion-id="promotionId"
      @success="handleFormSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePagination } from '@/composables/usePagination'
import { PromotionScopeForm } from '@/components/PromotionScopeForm'
import { 
  getPromotionScopes,
  deletePromotionScope
} from '@/services/PromotionScope'
import type { PromotionScope } from '@/model'

// Route params
const route = useRoute()
const router = useRouter()
const promotionId = computed(() => Number(route.params.promotionId))

// State
const currentScope = ref<PromotionScope | null>(null)
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')

// Use pagination
const {
  // State
  items, 
  loading,
  filters,
  
  // Methods
  loadItems,
  handleSearch,
  handleSortChange,
  refreshList
} = usePagination<PromotionScope>({
  fetchList: async (params: any) => {
    const result = await getPromotionScopes({
      promotionId: promotionId.value,
      ...params
    })
    return {
      list: result,
      cursor: null,
      hasMore: false
    }
  },
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'desc',
  defaultFilters: {
    search: '',
    scopeType: '',
    isExclude: ''
  }
})

// Lifecycle
onMounted(() => {
  loadItems()
})

// Show create dialog
const showCreateDialog = () => {
  dialogMode.value = 'create'
  dialogVisible.value = true
}

// Handle delete
const handleDelete = async (id: number) => {
  try {
    await deletePromotionScope({ scopeId: id })
    ElMessage.success('刪除成功')
    refreshList()
  } catch (error) {
    ElMessage.error('刪除失敗')
  }
}

// Handle form success
const handleFormSuccess = () => {
  dialogVisible.value = false
  refreshList()
}

// Handle back to promotions
const handleBack = () => {
  router.push('/promotions')
}

// Helper functions
const getScopeTypeLabel = (scopeType: string) => {
  const labels: Record<string, string> = {
    product: '指定商品',
    category: '指定分類',
    brand: '指定品牌',
    all: '全館'
  }
  return labels[scopeType] || scopeType
}

const getScopeTypeTagType = (scopeType: string) => {
  const types: Record<string, string> = {
    product: 'primary',
    category: 'success',
    brand: 'info',
    all: 'warning'
  }
  return types[scopeType] || 'info'
}
</script>

<style scoped>
.promotion-scopes-page {
  padding: 5px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.back-button {
  color: var(--el-text-color-regular);
}

.back-button:hover {
  color: var(--el-color-primary);
}

.scopes-container {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-ellipsis:hover {
  white-space: normal;
  word-break: break-all;
}
</style>
