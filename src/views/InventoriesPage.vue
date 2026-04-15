<template>
  <div class="inventory-management-page">
    <!-- 頁面標題 -->
    <div class="page-header">
      <el-button type="text" @click="handleBack" class="back-button">
        <i class="ri-arrow-left-line"></i> 返回儲位管理
      </el-button>
      <h1>{{ locationName ? `${locationName} - 庫存管理` : '庫存管理' }}</h1>
      <div></div> <!-- 佔位，保持佈局一致性 -->
    </div>

    <div class="inventory-container">
      <el-card class="inventory-list">
        <template #header>
          <div class="card-header">
            <span>庫存列表</span>
            <div class="header-actions">
              <el-select
                v-model="filters.status"
                placeholder="狀態"
                clearable
                style="width: 120px; margin-right: 10px"
                @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="啟用" value="active" />
                <el-option label="停用" value="inactive" />
              </el-select>

              <el-input
                v-model="filters.search"
                placeholder="搜尋庫存..."
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
          style="width: 100%">
          
          <el-table-column
            prop="skuImage"
            label="SKU 圖片"
            width="100">
            <template #default="{ row }">
              <img 
                  v-if="getSkuImage(row.skuId)"
                  :src="getSkuImage(row.skuId)"
                  alt="SKU 圖片"
                  style="width: 32px; height: 32px; border-radius: 4px; object-fit: cover;"
                />
              <div v-else style="color: #909399; font-size: 12px;">無圖片</div>
            </template>
          </el-table-column>

          <el-table-column
            prop="skuName"
            label="SKU Code"
            min-width="180">
            <template #default="{ row }">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div>
                  <div style="font-weight: 500;">{{ getSkuCode(row.skuId) }}</div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            prop="quantityOnHand"
            label="實際庫存"
            width="150"
            sortable="custom">
            <template #default="{ row }">
              <div :class="getQuantityClass(row.quantityOnHand)">
                {{ row.quantityOnHand || 0 }}
              </div>
            </template>
          </el-table-column>

          <el-table-column
            prop="quantityReserved"
            label="預占庫存"
            width="150"
            sortable="custom">
            <template #default="{ row }">
              <div :class="getQuantityClass(row.quantityReserved)">
                {{ row.quantityReserved || 0 }}
              </div>
            </template>
          </el-table-column>

          <el-table-column
            prop="quantityAvailable"
            label="可用庫存"
            width="150"
            sortable="custom">
            <template #default="{ row }">
              <div :class="getQuantityClass(row.quantityAvailable)">
                {{ row.quantityAvailable || 0 }}
              </div>
            </template>
          </el-table-column>

          <el-table-column
            prop="status"
            label="狀態"
            width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
            prop="createdAt"
            label="建立時間"
            width="120">
            <template #default="{ row }">
              <el-tooltip 
                :content="formatDate(row.createdAt)" 
                placement="top" 
              >
                <div class="text-ellipsis">
                  {{ formatDate(row.createdAt) }}
                </div>
              </el-tooltip>
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
                size="small"
                @click="handleEdit(row)">
                編輯
              </el-button>
              <el-popconfirm
                title="確定要刪除這個庫存記錄嗎？"
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

        <!-- 分頁 -->
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

    <!-- 庫存表單對話框 -->
    <InventoryForm
      v-model:visible="formVisible"
      :mode="formMode"
      :inventory="currentInventory"
      :sku-id="0"
      @success="handleFormSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Inventory } from '@/model'
import { getInventories, deleteInventory } from '@/services/Inventory'
import { getLocations } from '@/services/Location'
import { getSkus } from '@/services/Sku'
import { InventoryForm } from '@/components/InventoryForm'

// 響應式狀態
const loading = ref(false)
const items = ref<Inventory[]>([])
const formVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const currentInventory = ref<Inventory | null>(null)
const locations = ref<any[]>([])
const locationName = ref('')

// SKU 相關狀態
const skuCodes = ref<Map<number, string>>(new Map())     // SKU ID → 代碼的映射
const skuImages = ref<Map<number, string>>(new Map())     // SKU ID → 圖片的映射
const loadingSkus = ref(false)                         // 載入 SKU 信息的狀態

const router = useRouter()
const route = useRoute()

// 搜索篩選
const filters = ref({
  status: '',
  search: ''
})

// 分頁數據
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  hasMore: false,
  isLoading: false,
  cursor: null as string | null
})

// 載入儲位列表
const loadLocations = async () => {
  try {
    const response = await getLocations()
    locations.value = response.list
  } catch (error) {
    console.error('Load locations error:', error)
    ElMessage.error('載入儲位列表失敗')
  }
}

