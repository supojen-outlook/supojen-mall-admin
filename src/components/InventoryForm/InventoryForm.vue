<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle"
    width="600px"
    :before-close="handleClose"
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="儲位" prop="locationId">
        <LocationCascader
          v-model="formData.locationId"
          placeholder="選擇儲位"
          style="width: 90%"
          :disabled="mode === 'edit'"
        />
      </el-form-item>
      
      <el-form-item label="實際庫存" prop="quantityOnHand">
        <el-input-number
          v-model="formData.quantityOnHand"
          :min="0"
          placeholder="請輸入實際庫存數量"
          style="width: 90%"
        />
      </el-form-item>
      
      <el-form-item label="狀態" prop="status">
        <el-select
          v-model="formData.status"
          placeholder="選擇狀態"
          style="width: 90%"
        >
          <el-option label="啟用" value="active" />
          <el-option label="停用" value="inactive" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="是否可用" prop="isAvailable">
        <el-switch
          v-model="formData.isAvailable"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          type="primary" 
          :loading="submitting"
          @click="handleSubmit"
        >
          {{ mode === 'create' ? '建立' : '更新' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { Inventory } from '@/model'
import { createInventory, updateInventory } from '@/services/Inventory'
import { LocationCascader } from '@/components/LocationCascader'

// Props 定義
const props = defineProps<{
  visible: boolean
  mode: 'create' | 'edit'
  inventory?: Inventory | null
  skuId: number
}>()

// Emits 定義
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'success': []
}>()

// 響應式狀態
const formRef = ref<FormInstance>()
const submitting = ref(false)

// 表單數據
const formData = ref({
  locationId: 0,
  quantityOnHand: 0,
  status: 'active' as 'active' | 'inactive',
  isAvailable: true
})

// 表單驗證規則
const rules: FormRules = {
  locationId: [
    { required: true, message: '請選擇儲位', trigger: 'change' }
  ],
  quantityOnHand: [
    { required: true, message: '請輸入實際庫存數量', trigger: 'blur' },
    { type: 'number', min: 0, message: '庫存數量不能小於 0', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '請選擇狀態', trigger: 'change' }
  ]
}

// 計算屬性
const dialogTitle = computed(() => {
  return props.mode === 'create' ? '新增庫存' : '編輯庫存'
})

// 初始化表單數據
const initializeFormData = () => {
  if (props.mode === 'edit' && props.inventory) {
    formData.value = {
      locationId: props.inventory.locationId,
      quantityOnHand: props.inventory.quantityOnHand,
      status: props.inventory.status,
      isAvailable: props.inventory.isAvailable
    }
  } else {
    formData.value = {
      locationId: 0,
      quantityOnHand: 0,
      status: 'active',
      isAvailable: true
    }
  }
}

// 處理表單提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    if (props.mode === 'create') {
      await createInventory({
        skuId: props.skuId,
        locationId: formData.value.locationId,
        quantity: formData.value.quantityOnHand
      })
      ElMessage.success('庫存建立成功')
    } else {
      await updateInventory({
        id: props.inventory!.id,
        quantityOnHand: formData.value.quantityOnHand,
      })
      ElMessage.success('庫存更新成功')
    }
    
    emit('success')
    handleClose()
  } catch (error) {
    console.error('Submit error:', error)
    ElMessage.error('操作失敗')
  } finally {
    submitting.value = false
  }
}

// 處理關閉
const handleClose = () => {
  emit('update:visible', false)
}

// 監聽 visible 變化
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    initializeFormData()
  }
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-dialog__body) {
  padding: 24px;
}
</style>
