<template>
  <div class="product-management-page">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h1>產品管理</h1>
      <el-button type="primary" @click="showCreateDialog">
        <i class="ri-add-line"></i> 新增產品
      </el-button>
    </div>

    <div class="product-container">
      <el-card class="product-list">
        <template #header>
          <div class="card-header">
            <span>產品列表</span>
            <div class="header-actions">              
              <CategoryCascader 
                v-model="filters.categoryId"
                :reload-trigger="reloadTrigger"
                placeholder="選擇產品類別"
                :clearable="true"
                :filterable="true"
                @change="handleSearch"
                style="width: 200px; margin-right: 10px"
              />
              
              <BrandCascader 
                v-model="filters.brandId"
                placeholder="選擇產品品牌"
                :clearable="true"
                :filterable="true"
                @change="handleSearch"
                style="width: 200px; margin-right: 10px"
              />
              
              <el-select
                v-model="filters.status"
                placeholder="產品狀態"
                clearable
                style="width: 120px; margin-right: 10px"
                @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="上架" value="active" />
                <el-option label="下架" value="inactive" />
                <el-option label="草稿" value="draft" />
                <el-option label="審核中" value="pending" />
              </el-select>

              <el-input
                v-model="filters.search"
                placeholder="搜尋產品..."
                clearable
                style="width: 200px; margin-right: 10px"
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
          :data="items"
          v-loading="loading"
          row-key="id"
          @sort-change="handleSortChange"
          style="width: 100%">

          <el-table-column
            prop="name"
            label="產品名稱"
            width="180">
            <template #default="{ row }">
              <el-tooltip 
                :content="row.name" 
                placement="top" 
                :disabled="!row.name || row.name.length <= 10"
              >
                <div class="text-ellipsis">
                  {{ row.name || '-' }}
                </div>
              </el-tooltip>
            </template>
          </el-table-column>

          <el-table-column
            prop="spuCode"
            label="SPU 編碼"
            width="130">
            <template #default="{ row }">
              <el-tooltip 
                :content="row.spuCode" 
                placement="top" 
                :disabled="!row.spuCode || row.spuCode.length <= 10"
              >
                <div class="text-ellipsis">
                  {{ row.spuCode || '-' }}
                </div>
              </el-tooltip>
            </template>
          </el-table-column>          

          <el-table-column
            prop="mainImageUrl"
            label="主圖"
            width="90">
            <template #default="{ row }">
              <el-image
                v-if="row.mainImageUrl"
                :src="getFullImageUrl(row.mainImageUrl)"
                fit="cover"
                style="width: 45px; height: 45px; border-radius: 4px;"
                :preview-src-list="[getFullImageUrl(row.mainImageUrl)]"
                preview-teleported
              />
              <div v-else class="no-image">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column
            prop="price"
            label="價格"
            width="100"
            sortable="custom">
            <template #default="{ row }">
              <span class="price-text">{{ row.price?.toLocaleString() || '0' }} NTD</span>
            </template>
          </el-table-column>
        
          
          <el-table-column
            prop="status"
            label="狀態"
            width="90">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" effect="plain">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column
            prop="tags"
            label="標籤"
            min-width="180">
            <template #default="{ row }">
              <div class="tags-container">
                <el-tag
                  v-for="tag in (row.tags || []).slice(0, 3)"
                  :key="tag"
                  size="small"
                  effect="plain"
                  class="tag-item">
                  {{ tag }}
                </el-tag>
                <span v-if="(row.tags || []).length > 3" class="more-tags">
                  +{{ (row.tags || []).length - 3 }}
                </span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column
            prop="createdAt"
            label="建立時間"
            width="140"
            sortable="custom">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          
          <el-table-column
            label="操作"
            width="160"
            fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                size="small"
                @click="handleSkus(row)">
                規格
              </el-button>
              <el-button
                type="primary"
                link
                size="small"
                @click="handleEdit(row)">
                編輯
              </el-button>
              <el-popconfirm
                title="確定要刪除這個產品嗎？"
                @confirm="handleDelete(row.id)">
                <template #reference>
                  <el-button
                    type="danger"
                    link
                    size="small">
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

    <!-- 新增/編輯對話框 -->
    <product-form
      v-model:visible="dialogVisible"
      :mode="dialogMode"
      :product="currentProduct"
      @success="handleFormSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { ProductBase, Product } from '@/model/Product'
import { getProducts, getProduct, deleteProduct } from '@/services/Product'
import { API_CONFIG } from '@/services/Request'
import { usePagination } from '@/composables/usePagination'
import { CategoryCascader } from '@/components/CategoryCascader'
import { BrandCascader } from '@/components/BrandCascader'
import { ProductForm } from '@/components/ProductForm'

const router = useRouter()

// 獲取圖片的完整 URL
const getFullImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url
  return `${API_CONFIG.BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

// 定義組件名稱
defineOptions({
  name: 'ProductsPage'
})

// 響應式狀態
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const currentProduct = ref<Product | null>(null)
const reloadTrigger = ref(0)

// 使用分頁 composable
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
} = usePagination<ProductBase>({
  fetchList: (params) => getProducts({ ...params }),
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'desc',
  defaultFilters: {
    search: '',
    categoryId: '',
    brandId: '',
    status: ''
  }
})

// 生命週期鉤子
onMounted(() => {
  loadItems()
})

// 顯示新增對話框
const showCreateDialog = () => {
  dialogMode.value = 'create'
  dialogVisible.value = true
}

// 處理編輯
const handleEdit = async (product: ProductBase) => {
  try {
    // 使用 getProduct 獲取完整的產品信息
    const fullProduct = await getProduct(product.id)
    currentProduct.value = fullProduct
    dialogMode.value = 'edit'
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('獲取產品詳情失敗')
    console.error('Load product error:', error)
  }
}

// 處理刪除
const handleDelete = async (id: number) => {
  try {
    await deleteProduct(id)
    ElMessage.success('刪除成功')
    refreshList()
  } catch (error) {
    ElMessage.error('刪除失敗')
  }
}

// 處理表單提交成功
const handleFormSuccess = () => {
  dialogVisible.value = false
  refreshList()
}

// 處理規格管理
const handleSkus = (product: ProductBase) => {
  router.push(`/products/${product.id}/skus`)
}

// 獲取狀態類型
const getStatusType = (status: string): string => {
  const statusMap: Record<string, string> = {
    'active': 'success',
    'inactive': 'danger',
    'draft': 'warning',
    'pending': 'info'
  }
  return statusMap[status] || 'info'
}

// 獲取狀態文字
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'active': '上架',
    'inactive': '下架',
    'draft': '草稿',
    'pending': '審核中'
  }
  return statusMap[status] || status
}

// 格式化日期
const formatDate = (dateString: string): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-TW')
}

</script>

<style scoped>
.product-management-page {
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.header-left {
  display: flex;
  gap: 16px;
  align-items: center;
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.product-main-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
}

.no-image {
  width: 60px;
  height: 60px;
  border: 1px dashed var(--el-border-color-lighter);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-placeholder);
  background-color: var(--el-fill-color-lighter);
}

.image-slot {
  font-size: 24px;
  color: var(--el-text-color-placeholder);
}

.tags-container {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.price-text {
  color: var(--el-color-danger);
  font-weight: 500;
}

.dialog-footer {
  text-align: right;
  .more-tags {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
