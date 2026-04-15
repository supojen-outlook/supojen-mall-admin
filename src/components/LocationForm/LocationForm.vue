<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="(value: boolean) => emit('update:visible', value)"
    :title="dialogTitle"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      class="location-form"
    >
      <!-- 基本信息區域 -->
      <div class="form-section">
        <h3 class="section-title">基本信息</h3>
        
        <el-form-item label="位置名稱" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="請輸入位置名稱"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="位置編號" prop="locationNumber">
          <el-input
            v-model="formData.locationNumber"
            placeholder="請輸入位置編號，用於條碼/RFID 掃描"
            maxlength="50"
            clearable
          />
        </el-form-item>

        <el-form-item label="位置類型" prop="locationType">
          <el-select
            v-model="formData.locationType"
            placeholder="請選擇位置類型"
            class="w-full"
            @change="handleLocationTypeChange"
          >
            <el-option label="區域" value="ZONE" />
            <el-option label="儲位" value="BIN" />
          </el-select>
        </el-form-item>

        <el-form-item label="位置狀態" prop="status">
          <el-select
            v-model="formData.status"
            placeholder="請選擇位置狀態"
            class="w-full"
          >
            <el-option label="啟用" value="active" />
            <el-option label="停用" value="inactive" />
            <el-option label="維護中" value="maintenance" />
          </el-select>
        </el-form-item>
      </div>

      <!-- 層級結構區域 -->
      <div class="form-section">
        <h3 class="section-title">層級結構</h3>
        
        <el-form-item label="父級位置" prop="parentId">
          <LocationCascader
            v-model="formData.parentId"
            :reload-trigger="reloadTrigger"
            placeholder="請選擇父級位置，留空表示根區域"
            :clearable="true"
            :filterable="true"
            class="w-full"
            @change="handleParentChange"
          />
        </el-form-item>

        <el-form-item label="區域功能" prop="zoneType" v-if="formData.locationType === 'ZONE'">
          <el-select
            v-model="formData.zoneType"
            placeholder="請選擇區域功能"
            clearable
            class="w-full"
          >
            <el-option label="收貨區" value="RECEIVING" />
            <el-option label="儲存區" value="STORAGE" />
            <el-option label="出貨區" value="SHIPPING" />
            <el-option label="退貨區" value="RETURNING" />
          </el-select>
        </el-form-item>
      </div>

      <!-- 容量設置區域 -->
      <div class="form-section">
        <h3 class="section-title">容量設置</h3>
        
        <el-form-item label="計量單位" prop="unitOfMeasureId">
          <UnitOfMeasureSelector
            v-model="formData.unitOfMeasureId"
            placeholder="請選擇計量單位"
            class="w-full"
          />
        </el-form-item>

        <el-form-item label="最大容量" prop="maxQuantity">
          <el-input-number
            v-model="formData.maxQuantity"
            placeholder="請輸入最大容量，0 表示無限制"
            :min="0"
            :precision="0"
            class="w-full"
          />
        </el-form-item>
      </div>

      <!-- 其他信息區域 -->
      <div class="form-section">
        <h3 class="section-title">其他信息</h3>
        
        <el-form-item label="排序順序" prop="sortOrder">
          <el-input-number
            v-model="formData.sortOrder"
            placeholder="數字越小越前面"
            :min="0"
            :precision="0"
            class="w-full"
          />
        </el-form-item>

        <el-form-item label="實體地址" prop="address">
          <el-input
            v-model="formData.address"
            placeholder="請輸入實體地址（跨廠區時使用）"
            maxlength="200"
            clearable
          />
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ isEditMode ? '更新' : '創建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { Location, LocationType, ZoneType, LocationStatus } from '@/model'
import { UnitOfMeasureSelector } from '@/components/UnitOfMeasureSelector'
import { LocationCascader } from '@/components/LocationCascader'
import { getLocations, addLocation, updateLocation } from '@/services/Location'

// 定義組件名稱
defineOptions({
  name: 'LocationForm'
})

// Props 定義
const props = defineProps({
  /** 對話框顯示狀態 */
  visible: {
    type: Boolean,
    default: false
  },
  /** 編輯模式的位置數據 */
  location: {
    type: Object as () => Location | null,
    default: null
  },
  /** 表單模式：add 或 edit */
  mode: {
    type: String as () => 'add' | 'edit',
    default: 'add'
  }
})

// Emits 定義
const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

// 響應式狀態
const formRef = ref<FormInstance>()
const loading = ref(false)
const parentLocations = ref<Location[]>([])
const reloadTrigger = ref(0)

// 表單數據
const formData = ref({
  name: '',
  locationNumber: '',
  locationType: 'ZONE' as LocationType,
  zoneType: null as ZoneType | null,
  parentId: undefined as number | undefined,
  unitOfMeasureId: 1,
  maxQuantity: 0,
  address: '',
  sortOrder: 0,
  status: 'active' as LocationStatus
})

