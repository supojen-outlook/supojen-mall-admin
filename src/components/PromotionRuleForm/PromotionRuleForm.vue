<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="600px"
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
      <el-form-item label="規則名稱" prop="tabName">
        <el-input
          v-model="formData.tabName"
          placeholder="請輸入規則名稱"
          :disabled="disabled"
        />
      </el-form-item>

      <el-form-item label="規則類型" prop="ruleType">
        <el-select
          v-model="formData.ruleType"
          placeholder="選擇規則類型"
          :disabled="disabled"
          style="width: 100%"
          @change="handleRuleTypeChange"
        >
          <el-option label="滿額減" value="full_reduction" />
          <el-option label="折扣" value="discount" />
          <el-option label="贈品" value="gift" />
          <el-option label="免運" value="free_shipping" />
        </el-select>
      </el-form-item>

      <!-- 滿額減專用欄位 -->
      <template v-if="formData.ruleType === 'full_reduction'">
        <el-form-item label="滿額門檻" prop="thresholdAmount">
          <el-input-number
            v-model="formData.thresholdAmount"
            :min="0"
            :precision="0"
            placeholder="請輸入滿額門檻"
            :disabled="disabled"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="折抵金額" prop="discountAmount">
          <el-input-number
            v-model="formData.discountAmount"
            :min="0"
            :precision="0"
            placeholder="請輸入折抵金額"
            :disabled="disabled"
            style="width: 100%"
          />
        </el-form-item>
      </template>

      <!-- 折扣專用欄位 -->
      <template v-if="formData.ruleType === 'discount'">
        <el-form-item label="滿額門檻" prop="thresholdAmount">
          <el-input-number
            v-model="formData.thresholdAmount"
            :min="0"
            :precision="0"
            placeholder="請輸入滿額門檻"
            :disabled="disabled"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="折扣率" prop="discountRate">
          <el-input-number
            v-model="formData.discountRate"
            :min="0"
            :max="100"
            :precision="2"
            placeholder="請輸入折扣率 (%)"
            :disabled="disabled"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="最高折抵" prop="maxDiscountAmount">
          <el-input-number
            v-model="formData.maxDiscountAmount"
            :min="0"
            :precision="0"
            placeholder="請輸入最高折抵金額"
            :disabled="disabled"
            style="width: 100%"
          />
          <div class="el-form-item__tip">
            留空表示無上限
          </div>
        </el-form-item>
      </template>

      <!-- 贈品專用欄位 -->
      <template v-if="formData.ruleType === 'gift'">
        <el-form-item label="滿額門檻" prop="thresholdAmount">
          <el-input-number
            v-model="formData.thresholdAmount"
            :min="0"
            :precision="0"
            placeholder="請輸入滿額門檻"
            :disabled="disabled"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="滿件門檻" prop="thresholdQuantity">
          <el-input-number
            v-model="formData.thresholdQuantity"
            :min="0"
            placeholder="請輸入滿件門檻"
            :disabled="disabled"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="贈品商品 ID" prop="giftItemId">
          <el-input-number
            v-model="formData.giftItemId"
            :min="1"
            placeholder="請輸入贈品商品 ID"
            :disabled="disabled"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="贈品數量" prop="giftQuantity">
          <el-input-number
            v-model="formData.giftQuantity"
            :min="1"
            placeholder="請輸入贈品數量"
            :disabled="disabled"
            style="width: 100%"
          />
        </el-form-item>
      </template>

      <!-- 免運專用欄位 -->
      <template v-if="formData.ruleType === 'free_shipping'">
        <el-form-item label="滿額門檻" prop="thresholdAmount">
          <el-input-number
            v-model="formData.thresholdAmount"
            :min="0"
            :precision="0"
            placeholder="請輸入滿額門檻"
            :disabled="disabled"
            style="width: 100%"
          />
        </el-form-item>
      </template>
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
import { createPromotionRule, updatePromotionRule } from '@/services/PromotionRule'
import type { PromotionRule } from '@/model'

interface Props {
  modelValue: boolean
  mode: 'create' | 'edit'
  initialData?: PromotionRule | null
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
  return props.mode === 'create' ? '新增促銷規則' : '編輯促銷規則'
})

const formRef = ref<FormInstance>()
const loading = ref(false)

const formData = ref({
  tabName: '',
  ruleType: 'full_reduction' as 'full_reduction' | 'discount' | 'gift' | 'free_shipping',
  thresholdAmount: null as number | null,
  thresholdQuantity: null as number | null,
  discountAmount: null as number | null,
  discountRate: null as number | null,
  maxDiscountAmount: null as number | null,
  giftItemId: null as number | null,
  giftQuantity: 1
})

const formRules: FormRules = {
  tabName: [
    { required: true, message: '請輸入規則名稱', trigger: 'blur' }
  ],
  ruleType: [
    { required: true, message: '請選擇規則類型', trigger: 'change' }
  ]
}

// Initialize form data
const initFormData = () => {
  if (props.initialData) {
    formData.value = {
      tabName: props.initialData.tabName || '',
      ruleType: props.initialData.ruleType || 'full_reduction',
      thresholdAmount: props.initialData.thresholdAmount || null,
      thresholdQuantity: props.initialData.thresholdQuantity || null,
      discountAmount: props.initialData.discountAmount || null,
      discountRate: props.initialData.discountRate || null,
      maxDiscountAmount: props.initialData.maxDiscountAmount || null,
      giftItemId: props.initialData.giftItemId || null,
      giftQuantity: props.initialData.giftQuantity || 1
    }
  } else {
    formData.value = {
      tabName: '',
      ruleType: 'full_reduction',
      thresholdAmount: null,
      thresholdQuantity: null,
      discountAmount: null,
      discountRate: null,
      maxDiscountAmount: null,
      giftItemId: null,
      giftQuantity: 1
    }
  }
}

// Watch initialData changes
watch(() => props.initialData, () => {
  initFormData()
}, { immediate: true })

// Handle rule type change
const handleRuleTypeChange = () => {
  // Reset type-specific fields when rule type changes
  formData.value.thresholdAmount = null
  formData.value.thresholdQuantity = null
  formData.value.discountAmount = null
  formData.value.discountRate = null
  formData.value.maxDiscountAmount = null
  formData.value.giftItemId = null
  formData.value.giftQuantity = 1
}

// Handle submit
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const submitData = {
      promotionId: props.promotionId,
      ...formData.value
    }
    
    if (props.mode === 'create') {
      await createPromotionRule(submitData)
    } else if (props.initialData) {
      await updatePromotionRule({
        ruleId: props.initialData.id,
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

.el-form-item__tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}
</style>
