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
      <el-form-item label="顯示名稱" prop="displayName">
        <el-input
          v-model="formData.displayName"
          placeholder="請輸入顯示名稱"
          :disabled="disabled"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="全名" prop="fullName">
        <el-input
          v-model="formData.fullName"
          placeholder="請輸入用戶全名"
          :disabled="disabled"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="郵箱" prop="email">
        <el-input
          v-model="formData.email"
          placeholder="請輸入電子郵件"
          :disabled="disabled || isEditMode"
          maxlength="100"
        />
      </el-form-item>

      <el-form-item v-if="isCreateMode" label="密碼" prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="請輸入密碼"
          :disabled="disabled"
          maxlength="100"
          show-password
        />
      </el-form-item>

      <el-form-item label="生日" prop="birthDate">
        <el-date-picker
          v-model="formData.birthDate"
          type="date"
          placeholder="選擇生日"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :disabled="disabled"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="性別" prop="gender">
        <el-radio-group v-model="formData.gender" :disabled="disabled">
          <el-radio label="male">男</el-radio>
          <el-radio label="female">女</el-radio>
          <el-radio label="other">其他</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="頭像" prop="avatar">
        <AssetUpload
          v-model="formData.avatar"
          accept="image/*"
          :max-size="5"
          placeholder="上傳頭像"
          tip="支援 JPG、PNG 格式，最大 5MB"
        />
      </el-form-item>

      <el-form-item label="會員等級" prop="membershipLevel">
        <el-select
          v-model="formData.membershipLevel"
          placeholder="選擇會員等級"
          :disabled="disabled"
          style="width: 100%"
        >
          <el-option label="青銅" value="bronze" />
          <el-option label="白銀" value="silver" />
          <el-option label="黃金" value="gold" />
          <el-option label="尊榮" value="vip" />
        </el-select>
      </el-form-item>

      <el-form-item label="狀態" prop="status">
        <el-select
          v-model="formData.status"
          placeholder="選擇狀態"
          :disabled="disabled"
          style="width: 100%"
        >
          <el-option label="啟用" value="active" />
          <el-option label="停用" value="inactive" />
          <el-option label="待驗證" value="pending" />
        </el-select>
      </el-form-item>

      <el-form-item label="備註" prop="note">
        <el-input
          v-model="formData.note"
          type="textarea"
          :rows="3"
          placeholder="請輸入備註"
          :disabled="disabled"
          maxlength="500"
          show-word-limit
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
import { createUser, updateUser } from '@/services/User'
import type { User, MembershipLevel } from '@/model'
import { AssetUpload } from '@/components/AssetUpload'

interface Props {
  modelValue: boolean
  mode: 'create' | 'edit'
  initialData?: User | null
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
  return props.mode === 'create' ? '新增用戶' : '編輯用戶'
})

const isCreateMode = computed(() => props.mode === 'create')
const isEditMode = computed(() => props.mode === 'edit')

const formRef = ref<FormInstance>()
const loading = ref(false)

const formData = ref({
  displayName: '',
  fullName: '',
  email: '',
  password: '',
  birthDate: '',
  gender: null as string | null,
  avatar: '',
  membershipLevel: 'bronze' as MembershipLevel,
  status: 'pending' as string,
  note: ''
})

const emailValidator = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('請輸入電子郵件'))
    return
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    callback(new Error('請輸入有效的電子郵件地址'))
    return
  }
  callback()
}

const formRules: FormRules = {
  displayName: [
    { required: true, message: '請輸入顯示名稱', trigger: 'blur' },
    { max: 50, message: '最長 50 個字符', trigger: 'blur' }
  ],
  fullName: [
    { required: true, message: '請輸入用戶全名', trigger: 'blur' },
    { max: 100, message: '最長 100 個字符', trigger: 'blur' }
  ],
  email: [
    { required: true, validator: emailValidator, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, max: 100, message: '密碼長度在 6 到 100 個字符', trigger: 'blur' }
  ],
  membershipLevel: [
    { required: true, message: '請選擇會員等級', trigger: 'change' }
  ],
  status: [
    { required: true, message: '請選擇狀態', trigger: 'change' }
  ]
}

// Initialize form data
const initFormData = () => {
  if (props.initialData) {
    formData.value = {
      displayName: props.initialData.displayName || '',
      fullName: props.initialData.fullName || '',
      email: props.initialData.email || '',
      password: '', // 編輯時不帶入密碼
      birthDate: props.initialData.birthDate || '',
      gender: props.initialData.gender,
      avatar: props.initialData.avatar || '',
      membershipLevel: props.initialData.membershipLevel || 'bronze',
      status: props.initialData.status || 'pending',
      note: props.initialData.note || ''
    }
  } else {
    formData.value = {
      displayName: '',
      fullName: '',
      email: '',
      password: '',
      birthDate: '',
      gender: null,
      avatar: '',
      membershipLevel: 'bronze',
      status: 'pending',
      note: ''
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
    
    if (props.mode === 'create') {
      const createData = {
        displayName: formData.value.displayName,
        fullName: formData.value.fullName,
        email: formData.value.email,
        password: formData.value.password,
        birthDate: formData.value.birthDate || undefined,
        gender: formData.value.gender,
        avatar: formData.value.avatar || undefined,
        membershipLevel: formData.value.membershipLevel,
        status: formData.value.status,
        note: formData.value.note || null
      }
      await createUser(createData)
    } else if (props.initialData) {
      const updateData = {
        id: props.initialData.id,
        displayName: formData.value.displayName,
        fullName: formData.value.fullName,
        birthDate: formData.value.birthDate || undefined,
        gender: formData.value.gender,
        avatar: formData.value.avatar || undefined,
        membershipLevel: formData.value.membershipLevel,
        status: formData.value.status,
        note: formData.value.note || null
      }
      await updateUser(updateData)
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
