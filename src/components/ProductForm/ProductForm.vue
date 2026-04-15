<template>
  <div v-loading="submitting">
    <el-dialog
      v-model="visible"
      :title="dialogTitle"
      width="65%"
      @close="handleClose">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px">
        
        <!-- 基本信息區域 -->
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          
          <el-form-item label="產品名稱" prop="name">
            <el-input 
              v-model="formData.name" 
              type="textarea"
              :rows="2"
              placeholder="請輸入產品名稱"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="SPU 編碼" prop="spuCode">
            <el-input 
              v-model="formData.spuCode" 
              placeholder="請輸入 SPU 編碼，留空將自動生成"
              maxlength="50"
              style="width: 300px"
            />
          </el-form-item>
          
          <el-form-item label="產品價格" prop="price">
            <el-input-number
              v-model="formData.price"
              :min="0"
              :precision="0"
              placeholder="請輸入產品價格"
              class="w-full"
              style="width: 300px"
            >
              <template #suffix>
                <span class="price-suffix">USD</span>
              </template>
            </el-input-number>
          </el-form-item>
          
          
          <!-- 產品類別 -->
          <el-form-item label="產品類別" prop="categoryId">
            <CategoryCascader 
              v-model="formData.categoryId"
              :reload-trigger="reloadTrigger"
              placeholder="選擇產品類別（可選）"
              :clearable="true"
              :filterable="true"
              style="width: 300px"
              @change="handleCategoryChange"
            />
          </el-form-item>
          
          <el-form-item label="產品品牌" prop="brandId">
            <BrandCascader 
              v-model="formData.brandId"
              placeholder="選擇產品品牌（可選）"
              :clearable="true"
              :filterable="true"
              style="width: 300px"
            />
          
          </el-form-item>

          <el-form-item label="產品狀態" prop="status">
            <el-select
              v-model="formData.status"
              placeholder="請選擇產品狀態"
              style="width: 300px"
            >
              <el-option label="草稿" value="draft" />
              <el-option label="上架" value="active" />
              <el-option label="下架" value="inactive" />
              <el-option label="審核中" value="pending" />
            </el-select>
          </el-form-item>

          <el-form-item label="產品標籤" prop="tags">
            <TagsSelector v-model="formData.tags" />
          </el-form-item>
        </div>
        
        <!-- 詳情描述 -->
        <div class="form-section">
          <h3 class="section-title">產品描述</h3>
          <el-form-item label="產品描述" prop="description">
            <RichTextEdit 
              v-model="formData.description"
              placeholder="請輸入產品描述"
              :height="300"
            />
          </el-form-item>
        </div>
        
        <!-- 圖片上傳 -->
        <div class="form-section">
          <h3 class="section-title">產品圖片</h3>
          
          <el-form-item label="主圖" prop="mainImageUrl">
            <AssetUpload 
              v-model="formData.mainImageUrl"
              :limit="1"
              accept="image/*"
            />
          </el-form-item>
          
          <el-form-item label="詳情圖" prop="detailImages">
            <div class="detail-images-upload">
              <draggable
                v-if="formData.detailImages && formData.detailImages.length > 0"
                v-model="formData.detailImages"
                item-key="index"
                class="image-list"
                handle=".drag-handle"
                ghost-class="sortable-ghost"
                chosen-class="sortable-chosen"
                drag-class="sortable-drag"
                animation="200">
                <template #item="{ element: url, index }">
                  <div class="image-item">
                    <AssetUpload 
                      :model-value="url"
                      @update:model-value="(newUrl) => updateDetailImage(index, newUrl)"
                      :limit="1"
                      accept="image/*"
                    />
                    <div class="image-actions">
                      <el-icon class="drag-handle" :size="16"><Rank /></el-icon>
                      <el-icon :size="16" @click="removeDetailImage(index)"><Delete /></el-icon>
                    </div>
                  </div>
                </template>
              </draggable>
              <el-button 
                type="primary" 
                @click="addDetailImage"
                class="add-btn"
              >
                新增圖片
              </el-button>
            </div>
          </el-form-item>
        </div>
        
        <!-- 產品規格 -->
        <div class="form-section">
          <h3 class="section-title">產品規格</h3>
          <div class="specifications-list">
            <SpecificationInput
              v-for="spec in formData.specifications"
              :key="spec.keyId"
              :specification="spec"
              :mode="mode"
              @update="handleSpecificationItemUpdate"
            />
          </div>
        </div>
        
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button 
            type="primary" 
            :loading="submitting"
            @click="handleSubmit">
            {{ mode === 'create' ? '建立' : '更新' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { Product, Specification } from '@/model'
import draggable from 'vuedraggable'
import { CategoryCascader } from '@/components/CategoryCascader'
import { BrandCascader } from '@/components/BrandCascader'
import { SpecificationInput } from '@/components/SpecificationInput'
import { AssetUpload } from '@/components/AssetUpload'
import { TagsSelector } from '@/components/TagsSelector'
import { RichTextEdit } from '@/components/RichTextEdit'
import { createProduct, updateProduct } from '@/services/Product'
import { getAttributeKeys } from '@/services/AttributeKey'
import type { AttributeKey } from '@/model/AttributeKey'

const props = defineProps<{
  visible: boolean
  mode: 'create' | 'edit'
  product?: Product | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'success'): void
}>()

// 計算屬性用於 v-model
const visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

// 響應式狀態
const formRef = ref<FormInstance>()
const submitting = ref(false)
const reloadTrigger = ref(0)

// 表單數據
const formData = ref({
  name: '',
  spuCode: '',
  description: '',
  mainImageUrl: '',
  detailImages: [] as string[],
  videoUrl: '',
  categoryId: undefined as number | undefined,
  brandId: undefined as number | undefined,
  status: 'draft' as 'active' | 'inactive' | 'draft' | 'pending',
  price: 0,
  tags: [] as string[],
  specifications: [] as Specification[]
})

// 類別屬性
const categoryAttributes = ref<AttributeKey[]>([])

// 計算屬性
const dialogTitle = computed(() => {
  return props.mode === 'create' ? '新增產品' : '編輯產品'
})

// 表單驗證規則
const rules = computed<FormRules>(() => {
  const baseRules: FormRules = {
    name: [
      { required: true, message: '請輸入產品名稱', trigger: 'blur' },
      { min: 2, max: 200, message: '產品名稱長度應在 2-200 個字符之間', trigger: 'blur' }
    ],
    spuCode: [
      { max: 50, message: 'SPU 編碼長度不能超過 50 個字符', trigger: 'blur' }
    ],
    price: [
      { required: true, message: '請輸入產品價格', trigger: 'blur' },
      { type: 'number', min: 0, message: '產品價格必須大於等於 0', trigger: 'blur' }
    ]
    // 移除 categoryId 的必需驗證，使其變成選擇性
  };
  
  return baseRules;
})

// 監聽 visible 變化
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    if (props.mode === 'edit' && props.product) {
      loadProductData()
    } else {
      resetForm()
    }
  }
})