// 載入庫存列表
const loadInventories = async () => {
  try {
    loading.value = true
    const locationId = route.query.locationId ? Number(route.query.locationId) : null
    
    const params = {
      locationId: locationId || undefined,
      status: filters.value.status || undefined,
      search: filters.value.search || undefined,
      size: pagination.value.pageSize,
      cursor: pagination.value.cursor || undefined
    }
    
    const response = await getInventories(params)
    items.value = response.list
    
    // 設置頁面標題中的儲位名稱
    if (locationId) {
      const currentLocation = locations.value.find(loc => loc.id === locationId)
      if (currentLocation) {
        locationName.value = currentLocation.name
      } else {
        locationName.value = `儲位 ${locationId}`
      }
    }
    
    // 載入對應的 SKU 信息
    await loadSkuInfo()
    
    pagination.value.hasMore = response.cursor !== null
    pagination.value.cursor = response.cursor as string | null
  } catch (error) {
    console.error('Load inventories error:', error)
    ElMessage.error('載入庫存列表失敗')
  } finally {
    loading.value = false
  }
}

// 載入 SKU 信息
const loadSkuInfo = async () => {
  console.log('loadSkuInfo called');
  
  // 1. 從 Inventory 陣列提取所有 skuId
  const uniqueSkuIds = [...new Set(
    items.value.map(inventory => inventory.skuId)
  )];
  
  console.log('uniqueSkuIds:', uniqueSkuIds);
  
  // 2. 只獲取還沒有信息的 SKU
  const missingSkuIds = uniqueSkuIds.filter(
    id => !skuCodes.value.has(id)
  );
  
  console.log('missingSkuIds:', missingSkuIds);
  console.log('skuCodes.size before:', skuCodes.value.size);
  
  // 3. 如果所有 SKU 都有信息，直接返回
  if (missingSkuIds.length === 0) {
    console.log('All SKUs already have info, skipping loadSkuInfo');
    return;
  }
  
  try {
    loadingSkus.value = true;
    
    // 4. 批量獲取 SKU 信息，傳遞 ids 參數
    const response = await getSkus({ 
      ids: missingSkuIds,  // 轉換為逗號分隔的字符串
      productId: undefined  // getSkus 需要 productId，但傳遞 undefined 試試
    });
    
    console.log('getSkus response:', response);
    
    // 5. 將獲取到的 SKU 信息存儲到映射中
    response.list.forEach((sku: any) => {
      skuCodes.value.set(sku.id, sku.skuCode);
      skuImages.value.set(sku.id, sku.imageUrl || '');
    });
    
    console.log('skuCodes.size after:', skuCodes.value.size);
    console.log('skuImages.size after:', skuImages.value.size);
    
  } catch (error) {
    console.error('載入 SKU 信息失敗:', error);
    ElMessage.error('載入 SKU 信息失敗');
  } finally {
    loadingSkus.value = false;
  }
}

// 輔助函數
const getSkuCode = (skuId: number): string => {
  const code = skuCodes.value.get(skuId);
  return code || '';
};

const getSkuImage = (skuId: number): string => {
  const image = skuImages.value.get(skuId);
  return image || '';
};

// 處理搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
  pagination.value.cursor = null
  loadInventories()
}

// 處理頁碼變化
const handleCurrentChange = (page: number) => {
  pagination.value.currentPage = page
  loadInventories()
}

// 處理每頁大小變化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
  pagination.value.cursor = null
  loadInventories()
}

// 處理編輯
const handleEdit = (inventory: Inventory) => {
  formMode.value = 'edit'
  currentInventory.value = inventory
  formVisible.value = true
}

// 處理刪除
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('確定要刪除這個庫存記錄嗎？', '警告', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteInventory(id)
    ElMessage.success('刪除成功')
    loadInventories()
  } catch (error) {
    console.error('Delete inventory error:', error)
    ElMessage.error('刪除失敗')
  }
}

// 處理表單提交成功
const handleFormSuccess = () => {
  formVisible.value = false
  currentInventory.value = null
  loadInventories()
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

// 獲取狀態文字
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

// 獲取庫存數量樣式
const getQuantityClass = (quantity: number) => {
  if (quantity <= 0) {
    return 'quantity-zero'
  } else if (quantity <= 10) {
    return 'quantity-low'
  }
  return 'quantity-normal'
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-TW')
}

// 處理返回儲位管理
const handleBack = () => {
  router.push('/locations')
}

// 組件掛載
onMounted(async () => {
  await loadLocations()
  await loadInventories()
})
</script>

<style scoped>
.inventory-management-page {
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
  padding: 0;
  font-size: 14px;
  color: #606266;
}

.back-button:hover {
  color: #409eff;
}

.inventory-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  max-width: 200px;
}

.quantity-zero {
  color: #f56c6c;
  font-weight: 600;
}

.quantity-low {
  color: #e6a23c;
  font-weight: 600;
}

.quantity-normal {
  color: #67c23a;
  font-weight: 600;
}
</style>
