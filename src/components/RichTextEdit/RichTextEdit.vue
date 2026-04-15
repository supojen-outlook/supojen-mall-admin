<template>
  <div class="rich-text-editor">
    <div ref="toolbarRef" class="toolbar"></div>
    <div ref="editorRef" class="editor"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import '@wangeditor/editor/dist/css/style.css'
import { createEditor, createToolbar, type IDomEditor } from '@wangeditor/editor'
import { API_CONFIG } from '@/services'

interface Props {
  modelValue: string
  placeholder?: string
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '請輸入內容...',
  height: 400
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const toolbarRef = ref<HTMLElement>()
const editorRef = ref<HTMLElement>()
let editor: IDomEditor | null = null
let toolbar: any = null

onMounted(() => {
  if (editorRef.value && toolbarRef.value) {
    // 創建編輯器
    editor = createEditor({
      selector: editorRef.value,
      html: props.modelValue || '',
      config: {
        placeholder: props.placeholder,
        MENU_CONF: {
          uploadImage: {
            server: `${API_CONFIG.BASE_URL}/api/image`,
            fieldName: 'file',
            withCredentials: true,
            maxFileSize: 5 * 1024 * 1024, // 5MB
            allowedFileTypes: ['image/*'],
            metaWithUrl: true,
            withFileName: true,
            customInsert(res: any, insertFn: any) {
              if (res.url) {
                insertFn(res.url)
              }
            }
          }
        }
      }
    })

    // 創建工具欄
    toolbar = createToolbar({
      editor,
      selector: toolbarRef.value,
      config: {}
    })

    // 監聽內容變化
    editor.on('change', () => {
      const html = editor?.getHtml() || ''
      emit('update:modelValue', html)
    })
    
    // 延迟設置高度，確保編輯器完全初始化
    setTimeout(() => {
      if (editorRef.value) {
        const editorEl = editorRef.value.querySelector('.w-e-scroll') as HTMLElement
        if (editorEl) {
          const scrollHeight = props.height - 50 // 減去工具欄高度
          editorEl.style.minHeight = `${scrollHeight}px`
          editorEl.style.height = `${scrollHeight}px`
        }
      }
    }, 100)
  }
})

onBeforeUnmount(() => {
  if (editor) {
    editor.destroy()
  }
  if (toolbar) {
    toolbar.destroy()
  }
})

// 監聽外部值變化
watch(() => props.modelValue, (newValue) => {
  if (editor && newValue !== editor.getHtml()) {
    editor.setHtml(newValue)
  }
})
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  width: 100%;
}

.toolbar {
  border-bottom: 1px solid #dcdfe6;
}

.editor {
  height: v-bind('`${props.height}px`');
}
</style>

<style>
/* 全局强制设置富文本编辑器高度和背景色 */
.rich-text-editor .w-e-scroll {
  min-height: v-bind('`${props.height - 50}px`') !important;
  height: v-bind('`${props.height - 50}px`') !important;
  background-color: var(--el-bg-color-page) !important;
}

.rich-text-editor .w-e-text-container {
  min-height: v-bind('`${props.height - 50}px`') !important;
  background-color: var(--el-bg-color-page) !important;
}

.rich-text-editor .editor {
  height: v-bind('`${props.height}px`') !important;
  min-height: v-bind('`${props.height}px`') !important;
}

/* 编辑器内容区域背景色 */
.rich-text-editor .w-e-text {
  background-color: var(--el-bg-color-page) !important;
}

/* 工具栏背景色 */
.rich-text-editor .w-e-toolbar {
  background-color: var(--el-bg-color-page) !important;
}

/* 编辑器整体背景色 */
.rich-text-editor .w-e-editor {
  background-color: var(--el-bg-color-page) !important;
}

/* 编辑器容器背景色 */
.rich-text-editor .w-e-text-container [contenteditable="true"] {
  background-color: var(--el-bg-color-page) !important;
}
</style>
