<template>
  <div class="category-management-page">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h1>分類管理</h1>
      <el-button type="primary" @click="showCreateDialog">
        <i class="ri-add-line"></i> 新增分類
      </el-button>
    </div>

    <div class="category-container">
      <el-card class="category-list">
        <template #header>
          <div class="card-header">
            <span>分類列表</span>
            <div class="header-actions">
              <el-select
                v-model="filters.isLeaf"
                placeholder="葉子分類"
                clearable
                style="width: 120px; margin-right: 10px"
                @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="是" :value="true" />
                <el-option label="否" :value="false" />
              </el-select>
              <CategoryCascader 
                v-model="filters.parentId"
                :reload-trigger="reloadTrigger"
                placeholder="選擇父分類"
                :clearable="true"
                :filterable="true"
                @change="handleSearch"
                style="width: 240px; margin-right: 10px"
              />
              <el-select
                v-model="filters.level"
                placeholder="選擇層級"
                clearable
                style="width: 120px; margin-right: 10px"
                @change="handleSearch">
                <el-option
                  v-for="l in [1, 2, 3]"
                  :key="l"
                  :label="`層級 ${l}`"
                  :value="l" />
              </el-select>
              <el-input
                v-model="filters.search"
                placeholder="搜尋分類..."
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
            label="分類名稱"
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
            prop="slug"
            label="Slug"
            width="150">
            <template #default="{ row }">
              <el-tooltip 
                :content="row.slug" 
                placement="top" 
                :disabled="!row.slug || row.slug.length <= 10"
              >
                <div class="text-ellipsis">
                  {{ row.slug || '-' }}
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            prop="pathText"
            label="父分類"
            min-width="150" />
          <el-table-column
            prop="isLeaf"
            label="葉子類目"
            width="100">
            <template #default="{ row }">
              <el-tag :type="row.isLeaf ? 'success' : 'info'" effect="plain">
                {{ row.isLeaf ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
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
            prop="sortOrder"
            label="排序"
            width="90" />
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
              <el-button
                v-if="row.isLeaf"
                type="success"
                link
                @click="handleManageAttributes(row)">
                屬性
              </el-button>
              <el-popconfirm
                title="確定要刪除這個分類嗎？"
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

    <!-- 新增/編輯分類對話框 -->
    <CategoryForm
      v-model="dialogVisible"
      :mode="dialogMode"
      :initial-data="currentCategory"
      :reload-trigger="reloadTrigger"
      @success="handleFormSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { CategoryForm } from '@/components/CategoryForm'
import { CategoryCascader } from '@/components/CategoryCascader'
import { 
  getCategories,
  deleteCategory
} from '@/services/Category'
import type { Category } from '@/model'
import { usePagination } from '@/composables/usePagination'

// 狀態
const router = useRouter()
const categoryOptions = ref<Category[]>([])
const currentCategory = ref<Category | null>(null)
const dialogVisible   = ref(false)
const dialogMode      = ref<'create' | 'edit'>('create')
const reloadTrigger   = ref(0)

// 使用新的 usePagination
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
} = usePagination<Category>({
  fetchList: (params) => getCategories({
    ...params,
    format: 'flat'
  }),
  pageSize: 10,
  sortBy: 'sortOrder',
  sortDirection: 'asc',
  defaultFilters: {
    search: '',
    level: 1,
    parentId: undefined,
    isLeaf: undefined
  }
})

// 生命週期鉤子
onMounted(() => {
  loadItems()
  fetchCategoryOptions()
})

// 獲取分類選項
const fetchCategoryOptions = async () => {
  try {
    const data = await getCategories({
      status: 'active'
    })
    categoryOptions.value = data.list
  } catch (error) {
    console.error('獲取分類選項失敗:', error)
    ElMessage.error('獲取分類選項失敗')
  }
}

// 顯示新增對話框
const showCreateDialog = () => {
  dialogMode.value = 'create'
  dialogVisible.value = true
}

// 處理編輯
const handleEdit = (category: Category) => {
  currentCategory.value = { ...category }
  dialogMode.value = 'edit'
  dialogVisible.value = true
  // 增加 reloadTrigger 的值，觸發 cascader 重新加載
  reloadTrigger.value++
}

// 處理刪除
const handleDelete = async (id: number) => {
  try {
    await deleteCategory({ id })
    ElMessage.success('刪除成功')
    refreshList()
    // 增加 reloadTrigger 的值，觸發 cascader 重新加載
    reloadTrigger.value++
  } catch (error) {
    ElMessage.error('刪除失敗')
  }
}

// 處理管理屬性關聯
const handleManageAttributes = (category: Category) => {
  // 跳轉到屬性關聯管理頁面，並傳遞分類 ID 和名稱
  router.push({
    path: '/category-attributes',
    query: {
      categoryId: category.id,
      categoryName: category.name
    }
  })
}

// 處理表單提交成功
const handleFormSuccess = () => {
  dialogVisible.value = false
  refreshList()
  // 增加 reloadTrigger 的值，觸發 cascader 重新加載
  reloadTrigger.value++
}
</script>

<style scoped>
.category-management-page {
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

.category-container {
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
