<template>
  <div class="assets-management">
    <div class="page-header">
      <h1>資產管理</h1>
    </div>

    <div class="assets-container">
      <el-card class="assets-list">
        <template #header>
          <div class="card-header">
            <span>媒體資源列表</span>
            <div class="header-actions">
              <el-select
                v-model="filters.targetType"
                placeholder="關聯類型"
                clearable
                style="width: 120px; margin-right: 10px"
                @change="handleSearch">
                <el-option label="全部" :value="null" />
                <el-option label="商品" value="product" />
                <el-option label="分類" value="category" />
                <el-option label="品牌" value="brand" />
              </el-select>
              <el-select
                v-model="filters.isTargetIdNull"
                placeholder="資源狀態"
                clearable
                style="width: 120px"
                @change="handleSearch">
                <el-option label="全部" :value="undefined" />
                <el-option label="關聯" :value="false" />
                <el-option label="孤兒" :value="true" />
              </el-select>
            </div>
          </div>
        </template>

        <el-table
          v-loading="loading"
          :data="items"
          row-key="id"
          @sort-change="handleSortChange">
          <el-table-column
            prop="url"
            label="預覽"
            width="100">
            <template #default="{ row }">
              <el-image
                v-if="row.mediaType === 'image'"
                :src="row.url"
                :preview-src-list="[row.url]"
                fit="cover"
                style="width: 40px; height: 40px; border-radius: 4px;"
                preview-teleported
              />
              <video
                v-else-if="row.mediaType === 'video'"
                :src="row.url"
                style="width: 60px; height: 60px; border-radius: 4px; object-fit: cover;"
                controls
              />
              <div v-else style="width: 60px; height: 60px; border-radius: 4px; background: #f5f5f5; display: flex; align-items: center; justify-content: center;">
                <i class="ri-file-line" style="font-size: 24px; color: #999;"></i>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="mediaType"
            label="媒體類型"
            width="100">
            <template #default="{ row }">
              <el-tag :type="row.mediaType === 'image' ? 'success' : 'info'" effect="plain">
                {{ row.mediaType === 'image' ? '圖片' : '影片' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="targetType"
            label="關聯類型"
            width="100">
            <template #default="{ row }">
              <el-tag :type="getTargetTypeColor(row.targetType)" effect="plain">
                {{ getTargetTypeLabel(row.targetType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="targetId"
            label="關聯ID"
            width="100">
            <template #default="{ row }">
              {{ row.targetId || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="fileSizeBytes"
            label="檔案大小"
            width="120">
            <template #default="{ row }">
              {{ formatFileSize(row.fileSizeBytes) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="bucket"
            label="存儲桶"
            min-width="120" />
          <el-table-column
            prop="key"
            label="物件鍵"
            min-width="150" />
          <el-table-column
            label="操作"
            width="120"
            fixed="right">
            <template #default="{ row }">
              <el-popconfirm
                title="確定要刪除這個媒體資源嗎？"
                @confirm="handleDelete(row.url)">
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
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { usePagination } from '@/composables/usePagination'
import { 
  getAssets,
  deleteAsset
} from '@/services/Asset'
import type { Asset, AssetTargetType } from '@/model'

// 過濾器狀態
const filters = ref({
  targetType: null as AssetTargetType | null,
  isTargetIdNull: undefined as boolean | undefined
})

// 使用 usePagination
const {
  // 狀態
  items, 
  loading,
  pagination,
  
  // 方法
  loadItems,
  handleSearch,
  handleCurrentChange,
  handleSizeChange,
  handleSortChange,
  refreshList
} = usePagination<Asset>({
  fetchList: (params) => getAssets({
    targetType: filters.value.targetType,
    isTargetIdNull: filters.value.isTargetIdNull,
    cursor: params.cursor,
    size: params.size
  }),
  pageSize: 10,
  sortBy: 'id',
  sortDirection: 'desc'
})

// 生命週期鉤子
onMounted(() => {
  loadItems()
})

// 資源類型相關方法
const getTargetTypeLabel = (type: AssetTargetType | null) => {
  if (!type) return '未關聯'
  const typeLabels = {
    product: '商品',
    category: '分類',
    brand: '品牌'
  }
  return typeLabels[type]
}

const getTargetTypeColor = (type: AssetTargetType | null) => {
  if (!type) return ''
  const typeColors = {
    product: 'primary',
    category: 'success',
    brand: 'warning'
  }
  return typeColors[type]
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2))
  return `${size} ${sizes[i]}`
}

// 處理刪除
const handleDelete = async (url: string) => {
  try {
    await deleteAsset({ url })
    
    ElMessage.success('刪除成功')
    refreshList()
  } catch (error) {
    console.error('刪除失敗:', error)
    ElMessage.error('刪除失敗')
  }
}
</script>

<style scoped>
.assets-management-page {
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

.assets-container {
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
</style>
