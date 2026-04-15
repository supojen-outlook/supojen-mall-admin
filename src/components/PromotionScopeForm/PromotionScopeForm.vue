<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="500px"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="作用域類型" prop="scopeType">
        <el-select
          v-model="formData.scopeType"
          placeholder="選擇作用域類型"
          :disabled="disabled"
          style="width: 100%"
          @change="handleScopeTypeChange"
        >
          <el-option label="指定商品" value="product" />
          <el-option label="指定分類" value="category" />
          <el-option label="指定品牌" value="brand" />
          <el-option label="全館" value="all" />
        </el-select>
      </el-form-item>

      <el-form-item v-if="showProductSelector" label="選擇商品" prop="scopeId">
        <ProductSelector
          v-model="formData.scopeId"
          :disabled="disabled"
        />
      </el-form-item>

      <el-form-item v-if="showCategoryCascader" label="選擇分類" prop="scopeId">
        <CategoryCascader
          :model-value="formData.scopeId ?? undefined"
          @update:model-value="formData.scopeId = $event ?? null"
          :disabled="disabled"
          placeholder="請選擇商品分類"
        />
      </el-form-item>

      <el-form-item v-if="showBrandCascader" label="選擇品牌" prop="scopeId">
        <BrandCascader
          :model-value="formData.scopeId ?? undefined"
          @update:model-value="formData.scopeId = $event ?? null"
          :disabled="disabled"
          placeholder="請選擇品牌"
          :clearable="true"
        />
      </el-form-item>

      <el-form-item label="類型" prop="isExclude">
        <el-radio-group v-model="formData.isExclude" :disabled="disabled">
          <el-radio :label="false">包含</el-radio>
          <el-radio :label="true">排除</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :loading="loading"
        @click="handleSubmit"
      >
        {{ mode === 'create' ? '新增' : '更新' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { createPromotionScope } from '@/services/PromotionScope'
import type { PromotionScope } from '@/model'
import { ProductSelector } from '@/components/ProductSelector'
import { CategoryCascader } from '@/components/CategoryCascader'
import { BrandCascader } from '@/components/BrandCascader'

interface Props {
  modelValue: boolean
  mode: 'create' | 'edit'
  initialData?: PromotionScope | null
  disabled?: boolean
  promotionId: number
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const dialogTitle = computed(() => {
  return props.mode === 'create' ? '新增促銷作用域' : '編輯促銷作用域'
})

const formRef = ref<FormInstance>()
const loading = ref(false)

const formData = ref({
  scopeType: 'product' as 'product' | 'category' | 'brand' | 'all',
  scopeId: null as number | null,
  isExclude: false
})

const showProductSelector = computed(() => formData.value.scopeType === 'product')
const showCategoryCascader = computed(() => formData.value.scopeType === 'category')
const showBrandCascader = computed(() => formData.value.scopeType === 'brand')

const scopeIdValidator = (_rule: any, value: any, callback: any) => {
  if (formData.value.scopeType === 'all') {
    callback()
    return
  }
  if (!value || value === null) {
    callback(new Error('請選擇對象'))
    return
  }
  callback()
}

const formRules: FormRules = {
  scopeType: [
    { required: true, message: '請選擇作用域類型', trigger: 'change' }
  ],
  scopeId: [
    { validator: scopeIdValidator, trigger: 'change' }
  ]
}

const handleScopeTypeChange = () => {
  formData.value.scopeId = null
  if (formRef.value) {
    formRef.value.clearValidate('scopeId')
  }
}

// Initialize form data
const initFormData = () => {
  if (props.initialData) {
    formData.value = {
      scopeType: props.initialData.scopeType || 'product',
      scopeId: props.initialData.scopeId || null,
      isExclude: props.initialData.isExclude || false
    }
  } else {
    formData.value = {
      scopeType: 'product',
      scopeId: null,
      isExclude: false
    }
  }
  // 重置校验状态
  nextTick(() => {
    if (formRef.value) {
      formRef.value.clearValidate()
    }
  })
}

// Watch initialData changes
watch(() => props.initialData, () => {
  initFormData()
}, { immediate: true })

// Handle submit
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const submitData = {
      promotionId: props.promotionId,
      scopeType: formData.value.scopeType,
      scopeId: formData.value.scopeType === 'all' ? 0 : formData.value.scopeId!,
      isExclude: formData.value.isExclude
    }
    
    if (props.mode === 'create') {
      await createPromotionScope(submitData)
    } else {
      // Edit mode - would need updatePromotionScope API
      console.warn('Edit mode not implemented - updatePromotionScope API needed')
    }
    
    emit('success')
    handleClose()
  } catch (error) {
    console.error('提交失敗:', error)
  } finally {
    loading.value = false
  }
}

// Handle close
const handleClose = () => {
  visible.value = false
  nextTick(() => {
    initFormData()
    if (formRef.value) {
      formRef.value.clearValidate()
    }
  })
}
</script>

<style scoped>
.el-form {
  padding: 20px;
}
</style>
