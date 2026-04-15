<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="600px"
    @close="handleClose">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px">
      
      <el-form-item label="選擇屬性" prop="attributeKeyId">
        <AttributeKeySelector 
          v-model="formData.attributeKeyId"
          placeholder="選擇要關聯的屬性"
        />
        <div class="el-form-item__tip">
          選擇要關聯到此分類的屬性
        </div>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          確認
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { AttributeKeySelector } from '@/components/AttributeKeySelector'
import { addCategoryAttribute } from '@/services/Category'

// 定義組件名稱
defineOptions({
  name: 'CategoryAttributeForm'
})

/**
 * 組件屬性定義
 */
const props = defineProps({
  /** 是否顯示表單對話框 */
  modelValue: {
    type: Boolean,
    default: false
  },
  /** 表單模式：創建 */
  mode: {
    type: String as () => 'create',
    default: 'create'
  },
  /** 分類 ID */
  categoryId: {
    type: Number,
    required: true
  }
})

/**
 * 定義組件事件
 */
const emit = defineEmits<{
  /** 更新 modelValue 事件 */
  (e: 'update:modelValue', value: boolean): void
  /** 表單提交成功事件 */
  (e: 'success'): void
}>()

// 狀態
const formRef = ref<FormInstance>()
const loading = ref(false)

// 表單數據
const formData = ref<{
  attributeKeyId: number | null
}>({
  attributeKeyId: null
})

// 對話框顯示狀態
const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// 對話框標題
const dialogTitle = computed(() => {
  return '新增屬性關聯'
})

// 表單驗證規則
const formRules: FormRules = {
  attributeKeyId: [
    { required: true, message: '請選擇屬性', trigger: 'change' }
  ]
}

// 監聽對話框顯示狀態，重置表單
watch(visible, (newVal) => {
  if (newVal) {
    resetForm()
  }
})

// 重置表單數據
const resetForm = () => {
  formData.value = {
    attributeKeyId: null
  }
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 處理表單提交
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    // 執行表單驗證
    await formRef.value.validate()
  } catch (error) {
    // 驗證失敗時直接返回，不執行後續操作
    return
  }

  if (!formData.value.attributeKeyId) {
    ElMessage.error('請選擇屬性')
    return
  }

  try {
    loading.value = true
    
    // 創建模式：調用添加分類屬性API
    await addCategoryAttribute({
      categoryId: props.categoryId,
      attributeKeyId: formData.value.attributeKeyId
    })

    ElMessage.success('新增屬性關聯成功')
    
    // 觸發成功事件
    emit('success')
    
    // 關閉對話框
    visible.value = false
    
  } catch (error) {
    console.error('新增屬性關聯失敗:', error)
    ElMessage.error('新增屬性關聯失敗')
  } finally {
    loading.value = false
  }
}

// 處理關閉對話框
const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
.el-form-item__tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.4;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
