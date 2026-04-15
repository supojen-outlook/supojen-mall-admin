<template>
  <div class="asset-upload">
    <!-- 
      el-upload 核心組件 
      - :http-request="customUpload": 使用自定義上傳函數，這能讓我們利用 axios 攔截器自動處理令牌
      - :show-file-list="false": 不顯示檔案列表，僅顯示單一預覽
      - :before-upload="beforeUpload": 上傳前的驗證
      - :on-error="handleError": 處理上傳過程中的錯誤
      - :with-credentials="true": 允許攜帶和儲存 Cookie
      - :accept="accept": 限制可選擇的檔案類型
      - name="file": 對應後端 multipart/form-data 的欄位名稱
    -->
    <el-upload
      class="asset-uploader"
      :http-request="customUpload"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :on-error="handleError"
      :with-credentials="true"
      :accept="accept"
      name="file"
    >
      <!-- 狀態 1：上傳中 (顯示 Loading 動畫) -->
      <div v-if="uploading" class="status-container">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span class="status-text">上傳中...</span>
      </div>

      <!-- 狀態 2：已有檔案預覽 (當 modelValue 有值時) -->
      <template v-else-if="modelValue">
        <div class="preview-container">
          <!-- 根據副檔名判斷顯示影片或圖片 -->
          <video 
            v-if="isVideo(modelValue)" 
            :src="getFullUrl(modelValue)" 
            class="preview-content"
            controls
          />
          <img 
            v-else 
            :src="getFullUrl(modelValue)" 
            class="preview-content" 
          />
          <!-- 懸停遮罩：提示使用者可以點擊更換 -->
          <div class="preview-mask">
            <el-icon><Refresh /></el-icon>
            <span>更換檔案</span>
          </div>
        </div>
      </template>

      <!-- 狀態 3：預設待上傳狀態 (顯示 Plus 圖示) -->
      <div v-else class="status-container default-placeholder">
        <el-icon class="uploader-icon"><Plus /></el-icon>
        <span class="uploader-text">{{ placeholder }}</span>
      </div>
    </el-upload>
    
    <!-- 組件下方的輔助提示文字 -->
    <div v-if="tip" class="upload-tip">{{ tip }}</div>
  </div>
</template>

<script lang="ts" setup>
/**
 * AssetUpload asset upload component
 * 
 * Uses the automatic token interceptor from Request.ts:
 * 1. Uses customUpload + axios (worker instance)
 * 2. Interceptor automatically handles token expiration, refresh, and injection
 * 3. Component code becomes much cleaner, no manual token management needed
 */
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Loading, Refresh } from '@element-plus/icons-vue'
import { API_CONFIG, worker } from '@/services/Request'

interface Props {
  /** 綁定的資源 URL (支援 v-model) */
  modelValue: string | null | undefined
  /** 上傳端點路徑，預設為 /api/assets */
  action?: string
  /** 接受的檔案 MIME 類型，預設支援圖片與影片 */
  accept?: string
  /** 檔案大小上限 (MB)，預設 20MB */
  maxSize?: number
  /** 未上傳時的佔位文字 */
  placeholder?: string
  /** 組件下方的提示文字 */
  tip?: string
}

const props = withDefaults(defineProps<Props>(), {
  action: '/api/assets',
  accept: 'image/*,video/*',
  maxSize: 20,
  placeholder: '點擊上傳',
  tip: ''
})

const emit = defineEmits<{
  /** 更新 v-model */
  (e: 'update:modelValue', value: string): void
  /** 上傳成功回調 */
  (e: 'success', response: any): void
  /** 上傳失敗回調 */
  (e: 'error', error: any): void
}>()

const uploading = ref(false)

/**
 * Custom upload method
 * Uses the project's unified axios instance (worker),
 * which automatically handles Antiforgery Token injection via interceptors.
 */
const customUpload = async (options: any) => {
  const { file, onSuccess, onError } = options;
  
  uploading.value = true;
  
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await worker.post(uploadAction.value, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      withCredentials: true
    });
    
    uploading.value = false;
    
    if (response.data && response.data.url) {
      emit('update:modelValue', response.data.url);
      emit('success', response.data);
      ElMessage.success('上傳成功');
      onSuccess(response.data);
    } else {
      ElMessage.error('Upload failed: server did not return valid path');
      onError(new Error('Invalid response'));
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    uploading.value = false;
    
    // Handle error messages
    const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         error.message || 
                         'Upload failed';
    
    ElMessage.error(`Upload failed: ${errorMessage}`);
    onError(error);
    emit('error', error);
  }
};

/** 計算完整且正確的上傳 API 位址 */
const uploadAction = computed(() => {
  if (props.action.startsWith('http')) return props.action
  return `${props.action.startsWith('/') ? '' : '/'}${props.action}`
})

/** 判斷檔案是否為影片格式 */
const isVideo = (url: string) => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov']
  return videoExtensions.some(ext => url.toLowerCase().endsWith(ext))
}

/** 獲取資源的完整顯示 URL，自動處理基礎位址拼接 */
const getFullUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url
  return `${API_CONFIG.BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

/** 上傳前的預檢邏輯 */
const beforeUpload = (file: File) => {
  const isLtSize = file.size / 1024 / 1024 < props.maxSize
  if (!isLtSize) {
    ElMessage.error(`檔案大小不能超過 ${props.maxSize}MB!`)
    return false
  }

  uploading.value = true 
  return true
}

/** 上傳失敗的回調處理 */
const handleError = (err: any) => {
  uploading.value = false
  console.error('Asset Upload Error:', err)
  emit('error', err)
}
</script>

<style scoped>
.asset-upload {
  display: inline-block;
}

/* 覆蓋 el-upload 預設樣式 */
.asset-uploader :deep(.el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  background-color: var(--el-bg-color-page);
  width: 148px;
  height: 148px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.asset-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
  background-color: var(--el-fill-color-light);
}

.status-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  gap: 8px;
  width: 100%;
  height: 100%;
}

.uploader-icon {
  font-size: 28px;
}

.uploader-text {
  font-size: 13px;
}

.preview-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.preview-content {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 懸停遮罩 */
.preview-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s;
  gap: 8px;
  font-size: 13px;
}

.preview-container:hover .preview-mask {
  opacity: 1;
}

.upload-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 8px;
  text-align: center;
}

.is-loading {
  font-size: 24px;
  color: var(--el-color-primary);
}
</style>
