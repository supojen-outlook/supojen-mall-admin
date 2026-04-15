<template>
  <div class="product-management-page">
    <!-- 頁面標題 -->
    <div class="page-header">
      <el-button type="text" @click="handleBack" class="back-button">
        <i class="ri-arrow-left-line"></i> 返回商品列表
      </el-button>
      <h1>SKU 管理</h1>
      <el-button type="primary" @click="handleCreate">
        <i class="ri-add-line"></i> 新增 SKU
      </el-button>
    </div>

    <div class="product-container">
      <el-card class="product-list">
        <template #header>
          <div class="card-header">
            <span>規格列表</span>
            <div class="header-actions">
              <el-select
                v-model="searchForm.status"
                placeholder="狀態"
                clearable
                style="width: 120px; margin-right: 10px"
                @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="啟用" value="active" />
                <el-option label="停用" value="inactive" />
              </el-select>

              <el-input
                v-model="searchForm.search"
                placeholder="搜尋規格..."
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
          :data="skuList"
          row-key="id"
          @sort-change="handleSortChange"
          style="width: 100%"
        >
          <el-table-column
            prop="name"
            label="SKU 名稱"
            width="150"
          >
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
            label="SKU 編碼"
            width="130"
          >
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
            prop="imageUrl"
            label="圖片"
            width="90"
          >
            <template #default="{ row }">
              <el-image
                v-if="row.imageUrl"
                :src="getFullImageUrl(row.imageUrl)"
                fit="cover"
                class="product-main-image"
                :preview-src-list="[getFullImageUrl(row.imageUrl)]"
                :initial-index="0"
                hide-on-click-modal
                append-to-body
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div v-else class="no-image">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column
            prop="price"
            label="價格"
            width="100"
            sortable="custom"
          >
            <template #default="{ row }">
              <span class="price-text">{{ row.price?.toLocaleString() || '0' }} NTD</span>
            </template>
          </el-table-column>
          
          <el-table-column
            prop="status"
            label="狀態"
            width="90"
          >
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" effect="plain">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column
            prop="specs"
            label="規格"
            min-width="200"
          >
            <template #default="{ row }">
              <div class="specs-container">
                <el-tooltip
                  v-if="row.specs && row.specs.length > 0"
                  :content="getSpecsTooltip(row.specs)"
                  placement="top"
                >
                  <div class="specs-summary">
                    {{ getSpecsSummary(row.specs) }}
                  </div>
                </el-tooltip>
                <span v-else>-</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column
            prop="createdAt"
            label="建立時間"
            width="150"
            sortable="custom"
          >
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          
          <el-table-column
            label="操作"
            width="150"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                size="small"
                @click="handleEdit(row)"
              >
                編輯
              </el-button>
              <el-button
                type="success"
                link
                size="small"
                @click="handleInventories(row)"
              >
                庫存
              </el-button>
              <el-popconfirm
                title="確定要刪除這個 SKU 嗎？"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <el-button
                    type="danger"
                    link
                    size="small"
                  >
                    刪除
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :page-sizes="[10, 20, 50, 100]"
            layout="sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- SKU 表單對話框 -->
    <SkuForm
      v-model:visible="formVisible"
      :mode="formMode"
      :sku="currentSku"
      :product-id="productId"
      :product-specifications="productSpecifications"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import type { Sku, Specification } from '@/model'
import { getSkus, deleteSku } from '@/services/Sku'
import { getProduct } from '@/services/Product'
import { SkuForm } from '@/components/SkuForm'
import { API_CONFIG } from '@/services/Request'

const route = useRoute()
const router = useRouter()

// 響應式狀態
const loading = ref(false)
const skuList = ref<Sku[]>([])
const formVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const currentSku = ref<Sku | null>(null)
const productId = ref<number>(0)
const productSpecifications = ref<Specification[]>([])

// 搜索表單
const searchForm = ref({
  search: '',
  status: ''
})

// 分頁數據
const pagination = ref({
  page: 1,
  size: 20,
  cursor: null as string | null,
  sortField: 'createdAt',
  sortOrder: 'desc'
})