// 監聽 product 變化
watch(() => props.product, (newProduct) => {
  if (newProduct && props.mode === 'edit') {
    loadProductData()
  }
})

// 監聽 categoryId 變化，添加組件銷毀檢查
const stopWatch = watch(() => formData.value.categoryId, async (newCategoryId) => {
  // 檢查組件是否還在掛載狀態
  if (!props.visible) return
  
  if (newCategoryId) {
    await loadCategoryAttributes(newCategoryId)
    initializeSpecifications()
  } else {
    categoryAttributes.value = []
    resetSpecifications()
  }
})

// 組件卸載時清理 watch
onUnmounted(() => {
  stopWatch()
})

// 加載類別屬性
const loadCategoryAttributes = async (categoryId: number) => {
  try {
    const response = await getAttributeKeys({
      categoryId,
      status: 'active',
      forSales: false
    })
    categoryAttributes.value = response.list
  } catch (error) {
    console.error('Load category attributes error:', error)
  }
}

// 初始化規格
const initializeSpecifications = () => {
  if (props.mode === 'create') {
    // 創建模式：根據類別屬性建立空規格
    const newSpecs = categoryAttributes.value.map(attr => {
      // 檢查是否已經存在相同 keyId 的規格
      const existingSpec = formData.value.specifications.find(spec => spec.keyId === attr.id)
      
      return {
        keyId: attr.id,
        valueId: existingSpec?.valueId || null,
        name: attr.name,
        value: existingSpec?.value || null,
        unit: attr.unit,
        inputType: attr.inputType
      }
    })
    formData.value.specifications = newSpecs
  } else if (props.mode === 'edit') {
    // 編輯模式：合併類別屬性和現有規格值
    const mergedSpecs = categoryAttributes.value.map(attr => {
      // 查找現有規格值
      const existingSpec = formData.value.specifications.find(spec => spec.keyId === attr.id)
      
      return {
        keyId: attr.id,
        valueId: existingSpec?.valueId || null,
        name: attr.name,
        value: existingSpec?.value || null,
        unit: attr.unit,
        inputType: attr.inputType
      }
    })
    formData.value.specifications = mergedSpecs
  }
}

