<template>
  <div class="shipping-rules-management-page">
    <div class="page-header">
      <h1>運費規則管理</h1>
      <el-button 
        type="primary" 
        @click="showCreateDialog">
        <i class="ri-add-line"></i> 新增運費規則
      </el-button>
    </div>

    <div class="shipping-rules-container">
      <el-card class="shipping-rules-list">
        <template #header>
          <div class="card-header">
            <span>運費規則列表</span>
            <div class="header-actions">
              <el-select
                v-model="filters.isActive"
                placeholder="狀態"
                clearable
                style="width: 120px"
                @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="啟用" :value="true" />
                <el-option label="停用" :value="false" />
              </el-select>
              <el-input
                v-model="filters.search"
                placeholder="搜尋規則名稱..."
                clearable
                style="width: 220px"
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
            prop="name"
            label="規則名稱"
            min-width="150">
            <template #default="{ row }">
              <el-tooltip 
                :content="row.name" 
                placement="top" 
                :disabled="!row.name || row.name.length <= 20"
              >
                <div class="text-ellipsis">
                  {{ row.name }}
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            prop="description"
            label="描述"
            min-width="180">
            <template #default="{ row }">
              <el-tooltip 
                :content="row.description" 
                placement="top" 
                :disabled="!row.description || row.description.length <= 30"
              >
                <div class="text-ellipsis">
                  {{ row.description || '-' }}
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            prop="condition"
            label="條件類型"
            width="120">
            <template #default="{ row }">
              <el-tag v-if="row.condition" :type="getConditionTagType(row.condition.ruleType)" effect="plain">
                {{ getConditionLabel(row.condition.ruleType) }}
              </el-tag>
              <el-tag v-else type="info" effect="plain">無條件</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="condition"
            label="條件詳情"
            min-width="150">
            <template #default="{ row }">
              <span v-if="row.condition && row.condition.ruleType === 'quantity'">
                數量: {{ formatRange(row.condition.minAmount, row.condition.maxAmount) }}
              </span>
              <span v-else-if="row.condition && row.condition.ruleType === 'amount'">
                金額: {{ formatRange(row.condition.minAmount, row.condition.maxAmount) }}
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="shippingFee"
            label="運費金額"
            width="100">
            <template #default="{ row }">
              <span class="shipping-fee">${{ row.shippingFee }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="priority"
            label="優先級"
            width="80">
            <template #default="{ row }">
              <el-tag type="primary" effect="dark">
                {{ row.priority }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="isActive"
            label="狀態"
            width="90">
            <template #default="{ row }">
              <el-tag :type="row.isActive ? 'success' : 'info'" effect="plain">
                {{ row.isActive ? '啟用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="140"
            fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                @click="handleEdit(row)">
                編輯
              </el-button>
              <el-popconfirm
                title="確定要刪除這個運費規則嗎？"
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

        <div class="pagination-container">
          <el-pagination
            :current-page="pagination.currentPage"
            :page-size="pagination.pageSize"
            :page-count="pagination.hasMore ? pagination.currentPage + 1 : pagination.currentPage"
            :disabled="loading || pagination.isLoading"
            :page-sizes="[10, 20, 30, 50]"
            layout="sizes, prev, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :pager-count="5"
            :hide-on-single-page="false" />
        </div>
      </el-card>
    </div>

    <!-- 新增/編輯運費規則對話框 -->
    <ShippingRuleForm
      v-model="dialogVisible"
      :mode="dialogMode"
      :initial-data="currentRule"
      @success="handleFormSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ShippingRuleForm } from '@/components/ShippingRuleForm'
import { 
  getShippingRules,
  deleteShippingRule
} from '@/services/ShippingRule'
import type { ShippingRule } from '@/model'
import { usePagination } from '@/composables/usePagination'

// State
const currentRule = ref<ShippingRule | null>(null)
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')

// Use pagination
const {
  items, 
  loading,
  filters,
  pagination,
  loadItems,
  handleSearch,
  handleCurrentChange,
  handleSizeChange,
  handleSortChange,
  refreshList
} = usePagination<ShippingRule>({
  fetchList: getShippingRules,
  pageSize: 10,
  sortBy: 'priority',
  sortDirection: 'asc',
  defaultFilters: {
    search: '',
    isActive: undefined
  }
})

// Lifecycle
onMounted(() => {
  loadItems()
})

// Show create dialog
const showCreateDialog = () => {
  dialogMode.value = 'create'
  currentRule.value = null
  dialogVisible.value = true
}

// Handle edit
const handleEdit = (rule: ShippingRule) => {
  currentRule.value = { ...rule }
  dialogMode.value = 'edit'
  dialogVisible.value = true
}

// Handle delete
const handleDelete = async (id: number) => {
  try {
    await deleteShippingRule(id)
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

// Helper functions
const getConditionLabel = (ruleType: string) => {
  const labels: Record<string, string> = {
    quantity: '按數量',
    amount: '按金額'
  }
  return labels[ruleType] || ruleType
}

const getConditionTagType = (ruleType: string) => {
  const types: Record<string, string> = {
    quantity: 'primary',
    amount: 'success'
  }
  return types[ruleType] || 'info'
}

const formatRange = (min: number | null | undefined, max: number | null | undefined) => {
  if (min != null && max != null) {
    return `${min} - ${max}`
  } else if (min != null) {
    return `≥ ${min}`
  } else if (max != null) {
    return `≤ ${max}`
  }
  return '-'
}

</script>

<style scoped>
.shipping-rules-management-page {
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

.shipping-rules-container {
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
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

.shipping-fee {
  font-weight: 600;
  color: var(--el-color-primary);
}
</style>
