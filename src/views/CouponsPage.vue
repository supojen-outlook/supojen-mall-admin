<template>
  <div class="coupons-management-page">
    <div class="page-header">
      <h1>優惠券管理</h1>
      <el-button 
        type="primary" 
        @click="showCreateDialog">
        <i class="ri-add-line"></i> 新增優惠券
      </el-button>
    </div>

    <div class="coupons-container">
      <el-card class="coupons-list">
        <template #header>
          <div class="card-header">
            <span>優惠券列表</span>
            <div class="header-actions">
              <el-select
                v-model="filters.scopeType"
                placeholder="適用範圍"
                clearable
                style="width: 120px"
                @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="全部商品" value="all" />
                <el-option label="指定商品" value="product" />
                <el-option label="指定分類" value="category" />
                <el-option label="指定品牌" value="brand" />
              </el-select>
              <el-select
                v-model="filters.isUsed"
                placeholder="使用狀態"
                clearable
                style="width: 120px"
                @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="未使用" :value="false" />
                <el-option label="已使用" :value="true" />
              </el-select>
              <el-input
                v-model="filters.search"
                placeholder="搜尋優惠券代碼或名稱..."
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
            prop="couponCode"
            label="優惠券代碼"
            width="140">
            <template #default="{ row }">
              <el-tag type="primary" effect="plain">
                {{ row.couponCode }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="name"
            label="名稱"
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
            min-width="150">
            <template #default="{ row }">
              <el-tooltip 
                :content="row.description" 
                placement="top" 
                :disabled="!row.description || row.description.length <= 25"
              >
                <div class="text-ellipsis">
                  {{ row.description || '-' }}
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            prop="discountRate"
            label="折扣"
            width="80">
            <template #default="{ row }">
              <el-tag type="danger" effect="dark">
                {{ formatDiscount(row.discountRate) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="scopeType"
            label="適用範圍"
            width="100">
            <template #default="{ row }">
              <el-tag :type="getScopeTypeTagType(row.scopeType)" effect="plain">
                {{ getScopeTypeLabel(row.scopeType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="userId"
            label="指定用戶"
            width="120">
            <template #default="{ row }">
              <span v-if="row.userId">{{ row.userId }}</span>
              <el-tag v-else type="info" effect="plain" size="small">不限</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="validFrom"
            label="有效開始"
            width="100">
            <template #default="{ row }">
              {{ formatDate(row.validFrom) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="validUntil"
            label="有效截止"
            width="100">
            <template #default="{ row }">
              {{ row.validUntil ? formatDate(row.validUntil) : '永久' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="isUsed"
            label="使用狀態"
            width="90">
            <template #default="{ row }">
              <el-tag :type="row.isUsed ? 'info' : 'success'" effect="plain">
                {{ row.isUsed ? '已使用' : '未使用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="usedAt"
            label="使用時間"
            width="100">
            <template #default="{ row }">
              {{ row.usedAt ? formatDateTime(row.usedAt) : '-' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="orderId"
            label="訂單 ID"
            width="100">
            <template #default="{ row }">
              {{ row.orderId || '-' }}
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
                title="確定要刪除這個優惠券嗎？"
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

    <!-- 新增/編輯優惠券對話框 -->
    <CouponForm
      v-model="dialogVisible"
      :mode="dialogMode"
      :initial-data="currentCoupon"
      @success="handleFormSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { CouponForm } from '@/components/CouponForm'
import { 
  getCoupons,
  deleteCoupon
} from '@/services/Coupon'
import type { Coupon } from '@/model'
import { usePagination } from '@/composables/usePagination'

// State
const currentCoupon = ref<Coupon | null>(null)
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')

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
} = usePagination<Coupon>({
  fetchList: getCoupons,
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'desc',
  defaultFilters: {
    search: '',
    scopeType: '',
    isUsed: ''
  }
})

// Lifecycle
onMounted(() => {
  loadItems()
})

// Show create dialog
const showCreateDialog = () => {
  dialogMode.value = 'create'
  currentCoupon.value = null
  dialogVisible.value = true
}

// Handle edit
const handleEdit = (coupon: Coupon) => {
  currentCoupon.value = { ...coupon }
  dialogMode.value = 'edit'
  dialogVisible.value = true
}

// Handle delete
const handleDelete = async (id: number) => {
  try {
    await deleteCoupon(id)
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
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

const formatDiscount = (discountRate: number) => {
  // discountRate 如 15.00 表示 85折
  const discount = 100 - discountRate
  return `${discount}折`
}

const getScopeTypeLabel = (scopeType: string) => {
  const labels: Record<string, string> = {
    all: '全部',
    product: '商品',
    category: '分類',
    brand: '品牌'
  }
  return labels[scopeType] || scopeType
}

const getScopeTypeTagType = (scopeType: string) => {
  const types: Record<string, string> = {
    all: 'warning',
    product: 'primary',
    category: 'success',
    brand: 'info'
  }
  return types[scopeType] || 'info'
}
</script>

<style scoped>
.coupons-management-page {
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

.coupons-container {
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
