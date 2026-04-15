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
      label-width="100px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="品牌名稱" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="請輸入品牌名稱"
          :disabled="disabled"
        />
      </el-form-item>

      <el-form-item label="URL 友好名稱" prop="slug">
        <el-input
          v-model="formData.slug"
          placeholder="請輸入 URL 友好名稱"
          :disabled="disabled"
        />
      </el-form-item>

      <el-form-item label="父品牌" prop="parentId">
        <BrandCascader
          v-model="formData.parentId"
          placeholder="選擇父品牌"
          :clearable="true"
          :filterable="true"
          :disabled="disabled"
          :reload-trigger="reloadTrigger"
        />
      </el-form-item>

      <el-form-item label="排序" prop="sortOrder">
        <el-input-number
          v-model="formData.sortOrder"
          :min="0"
          placeholder="請輸入排序順序"
          :disabled="disabled"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="品牌描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="請輸入品牌描述"
          :disabled="disabled"
        />
      </el-form-item>

      <el-form-item label="品牌標誌" prop="logoUrl">
        <AssetUpload 
          v-model="formData.logoUrl" 
          placeholder="點擊上傳品牌標誌"
          tip="建議尺寸 200x200，大小不超過 5MB"
          :max-size="5"
          accept="image/*"
        />
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
        </el-select>
      </el-form-item>

      <el-form-item label="是否為葉品牌" prop="isLeaf">
        <el-switch
          v-model="formData.isLeaf"
          active-text="是"
          inactive-text="否"
          :disabled="disabled"
        />
        <div class="el-form-item__tip">
          葉子品牌不能包含子品牌
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
import { createBrand, updateBrand } from '@/services/Brand'
import { BrandCascader } from '@/components/BrandCascader'
import { AssetUpload } from '@/components/AssetUpload'
import type { Brand } from '@/model'

interface Props {
  modelValue: boolean
  mode: 'create' | 'edit'
  initialData?: Brand | null
  disabled?: boolean
  reloadTrigger?: number
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
  return props.mode === 'create' ? '新增品牌' : '編輯品牌'
})

const formRef = ref<FormInstance>()
const loading = ref(false)

const formData = ref({
  name: '',
  slug: '',
  parentId: null as number | null,
  sortOrder: 0,
  description: '',
  logoUrl: '',
  status: 'active' as 'active' | 'inactive',
  isLeaf: false
})

const formRules: FormRules = {
  name: [
    { required: true, message: '請輸入品牌名稱', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '請選擇狀態', trigger: 'change' }
  ]
}

// 初始化表單數據
const initFormData = () => {
  if (props.initialData) {
    formData.value = {
      name: props.initialData.name || '',
      slug: props.initialData.slug || '',
      parentId: props.initialData.parentId || null,
      sortOrder: props.initialData.sortOrder || 0,
      description: props.initialData.description || '',
      logoUrl: props.initialData.logoUrl || '',
      status: props.initialData.status || 'active',
      isLeaf: props.initialData.isLeaf || false
    }
  } else {
    formData.value = {
      name: '',
      slug: '',
      parentId: null,
      sortOrder: 0,
      description: '',
      logoUrl: '',
      status: 'active',
      isLeaf: false
    }
  }
}

// 監聽 initialData 變化
watch(() => props.initialData, () => {
  initFormData()
}, { immediate: true })

// 監聽 reloadTrigger 變化
watch(() => props.reloadTrigger, () => {
  initFormData()
}, { immediate: false })

// 處理提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const submitData = {
      ...formData.value
    }
    
    if (props.mode === 'create') {
      await createBrand(submitData)
    } else if (props.initialData) {
      await updateBrand({
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

// 處理關閉
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
