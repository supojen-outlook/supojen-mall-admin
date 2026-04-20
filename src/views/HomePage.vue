<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
      <div class="logo">
        <div v-if="!isCollapsed" class="logo-content" @click="toggleSidebar">
          <div class="logo-image">
            <img src="/logo.png" alt="Logo" class="logo-img" />
          </div>
          <div class="logo-text">小紅帽資訊</div>
        </div>
        <div v-else class="menu-toggle-container">
          <el-button 
            type="text" 
            @click="toggleSidebar"
            class="menu-toggle-btn"
            :class="{ 'menu-toggle-btn-collapsed': isCollapsed }">
            <el-icon size="18">
              <Expand />
            </el-icon>
          </el-button>
        </div>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        background-color="var(--el-bg-color)"
        text-color="var(--el-text-color-primary)"
        active-text-color="var(--el-color-primary)"
        router
        :collapse="isCollapsed"
      >
      
        <!-- 商品中心 -->
        <el-sub-menu index="products">
          <template #title>
            <el-icon><i class="ri-shopping-bag-line"></i></el-icon>
            <span>商品中心</span>
          </template>
          <el-menu-item index="/products">產品列表</el-menu-item>
          <el-menu-item index="/products/categories">分類管理</el-menu-item>
          <el-menu-item index="/brands">品牌列表</el-menu-item>
          <el-menu-item index="/attribute-keys">屬性管理</el-menu-item>
        </el-sub-menu>

        <!-- 銷售中心 -->
        <el-sub-menu index="sales">
          <template #title>
            <el-icon><i class="ri-price-tag-3-line"></i></el-icon>
            <span>銷售中心</span>
          </template>
          <el-menu-item index="/promotions">促銷管理</el-menu-item>
          <el-menu-item index="/coupons">優惠券管理</el-menu-item>
          <el-menu-item index="/shipping-rules">運費規則</el-menu-item>
        </el-sub-menu>

        <!-- 獨立菜單項 -->
        <el-menu-item index="/orders">
          <el-icon><i class="ri-file-list-3-line"></i></el-icon>
          <span>訂單管理</span>
        </el-menu-item>

        <el-menu-item index="/locations">
          <el-icon><i class="ri-map-pin-line"></i></el-icon>
          <span>倉位列表</span>
        </el-menu-item>

        <el-menu-item index="/users">
          <el-icon><i class="ri-user-line"></i></el-icon>
          <span>用戶管理</span>
        </el-menu-item>

        <el-menu-item index="/assets">
          <el-icon><i class="ri-image-line"></i></el-icon>
          <span>資源列表</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航 -->
      <header class="top-bar">
        <div class="user-actions">
          <el-dropdown>
            <div class="user-profile">
              <el-avatar :size="32" :src="account.profile?.avatar || ''">
                {{ account.profile?.displayName?.charAt(0) || 'A' }}
              </el-avatar>
              <span class="username">{{ account.profile?.displayName || '管理员' }}</span>
              <el-icon><i class="ri-arrow-down-s-line"></i></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人资料</el-dropdown-item>
                <el-dropdown-item>设置</el-dropdown-item>
                <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 内容区 - 使用 CategoriesPage -->
      <main class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Expand } from '@element-plus/icons-vue'
import { useAccountStore } from '@/stores'
import { signOut } from '@/services'



const router = useRouter()
const route = useRoute()
const account = useAccountStore()

// 側邊欄縮起狀態
const isCollapsed = ref(false)

// 切換側邊欄狀態
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  // 保存狀態到 localStorage
  localStorage.setItem('sidebar-collapsed', isCollapsed.value.toString())
}

// 初始化時讀取保存的狀態
const initSidebarState = () => {
  const savedState = localStorage.getItem('sidebar-collapsed')
  if (savedState !== null) {
    isCollapsed.value = savedState === 'true'
  }
}

// 獲取當前激活的菜單
const activeMenu = computed(() => {
  return route.path
})

// 退出登錄
const logout = async () => {
  try {
    await signOut()
  } catch (error) {
    console.error('登出 API 失敗:', error)
  }
  account.logout()
  router.push('/admin/login')
}

