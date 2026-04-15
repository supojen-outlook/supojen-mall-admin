<template>
  <div v-loading="loading">
    <el-dialog
      v-model="visible"
      :title="mode === 'create' ? '新增分類' : '編輯分類'"
      width="600px"
      @close="handleClose">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px">
        <el-form-item label="分類名稱" prop="name">
          <el-input v-model="formData.name" placeholder="請輸入分類名稱" />
        </el-form-item>
        
        <el-form-item label="Slug" prop="slug">
          <el-input v-model="formData.slug" placeholder="請輸入分類網址" />
        </el-form-item>
        
        <el-form-item label="父分類" prop="parentId">
          <CategoryCascader 
            v-model="formData.parentId"
            :reload-trigger="reloadTrigger"
            placeholder="選擇父分類"
            :clearable="true"
            :filterable="true"
            style="width: 240px; margin-right: 10px"
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
        
        <el-form-item label="狀態" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio-button value="active">啟用</el-radio-button>
            <el-radio-button value="inactive">停用</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="分類圖片" prop="imageUrl">
          <AssetUpload 
            v-model="formData.imageUrl" 
            placeholder="點擊上傳圖片"
            tip="建議尺寸 200x200，大小不超過 5MB"
            :max-size="5"
            accept="image/*"
          />
        </el-form-item>
        
        <el-form-item label="是否為葉子分類" prop="isLeaf">
          <el-switch
            v-model="formData.isLeaf"
            active-text="是"
            inactive-text="否"
          />
          <div class="el-form-item__tip">
            商品只能關聯到葉子類目
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose(formRef)">取消</el-button>
          <el-button type="primary" @click="handleSubmit(formRef)" :loading="loading">
            確認
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import type { FormInstance } from 'element-plus'
import type { Category } from '@/model'
import { CategoryCascader } from '@/components/CategoryCascader'
import { AssetUpload } from '@/components/AssetUpload'
import { useCategoryForm } from './useCategoryForm.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String as () => 'create' | 'edit',
    default: 'create'
  },
  initialData: {
    type: Object as () => Category | null,
    default: null
  },
  reloadTrigger: { 
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const {
  loading,
  formData,
  rules,
  initFormData,
  handleSubmit,
  handleClose,
} = useCategoryForm(props, emit)

// State
const formRef = ref<FormInstance>()

// Computed
const visible = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

// Watch for dialog open/close
watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    await nextTick(); // Wait for DOM update
    await initFormData();
  }
})
</script>

<style scoped>
/* Form item tip styling */
:deep(.el-form-item__tip) {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  margin-left: 10px;
  font-style: italic;
  opacity: 0.8;
  transition: color 0.2s;
}

:deep(.el-form-item.is-error .el-form-item__tip) {
  color: var(--el-color-danger);
}

:deep(.el-form-item.is-success .el-form-item__tip) {
  color: var(--el-color-success);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
