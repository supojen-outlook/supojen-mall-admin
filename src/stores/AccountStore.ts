import { defineStore } from "pinia";
import type {
  Profile
} from '@/model/index'

// 持久化處存的鍵名
const localStoreageKey = 'user.profile'

export default defineStore('account', {
  // 帳戶狀態數據 
  state: () => {

    // 嘗試讀取本地緩存數據
    const savedProfile = localStorage.getItem(localStoreageKey);
    let profile: Profile | null = null
    if (savedProfile != null) {
      // 將數據轉換為對象
      profile = JSON.parse(savedProfile);
    }   

    return {
      profile
    };
  },

  // 計算數據
  getters: {
    // 帳戶是否已登錄
    isLogin: (state): boolean => {
      return state.profile != null 
    }
  },


  // 定義行為
  actions: {
    // 登入行為
    login(info: Profile) {
      // 儲存用戶信息到內存
      this.profile = info
      // 將用戶信息存儲至本地緩存
      localStorage.setItem(localStoreageKey, JSON.stringify(info))
    },
    // 登出行為
    logout() {
      this.profile = null
      localStorage.removeItem(localStoreageKey)
    }
  }
});