// 組件掛載時初始化
initSidebarState()
</script>

<style scoped>
/* 整体布局 */
.app-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 侧边栏样式 */
.sidebar {
  width: 220px;
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
  transition: all 0.3s ease;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
}

.sidebar-collapsed {
  width: 64px;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.logo-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  padding: 8px 16px;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logo-content:hover {
  background-color: transparent;
  color: var(--el-color-primary);
}

.logo-image {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: center;
}

.logo-img {
  max-width: 40px;
  max-height: 40px;
  object-fit: contain;
  transition: all 0.3s ease;
  border-radius: 50%;
  background-color: var(--el-bg-color-page);
  padding: 4px;
}

.logo-content:hover .logo-img {
  opacity: 0.8;
}

.logo-text {
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.3s ease;
  cursor: pointer;
  align-self: center;
  line-height: 1;
}

.logo-content:hover .logo-text {
  color: var(--el-color-primary);
}

/* 菜单切換按鈕容器 */
.menu-toggle-container {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

.menu-toggle-btn {
  color: var(--el-text-color-regular);
  padding: 6px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
  width: 100%;
  justify-content: center;
}

.menu-toggle-btn:hover {
  background-color: transparent;
  color: var(--el-color-primary);
}

.menu-toggle-btn-collapsed {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.sidebar-menu {
  border-right: none;
  padding: 8px;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

.sidebar-menu .el-menu-item,
.sidebar-menu .el-sub-menu__title {
  height: 44px;
  line-height: 44px;
  border-radius: 4px;
  margin: 2px 0;
  transition: all 0.3s ease;
}

.sidebar-menu .el-menu-item:hover,
.sidebar-menu .el-sub-menu__title:hover {
  background-color: transparent !important;
  color: var(--el-color-primary) !important;
}

/* 強制覆蓋 Element Plus 默認樣式 */
:deep(.sidebar-menu .el-menu-item:hover) {
  background-color: transparent !important;
  color: var(--el-color-primary) !important;
}

:deep(.sidebar-menu .el-sub-menu__title:hover) {
  background-color: transparent !important;
  color: var(--el-color-primary) !important;
}

/* 覆蓋所有可能的 hover 樣式 */
:deep(.el-menu--popup .el-menu-item:hover) {
  background-color: transparent !important;
  color: var(--el-color-primary) !important;
}

:deep(.el-sub-menu .el-menu-item:hover) {
  background-color: transparent !important;
  color: var(--el-color-primary) !important;
}

:deep(.el-menu .el-sub-menu__title:hover) {
  background-color: transparent !important;
  color: var(--el-color-primary) !important;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: var(--el-color-primary-light-9) !important;
  color: var(--el-color-primary) !important;
}

.sidebar-menu .el-sub-menu .el-menu-item {
  min-width: 0;
  padding-left: 50px !important;
}

/* 顶部导航栏 */
.top-bar {
  height: 64px;
  background-color: var(--el-bg-color-page);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 10;
  transition: all 0.3s ease;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 20px;
  transition: all 0.3s;
}

.user-profile:hover {
  background-color: var(--el-bg-color-page);
}

.username {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
}

.content-wrapper {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: var(--el-bg-color-page);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 64px;
  }
  
  .sidebar-collapsed {
    width: 64px;
  }

  .logo-content,
  .sidebar-menu span {
    display: none;
  }

  .sidebar-menu .el-sub-menu > .el-sub-menu__title > .el-sub-menu__icon-arrow {
    display: none;
  }
}

/* Element Plus 菜单折叠状态优化 */
:deep(.el-menu--collapse) {
  width: 64px;
}

:deep(.el-menu--collapse .el-sub-menu__title span) {
  display: none;
}

:deep(.el-menu--collapse .el-sub-menu__title .el-sub-menu__icon-arrow) {
  display: none;
}

:deep(.el-menu--collapse .el-menu-item span) {
  display: none;
}

:deep(.el-menu--collapse .el-menu-item) {
  padding-left: 20px !important;
}

:deep(.el-menu--collapse .el-sub-menu .el-menu-item) {
  padding-left: 20px !important;
  background-color: var(--el-bg-color-page) !important;
}
</style>