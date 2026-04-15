import { createApp } from 'vue'
import App from './App.vue'

import ElementPlus from 'element-plus'                         // 導入Element Plus
import * as ElementPlusIconsVue from '@element-plus/icons-vue' // 導入圖標模塊
import 'element-plus/dist/index.css'                           // 導入樣式表
import './style.css'                                           // 導入自定義樣式
import { createPinia } from 'pinia'                            // 導入 Pinia
import { router } from './base'                                // 導入路由
import { initAntiforgery } from '@/services/antiforgery'

// ⭐ 啟動時獲取一次防偽令牌 
initAntiforgery(); 

// 創建應用
const app = createApp(App)
// 加載 ElementPlus 模塊 
app.use(ElementPlus)
// 循環遍歷所有圖標組件，將其註冊為全局組建進行使用
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
   app.component(key, component)
}
// 註冊路由
app.use(router)
// 註冊 Pinia
app.use(createPinia())

// 掛載應用
app.mount('#app')
