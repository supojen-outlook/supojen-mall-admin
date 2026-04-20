<template>
  <el-select
    ref="selectRef"
    v-model="selectedValue"
    filterable
    remote
    :remote-method="handleSearch"
    :loading="loading"
    :remote-show-suffix="true"
    clearable
    popper-class="user-selector-popper"
    @visible-change="handleVisibleChange"
    placeholder="請選擇用戶"
    class="w-full"
  >
    <el-option
      v-for="item in userOptions"
      :key="item.id"
      :label="item.displayName"
      :value="item.id"
    >
      <div class="option-content">
        <el-avatar :size="24" :src="item.avatar || '/admin/default_avatar.png'" class="option-avatar">
          {{ item.displayName?.charAt(0) || 'U' }}
        </el-avatar>
        <span class="option-name">{{ item.displayName }}</span>
        <el-tag size="small" class="option-tag" type="info">
          {{ item.email }}
        </el-tag>
      </div>
    </el-option>
    <template #footer v-if="hasMore">
      <div class="loading-more" v-loading="loadingMore">
        <span v-if="!loadingMore">滾動加載更多</span>
      </div>
    </template>
  </el-select>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElSelect, ElOption, ElTag, ElAvatar } from 'element-plus'
import { getUsers } from '@/services/User'
import type { User } from '@/model'

const props = defineProps({
  modelValue: {
    type: Number as () => number | null,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const selectRef = ref()
const loading = ref(false)
const loadingMore = ref(false)
const selectedValue = ref<number | null>(null)
const userOptions = ref<User[]>([])
const hasMore = ref(true)
const currentCursor = ref<string>('')
const searchKeyword = ref('')
const pageSize = 10

watch(selectedValue, (newVal) => {
  emit('update:modelValue', newVal)
})

watch(() => props.modelValue, (newVal) => {
  if (newVal !== selectedValue.value) {
    selectedValue.value = newVal
  }
})

const loadUsers = async (loadMore: boolean = false) => {
  try {
    if (loadMore) {
      loadingMore.value = true
    } else {
      loading.value = true
      currentCursor.value = ''
      userOptions.value = []
    }

    const params = {
      size: pageSize,
      cursor: loadMore ? currentCursor.value : undefined,
      search: searchKeyword.value
    }

    const result = await getUsers(params)

    if (loadMore) {
      userOptions.value = [...userOptions.value, ...result.list]
    } else {
      userOptions.value = result.list
    }

    currentCursor.value = result.cursor || ''
    hasMore.value = !!result.cursor

  } catch (error) {
    console.error('加載用戶列表失敗:', error)
  } finally {
    if (loadMore) {
      loadingMore.value = false
    } else {
      loading.value = false
    }
  }
}

const handleSearch = (query: string) => {
  searchKeyword.value = query
  loadUsers(false)
}

const handleVisibleChange = (visible: boolean) => {
  if (visible) {
    if (userOptions.value.length === 0) {
      loadUsers(false)
    }
    setTimeout(setupScrollListener, 100)
  } else {
    cleanupScrollListener()
  }
}

const handleScroll = () => {
  if (!scrollElement) return

  const { scrollTop, scrollHeight, clientHeight } = scrollElement

  if (Math.ceil(scrollTop + clientHeight) >= scrollHeight) {
    if (!loadingMore.value && hasMore.value) {
      loadUsers(true)
    }
  }
}

const cleanupScrollListener = () => {
  if (scrollElement) {
    scrollElement.removeEventListener('scroll', handleScroll)
    scrollElement = null
  }
  if (observer) {
    observer.disconnect()
    observer = null
  }
}

const setupScrollListener = () => {
  cleanupScrollListener()

  nextTick(() => {
    if (!selectRef.value) return

    const dropdown = document.querySelector('.user-selector-popper .el-select-dropdown')
    if (!dropdown) return

    const wrap = dropdown.querySelector<HTMLElement>('.el-select-dropdown__wrap')
    if (!wrap) return

    scrollElement = wrap
    wrap.addEventListener('scroll', handleScroll)

    observer = new MutationObserver(() => {
      if (!wrap.isConnected) {
        cleanupScrollListener()
        setupScrollListener()
      }
    })

    observer.observe(dropdown, {
      childList: true,
      subtree: true
    })
  })
}

onMounted(() => {
  selectedValue.value = props.modelValue
})

onBeforeUnmount(() => {
  cleanupScrollListener()
})

let scrollElement: HTMLElement | null = null
let observer: MutationObserver | null = null
</script>

<style scoped>
.option-content {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 0;
}

.option-avatar {
  flex-shrink: 0;
}

.option-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.option-tag {
  flex-shrink: 0;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.loading-more {
  padding: 12px 0;
  text-align: center;
  color: #909399;
  font-size: 12px;
}
</style>

<style>
.user-selector-popper {
  z-index: 9999 !important;
}

.user-selector-popper .el-select-dropdown__wrap {
  max-height: 274px;
}
</style>
