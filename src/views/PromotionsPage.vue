<template>
  <div class="promotion-management-page">
    <div class="page-header">
      <h1>促銷活動管理</h1>
      <el-button 
        type="primary" 
        @click="showCreateDialog">
        <i class="ri-add-line"></i> 新增促銷
      </el-button>
    </div>

    <div class="promotion-container">
      <el-card class="promotion-list">
        <template #header>
          <div class="card-header">
            <span>促銷活動列表</span>
            <div class="header-actions">
              <el-select
                v-model="filters.status"
                placeholder="狀態"
                clearable
                style="width: 120px"
                @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="草稿" value="draft" />
                <el-option label="啟用" value="active" />
                <el-option label="過期" value="expired" />
                <el-option label="停用" value="disabled" />
              </el-select>
              <el-select
                v-model="filters.channel"
                placeholder="通路"
                clearable
                style="width: 120px"
                @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="App" value="app" />
                <el-option label="Web" value="web" />
                <el-option label="全部通路" value="all" />
              </el-select>
              <el-select
                v-model="filters.userScope"
                placeholder="適用會員"
                clearable
                style="width: 120px"
                @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="全部會員" value="all" />
                <el-option label="青銅" value="bronze" />
                <el-option label="白銀" value="silver" />
                <el-option label="黃金" value="gold" />
                <el-option label="尊榮" value="vip" />
              </el-select>
              <el-input
                v-model="filters.search"
                placeholder="搜尋促銷活動..."
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
            prop="name"
            label="促銷名稱"
            width="160">
            <template #default="{ row }">
              <el-tooltip 
                :content="row.name" 
                placement="top" 
                :disabled="!row.name || row.name.length <= 15"
              >
                <div class="text-ellipsis">
                  {{ row.name || '-' }}
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            prop="description"
            label="描述"
            min-width="190">
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
            prop="channel"
            label="通路"
            width="80">
            <template #default="{ row }">
              <el-tag :type="getChannelTagType(row.channel)" effect="plain">
                {{ getChannelLabel(row.channel) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="userScope"
            label="適用會員"
            width="80">
            <template #default="{ row }">
              <el-tag :type="getUserScopeTagType(row.userScope)" effect="plain">
                {{ getUserScopeLabel(row.userScope) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="startDate"
            label="開始時間"
            width="100">
            <template #default="{ row }">
              {{ formatDate(row.startDate) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="endDate"
            label="結束時間"
            width="100">
            <template #default="{ row }">
              {{ formatDate(row.endDate) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            label="狀態"
            width="90">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)" effect="plain">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="usedCount"
            label="使用次數"
            width="80">
            <template #default="{ row }">
              {{ row.usedCount || 0 }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="240"
            fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                @click="handleEdit(row)">
                編輯
              </el-button>
              <el-button
                type="success"
                link
                @click="handleViewRules(row)">
                規則
              </el-button>
              <el-button
                type="warning"
                link
                @click="handleViewScopes(row)">
                作用域
              </el-button>
              <el-popconfirm
                title="確定要刪除這個促銷活動嗎？"
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

    <!-- New/Edit Promotion Dialog -->
    <PromotionForm
      v-model="dialogVisible"
      :mode="dialogMode"
      :initial-data="currentPromotion"
      @success="handleFormSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { PromotionForm } from '@/components/PromotionForm'
import { 
  getPromotions,
  deletePromotion
} from '@/services/Promotion'
import type { Promotion } from '@/model'
import { usePagination } from '@/composables/usePagination'

// State
const currentPromotion = ref<Promotion | null>(null)
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')

// Router
const router = useRouter()

// Use pagination
const {
  // State
  items, 
  loading,
  filters,
  pagination,
  
  // Methods
  loadItems,
  handleSearch,
  handleCurrentChange,
  handleSizeChange,
  handleSortChange,
  refreshList
} = usePagination<Promotion>({
  fetchList: getPromotions,
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'desc',
  defaultFilters: {
    search: '',
    status: '',
    channel: '',
    userScope: ''
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
const handleEdit = (promotion: Promotion) => {
  currentPromotion.value = { ...promotion }
  dialogMode.value = 'edit'
  dialogVisible.value = true
}

// Handle delete
const handleDelete = async (id: number) => {
  try {
    await deletePromotion({ id })
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

// Handle view rules
const handleViewRules = (promotion: Promotion) => {
  router.push({
    name: 'promotion-rules',
    params: { promotionId: promotion.id.toString() }
  })
}

// Handle view scopes
const handleViewScopes = (promotion: Promotion) => {
  router.push({
    name: 'promotion-scopes',
    params: { promotionId: promotion.id.toString() }
  })
}

// Helper functions
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: '草稿',
    active: '啟用',
    expired: '過期',
    disabled: '停用'
  }
  return labels[status] || status
}

const getStatusTagType = (status: string) => {
  const types: Record<string, string> = {
    draft: 'info',
    active: 'success',
    expired: 'warning',
    disabled: 'danger'
  }
  return types[status] || 'info'
}

const getChannelLabel = (channel: string) => {
  const labels: Record<string, string> = {
    app: 'App',
    web: 'Web',
    all: '全部'
  }
  return labels[channel] || channel
}

const getChannelTagType = (channel: string) => {
  const types: Record<string, string> = {
    app: 'primary',
    web: 'success',
    all: 'warning'
  }
  return types[channel] || 'info'
}

const getUserScopeLabel = (userScope: string) => {
  const labels: Record<string, string> = {
    all: '全部',
    bronze: '青銅',
    silver: '白銀',
    gold: '黃金',
    vip: '尊榮'
  }
  return labels[userScope] || userScope
}

const getUserScopeTagType = (userScope: string) => {
  const types: Record<string, string> = {
    all: 'info',
    bronze: 'warning',
    silver: 'primary',
    gold: 'success',
    vip: 'danger'
  }
  return types[userScope] || 'info'
}
</script>

<style scoped>
.promotion-management-page {
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

.promotion-container {
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
</style>
