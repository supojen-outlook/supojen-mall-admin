<template>
  <div class="login-page">
    <div class="left-panel">
      <img src="/logo.png" alt="Logo" class="logo-image" />
    </div>
    <div class="right-panel">
      <div class="login-form">
        <h1 class="welcome-title">歡迎回來</h1>
        <p class="subtitle">請輸入您的詳細資訊以登入帳戶。</p>
        
        <el-form :model="loginForm" label-position="top">
          <el-form-item label="電子郵件地址">
            <el-input 
              v-model="loginForm.email" 
              placeholder="@name@company.com"
              size="large"
              :prefix-icon="Message"
            />
          </el-form-item>
          
          <el-form-item label="密碼">
            <el-input 
              v-model="loginForm.password" 
              type="password"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <div class="form-spacer"></div>
          
          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              class="signin-btn"
              @click="handleSignIn"
              :loading="isLoading"
              :disabled="isLoading"
            >
              登入
            </el-button>
          </el-form-item>
        </el-form>
        
        <el-divider>
          <span class="divider-text">或繼續使用</span>
        </el-divider>
        
        <el-button 
          size="large" 
          class="line-login-btn"
          @click="handleLineLogin"
        >
          <template #icon>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#00C300" d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.599.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771z"/>
              <path fill="#00C300" d="M11.568 8.108c0-.345.282-.63.63-.63h3.255c.346 0 .627.285.627.63 0 .349-.281.63-.627.63h-1.144v4.141h1.144c.346 0 .627.285.627.629 0 .344-.281.629-.627.629h-3.255c-.348 0-.63-.285-.63-.629 0-.345.282-.629.63-.629h1.145V8.738h-1.145c-.348 0-.63-.281-.63-.63zm-3.823 2.625c-.349 0-.63.285-.63.631 0 .345.281.63.63.63h1.756v1.125H7.745c-.349 0-.63.283-.63.63 0 .344.281.629.63.629h2.386c.345 0 .627-.285.627-.629V8.108c0-.345-.282-.63-.627-.63H7.745c-.349 0-.63.285-.63.63 0 .349.281.63.63.63h1.756v1.125H7.745z"/>
            </svg>
          </template>
          使用 LINE 登入
        </el-button>
        
        <div class="register-link">
          <span>還沒有帳戶？</span>
          <el-link type="primary" :underline="false" @click="goToSignup">註冊帳戶</el-link>
        </div>
        
        <div class="forgot-password-link">
          <el-link type="primary" :underline="false" @click="goToResetPassword">忘記密碼？</el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Message, Lock } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { signIn } from '@/services'
import { ElMessage } from 'element-plus'
import { API_CONFIG } from '@/services/Request'

const router = useRouter()

const isLoading = ref(false)

const loginForm = reactive({
  email: '',
  password: ''
})

const handleSignIn = async () => {
  isLoading.value = true
  try {
    await signIn({ 
      email: loginForm.email,
      password: loginForm.password
    })

    ElMessage.success('登入成功')
    router.push('/')
  } catch(error: any) {
    ElMessage.error(error.message)
  } finally {
    isLoading.value = false
  }
}

const handleLineLogin = () => {
  const redirectUri = encodeURIComponent(`${window.location.origin}/`)
  window.location.href = `${API_CONFIG.BASE_URL}/api/account/signin/line?redirectUri=${redirectUri}`
}

const goToSignup = () => {
  router.push('/signup')
}

const goToResetPassword = () => {
  router.push('/reset-password')
}
</script>

<style scoped>
.login-page {
  width: 100vw;
  height: 100vh;
  display: flex;
}

.left-panel {
  flex: 1;
  background-image: url('/background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
}


.logo-image {
  max-width: 300px;
  height: auto;
  margin-bottom: 20px;
}

.company-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin: 0;
  line-height: 1.4;
}

.right-panel {
  flex: 1;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-form {
  width: 100%;
  max-width: 400px;
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 32px;
  line-height: 1.5;
}

.signin-btn {
  width: 100%;
}

.divider-text {
  font-size: 12px;
  color: #999;
}

.line-login-btn {
  width: 100%;
  background-color: #52B542;
  color: white;
  border-color: #52B542;
}

.line-login-btn:hover {
  background-color: #4CAF50;
  border-color: #4CAF50;
}

.form-spacer {
  height: 20px;
}

.register-link {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-top: 16px;
}

.forgot-password-link {
  text-align: center;
  font-size: 13px;
  color: #666;
  margin-top: 10px;
}
</style>
