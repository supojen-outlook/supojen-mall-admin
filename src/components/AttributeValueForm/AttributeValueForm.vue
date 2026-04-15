<template>
  <div v-loading="loading">
    <el-dialog
      v-model="visible"
      :title="mode === 'create' ? '新增屬性值' : '編輯屬性值'"
      width="500px"
      @close="handleClose">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px">
        <el-form-item label="屬性值" prop="value">
          <el-input
            v-model="formData.value"
            placeholder="請輸入屬性值"
          />
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="請輸入屬性值描述"
          />
        </el-form-item>

        <el-form-item label="排序" prop="sortOrder">
          <el-input-number
            v-model="formData.sortOrder"
            :min="0"
            placeholder="請輸入排序順序"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleSubmit"
          >
            {{ mode === 'create' ? '新增' : '更新' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { updateAttributeValue } from '@/services/AttributeValue'
import type { AttributeValue } from '@/model'

interface Props {
  modelValue: boolean
  mode: 'create' | 'edit'
  initialData?: AttributeValue | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref<FormInstance>()
const loading = ref(false)

const formData = ref({
  value: '',
  description: '',
  sortOrder: 0
})

const formRules: FormRules = {
  value: [
    { required: true, message: '請輸入屬性值', trigger: 'blur' }
  ],
  sortOrder: [
    { required: true, message: '請輸入排序順序', trigger: 'blur' }
  ]
}

// 初始化表單數據
const initFormData = () => {
  if (props.initialData) {
    formData.value = {
      value: props.initialData.value || '',
      description: props.initialData.description || '',
      sortOrder: props.initialData.sortOrder || 0
    }
  } else {
    formData.value = {
      value: '',
      description: '',
      sortOrder: 0
    }
  }
}

// 監聽 initialData 變化
watch(() => props.initialData, () => {
  initFormData()
}, { immediate: true })

// 處理提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    if (props.mode === 'edit' && props.initialData) {
      await updateAttributeValue({
        id: props.initialData.id,
        ...formData.value
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
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
