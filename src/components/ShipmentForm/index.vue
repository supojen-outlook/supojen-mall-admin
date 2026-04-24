<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '編輯物流信息' : '新增物流信息'"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="物流方式" prop="method">
        <el-select v-model="form.method" placeholder="請選擇物流方式" style="width: 100%">
          <el-option label="中華郵政" value="post" />
          <el-option label="7-11" value="seven" />
          <el-option label="全家" value="family" />
          <el-option label="萊爾富" value="hilife" />
          <el-option label="OK Mart" value="ok" />
          <el-option label="黑貓" value="tcat" />
          <el-option label="宅配通" value="ecam" />
        </el-select>
      </el-form-item>

      <el-form-item label="追蹤編號" prop="trackingNumber">
        <el-input v-model="form.trackingNumber" placeholder="請輸入追蹤編號" />
      </el-form-item>

      <el-form-item label="收件人姓名" prop="recipientName">
        <el-input v-model="form.recipientName" placeholder="請輸入收件人姓名" />
      </el-form-item>

      <el-form-item label="收件人電話" prop="recipientPhone">
        <el-input v-model="form.recipientPhone" placeholder="請輸入收件人電話" />
      </el-form-item>

      <el-form-item label="寄送地址" prop="shippingAddress">
        <el-input
          v-model="form.shippingAddress"
          type="textarea"
          :rows="2"
          placeholder="請輸入寄送地址"
        />
      </el-form-item>

      <el-form-item label="出貨日期" prop="shipDate">
        <el-date-picker
          v-model="form.shipDate"
          type="date"
          placeholder="請選擇出貨日期"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="送達日期" prop="deliveredDate">
        <el-date-picker
          v-model="form.deliveredDate"
          type="date"
          placeholder="請選擇送達日期"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          確認
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Shipment, ShipmentMethod } from '@/model'

interface FormData {
  id?: number
  orderId: number
  method: ShipmentMethod | null
  trackingNumber: string
  recipientName: string
  recipientPhone: string
  shippingAddress: string
  shipDate: Date | null
  deliveredDate: Date | null
}

const props = defineProps<{
  modelValue: boolean
  orderId: number
  shipment?: Shipment | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: FormData): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.shipment)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const form = reactive<FormData>({
  orderId: props.orderId,
  method: null,
  trackingNumber: '',
  recipientName: '',
  recipientPhone: '',
  shippingAddress: '',
  shipDate: null,
  deliveredDate: null
})

const rules: FormRules = {
  method: [{ required: true, message: '請選擇物流方式', trigger: 'change' }],
  trackingNumber: [{ required: true, message: '請輸入追蹤編號', trigger: 'blur' }],
  recipientName: [{ required: true, message: '請輸入收件人姓名', trigger: 'blur' }],
  recipientPhone: [{ required: true, message: '請輸入收件人電話', trigger: 'blur' }],
  shippingAddress: [{ required: true, message: '請輸入寄送地址', trigger: 'blur' }],
  shipDate: [{ required: false, message: '請選擇出貨日期', trigger: 'change' }]
}

const resetForm = () => {
  form.id = undefined
  form.method = null
  form.trackingNumber = ''
  form.recipientName = ''
  form.recipientPhone = ''
  form.shippingAddress = ''
  form.shipDate = null
  form.deliveredDate = null
}

const handleClose = () => {
  visible.value = false
  resetForm()
  formRef.value?.resetFields()
}

// 当 shipment 数据变化时，更新表单
watch(() => props.shipment, (newShipment) => {
  if (newShipment) {
    form.id = newShipment.id
    form.method = newShipment.method
    form.trackingNumber = newShipment.trackingNumber || ''
    form.recipientName = newShipment.recipientName
    form.recipientPhone = newShipment.recipientPhone
    form.shippingAddress = newShipment.shippingAddress || ''
    form.shipDate = newShipment.shipDate ? new Date(newShipment.shipDate) : null
    form.deliveredDate = newShipment.deliveredDate ? new Date(newShipment.deliveredDate) : null
  } else {
    resetForm()
  }
}, { immediate: true })

// 当 orderId 变化时更新
watch(() => props.orderId, (newOrderId) => {
  form.orderId = newOrderId
})

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', { ...form })
      handleClose()
    }
  })
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
