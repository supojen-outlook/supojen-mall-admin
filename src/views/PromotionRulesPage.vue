<template>
  <div class="promotion-rules-page">
    <!-- 頁面標題 -->
    <div class="page-header">
      <el-button type="text" @click="handleBack" class="back-button">
        <i class="ri-arrow-left-line"></i> 返回促銷列表
      </el-button>
      <h1>促銷規則管理</h1>
      <el-button 
        type="primary" 
        @click="showCreateDialog">
        <i class="ri-add-line"></i> 新增規則
      </el-button>
    </div>

    <div class="rules-container">
      <el-card class="rules-list">
        <template #header>
          <div class="card-header">
            <span>規則列表</span>
            <div class="header-actions">
              <el-select
                v-model="filters.ruleType"
                placeholder="規則類型"
                clearable
                style="width: 120px"
                @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="滿額減" value="full_reduction" />
                <el-option label="折扣" value="discount" />
                <el-option label="贈品" value="gift" />
                <el-option label="免運" value="free_shipping" />
              </el-select>
              <el-input
                v-model="filters.search"
                placeholder="搜尋規則..."
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
            prop="tabName"
            label="規則名稱"
            min-width="150">
            <template #default="{ row }">
              <el-tooltip 
                :content="row.tabName" 
                placement="top" 
                :disabled="!row.tabName || row.tabName.length <= 10"
              >
                <div class="text-ellipsis">
                  {{ row.tabName || '-' }}
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            prop="ruleType"
            label="規則類型"
            width="120">
            <template #default="{ row }">
              <el-tag :type="getRuleTypeTagType(row.ruleType)" effect="plain">
                {{ getRuleTypeLabel(row.ruleType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="thresholdAmount"
            label="滿額門檻"
            width="120">
            <template #default="{ row }">
              {{ row.thresholdAmount ? `NT$ ${row.thresholdAmount}` : '-' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="thresholdQuantity"
            label="滿件門檻(贈品)"
            width="120">
            <template #default="{ row }">
              {{ row.thresholdQuantity ? `${row.thresholdQuantity} 件` : '-' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="discountAmount"
            label="折抵金額"
            width="120">
            <template #default="{ row }">
              {{ row.discountAmount ? `NT$ ${row.discountAmount}` : '-' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="discountRate"
            label="折扣率"
            width="100">
            <template #default="{ row }">
              {{ row.discountRate ? `${row.discountRate}%` : '-' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="giftItemId"
            label="贈品商品"
            width="120">
            <template #default="{ row }">
              {{ row.giftItemId ? `ID: ${row.giftItemId}` : '-' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="giftQuantity"
            label="贈品數量"
            width="100">
            <template #default="{ row }">
              {{ row.giftQuantity || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="150"
            fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                @click="handleEdit(row)">
                編輯
              </el-button>
              <el-popconfirm
                title="確定要刪除這個規則嗎？"
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

    <!-- 新增/編輯規則對話框 -->
    <PromotionRuleForm
      v-model="dialogVisible"
      :mode="dialogMode"
      :initial-data="currentRule"
      :promotion-id="promotionId"
      @success="handleFormSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePagination } from '@/composables/usePagination'
import { PromotionRuleForm } from '@/components/PromotionRuleForm'
import { 
  getPromotionRules,
  deletePromotionRule
} from '@/services/PromotionRule'
import type { PromotionRule } from '@/model'

// Route params
const route = useRoute()
const router = useRouter()
const promotionId = computed(() => Number(route.params.promotionId))

// State
const currentRule = ref<PromotionRule | null>(null)
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
} = usePagination<PromotionRule>({
  fetchList: async (params: any) => {
    const result = await getPromotionRules({
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
    ruleType: ''
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

// Handle edit
const handleEdit = (rule: PromotionRule) => {
  currentRule.value = { ...rule }
  dialogMode.value = 'edit'
  dialogVisible.value = true
}

// Handle delete
const handleDelete = async (id: number) => {
  try {
    await deletePromotionRule({ ruleId: id })
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
const getRuleTypeLabel = (ruleType: string) => {
  const labels: Record<string, string> = {
    full_reduction: '滿額減',
    discount: '折扣',
    gift: '贈品',
    free_shipping: '免運'
  }
  return labels[ruleType] || ruleType
}

const getRuleTypeTagType = (ruleType: string) => {
  const types: Record<string, string> = {
    full_reduction: 'success',
    discount: 'primary',
    gift: 'warning',
    free_shipping: 'info'
  }
  return types[ruleType] || 'info'
}
</script>

<style scoped>
.promotion-rules-page {
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

.rules-container {
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
