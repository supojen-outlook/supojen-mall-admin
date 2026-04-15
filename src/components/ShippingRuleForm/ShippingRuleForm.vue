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
      <el-form-item label="規則名稱" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="請輸入運費規則名稱"
          :disabled="disabled"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="2"
          placeholder="請輸入規則描述"
          :disabled="disabled"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="條件類型" prop="conditionType">
        <el-select
          v-model="conditionType"
          placeholder="選擇條件類型"
          :disabled="disabled"
          style="width: 100%"
          @change="handleConditionTypeChange"
          clearable
        >
          <el-option label="無條件" value="" />
          <el-option label="按數量" value="quantity" />
          <el-option label="按金額" value="amount" />
        </el-select>
      </el-form-item>

      <!-- 按數量條件 -->
      <template v-if="conditionType === 'quantity'">
        <el-form-item label="最小數量" prop="minAmount">
          <el-input-number
            v-model="formData.minAmount"
            :min="0"
            :precision="0"
            placeholder="可不填"
            :disabled="disabled"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="最大數量" prop="maxAmount">
          <el-input-number
            v-model="formData.maxAmount"
            :min="0"
            :precision="0"
            placeholder="可不填"
            :disabled="disabled"
            style="width: 100%"
          />
        </el-form-item>
      </template>

      <!-- 按金額條件 -->
      <template v-if="conditionType === 'amount'">
        <el-form-item label="最小金額" prop="minAmount">
          <el-input-number
            v-model="formData.minAmount"
            :min="0"
            :precision="2"
            placeholder="可不填"
            :disabled="disabled"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="最大金額" prop="maxAmount">
          <el-input-number
            v-model="formData.maxAmount"
            :min="0"
            :precision="2"
            placeholder="可不填"
            :disabled="disabled"
            style="width: 100%"
          />
        </el-form-item>
      </template>

      <el-form-item label="運費金額" prop="shippingFee">
        <el-input-number
          v-model="formData.shippingFee"
          :min="0"
          :precision="2"
          placeholder="請輸入運費金額"
          :disabled="disabled"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="是否啟用" prop="isActive">
        <el-switch
          v-model="formData.isActive"
          :disabled="disabled"
          active-text="啟用"
          inactive-text="停用"
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
import { createShippingRule, updateShippingRule } from '@/services/ShippingRule'
import type { ShippingRule, ShippingRuleCondition } from '@/model'

interface Props {
  modelValue: boolean
  mode: 'create' | 'edit'
  initialData?: ShippingRule | null
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
  return props.mode === 'create' ? '新增運費規則' : '編輯運費規則'
})

const formRef = ref<FormInstance>()
const loading = ref(false)
const conditionType = ref<string>('') // '', 'quantity', 'amount'

const formData = ref({
  name: '',
  description: '',
  minAmount: undefined as number | undefined,
  maxAmount: undefined as number | undefined,
  shippingFee: 0,
  isActive: true
})

const formRules: FormRules = {
  name: [
    { required: true, message: '請輸入規則名稱', trigger: 'blur' },
    { max: 100, message: '最長 100 個字符', trigger: 'blur' }
  ],
  shippingFee: [
    { required: true, message: '請輸入運費金額', trigger: 'change' },
    {
      validator: (_rule, value, callback) => {
        if (value < 0) {
          callback(new Error('運費金額不能為負數'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 處理條件類型變更
const handleConditionTypeChange = () => {
  // 清空之前的條件值
  formData.value.minAmount = undefined
  formData.value.maxAmount = undefined
}

// 從初始數據解析條件類型和值
const parseConditionFromData = (rule: ShippingRule | null) => {
  if (!rule || !rule.condition) {
    conditionType.value = ''
    return
  }
  
  const condition = rule.condition
  conditionType.value = condition.ruleType
  
  if (condition.ruleType === 'quantity' || condition.ruleType === 'amount') {
    formData.value.minAmount = (condition as any).minAmount ?? undefined
    formData.value.maxAmount = (condition as any).maxAmount ?? undefined
  }
}

// 構建條件對象
const buildCondition = (): ShippingRuleCondition | null => {
  if (!conditionType.value) {
    return null
  }
  
  if (conditionType.value === 'quantity') {
    return {
      ruleType: 'quantity',
      minAmount: formData.value.minAmount ?? null,
      maxAmount: formData.value.maxAmount ?? null
    } as ShippingRuleCondition
  }
  
  if (conditionType.value === 'amount') {
    return {
      ruleType: 'amount',
      minAmount: formData.value.minAmount ?? null,
      maxAmount: formData.value.maxAmount ?? null
    } as ShippingRuleCondition
  }
  
  return null
}

// Initialize form data
const initFormData = () => {
  if (props.initialData) {
    formData.value = {
      name: props.initialData.name || '',
      description: props.initialData.description || '',
      minAmount: undefined,
      maxAmount: undefined,
      shippingFee: props.initialData.shippingFee || 0,
      isActive: props.initialData.isActive ?? true
    }
    parseConditionFromData(props.initialData)
  } else {
    formData.value = {
      name: '',
      description: '',
      minAmount: undefined,
      maxAmount: undefined,
      shippingFee: 0,
      isActive: true
    }
    conditionType.value = ''
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
    
    const condition = buildCondition()
    
    const submitData = {
      name: formData.value.name,
      description: formData.value.description || null,
      condition: condition,
      shippingFee: formData.value.shippingFee,
      isActive: formData.value.isActive
    }
    
    if (props.mode === 'create') {
      await createShippingRule(submitData)
    } else if (props.initialData) {
      await updateShippingRule({
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
</style>
