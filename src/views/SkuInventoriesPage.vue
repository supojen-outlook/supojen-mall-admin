<template>
  <div class="sku-inventory-management-page">
    <!-- 頁面標題 -->
    <div class="page-header">
      <el-button type="text" @click="handleBack" class="back-button">
        <i class="ri-arrow-left-line"></i> 返回 SKU 列表
      </el-button>
      <h1>{{ skuInfo ? `${skuInfo.name} - 庫存管理` : 'SKU 庫存管理' }}</h1>
      <el-button type="primary" @click="handleCreate">
        <i class="ri-add-line"></i> 新增庫存
      </el-button>
    </div>

    <div class="product-container">
      <el-card class="product-list">
        <template #header>
          <div class="card-header">
            <span>庫存列表</span>
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
            </div>
          </div>
        </template>

        <el-table
          v-loading="loading"
          :data="inventoryList"
          row-key="id"
          @sort-change="handleSortChange"
          style="width: 100%"
        >
          <el-table-column
            prop="locationId"
            label="儲位名稱"
            min-width="150"
          >
            <template #default="{ row }">
              <el-tooltip 
                :content="`儲位 ID: ${row.locationId}`" 
                placement="top" 
              >
                <div class="text-ellipsis">
                  {{ getLocationName(row.locationId) }}
                </div>
              </el-tooltip>
            </template>
          </el-table-column>

          <el-table-column
            prop="quantityOnHand"
            label="實際庫存"
            width="150"
            sortable="custom"
          >
            <template #default="{ row }">
              {{ row.quantityOnHand || 0 }}
            </template>
          </el-table-column>

          <el-table-column
            prop="quantityReserved"
            label="預占庫存"
            width="150"
            sortable="custom"
          >
            <template #default="{ row }">
              {{ row.quantityReserved || 0 }}
            </template>
          </el-table-column>

          <el-table-column
            prop="quantityAvailable"
            label="可用庫存"
            width="150"
            sortable="custom"
          >
            <template #default="{ row }">
              <span :class="getQuantityAvailableClass(row.quantityAvailable)">
                {{ row.quantityAvailable || 0 }}
              </span>
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
            width="120"
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
              <el-popconfirm
                title="確定要刪除這個庫存記錄嗎？"
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

    <!-- 庫存表單對話框 -->
    <InventoryForm
      v-model:visible="formVisible"
      :mode="formMode"
      :inventory="currentInventory"
      :sku-id="skuId"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Inventory } from '@/model'
import { getInventories, deleteInventory } from '@/services/Inventory'
import { getSkus } from '@/services/Sku'
import { getLocations } from '@/services/Location'
import { InventoryForm } from '@/components/InventoryForm'

const route = useRoute()
const router = useRouter()

// 響應式狀態
const loading = ref(false)
const inventoryList = ref<Inventory[]>([])
const formVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const currentInventory = ref<Inventory | null>(null)
const skuId = ref<number>(0)
const productId = ref<number>(0)
const skuInfo = ref<any>(null)

// 儲位相關狀態
const locationNames = ref<Map<number, string>>(new Map())  // 儲位 ID → 名稱的映射
const loadingLocations = ref(false)                    // 載入儲位信息的狀態