// 計算屬性
const isEditMode = computed(() => props.mode === 'edit')
const dialogTitle = computed(() => isEditMode.value ? '編輯位置' : '新增位置')

// 表單驗證規則
const formRules: FormRules = {
  name: [
    { required: true, message: '請輸入位置名稱', trigger: 'blur' },
    { min: 2, max: 50, message: '位置名稱長度應在 2-50 個字符之間', trigger: 'blur' }
  ],
  locationType: [
    { required: true, message: '請選擇位置類型', trigger: 'change' }
  ],
  status: [
    { required: true, message: '請選擇位置狀態', trigger: 'change' }
  ],
  unitOfMeasureId: [
    { required: true, message: '請選擇計量單位', trigger: 'change' }
  ],
  maxQuantity: [
    { type: 'number', min: 0, message: '最大容量不能小於 0', trigger: 'blur' }
  ],
  sortOrder: [
    { type: 'number', min: 0, message: '排序順序不能小於 0', trigger: 'blur' }
  ]
}

// 監聽對話框顯示狀態
watch(() => props.visible, (newVal) => {
  if (newVal) {
    initializeForm()
  }
})

// 監聽位置數據變化（編輯模式）
watch(() => props.location, (newLocation) => {
  if (newLocation && isEditMode.value) {
    loadLocationData(newLocation)
  }
}, { immediate: true })

// 監聽位置類型變化
watch(() => formData.value.locationType, (newType) => {
  if (newType === 'BIN') {
    // 儲位類型時清空區域功能
    formData.value.zoneType = null
  }
})

/**
 * 初始化表單
 */
const initializeForm = async () => {
  await loadParentLocations()
  
  if (isEditMode.value && props.location) {
    loadLocationData(props.location)
  } else {
    resetForm()
  }
}

/**
 * 加載父級位置列表
 */
const loadParentLocations = async () => {
  try {
    const result = await getLocations({ 
      locationType: 'ZONE', 
      status: 'active' 
    })
    parentLocations.value = result.list
  } catch (error) {
    console.error('加載父級位置失敗:', error)
    ElMessage.error('加載父級位置失敗')
  }
}

/**
 * 加載位置數據（編輯模式）
 */
const loadLocationData = (location: Location) => {
  formData.value = {
    name: location.name,
    locationNumber: location.locationNumber || '',
    locationType: location.locationType,
    zoneType: location.zoneType,
    parentId: location.parentId || undefined,
    unitOfMeasureId: location.unitOfMeasureId,
    maxQuantity: location.maxQuantity || 0,
    address: location.address || '',
    sortOrder: location.sortOrder,
    status: location.status
  }
}

/**
 * 重置表單
 */
const resetForm = () => {
  formData.value = {
    name: '',
    locationNumber: '',
    locationType: 'ZONE',
    zoneType: null,
    parentId: undefined,
    unitOfMeasureId: 1,
    maxQuantity: 0,
    address: '',
    sortOrder: 0,
    status: 'active'
  }
  
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

/**
 * 處理父級變化
 */
const handleParentChange = (parentId: number | undefined) => {
  if (parentId) {
    // 選擇父級後，自動設置為儲位類型
    formData.value.locationType = 'BIN'
  }
}

/**
 * 處理位置類型變化
 */
const handleLocationTypeChange = (locationType: string) => {
  if (locationType === 'BIN') {
    // 儲位類型時不需要區域功能
    formData.value.zoneType = null
  }
}

/**
 * 驗證表單
 */
const validateForm = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    formRef.value?.validate((valid: boolean) => {
      resolve(valid)
    })
  })
}

/**
 * 處理提交
 */
const handleSubmit = async () => {
  const isValid = await validateForm()
  if (!isValid) {
    return
  }
  
  try {
    loading.value = true
    
    const submitData = {
      ...formData.value,
      maxQuantity: formData.value.maxQuantity || undefined,
      address: formData.value.address || undefined,
      zoneType: formData.value.zoneType || undefined,
      parentId: formData.value.parentId || undefined
    }
    
    if (isEditMode.value && props.location) {
      await updateLocation({ id: props.location.id, ...submitData })
      ElMessage.success('位置更新成功')
    } else {
      await addLocation(submitData)
      ElMessage.success('位置創建成功')
    }
    
    emit('success')
    handleClose()
  } catch (error) {
    console.error('提交失敗:', error)
    ElMessage.error(isEditMode.value ? '位置更新失敗' : '位置創建失敗')
  } finally {
    loading.value = false
  }
}

/**
 * 處理關閉
 */
const handleClose = () => {
  emit('update:visible', false)
}
</script>

<style scoped>
.location-form {
  max-height: 600px;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #ebeef5;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #303133;
}

.parent-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.parent-name {
  flex: 1;
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.w-full {
  width: 100%;
}
</style>
