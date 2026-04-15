<template>
  <div class="location-management-page">
    <div class="page-header">
      <h1>儲位管理</h1>
      <el-button type="primary" @click="showCreateDialog">
        <i class="ri-add-line"></i> 新增儲位
      </el-button>
    </div>

    <div class="location-container">
      <el-card class="location-list">
        <template #header>
          <div class="card-header">
            <span>位置列表</span>
            <div class="header-actions">
              <LocationCascader 
                v-model="filters.parentId"
                :reload-trigger="reloadTrigger"
                placeholder="選擇父級位置"
                :clearable="true"
                :filterable="true"
                @change="handleSearch"
                style="width: 240px; margin-right: 10px"
              />
              <el-select
                v-model="filters.zoneType"
                placeholder="區域功能"
                clearable
                style="width: 120px; margin-right: 10px"
                @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="收貨區" value="RECEIVING" />
                <el-option label="儲存區" value="STORAGE" />
                <el-option label="出貨區" value="SHIPPING" />
                <el-option label="退貨區" value="RETURNING" />
              </el-select>
              <el-select
                v-model="filters.level"
                placeholder="選擇層級"
                clearable
                style="width: 120px; margin-right: 10px"
                @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="一層" value="1" />
              </el-select>
              <el-select
                v-model="filters.status"
                placeholder="狀態"
                clearable
                style="width: 120px; margin-right: 10px"
                @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="啟用" value="active" />
                <el-option label="停用" value="inactive" />
                <el-option label="維護中" value="maintenance" />
              </el-select>
              <el-input
                v-model="filters.search"
                placeholder="搜尋位置..."
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
            label="位置名稱"
            width="150">
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
            prop="locationNumber"
            label="位置編號"
            width="150">
            <template #default="{ row }">
              <el-tooltip 
                :content="row.locationNumber" 
                placement="top" 
                :disabled="!row.locationNumber || row.locationNumber.length <= 10"
              >
                <div class="text-ellipsis">
                  {{ row.locationNumber || '-' }}
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            prop="pathText"
            label="位置路徑"
            min-width="150" />
          <el-table-column
            prop="locationType"
            label="位置類型"
            width="100">
            <template #default="{ row }">
              <el-tag
                :type="getLocationTypeColor(row.locationType)"
                effect="plain">
                {{ getLocationTypeText(row.locationType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="zoneType"
            label="區域功能"
            width="100">
            <template #default="{ row }">
              <el-tag
                v-if="row.zoneType"
                :type="getZoneTypeColor(row.zoneType)"
                effect="plain">
                {{ getZoneTypeText(row.zoneType) }}
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="maxQuantity"
            label="容量"
            width="80">
            <template #default="{ row }">
              {{ row.maxQuantity || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            label="狀態"
            width="80">
            <template #default="{ row }">
              <el-tag
                :type="getStatusType(row.status)"
                effect="plain">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="sortOrder"
            label="排序"
            width="80" />
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
              <el-button
                type="success"
                link
                size="small"
                @click="handleInventories(row)">
                庫存
              </el-button>
              <el-popconfirm
                title="確定要刪除這個位置嗎？"
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
    <LocationForm
      v-model="dialogVisible"
      :mode="dialogMode"
      :location="currentLocation"
      @success="handleFormSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { Location } from '@/model'
import { LocationForm } from '@/components/LocationForm'
import { LocationCascader } from '@/components/LocationCascader'
import { getLocations, deleteLocation } from '@/services/Location'
import { usePagination } from '@/composables/usePagination'

// 定義組件名稱
defineOptions({
  name: 'LocationsPage'
})

// 響應式狀態
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const currentLocation = ref<Location | null>(null)
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
} = usePagination<Location>({
  fetchList: (params) => getLocations({ ...params }),
  pageSize: 10,
  sortBy: 'sortOrder',
  sortDirection: 'asc',
  defaultFilters: {
    search: '',
    zoneType: '',
    status: '',
    level: '1',
    parentId: undefined
  }
})

// 生命週期鉤子
onMounted(() => {
  loadItems()
})

// 處理返回首頁
const router = useRouter()

// 處理新增對話框
const showCreateDialog = () => {
  dialogMode.value = 'add'
  currentLocation.value = null
  dialogVisible.value = true
}

// 處理庫存管理
const handleInventories = (location: any) => {
  router.push({
    path: '/inventories',
    query: {
      locationId: location.id
    }
  })
}

// 處理編輯
const handleEdit = (location: Location) => {
  currentLocation.value = { ...location }
  dialogMode.value = 'edit'
  dialogVisible.value = true
}

// 處理刪除
const handleDelete = async (id: number) => {
  try {
    await deleteLocation({ id })
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

// 獲取位置類型顏色
const getLocationTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    'ZONE': 'primary',
    'BIN': 'success'
  }
  return colorMap[type] || 'info'
}

// 獲取位置類型文字
const getLocationTypeText = (type: string): string => {
  const textMap: Record<string, string> = {
    'ZONE': '區域',
    'BIN': '儲位'
  }
  return textMap[type] || type
}

// 獲取區域功能顏色
const getZoneTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    'RECEIVING': 'danger',
    'STORAGE': 'primary',
    'SHIPPING': 'success',
    'RETURNING': 'danger'
  }
  return colorMap[type] || 'info'
}

// 獲取區域功能文字
const getZoneTypeText = (type: string): string => {
  const textMap: Record<string, string> = {
    'RECEIVING': '收貨區',
    'STORAGE': '儲存區',
    'SHIPPING': '出貨區',
    'RETURNING': '退貨區'
  }
  return textMap[type] || type
}

// 獲取狀態類型
const getStatusType = (status: string): string => {
  const statusMap: Record<string, string> = {
    'active': 'success',
    'inactive': 'danger',
    'maintenance': 'warning'
  }
  return statusMap[status] || 'info'
}

// 獲取狀態文字
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'active': '啟用',
    'inactive': '停用',
    'maintenance': '維護中'
  }
  return statusMap[status] || status
}
</script>

<style scoped>
.location-management-page {
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

.location-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
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