// 重置規格
const resetSpecifications = () => {
  formData.value.specifications = []
}

// 處理規格更新
const handleSpecificationItemUpdate = (updatedSpec: Specification) => {
  const index = formData.value.specifications.findIndex(
    spec => spec.keyId === updatedSpec.keyId
  )
  if (index !== -1) {
    formData.value.specifications[index] = updatedSpec
  }
}

// 加載產品數據
const loadProductData = async () => {
  if (!props.product) return
  
  // 先加載類別屬性
  if (props.product.categoryId) {
    await loadCategoryAttributes(props.product.categoryId)
  }
  
  formData.value = {
    name: props.product.name || '',
    spuCode: props.product.spuCode || '',
    description: props.product.description || '',
    mainImageUrl: props.product.mainImageUrl || '',
    detailImages: props.product.detailImages || [],
    videoUrl: props.product.videoUrl || '',
    categoryId: props.product.categoryId || undefined,
    brandId: props.product.brandId || undefined,
    status: props.product.status || 'draft',
    price: props.product.price || 0,
    tags: props.product.tags || [],
    specifications: props.product.specs || []
  }
}

// 重置表單
const resetForm = () => {
  formData.value = {
    name: '',
    spuCode: '',
    description: '',
    mainImageUrl: '',
    detailImages: [],
    videoUrl: '',
    categoryId: undefined,
    brandId: undefined,
    status: 'draft',
    price: 0,
    tags: [],
    specifications: []
  }
  // 重置表單驗證
  formRef.value?.clearValidate()
  reloadTrigger.value++
}

// 處理類別變化
const handleCategoryChange = (categoryId: number | undefined) => {
  if (categoryId) {
    // 類別變化時，規格會自動重新加載
    reloadTrigger.value++
  }
}

// 處理詳情圖片
const addDetailImage = () => {
  formData.value.detailImages.push('')
}

const updateDetailImage = (index: number, newUrl: string) => {
  formData.value.detailImages[index] = newUrl
}

const removeDetailImage = (index: number) => {
  formData.value.detailImages.splice(index, 1)
}

// 處理關閉
const handleClose = () => {
  emit('update:visible', false)
  resetForm()
}

// 處理提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    submitting.value = true
    
    const submitData = { ...formData.value }
    
    // 只有在選擇了類別時才需要驗證規格
    if (submitData.categoryId) {
      if (!submitData.specifications || submitData.specifications.length === 0) {
        ElMessage.warning('請至少填寫一個產品規格')
        return
      }
    }
    
    if (props.mode === 'create') {
      await createProduct(submitData)
      ElMessage.success('產品建立成功')
    } else {
      // 編輯模式
      await updateProduct({ ...submitData, id: props.product!.id })
      ElMessage.success('產品更新成功')
    }
    
    emit('success')
    handleClose()
  } catch (error) {
    console.error('Submit error:', error)
    ElMessage.error(props.mode === 'create' ? '產品建立失敗' : '產品更新失敗')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.form-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  
  &:last-child {
    border-bottom: none;
  }
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.w-full {
  width: 100%;
}

.price-suffix {
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.detail-images-upload {
  .image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 10px;
  }
  
  .image-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
    background-color: var(--el-bg-color-page);
    min-width: 150px;
    flex-shrink: 0;
    
    .image-actions {
      display: flex;
      gap: 8px;
      justify-content: center;
      
      .drag-handle {
        cursor: move;
        color: var(--el-color-info);
        
        &:hover {
          color: var(--el-color-primary);
        }
      }
      
      .el-icon {
        cursor: pointer;
        color: var(--el-color-danger);
        
        &:hover {
          color: var(--el-color-danger-light-3);
        }
      }
    }
  }
  
  .add-btn {
    margin-top: 10px;
  }
}

.specifications-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
  background-color: var(--el-bg-color-page);
  border-radius: 6px;
}

.specifications-list .specification-item {
  flex: 0 0 calc(50% - 10px);  /* 一行兩個，考慮 gap */
}

.dialog-footer {
  text-align: right;
}
</style>
