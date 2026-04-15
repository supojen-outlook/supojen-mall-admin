<template>
  <div class="category-attributes-management-page">
    <div class="page-header">
      <el-button type="text" @click="goBack" class="back-button">
        <i class="ri-arrow-left-line"></i> 返回分類管理
      </el-button>
      <h1>{{ currentCategoryName }} - 屬性關聯管理</h1>
      <el-button type="primary" @click="showCreateDialog">
        <i class="ri-add-line"></i> 新增屬性關聯
      </el-button>
    </div>

    <div class="category-attributes-container">
      <el-card class="category-attributes-list">
        <template #header>
          <div class="card-header">
            <span>關聯屬性列表</span>
            <div class="header-actions">
              <el-input
                v-model="searchValue"
                placeholder="搜尋屬性..."
                clearable
                style="width: 200px"
                @clear="handleSearch"
                @keyup.enter="handleSearch">
                <template #prefix>
                  <i class="ri-search-line"></i>
                </template>
              </el-input>
              <el-button 
                type="primary" 
                @click="handleSearch"
                :loading="loading">
                <i class="ri-search-line"></i> 搜尋
              </el-button>
            </div>
          </div>
        </template>

        <el-table
          v-loading="loading"
          :data="filteredAttributes"
          row-key="id"
          style="width: 100%">
          <el-table-column
            prop="name"
            label="屬性名稱"
            width="200">
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
            label="描述"
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
              <el-tag 
                :type="getInputTypeTagType(row.inputType)" 
                size="small">
                {{ getInputTypeText(row.inputType) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
            prop="forSales"
            label="銷售屬性"
            width="100">
            <template #default="{ row }">
              <el-tag 
                :type="row.forSales ? 'success' : 'info'" 
                size="small">
                {{ row.forSales ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
            prop="isRequired"
            label="必填"
            width="80">
            <template #default="{ row }">
              <el-tag 
                :type="row.isRequired ? 'danger' : 'info'" 
                size="small">
                {{ row.isRequired ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
            prop="sortOrder"
            label="排序"
            width="80">
            <template #default="{ row }">
              {{ row.sortOrder || 0 }}
            </template>
          </el-table-column>

          <el-table-column
            label="操作"
            width="120"
            fixed="right">
            <template #default="{ row }">
              <el-popconfirm
                title="確定要移除這個屬性關聯嗎？"
                @confirm="handleDelete(row.id)">
                <template #reference>
                  <el-button
                    type="danger"
                    link
                    size="small">
                    移除
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 新增屬性關聯對話框 -->
    <CategoryAttributeForm
      v-model="dialogVisible"
      :mode="dialogMode"
      :category-id="categoryId"
      @success="handleFormSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAttributeKeys } from '@/services/AttributeKey'
import { deleteCategoryAttribute } from '@/services/Category'
import { CategoryAttributeForm } from '@/components/CategoryAttributeForm'
import type { AttributeKey } from '@/model'

// 狀態
const router = useRouter()
const route = useRoute()
const loading = ref(false)
const searchValue = ref('')
const categoryAttributes = ref<AttributeKey[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'create'>('create')

// 從路由參數獲取分類信息
const categoryId = computed(() => Number(route.query.categoryId))
const currentCategoryName = computed(() => route.query.categoryName as string || '未知分類')

// 過濾後的屬性列表
const filteredAttributes = computed(() => {
  if (!searchValue.value) {
    return categoryAttributes.value || []
  }
  const attributes = Array.isArray(categoryAttributes.value) ? categoryAttributes.value : []
  return attributes.filter(item => 
    item.name?.toLowerCase().includes(searchValue.value.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchValue.value.toLowerCase())
  )
})

// 輸入類型標籤樣式
const getInputTypeTagType = (type: string): "primary" | "success" | "warning" | "info" => {
  const typeMap: Record<string, "primary" | "success" | "warning" | "info"> = {
    'select': 'primary',
    'text': 'success',
    'number': 'warning',
    'checkbox': 'info'
  }
  return typeMap[type] || 'info'
}

const getInputTypeText = (type: string) => {
  const textMap = {
    'select': '下拉選單',
    'text': '文字',
    'number': '數字',
    'checkbox': '複選框'
  }
  return textMap[type as keyof typeof textMap] || type
}

// 生命週期鉤子
onMounted(() => {
  console.log('路由參數:', route.query)
  console.log('categoryId:', categoryId.value)
  console.log('categoryName:', currentCategoryName.value)
  
  if (categoryId.value) {
    loadCategoryAttributes()
  } else {
    ElMessage.error('缺少分類 ID')
    goBack()
  }
})

// 載入分類關聯的屬性
const loadCategoryAttributes = async () => {
  try {
    loading.value = true
    const result = await getAttributeKeys({ 
      categoryId: categoryId.value,
      status: 'active'
    })
    console.log('API 返回的原始數據:', result)
    console.log('數據類型:', typeof result)
    
    // 現在 API 返回的是 Pagination<AttributeKey> 格式
    if (result && typeof result === 'object' && 'list' in result) {
      categoryAttributes.value = result.list || []
      console.log('處理後的屬性列表:', result.list)
    } else {
      console.warn('API 返回的數據格式不符合 Pagination 結構:', result)
      categoryAttributes.value = []
    }
  } catch (error) {
    console.error('載入分類屬性失敗:', error)
    ElMessage.error('載入分類屬性失敗')
    categoryAttributes.value = []
  } finally {
    loading.value = false
  }
}

// 搜尋處理
const handleSearch = () => {
  // 搜尋已經由 computed 屬性處理
  console.log('搜尋:', searchValue.value)
}

// 返回上一頁
const goBack = () => {
  router.push('/products/categories')
}

// 顯示新增對話框
const showCreateDialog = () => {
  dialogMode.value = 'create'
  dialogVisible.value = true
}

// 處理表單提交成功
const handleFormSuccess = () => {
  dialogVisible.value = false
  loadCategoryAttributes()
}

// 處理刪除
const handleDelete = async (attributeKeyId: number) => {
  try {
    await deleteCategoryAttribute({
      categoryId: categoryId.value,
      attributeKeyId: attributeKeyId
    })
    ElMessage.success('移除屬性關聯成功')
    loadCategoryAttributes()
  } catch (error) {
    ElMessage.error('移除屬性關聯失敗')
  }
}
</script>

<style scoped>
.category-attributes-management-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  color: var(--el-text-color-primary);
  transition: all 0.3s ease;
}

.back-button:hover {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.page-header h1 {
  color: var(--el-text-color-primary);
  font-weight: 600;
  margin: 0;
  font-size: 24px;
}

.category-attributes-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.category-attributes-list {
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
