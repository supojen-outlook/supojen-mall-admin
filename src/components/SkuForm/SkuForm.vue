<template>
  <div v-loading="submitting">
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
        
        <!-- 基本信息區域 -->
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          
          <el-form-item label="SKU 名稱" prop="name">
            <el-input
              v-model="formData.name"
              placeholder="請輸入 SKU 名稱"
              style="width: 90%"
            />
          </el-form-item>
          
          <el-form-item label="價格" prop="price">
            <el-input-number
              v-model="formData.price"
              :min="0"
              :precision="2"
              placeholder="請輸入價格"
              style="width: 90%""
            />
          </el-form-item>
          
          <el-form-item label="庫存數量" prop="stockQuantity">
            <el-input-number
              v-model="formData.stockQuantity"
              :min="0"
              placeholder="請輸入庫存數量"
              style="width: 90%"
            />
          </el-form-item>
          
          <el-form-item label="計量單位" prop="unitOfMeasureId">
            <UnitOfMeasureSelector
              v-model="formData.unitOfMeasureId"
              placeholder="選擇計量單位"
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
          
          <el-form-item label="是否預設" prop="isDefault">
            <el-switch
              v-model="formData.isDefault"
              active-text="是"
              inactive-text="否"
            />
          </el-form-item>
        </div>
        
        <!-- SKU 規格 -->
        <div class="form-section">
          <h3 class="section-title">規格</h3>
          <div class="specifications-list">
            <SpecificationInput
              v-for="spec in formData.specifications"
              :key="spec.keyId"
              :specification="spec"
              :mode="mode"
              @update="handleSpecificationUpdate"
            />
          </div>
        </div>
        
        <!-- SKU 圖片 -->
        <div class="form-section">
          <h3 class="section-title">圖片</h3>
          <el-form-item label="SKU 圖片" prop="imageUrl">
            <AssetUpload
              v-model="formData.imageUrl"
              :limit="1"
              accept="image/*"
            />
          </el-form-item>
        </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { Sku, Specification } from '@/model'
import { UnitOfMeasureSelector } from '@/components/UnitOfMeasureSelector'
import { SpecificationInput } from '@/components/SpecificationInput'
import { AssetUpload } from '@/components/AssetUpload'
import { createSku, updateSku } from '@/services/Sku'

interface Props {
  visible: boolean
  mode: 'create' | 'edit'
  sku?: Sku | null
  productId?: number
  productSpecifications?: Specification[]
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 計算屬性
const dialogTitle = computed(() => {
  return props.mode === 'create' ? '新增 SKU' : '編輯 SKU'
})

// 表單驗證規則
const rules = computed<FormRules>(() => {
  const baseRules: FormRules = {
    name: [
      { required: true, message: '請輸入 SKU 名稱', trigger: 'blur' },
      { min: 2, max: 100, message: 'SKU 名稱長度應在 2-100 個字符之間', trigger: 'blur' }
    ],
    price: [
      { required: true, message: '請輸入價格', trigger: 'blur' },
      { type: 'number', min: 0, message: '價格必須大於等於 0', trigger: 'blur' }
    ],
    stockQuantity: [
      { required: true, message: '請輸入庫存數量', trigger: 'blur' },
      { type: 'number', min: 0, message: '庫存數量必須大於等於 0', trigger: 'blur' }
    ],
    unitOfMeasureId: [
      { required: true, message: '請選擇計量單位', trigger: 'change' }
    ],
    status: [
      { required: true, message: '請選擇狀態', trigger: 'change' }
    ]
  }
  return baseRules
})

// 響應式狀態
const formRef = ref<FormInstance>()
const submitting = ref(false)

// 表單數據
const formData = ref({
  name: '',
  price: 0,
  stockQuantity: 0,
  unitOfMeasureId: undefined as number | undefined,
  status: 'active' as 'active' | 'inactive',
  isDefault: false,
  imageUrl: '',
  specifications: [] as Specification[],
  productId: 0 as number
})

// 處理規格更新
const handleSpecificationUpdate = (updatedSpec: Specification) => {
  const index = formData.value.specifications.findIndex(
    spec => spec.keyId === updatedSpec.keyId
  )
  if (index !== -1) {
    formData.value.specifications[index] = updatedSpec
  }
}

// 處理提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    submitting.value = true
    
    const submitData = { ...formData.value }
    
    // 添加產品 ID
    if (props.productId) {
      submitData.productId = props.productId
    }
    
    if (props.mode === 'create') {
      await createSku(submitData)
      ElMessage.success('SKU 建立成功')
    } else {
      await updateSku({ ...submitData, id: props.sku!.id })
      ElMessage.success('SKU 更新成功')
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
  resetForm()
}

// 重置表單
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  formData.value = {
    name: '',
    price: 0,
    stockQuantity: 0,
    unitOfMeasureId: undefined,
    status: 'active',
    isDefault: false,
    imageUrl: '',
    specifications: [],
    productId: 0
  }
}

// 初始化表單數據
const initializeFormData = () => {
  if (props.mode === 'edit' && props.sku) {
    formData.value = {
      name: props.sku.name || '',
      price: props.sku.price || 0,
      stockQuantity: props.sku.stockQuantity || 0,
      unitOfMeasureId: props.sku.unitOfMeasureId || undefined,
      status: props.sku.status || 'active',
      isDefault: props.sku.isDefault || false,
      imageUrl: props.sku.imageUrl || '',
      specifications: props.sku.specs || [],
      productId: props.sku.productId || 0
    }
  } else if (props.mode === 'create' && props.productSpecifications) {
    // 創建模式：使用產品規格初始化
    formData.value.specifications = props.productSpecifications.map(spec => ({
      ...spec,
      valueId: null,
      value: null
    }))
    formData.value.productId = props.productId || 0
  }
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
  text-align: right;
}

.form-section {
  padding: 0;
  margin-bottom: 24px;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--el-color-primary-light-9);
}

.specifications-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
