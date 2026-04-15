<template>
  <el-select
    v-model="selectedTags"
    multiple
    filterable
    allow-create
    default-first-option
    placeholder="請選擇或輸入標籤"
    style="width: 100%"
    @change="handleChange"
  >
    <el-option
      v-for="tag in tagsList"
      :key="tag.id"
      :label="tag.name"
      :value="tag.name"
    />
  </el-select>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { Tag } from '@/model/Tag'
import { getTags } from '@/services/Tag'

interface Props {
  modelValue?: string[]
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => []
})

const emit = defineEmits<Emits>()

// 響應式狀態
const loading = ref(false)
const tagsList = ref<Tag[]>([])
const selectedTags = ref<string[]>([])

// 處理變化
const handleChange = (value: string[]) => {
  selectedTags.value = value
  emit('update:modelValue', value)
}

// 加載標籤列表
const loadTags = async () => {
  try {
    loading.value = true
    const response = await getTags()
    tagsList.value = response.list
  } catch (error) {
    ElMessage.error('加載標籤失敗')
    console.error('Load tags error:', error)
  } finally {
    loading.value = false
  }
}

// 監聽 modelValue 變化
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    selectedTags.value = [...newValue]
  }
}, { immediate: true })

// 組件掛載時加載數據
onMounted(() => {
  loadTags()
})
</script>

<style scoped>
/* 可以根據需要添加自定義樣式 */
</style>
