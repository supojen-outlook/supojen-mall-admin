<template>
  <div class="users-management-page">
    <div class="page-header">
      <h1>用戶管理</h1>
      <el-button 
        type="primary" 
        @click="showCreateDialog">
        <i class="ri-add-line"></i> 新增用戶
      </el-button>
    </div>

    <div class="users-container">
      <el-card class="users-list">
        <template #header>
          <div class="card-header">
            <span>用戶列表</span>
            <div class="header-actions">
              <el-select
                v-model="filters.status"
                placeholder="狀態"
                clearable
                style="width: 120px"
                @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="啟用" value="active" />
                <el-option label="停用" value="inactive" />
                <el-option label="待驗證" value="pending" />
              </el-select>
              <el-select
                v-model="filters.membershipLevel"
                placeholder="會員等級"
                clearable
                style="width: 120px"
                @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="青銅" value="bronze" />
                <el-option label="白銀" value="silver" />
                <el-option label="黃金" value="gold" />
                <el-option label="尊榮" value="vip" />
              </el-select>
              <el-input
                v-model="filters.search"
                placeholder="搜尋用戶名稱或郵箱..."
                clearable
                style="width: 220px"
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
            prop="avatar"
            label="頭像"
            width="80">
            <template #default="{ row }">
              <el-avatar :size="40" :src="row.avatar">
                {{ row.displayName?.charAt(0) || 'U' }}
              </el-avatar>
            </template>
          </el-table-column>
          <el-table-column
            prop="displayName"
            label="顯示名稱"
            width="140">
            <template #default="{ row }">
              <el-tooltip 
                :content="row.displayName" 
                placement="top" 
                :disabled="!row.displayName || row.displayName.length <= 15"
              >
                <div class="text-ellipsis">
                  {{ row.displayName || '-' }}
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            prop="fullName"
            label="全名"
            width="140">
            <template #default="{ row }">
              <el-tooltip 
                :content="row.fullName" 
                placement="top" 
                :disabled="!row.fullName || row.fullName.length <= 15"
              >
                <div class="text-ellipsis">
                  {{ row.fullName || '-' }}
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            prop="email"
            label="郵箱"
            min-width="180">
            <template #default="{ row }">
              <div class="email-cell">
                {{ row.email }}
                <el-tag v-if="!row.emailVerified" type="warning" size="small" effect="plain">未驗證</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="membershipLevel"
            label="會員等級"
            width="100">
            <template #default="{ row }">
              <el-tag :type="getMembershipLevelTagType(row.membershipLevel)" effect="plain">
                {{ getMembershipLevelLabel(row.membershipLevel) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="roles"
            label="角色"
            width="150">
            <template #default="{ row }">
              <div class="roles-cell">
                <el-tag
                  v-for="role in row.roles"
                  :key="role.id"
                  size="small"
                  effect="plain"
                  class="role-tag">
                  {{ role.name }}
                </el-tag>
                <span v-if="!row.roles?.length" class="text-gray">-</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="points"
            label="積分"
            width="80">
            <template #default="{ row }">
              {{ row.points || 0 }}
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            label="狀態"
            width="90">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)" effect="plain">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="birthDate"
            label="生日"
            width="110">
            <template #default="{ row }">
              {{ row.birthDate || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="gender"
            label="性別"
            width="70">
            <template #default="{ row }">
              {{ getGenderLabel(row.gender) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="note"
            label="備註"
            min-width="120">
            <template #default="{ row }">
              <el-tooltip 
                :content="row.note" 
                placement="top" 
                :disabled="!row.note || row.note.length <= 20"
              >
                <div class="text-ellipsis">
                  {{ row.note || '-' }}
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="140"
            fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                @click="handleEdit(row)">
                編輯
              </el-button>
              <el-popconfirm
                title="確定要刪除這個用戶嗎？"
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

    <!-- 新增/編輯用戶對話框 -->
    <UserForm
      v-model="dialogVisible"
      :mode="dialogMode"
      :initial-data="currentUser"
      @success="handleFormSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UserForm } from '@/components/UserForm'
import { 
  getUsers,
  // deleteUser - 如果需要删除功能，需要先在 User.ts 中添加
} from '@/services/User'
import type { User } from '@/model'
import { usePagination } from '@/composables/usePagination'

// State
const currentUser = ref<User | null>(null)
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')

// Use pagination
const {
  // State
  items, 
  loading,
  filters,
  pagination,
  
  // Methods
  loadItems,
  handleSearch,
  handleCurrentChange,
  handleSizeChange,
  handleSortChange,
  refreshList
} = usePagination<User>({
  fetchList: getUsers,
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'desc',
  defaultFilters: {
    search: '',
    status: '',
    membershipLevel: ''
  }
})

// Lifecycle
onMounted(() => {
  loadItems()
})

// Show create dialog
const showCreateDialog = () => {
  dialogMode.value = 'create'
  currentUser.value = null
  dialogVisible.value = true
}

// Handle edit
const handleEdit = (user: User) => {
  currentUser.value = { ...user }
  dialogMode.value = 'edit'
  dialogVisible.value = true
}

// Handle delete - 暂时使用模拟功能，需要添加 deleteUser API
const handleDelete = async (_: number) => {
  try {
    // await deleteUser(id)
    ElMessage.success('刪除成功（模擬）')
    refreshList()
  } catch (error) {
    ElMessage.error('刪除失敗')
  }
}

// Handle form success
const handleFormSuccess = () => {
  dialogVisible.value = false
  refreshList()
}

// Helper functions
const getMembershipLevelLabel = (level: string) => {
  const labels: Record<string, string> = {
    bronze: '青銅',
    silver: '白銀',
    gold: '黃金',
    vip: '尊榮'
  }
  return labels[level] || level
}

const getMembershipLevelTagType = (level: string) => {
  const types: Record<string, string> = {
    bronze: 'warning',
    silver: 'primary',
    gold: 'success',
    vip: 'danger'
  }
  return types[level] || 'info'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    active: '啟用',
    inactive: '停用',
    pending: '待驗證'
  }
  return labels[status] || status
}

const getStatusTagType = (status: string) => {
  const types: Record<string, string> = {
    active: 'success',
    inactive: 'info',
    pending: 'warning'
  }
  return types[status] || 'info'
}

const getGenderLabel = (gender: string | null) => {
  if (!gender) return '-'
  const labels: Record<string, string> = {
    male: '男',
    female: '女',
    other: '其他'
  }
  return labels[gender] || gender
}
</script>

<style scoped>
.users-management-page {
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

.users-container {
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

.email-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.roles-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.role-tag {
  margin-right: 0;
}

.text-gray {
  color: #909399;
}
</style>
