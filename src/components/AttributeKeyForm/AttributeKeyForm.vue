<template>
  <div v-loading="loading">
    <el-dialog
      v-model="visible"
      :title="mode === 'create' ? '新增屬性' : '編輯屬性'"
      width="600px"
      @close="handleClose">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px">
        <el-form-item label="屬性名稱" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="請輸入屬性名稱"
          />
        </el-form-item>
        
        <el-form-item label="屬性描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="請輸入屬性描述"
          />
        </el-form-item>

        <el-form-item label="輸入類型" prop="inputType">
          <el-select
            v-model="formData.inputType"
            placeholder="選擇輸入類型"
            style="width: 100%">
            <el-option label="下拉選單" value="select" />
            <el-option label="文字" value="text" />
            <el-option label="數字" value="number" />
            <el-option label="複選框" value="checkbox" />
          </el-select>
        </el-form-item>

        <el-form-item label="是否為銷售屬性" prop="forSales">
          <el-switch
            v-model="formData.forSales"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>

        <el-form-item label="是否為必填屬性" prop="isRequired">
          <el-switch
            v-model="formData.isRequired"
            active-text="是"
            inactive-text="否"
          />
          <div class="el-form-item__tip">
            必填屬性在商品編輯時必須填寫
          </div>
        </el-form-item>

        <el-form-item label="排序" prop="sortOrder">
          <el-input-number
            v-model="formData.sortOrder"
            :min="0"
            placeholder="請輸入排序順序"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="單位" prop="unit" v-if="formData.inputType === 'number'">
          <el-input
            v-model="formData.unit"
            placeholder="請輸入單位，如：cm、g"
          />
        </el-form-item>

        <el-form-item label="狀態" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio-button value="active">啟用</el-radio-button>
            <el-radio-button value="inactive">停用</el-radio-button>
          </el-radio-group>
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
import { createAttributeKey, updateAttributeKey } from '@/services/AttributeKey'
import type { AttributeKey } from '@/model'

interface Props {
  modelValue: boolean
  mode: 'create' | 'edit'
  initialData?: AttributeKey | null
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
  name: '',
  description: '',
  inputType: 'select' as 'select' | 'text' | 'number' | 'checkbox',
  forSales: false,
  isRequired: false,
  unit: '',
  sortOrder: 0,
  status: 'active' as 'active' | 'inactive'
})

const formRules: FormRules = {
  name: [
    { required: true, message: '請輸入屬性名稱', trigger: 'blur' }
  ],
  inputType: [
    { required: true, message: '請選擇輸入類型', trigger: 'change' }
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
      description: props.initialData.description || '',
      inputType: props.initialData.inputType || 'select',
      forSales: props.initialData.forSales || false,
      isRequired: props.initialData.isRequired || false,
      unit: props.initialData.unit || '',
      sortOrder: props.initialData.sortOrder || 0,
      status: props.initialData.status || 'active'
    }
  } else {
    formData.value = {
      name: '',
      description: '',
      inputType: 'select',
      forSales: false,
      isRequired: false,
      unit: '',
      sortOrder: 0,
      status: 'active'
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
    
    if (props.mode === 'create') {
      await createAttributeKey(formData.value)
    } else if (props.initialData) {
      await updateAttributeKey({
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