// 加載 SKU 列表
const loadSkus = async () => {
  try {
    loading.value = true
    const params = {
      productId: productId.value,
      page: pagination.value.page - 1,
      size: pagination.value.size,
      search: searchForm.value.search || undefined,
      status: searchForm.value.status || undefined,
      sortField: pagination.value.sortField,
      sortOrder: pagination.value.sortOrder
    }
    
    const response = await getSkus(params)
    skuList.value = response.list
    pagination.value.cursor = response.cursor
  } catch (error) {
    ElMessage.error('加載 SKU 列表失敗')
    console.error('Load skus error:', error)
  } finally {
    loading.value = false
  }
}

// 加載產品信息
const loadProductInfo = async () => {
  try {
    const id = Number(route.params.productId)
    if (!id) {
      ElMessage.error('產品 ID 無效')
      router.push('/products')
      return
    }
    
    productId.value = id
    const product = await getProduct(id)
    productSpecifications.value = product.specs || []
  } catch (error) {
    ElMessage.error('加載產品信息失敗')
    console.error('Load product error:', error)
  }
}

// 處理搜索
const handleSearch = () => {
  pagination.value.page = 1
  loadSkus()
}

// 處理排序變化
const handleSortChange = ({ prop, order }: { prop?: string; order?: string }) => {
  if (prop && order) {
    pagination.value.sortField = prop
    pagination.value.sortOrder = order === 'ascending' ? 'asc' : 'desc'
  } else {
    pagination.value.sortField = 'createdAt'
    pagination.value.sortOrder = 'desc'
  }
  loadSkus()
}

// 處理分頁大小變化
const handleSizeChange = (size: number) => {
  pagination.value.size = size
  pagination.value.page = 1
  loadSkus()
}

// 處理頁碼變化
const handleCurrentChange = (page: number) => {
  pagination.value.page = page
  loadSkus()
}

// 處理創建 SKU
const handleCreate = () => {
  currentSku.value = null
  formMode.value = 'create'
  formVisible.value = true
}

// 處理返回商品列表
const handleBack = () => {
  router.push('/products')
}

// 處理庫存管理
const handleInventories = (sku: Sku) => {
  router.push(`/products/${sku.productId}/skus/${sku.id}/sku-inventories`)
}

// 處理編輯
const handleEdit = (sku: Sku) => {
  formMode.value = 'edit'
  currentSku.value = sku
  formVisible.value = true
}

// 處理刪除
const handleDelete = async (sku: Sku) => {
  try {
    await deleteSku(sku.id)
    ElMessage.success('SKU 刪除成功')
    loadSkus()
  } catch (error) {
    ElMessage.error('SKU 刪除失敗')
    console.error('Delete sku error:', error)
  }
}

// 處理表單成功
const handleFormSuccess = () => {
  loadSkus()
}

// 獲取狀態類型
const getStatusType = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'danger'
    default:
      return 'info'
  }
}

// 獲取狀態文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return '啟用'
    case 'inactive':
      return '停用'
    default:
      return '未知'
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-TW')
}

// 獲取圖片的完整 URL
const getFullImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url
  return `${API_CONFIG.BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

// 獲取規格摘要（用於表格顯示）
const getSpecsSummary = (specs: any[]) => {
  if (!specs || specs.length === 0) return '-'
  
  // 如果規格數量少於等於2個，直接顯示
  if (specs.length <= 2) {
    return specs.map(spec => `${spec.name}:${spec.value}`).join(', ')
  }
  
  // 如果規格數量多於2個，只顯示前2個並加上省略號
  const firstTwo = specs.slice(0, 2).map(spec => `${spec.name}:${spec.value}`).join(', ')
  return `${firstTwo}...`
}

// 獲取規格詳情（用於 tooltip 顯示）
const getSpecsTooltip = (specs: any[]) => {
  if (!specs || specs.length === 0) return '無規格'
  
  return specs.map(spec => `${spec.name}: ${spec.value}`).join('\n')
}

// 組件掛載
onMounted(async () => {
  await loadProductInfo()
  await loadSkus()
})
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

.product-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-list {
  flex: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
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

.specs-container {
  display: flex;
  align-items: center;
}

.specs-summary {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
  cursor: pointer;
  color: #606266;
}

.specs-summary:hover {
  color: #409eff;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
