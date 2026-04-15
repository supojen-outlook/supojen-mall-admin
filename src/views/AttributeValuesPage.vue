<template>
  <div class="attribute-values-management-page">
    <div class="page-header">
      <div class="header-left">
        <el-button 
          type="text" 
          @click="goBack"
          class="back-button">
          <i class="ri-arrow-left-line"></i> 返回屬性管理
        </el-button>
        <h1>{{ currentKeyName }} - 屬性值管理</h1>
      </div>
      <el-button 
        type="primary" 
        @click="showCreateDialog">
        <i class="ri-add-line"></i> 新增屬性值
      </el-button>
    </div>

    <div class="attribute-values-container">
      <el-card class="attribute-values-list">
        <template #header>
          <div class="card-header">
            <span>屬性值列表</span>
            <div class="header-actions">
              <el-input
                v-model="searchValue"
                placeholder="搜尋屬性值..."
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
          :data="filteredValues"
          row-key="id"
          style="width: 100%">
          <el-table-column
            prop="value"
            label="屬性值"
            width="150">
            <template #default="{ row }">
              <el-tooltip 
                :content="row.value" 
                placement="top" 
                :disabled="!row.value || row.value.length <= 10"
              >
                <div class="text-ellipsis">
                  {{ row.value || '-' }}
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
            prop="sortOrder"
            label="排序"
            width="80" />
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
                title="確定要刪除這個屬性值嗎？"
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
      </el-card>
    </div>

    <!-- 新增/編輯屬性值對話框 -->
    <AttributeValueForm
      v-model="dialogVisible"
      :mode="dialogMode"
      :initial-data="currentAttributeValue"
      @success="handleFormSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAttributeValues, deleteAttributeValue } from '@/services/AttributeValue'
import { AttributeValueForm } from '@/components/AttributeValueForm'
import type { AttributeValue } from '@/model'

// 狀態
const router = useRouter()
const route = useRoute()
const currentAttributeValue = ref<AttributeValue | null>(null)
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const loading = ref(false)
const attributeValues = ref<AttributeValue[]>([])
const searchValue = ref('')

// 從路由參數獲取屬性鍵值信息
const keyId = computed(() => Number(route.query.keyId))
const currentKeyName = computed(() => route.query.keyName as string || '未知屬性')

// 過濾後的屬性值
const filteredValues = computed(() => {
  if (!searchValue.value) {
    return attributeValues.value || []
  }
  // 確保 attributeValues.value 是陣列
  const values = Array.isArray(attributeValues.value) ? attributeValues.value : []
  return values.filter(item => 
    item.value?.toLowerCase().includes(searchValue.value.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchValue.value.toLowerCase())
  )
})

// 生命週期鉤子
onMounted(() => {
  console.log('路由參數:', route.query)
  console.log('keyId:', keyId.value)
  console.log('keyName:', currentKeyName.value)
  
  if (keyId.value) {
    loadAttributeValues()
  } else {
    ElMessage.error('缺少屬性鍵值 ID')
    goBack()
  }
})

// 載入屬性值
const loadAttributeValues = async () => {
  try {
    loading.value = true
    const result = await getAttributeValues({ id: keyId.value })
    console.log('API 返回的原始數據:', result)
    console.log('數據類型:', typeof result)
    
    // 現在 API 返回的是 Pagination<AttributeValue> 格式
    if (result && typeof result === 'object' && 'list' in result) {
      attributeValues.value = result.list || []
      console.log('處理後的屬性值:', result.list)
    } else {
      console.warn('API 返回的數據格式不符合 Pagination 結構:', result)
      attributeValues.value = []
    }
  } catch (error) {
    console.error('載入屬性值失敗:', error)
    ElMessage.error('載入屬性值失敗')
    attributeValues.value = []  // 確保在錯誤情況下也是陣列
  } finally {
    loading.value = false
  }
}

// 返回上一頁
const goBack = () => {
  router.push('/attribute-keys')
}

// 顯示新增對話框
const showCreateDialog = () => {
  dialogMode.value = 'create'
  dialogVisible.value = true
}

// 處理編輯
const handleEdit = (attributeValue: AttributeValue) => {
  currentAttributeValue.value = { ...attributeValue }
  dialogMode.value = 'edit'
  dialogVisible.value = true
}

// 處理刪除
const handleDelete = async (id: number) => {
  try {
    await deleteAttributeValue({ id })
    ElMessage.success('刪除成功')
    await loadAttributeValues()
  } catch (error) {
    ElMessage.error('刪除失敗')
  }
}

// 處理搜尋
const handleSearch = () => {
  // 搜尋邏輯已經在 computed 中處理
}

// 處理表單提交成功
const handleFormSuccess = () => {
  dialogVisible.value = false
  loadAttributeValues()
}
</script>

<style scoped>
.attribute-values-management-page {
  padding: 5px;
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
  gap: 15px;
}

.back-button {
  color: var(--el-color-primary);
  font-size: 14px;
  padding: 8px 12px;
}

.back-button:hover {
  background-color: var(--el-color-primary-light-9);
}

.page-header h1 {
  color: var(--el-text-color-primary);
  font-weight: 600;
  margin: 0;
}

.attribute-values-container {
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