// 搜索表單
const searchForm = ref({
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

// 初始化 SKU ID
const initializeSkuId = () => {
  const id = Number(route.params.skuId)
  const pid = Number(route.params.productId)
  if (!id || !pid) {
    ElMessage.error('SKU ID 或產品 ID 無效')
    router.push('/products')
    return
  }
  skuId.value = id
  productId.value = pid
}

// 獲取 SKU 信息
const loadSkuInfo = async () => {
  try {
    const response = await getSkus({ 
      productId: productId.value
    })
    const sku = response.list.find((sku: any) => sku.id === skuId.value)
    if (sku) {
      skuInfo.value = sku
    }
  } catch (error) {
    console.error('Load sku info error:', error)
  }
}

/**
 * 獲取庫存列表中涉及的所有儲位名稱
 * 這樣可以避免重複獲取相同的儲位信息
 */
const loadLocationNames = async () => {
  // 1. 提取所有不重複的儲位 ID
  const uniqueLocationIds = [...new Set(
    inventoryList.value.map(inventory => inventory.locationId)
  )];
  
  // 如果沒有儲位 ID，直接返回
  if (uniqueLocationIds.length === 0) {
    return;
  }
  
  // 2. 只獲取還沒有名稱的儲位
  const missingLocationIds = uniqueLocationIds.filter(
    id => !locationNames.value.has(id)
  );
  
  // 如果所有儲位都有名稱，直接返回
  if (missingLocationIds.length === 0) {
    return;
  }
  
  try {
    loadingLocations.value = true;
    
    // 3. 批量獲取儲位信息
    const response = await getLocations({ 
      ids: missingLocationIds 
    });
    
    // 4. 將獲取到的儲位信息存儲到映射中
    response.list.forEach(location => {
      locationNames.value.set(location.id, location.name);
    });
    
  } catch (error) {
    console.error('載入儲位名稱失敗:', error);
    ElMessage.error('載入儲位名稱失敗');
  } finally {
    loadingLocations.value = false;
  }
};

/**
 * 獲取儲位名稱的輔助函數
 * 如果沒有名稱，顯示預設格式
 */
const getLocationName = (locationId: number): string => {
  const name = locationNames.value.get(locationId);
  return name || `儲位 ${locationId}`;
};

// 獲取庫存列表
const loadInventories = async () => {
  try {
    loading.value = true;
    
    // 1. 先載入庫存列表
    const params = {
      skuId: skuId.value,
      status: searchForm.value.status || undefined,
      size: pagination.value.size,
      cursor: pagination.value.cursor || undefined
    };
    
    const response = await getInventories(params);
    inventoryList.value = response.list;
    pagination.value.cursor = response.cursor;
    
    // 2. 載入對應的儲位名稱
    await loadLocationNames();
    
  } catch (error) {
    console.error('Load inventories error:', error);
    ElMessage.error('載入庫存列表失敗');
  } finally {
    loading.value = false;
  }
};

// 處理搜索
const handleSearch = () => {
  pagination.value.page = 1
  pagination.value.cursor = null
  loadInventories()
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
  loadInventories()
}

// 處理分頁大小變化
const handleSizeChange = (size: number) => {
  pagination.value.size = size
  pagination.value.page = 1
  pagination.value.cursor = null
  loadInventories()
}

// 處理頁碼變化
const handleCurrentChange = (page: number) => {
  pagination.value.page = page
  loadInventories()
}

// 處理創建庫存
const handleCreate = () => {
  currentInventory.value = null
  formMode.value = 'create'
  formVisible.value = true
}

// 處理編輯
const handleEdit = (inventory: Inventory) => {
  formMode.value = 'edit'
  currentInventory.value = inventory
  formVisible.value = true
}

// 處理刪除
const handleDelete = async (inventory: Inventory) => {
  try {
    await ElMessageBox.confirm(
      '確定要刪除這個庫存記錄嗎？',
      '警告',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteInventory(inventory.id)
    ElMessage.success('庫存記錄刪除成功')
    await loadInventories()
  } catch (error) {
    console.error('Delete inventory error:', error)
    ElMessage.error('刪除失敗')
  }
}

// 處理表單成功
const handleFormSuccess = () => {
  formVisible.value = false
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

// 獲取可用庫存樣式
const getQuantityAvailableClass = (quantity: number) => {
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

// 組件掛載
onMounted(async () => {
  await initializeSkuId()
  await loadSkuInfo()
  await loadInventories()
})

// 處理返回 SKU 列表
const handleBack = () => {
  router.push(`/products/${productId.value}/skus`)
}
</script>

<style scoped>
.sku-inventory-management-page {
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
  width: 100%;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.quantity-zero {
  color: var(--el-color-danger);
  font-weight: 600;
}

.quantity-low {
  color: var(--el-color-warning);
  font-weight: 500;
}

.quantity-normal {
  color: var(--el-color-success);
  font-weight: 500;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
