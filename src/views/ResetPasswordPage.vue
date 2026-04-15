<template>
  <div class="reset-password-page">
    <div class="reset-password-panel">
      <div class="logo-container">
        <img src="/logo.png" alt="Logo" class="company-logo" />
      </div>
      <h2>重設密碼</h2>
      <p class="subtitle">請輸入您的電子郵件以重設密碼</p>

      <el-form :model="resetForm" label-position="top">
        <el-form-item label="電子郵件地址">
          <div class="email-input-wrapper">
            <el-input 
              v-model="resetForm.email" 
              placeholder="name@company.com"
              size="large"
              :prefix-icon="Message"
            />
            <el-button 
              type="primary" 
              size="large"
              class="get-code-btn"
              :loading="isGettingCode"
              @click="handleGetCode"
            >
              獲取驗證碼
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="驗證碼">
          <el-input 
            v-model="resetForm.verificationCode" 
            placeholder="6位數驗證碼"
            size="large"
            :prefix-icon="Lock"
          />
        </el-form-item>

        <el-form-item label="新密碼">
          <el-input 
            v-model="resetForm.password" 
            type="password"
            placeholder="********"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item label="確認新密碼">
          <el-input 
            v-model="resetForm.confirmPassword" 
            type="password"
            placeholder="********"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            class="reset-btn"
            :loading="isResetting"
            @click="handleReset"
          >
            重設密碼
          </el-button>
        </el-form-item>
      </el-form>

      <p class="login-link">
        記起密碼了？ 
        <el-link type="primary" :underline="false" @click="goToLogin">返回登入</el-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Message, Lock } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { 
  resetPassword,
  resetPasswordConfirm
} from '@/services'
import { ElMessage } from 'element-plus'

const router = useRouter()

const isGettingCode = ref(false)
const isResetting = ref(false)

const resetForm = reactive({
  email: '',
  verificationCode: '',
  password: '',
  confirmPassword: ''
})

const handleGetCode = async () => {
  isGettingCode.value = true
  try {
    await resetPassword({ email: resetForm.email })
    ElMessage.success('驗證碼已發送')
  } catch(error: any) {
    ElMessage.error(error.message)
  } finally {
    isGettingCode.value = false
  }
}

const handleReset = async () => {
  isResetting.value = true
  try {
    await resetPasswordConfirm({
      email: resetForm.email,
      password: resetForm.password,
      passwordConfirmed: resetForm.confirmPassword,
      code: resetForm.verificationCode
    })
    ElMessage.success('密碼重設成功')
    router.push('/login')
  } catch(error: any) {
    ElMessage.error(error.message)
  } finally {
    isResetting.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.reset-password-page {
  width: 100vw;
  height: 100vh;
  background-image: url('/background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
}

.reset-password-panel {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.logo-container {
  margin-bottom: 10px;
}

.company-logo {
  max-width: 80px;
  height: auto;
}

h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.subtitle {
  font-size: 13px;
  color: #666;
  margin-bottom: 16px;
}

.email-input-wrapper {
  display: flex;
  gap: 8px;
}

.email-input-wrapper .el-input {
  flex: 1;
}

.get-code-btn {
  white-space: nowrap;
}

.reset-btn {
  width: 100%;
}

.login-link {
  font-size: 13px;
  color: #666;
  margin-top: 12px;
}
</style>
