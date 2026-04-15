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
      <el-form-item label="促銷名稱" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="請輸入促銷名稱"
          :disabled="disabled"
        />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="請輸入促銷描述"
          :disabled="disabled"
        />
      </el-form-item>

      <el-form-item label="開始時間" prop="startDate">
        <el-date-picker
          v-model="formData.startDate"
          type="date"
          placeholder="選擇開始日期"
          value-format="YYYY-MM-DD"
          :disabled="disabled"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="結束時間" prop="endDate">
        <el-date-picker
          v-model="formData.endDate"
          type="date"
          placeholder="選擇結束日期"
          value-format="YYYY-MM-DD"
          :disabled="disabled"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="通路" prop="channel">
        <el-select
          v-model="formData.channel"
          placeholder="選擇通路"
          :disabled="disabled"
          style="width: 100%"
        >
          <el-option label="App" value="app" />
          <el-option label="Web" value="web" />
          <el-option label="全部通路" value="all" />
        </el-select>
      </el-form-item>

      <el-form-item label="適用會員" prop="userScope">
        <el-select
          v-model="formData.userScope"
          placeholder="選擇適用會員"
          :disabled="disabled"
          style="width: 100%"
        >
          <el-option label="全部會員" value="all" />
          <el-option label="青銅" value="bronze" />
          <el-option label="白銀" value="silver" />
          <el-option label="黃金" value="gold" />
          <el-option label="尊榮" value="vip" />
        </el-select>
      </el-form-item>

      <el-form-item label="每人限制" prop="limitPerUser">
        <el-input-number
          v-model="formData.limitPerUser"
          :min="0"
          placeholder="無限制"
          :disabled="disabled"
          style="width: 100%"
        />
        <div class="el-form-item__tip">
          留空或 0 表示無限制
        </div>
      </el-form-item>

      <el-form-item label="總限制" prop="limitTotal">
        <el-input-number
          v-model="formData.limitTotal"
          :min="0"
          placeholder="無限制"
          :disabled="disabled"
          style="width: 100%"
        />
        <div class="el-form-item__tip">
          留空或 0 表示無限制
        </div>
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
import { createPromotion, updatePromotion } from '@/services/Promotion'
import type { Promotion } from '@/model'

interface Props {
  modelValue: boolean
  mode: 'create' | 'edit'
  initialData?: Promotion | null
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
  return props.mode === 'create' ? '新增促銷' : '編輯促銷'
})

const formRef = ref<FormInstance>()
const loading = ref(false)

const formData = ref({
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  channel: 'all' as 'app' | 'web' | 'all',
  userScope: 'all' as 'all' | 'bronze' | 'silver' | 'gold' | 'vip',
  limitPerUser: null as number | null,
  limitTotal: null as number | null
})

const formRules: FormRules = {
  name: [
    { required: true, message: '請輸入促銷名稱', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '請選擇開始時間', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '請選擇結束時間', trigger: 'change' }
  ],
  channel: [
    { required: true, message: '請選擇通路', trigger: 'change' }
  ],
  userScope: [
    { required: true, message: '請選擇適用會員', trigger: 'change' }
  ]
}

// Initialize form data
const initFormData = () => {
  if (props.initialData) {
    formData.value = {
      name: props.initialData.name || '',
      description: props.initialData.description || '',
      startDate: props.initialData.startDate ? props.initialData.startDate.split('T')[0] : '',
      endDate: props.initialData.endDate ? props.initialData.endDate.split('T')[0] : '',
      channel: props.initialData.channel || 'all',
      userScope: props.initialData.userScope || 'all',
      limitPerUser: props.initialData.limitPerUser || null,
      limitTotal: props.initialData.limitTotal || null
    }
  } else {
    formData.value = {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      channel: 'all',
      userScope: 'all',
      limitPerUser: null,
      limitTotal: null
    }
  }
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
    
    // 將日期格式轉換為 UTC ISO 8601 格式，兼容 PostgreSQL timestamp with time zone
    const formatToUTC = (dateStr: string) => {
      return dateStr + 'T00:00:00Z'
    }
    
    const submitData = {
      ...formData.value,
      startDate: formatToUTC(formData.value.startDate),
      endDate: formatToUTC(formData.value.endDate)
    }
    
    if (props.mode === 'create') {
      await createPromotion(submitData)
    } else if (props.initialData) {
      await updatePromotion({
        id: props.initialData.id,
        ...submitData
      })
    }
    
    emit('success')
    handleClose()
  } catch (error) {
    console.error('Submit failed:', error)
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
