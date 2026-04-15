<template>
  <div class="attribute-keys-management-page">
    <div class="page-header">
      <h1>屬性管理</h1>
      <el-button 
        type="primary" 
        @click="showCreateDialog">
        <i class="ri-add-line"></i> 新增屬性
      </el-button>
    </div>

    <div class="attribute-keys-container">
      <el-card class="attribute-keys-list">
        <template #header>
          <div class="card-header">
            <span>屬性列表</span>
            <div class="header-actions">
              <el-select
                v-model="filters.inputType"
                placeholder="輸入類型"
                clearable
                style="width: 120px"
                @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="下拉選單" value="select" />
                <el-option label="文字" value="text" />
                <el-option label="數字" value="number" />
                <el-option label="複選框" value="checkbox" />
              </el-select>
              <el-select
                v-model="filters.forSales"
                placeholder="銷售屬性"
                clearable
                style="width: 120px"
                @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="是" :value="true" />
                <el-option label="否" :value="false" />
              </el-select>
              <el-select
                v-model="filters.isRequired"
                placeholder="必填屬性"
                clearable
                style="width: 120px"
                @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="是" :value="true" />
                <el-option label="否" :value="false" />
              </el-select>
              <el-select
                v-model="filters.status"
                placeholder="狀態"
                clearable
                style="width: 120px"
                @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="啟用" value="active" />
                <el-option label="停用" value="inactive" />
              </el-select>
              <el-input
                v-model="filters.search"
                placeholder="搜尋屬性..."
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
            label="屬性名稱"
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
            prop="description"
            label="屬性描述"
            min-width="200">
            <template #default="{ row }">
              <el-tooltip 
                :content="row.description" 
                placement="top" 
                :disabled="!row.description || row.description.length <= 20"
              >
                <div class="text-ellipsis">
                  {{ row.description || '-' }}
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            prop="inputType"
            label="輸入類型"
            width="120">
            <template #default="{ row }">
              <el-tag :type="getInputTypeTagType(row.inputType)" effect="plain">
                {{ getInputTypeText(row.inputType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="forSales"
            label="銷售屬性"
            width="100">
            <template #default="{ row }">
              <el-tag :type="row.forSales ? 'success' : 'info'" effect="plain">
                {{ row.forSales ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="isRequired"
            label="必填"
            width="80">
            <template #default="{ row }">
              <el-tag :type="row.isRequired ? 'warning' : 'info'" effect="plain">
                {{ row.isRequired ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="sortOrder"
            label="排序"
            width="80" />
          <el-table-column
            prop="status"
            label="狀態"
            width="100">
            <template #default="{ row }">
              <el-tag
                :type="row.status === 'active' ? 'success' : 'danger'"
                effect="plain">
                {{ row.status === 'active' ? '啟用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="180"
            fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                @click="handleEdit(row)">
                編輯
              </el-button>
              <el-popconfirm
                title="確定要刪除這個屬性嗎？"
                @confirm="handleDelete(row.id)">
                <template #reference>
                  <el-button
                    type="danger"
                    link>
                    刪除
                  </el-button>
                </template>
              </el-popconfirm>
              <el-button
                v-if="row.inputType === 'select' || row.inputType === 'checkbox'"
                type="primary"
                link
                @click="handleManageValues(row)">
                屬性值
              </el-button>
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

    <!-- 新增/編輯屬性對話框 -->
    <AttributeKeyForm
      v-model="dialogVisible"
      :mode="dialogMode"
      :initial-data="currentAttributeKey"
      @success="handleFormSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAttributeKeys, deleteAttributeKey } from '@/services/AttributeKey'
import { AttributeKeyForm } from '@/components/AttributeKeyForm'
import type { AttributeKey } from '@/model'
import { usePagination } from '@/composables/usePagination'

// 狀態
const router = useRouter()
const currentAttributeKey = ref<AttributeKey | null>(null)
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const reloadTrigger = ref(0)

// 使用 usePagination
const {
  // 狀態
  items, 
  loading,
  filters,
  pagination,
  
  // 方法
  loadItems,
  handleSearch,
  handleCurrentChange,
  handleSizeChange,
  handleSortChange,
  refreshList
} = usePagination<AttributeKey>({
  fetchList: (params) => getAttributeKeys({
    ...params
  }),
  pageSize: 10,
  sortBy: 'sortOrder',
  sortDirection: 'asc',
  defaultFilters: {
    search: '',
    status: '',
    inputType: '',
    forSales: '',
    isRequired: ''
  }
})

// 生命週期鉤子
onMounted(() => {
  loadItems()
})

// 輸入類型標籤樣式
const getInputTypeTagType = (type: string) => {
  const typeMap = {
    'select': 'primary',
    'text': 'success',
    'number': 'warning',
    'checkbox': 'info'
  }
  return typeMap[type as keyof typeof typeMap] || 'info'
}

// 輸入類型文字
const getInputTypeText = (type: string) => {
  const textMap = {
    'select': '下拉選單',
    'text': '文字',
    'number': '數字',
    'checkbox': '複選框'
  }
  return textMap[type as keyof typeof textMap] || type
}

// 顯示新增對話框
const showCreateDialog = () => {
  dialogMode.value = 'create'
  dialogVisible.value = true
}

// 處理編輯
const handleEdit = (attributeKey: AttributeKey) => {
  currentAttributeKey.value = { ...attributeKey }
  dialogMode.value = 'edit'
  dialogVisible.value = true
  // 增加 reloadTrigger 的值，觸發相關組件重新加載
  reloadTrigger.value++
}

// 處理刪除
const handleDelete = async (id: number) => {
  try {
    await deleteAttributeKey({ id })
    ElMessage.success('刪除成功')
    refreshList()
  } catch (error) {
    ElMessage.error('刪除失敗')
  }
}

// 處理管理屬性值
const handleManageValues = (attributeKey: AttributeKey) => {
  // 跳轉到屬性值管理頁面，並傳遞屬性鍵值 ID
  router.push({
    path: '/attribute-values',
    query: {
      keyId: attributeKey.id,
      keyName: attributeKey.name
    }
  })
}

// 處理表單提交成功
const handleFormSuccess = () => {
  dialogVisible.value = false
  refreshList()
}
</script>

<style scoped>
.attribute-keys-management-page {
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

.attribute-keys-container {
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
