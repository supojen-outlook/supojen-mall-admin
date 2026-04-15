<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="550px"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="優惠券代碼" prop="couponCode">
        <el-input
          v-model="formData.couponCode"
          placeholder="請輸入優惠券代碼"
          :disabled="disabled"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="名稱" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="請輸入優惠券名稱"
          :disabled="disabled"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="請輸入優惠券描述"
          :disabled="disabled"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="折扣率" prop="discountRate">
        <el-input-number
          v-model="formData.discountRate"
          :min="0"
          :max="100"
          :precision="2"
          :step="1"
          placeholder="輸入折扣率"
          :disabled="disabled"
          style="width: 180px"
        />
        <span class="form-tip">% 折扣，如 15 表示 85折</span>
      </el-form-item>

      <el-form-item label="適用範圍" prop="scopeType">
        <el-select
          v-model="formData.scopeType"
          placeholder="選擇適用範圍"
          :disabled="disabled"
          style="width: 100%"
          @change="handleScopeTypeChange"
        >
          <el-option label="全部商品" value="all" />
          <el-option label="指定商品" value="product" />
          <el-option label="指定分類" value="category" />
          <el-option label="指定品牌" value="brand" />
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

      <el-form-item label="指定用戶" prop="userId">
        <UserSelector
          v-model="formData.userId"
          :disabled="disabled"
        />
        <span class="form-tip">留空表示不指定特定用戶，所有用戶皆可使用</span>
      </el-form-item>

      <el-form-item label="有效期限" prop="validPeriod">
        <el-date-picker
          v-model="validPeriod"
          type="daterange"
          range-separator="至"
          start-placeholder="開始日期"
          end-placeholder="結束日期"
          value-format="YYYY-MM-DD"
          :disabled="disabled"
          style="width: 100%"
        />
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
import { createCoupon, updateCoupon } from '@/services/Coupon'
import type { Coupon } from '@/model'
import { ProductSelector } from '@/components/ProductSelector'
import { CategoryCascader } from '@/components/CategoryCascader'
import { BrandCascader } from '@/components/BrandCascader'
import { UserSelector } from '@/components/UserSelector'

interface Props {
  modelValue: boolean
  mode: 'create' | 'edit'
  initialData?: Coupon | null
  disabled?: boolean
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
  return props.mode === 'create' ? '新增優惠券' : '編輯優惠券'
})

const formRef = ref<FormInstance>()
const loading = ref(false)
const validPeriod = ref<[string, string] | null>(null)

const formData = ref({
  couponCode: '',
  name: '',
  description: '',
  discountRate: 0,
  scopeType: 'all' as 'all' | 'product' | 'category' | 'brand',
  scopeId: null as number | null,
  userId: null as number | null,
  validFrom: '',
  validUntil: '' as string | null
})

const showProductSelector = computed(() => formData.value.scopeType === 'product')
const showCategoryCascader = computed(() => formData.value.scopeType === 'category')
const showBrandCascader = computed(() => formData.value.scopeType === 'brand')

const scopeIdValidator = (_rule: any, _value: any, callback: any) => {
  if (formData.value.scopeType === 'all') {
    callback()
    return
  }
  if (!formData.value.scopeId || formData.value.scopeId === null) {
    callback(new Error('請選擇對象'))
    return
  }
  callback()
}

const validPeriodValidator = (_rule: any, _value: any, callback: any) => {
  if (!validPeriod.value || !validPeriod.value[0]) {
    callback(new Error('請選擇有效期限'))
    return
  }
  callback()
}

const formRules: FormRules = {
  couponCode: [
    { required: true, message: '請輸入優惠券代碼', trigger: 'blur' },
    { min: 3, max: 50, message: '長度在 3 到 50 個字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '請輸入優惠券名稱', trigger: 'blur' },
    { max: 100, message: '最長 100 個字符', trigger: 'blur' }
  ],
  discountRate: [
    { required: true, message: '請輸入折扣率', trigger: 'change' },
    { 
      validator: (_rule, value, callback) => {
        if (value < 0 || value > 100) {
          callback(new Error('折扣率必須在 0-100 之間'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  scopeType: [
    { required: true, message: '請選擇適用範圍', trigger: 'change' }
  ],
  scopeId: [
    { validator: scopeIdValidator, trigger: 'change' }
  ],
  validPeriod: [
    { validator: validPeriodValidator, trigger: 'change' }
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
      couponCode: props.initialData.couponCode || '',
      name: props.initialData.name || '',
      description: props.initialData.description || '',
      discountRate: props.initialData.discountRate || 0,
      scopeType: props.initialData.scopeType || 'all',
      scopeId: props.initialData.scopeId || null,
      userId: props.initialData.userId || null,
      validFrom: props.initialData.validFrom || '',
      validUntil: props.initialData.validUntil || null
    }
    // 設置日期範圍（從 ISO 格式中提取日期部分 YYYY-MM-DD）
    if (props.initialData.validFrom) {
      const extractDate = (isoStr: string) => isoStr.split('T')[0]
      validPeriod.value = [
        extractDate(props.initialData.validFrom),
        props.initialData.validUntil ? extractDate(props.initialData.validUntil) : ''
      ]
    }
  } else {
    formData.value = {
      couponCode: '',
      name: '',
      description: '',
      discountRate: 0,
      scopeType: 'all',
      scopeId: null,
      userId: null,
      validFrom: '',
      validUntil: null
    }
    validPeriod.value = null
  }
  // 重置校验状态
  nextTick(() => {
    if (formRef.value) {
      formRef.value.clearValidate()
    }
  })
}

// Watch validPeriod and sync to formData
watch(validPeriod, (newVal) => {
  if (newVal && newVal[0]) {
    formData.value.validFrom = newVal[0]
    formData.value.validUntil = newVal[1] || null
  } else {
    formData.value.validFrom = ''
    formData.value.validUntil = null
  }
})

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
    
    // 将日期格式转换为 UTC ISO 8601 格式，兼容 PostgreSQL timestamp with time zone
    const formatToUTC = (dateStr: string) => {
      return dateStr + 'T00:00:00Z'
    }

    const submitData = {
      couponCode: formData.value.couponCode,
      name: formData.value.name,
      description: formData.value.description || undefined,
      discountRate: formData.value.discountRate,
      scopeType: formData.value.scopeType,
      scopeId: formData.value.scopeType === 'all' ? null : formData.value.scopeId,
      userId: formData.value.userId || null,
      validFrom: formatToUTC(formData.value.validFrom),
      validUntil: formData.value.validUntil ? formatToUTC(formData.value.validUntil) : null
    }
    
    if (props.mode === 'create') {
      await createCoupon(submitData)
    } else if (props.initialData) {
      await updateCoupon({
        id: props.initialData.id,
        ...submitData
      })
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

.form-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}
</style>
