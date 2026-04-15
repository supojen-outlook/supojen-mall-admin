<template>
  <div class="specification-item">
    <el-form-item 
      :label="specification.name"
      label-width="120px"
    >
      <!-- Select 類型 -->
      <el-select
        v-if="specification.inputType === 'select'"
        v-model="localValue"
        :placeholder="`請選擇${specification.name}`"
        clearable
        class="w-full"
        @change="handleChange"
      >
        <el-option
          v-for="value in attributeValues[specification.keyId]"
          :key="value.id"
          :label="value.value"
          :value="value.id"
        />
      </el-select>
      
      <!-- Text 類型 -->
      <el-input
        v-else-if="specification.inputType === 'text'"
        v-model="localValue"
        :placeholder="`請輸入${specification.name}`"
        clearable
        class="w-full"
        @input="handleChange"
      />
      
      <!-- Number 類型 -->
      <el-input-number
        v-else-if="specification.inputType === 'number'"
        v-model="localValue"
        :placeholder="`請輸入${specification.name}`"
        :min="0"
        class="w-full"
        @change="handleChange"
      />
      
      <!-- Checkbox 類型 -->
      <el-checkbox-group
        v-else-if="specification.inputType === 'checkbox'"
        v-model="localValue"
        @change="handleChange"
      >
        <el-checkbox
          v-for="value in attributeValues[specification.keyId]"
          :key="value.id"
          :label="value.id"
        >
          {{ value.value }}
        </el-checkbox>
      </el-checkbox-group>
      
      <!-- 單位顯示 -->
      <span v-if="specification.unit" class="unit-text">
        {{ specification.unit }}
      </span>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { AttributeValue } from '@/model/AttributeValue'
import type { Specification } from '@/model/Specification'
import { getAttributeValues } from '@/services/AttributeValue'

interface Props {
  specification: Specification
  mode?: 'create' | 'edit'
}

interface Emits {
  (e: 'update', specification: Specification): void
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

const emit = defineEmits<Emits>()

// 響應式狀態
const loading = ref(false)
const attributeValues = ref<Record<number, AttributeValue[]>>({})
const localValue = ref()

// 獲取初始值
const getInitialValue = (spec: Specification) => {
  if (spec.valueId && spec.valueId !== 0) {
    // 對於 select/checkbox 類型，使用 valueId
    if (spec.inputType === 'checkbox') {
      // checkbox 的 valueId 可能是 "1,2,3" 格式，需要轉換為數組
      return spec.valueId.toString().split(',').map(id => Number(id.trim()))
    }
    return spec.valueId
  } else if (spec.value) {
    // 對於 text/number 類型，使用 value
    if (spec.inputType === 'checkbox') {
      // checkbox 的 value 可能是 "1,2,3" 格式，需要轉換為數組
      return spec.value.split(',').map(id => Number(id.trim()))
    }
    return spec.value
  }
  return spec.inputType === 'checkbox' ? [] : ''
}

// 處理值變化
const handleChange = (value: any) => {
  localValue.value = value
  emit('update', {
    ...props.specification,
    valueId: getValueId(value),
    value: getValueText(value)
  })
}

// 獲取 valueId
const getValueId = (value: any): number | null => {
  if (props.specification.inputType === 'select' || props.specification.inputType === 'checkbox') {
    const result = Array.isArray(value) ? value.join(',') : value
    return result ? Number(result) : null
  }
  return null
}

// 獲取 value 文本
const getValueText = (value: any): string => {
  if (props.specification.inputType === 'select' || props.specification.inputType === 'checkbox') {
    const values = attributeValues.value[props.specification.keyId]
    if (!values) return ''
    
    if (Array.isArray(value)) {
      return value.map(id => {
        const val = values.find(v => v.id === id)
        return val ? val.value : ''
      }).join(', ')
    } else {
      const val = values.find(v => v.id === value)
      return val ? val.value : ''
    }
  }
  return value ? value.toString() : ''
}

// 加載屬性值選項
const loadAttributeValues = async () => {
  if (props.specification.inputType === 'select' || props.specification.inputType === 'checkbox') {
    loading.value = true
    
    try {
      const valuesResponse = await getAttributeValues({
        id: props.specification.keyId,
      })
      attributeValues.value[props.specification.keyId] = valuesResponse.list
    } catch (error) {
      ElMessage.error('加載屬性選項失敗')
      console.error('Load attribute values error:', error)
    } finally {
      loading.value = false
    }
  }
}

// 監聽規格變化
watch(() => props.specification, (newSpec) => {
  if (newSpec) {
    localValue.value = getInitialValue(newSpec)
    loadAttributeValues()
  }
}, { immediate: true })

// 組件掛載時初始化
onMounted(() => {
  loadAttributeValues()
})
</script>

<style scoped>
.specification-item {
  margin-bottom: 0;  /* 在 flex 佈局中不需要 margin-bottom */
  padding: 0;
  background-color: transparent;
}

.specification-item .el-form-item {
  margin-bottom: 0;
}

.unit-text {
  margin-left: 8px;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.w-full {
  width: 90%;
}
</style>
