<template>
  <div class="orders-management-page">
    <div class="page-header">
      <h1>訂單管理</h1>
    </div>

    <div class="orders-container">
      <el-card class="orders-list">
        <template #header>
          <div class="card-header">
            <span>訂單列表</span>
            <div class="header-actions">
              <el-select
                v-model="filters.status"
                placeholder="訂單狀態"
                clearable
                style="width: 140px"
                @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="已建立" value="created" />
                <el-option label="已付款" value="paid" />
                <el-option label="已出貨" value="shipped" />
                <el-option label="已完成" value="completed" />
                <el-option label="已關閉" value="closed" />
              </el-select>
              <el-input
                v-model="filters.search"
                placeholder="搜尋訂單編號..."
                clearable
                style="width: 220px"
                @clear="handleSearch"
                @keyup.enter="handleSearch">
                <template #prefix>
                  <i class="ri-search-line"></i>
                </template>
              </el-input>
            </div>
          </div>
        </template>

        <el-table
          v-loading="loading"
          :data="items"
          row-key="id"
          @sort-change="handleSortChange"
          @expand-change="handleExpandChange">
          <el-table-column type="expand" width="40">
            <template #default="{ row }">
              <div class="order-detail">
                <!-- 加載中提示 -->
                <div v-if="row._detailLoading" class="detail-loading">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  <span>加載中...</span>
                </div>
                
                <!-- 訂單項目 -->
                <div class="detail-section">
                  <h4>訂單項目</h4>
                  <el-table :data="row.orderItems || []" size="small" class="detail-table">
                    <el-table-column label="商品圖片" width="80">
                      <template #default="{ row: item }">
                        <el-image 
                          v-if="item.productImageUrl" 
                          :src="item.productImageUrl" 
                          :preview-src-list="[item.productImageUrl]"
                          fit="cover"
                          class="product-image"
                        />
                        <div v-else class="no-image">-</div>
                      </template>
                    </el-table-column>
                    <el-table-column prop="productName" label="商品名稱" min-width="150" />
                    <el-table-column prop="unitPrice" label="單價" width="100">
                      <template #default="{ row: item }">
                        ${{ item.unitPrice }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="quantity" label="數量" width="80" />
                    <el-table-column prop="status" label="狀態" width="100">
                      <template #default="{ row: item }">
                        <el-tag :type="getItemStatusType(item.status)" size="small">
                          {{ getItemStatusLabel(item.status) }}
                        </el-tag>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>

                <!-- 付款記錄 -->
                <div class="detail-section" v-if="row.payments && row.payments.length > 0">
                  <h4>付款記錄</h4>
                  <el-table :data="row.payments || []" size="small" class="detail-table">
                    <el-table-column prop="method" label="付款方式" width="120">
                      <template #default="{ row: payment }">
                        {{ getPaymentMethodLabel(payment.method) }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="amount" label="金額" width="100">
                      <template #default="{ row: payment }">
                        ${{ payment.amount }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="status" label="狀態" width="100">
                      <template #default="{ row: payment }">
                        <el-tag :type="getPaymentStatusType(payment.status)" size="small">
                          {{ getPaymentStatusLabel(payment.status) }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="transactionId" label="交易編號" min-width="150" />
                  </el-table>
                </div>

                <!-- 物流信息 -->
                <div class="detail-section">
                  <div class="section-header">
                    <h4>物流信息</h4>
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="openShipmentForm(row, row.shipments && row.shipments.length > 0 ? row.shipments[0] : null)"
                    >
                      {{ row.shipments && row.shipments.length > 0 ? '編輯' : '新增' }}
                    </el-button>
                  </div>
                  <el-table v-if="row.shipments && row.shipments.length > 0" :data="row.shipments" size="small" class="detail-table">
                    <el-table-column prop="method" label="物流方式" width="120">
                      <template #default="{ row: shipment }">
                        {{ getShipmentMethodLabel(shipment.method) }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="trackingNumber" label="追蹤編號" width="150" />
                    <el-table-column prop="shipDate" label="出貨日期" width="150">
                      <template #default="{ row: shipment }">
                        {{ formatDateTime(shipment.shipDate) }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="recipientName" label="收件人" width="100" />
                    <el-table-column prop="recipientPhone" label="電話" width="120" />
                    <el-table-column prop="shippingAddress" label="地址" min-width="200" />
                  </el-table>
                  <div v-else class="no-data">暫無物流信息</div>
                </div>

              </div>
            </template>
          </el-table-column>

          <el-table-column
            prop="orderNumber"
            label="訂單編號"
            min-width="150"
            sortable="custom">
            <template #default="{ row }">
              <el-tooltip effect="dark" placement="top">
                <template #content>
                  <div>訂單 ID: {{ row.id }}</div>
                  <div>顧客: {{ row.user?.displayName || 'User #' + row.userId }}</div>
                  <div>商品數: {{ row.itemCount || row.orderItems?.length || '-' }}</div>
                </template>
                <span class="order-number">{{ row.orderNumber }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            label="訂單狀態"
            width="100">
            <template #default="{ row }">
              <el-tag :type="getOrderStatusType(row.status)" effect="plain">
                {{ getOrderStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="totalAmount"
            label="總金額"
            width="120"
            sortable="custom">
            <template #default="{ row }">
              <span class="amount">${{ row.totalAmount }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="discountAmount"
            label="折扣"
            width="100">
            <template #default="{ row }">
              <span v-if="row.discountAmount > 0" class="discount">-${{ row.discountAmount }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="shippingAmount"
            label="運費"
            width="100">
            <template #default="{ row }">
              <span v-if="row.shippingAmount > 0">${{ row.shippingAmount }}</span>
              <span v-else class="free-shipping">免運</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="userId"
            label="顧客 ID"
            width="150">
            <template #default="{ row }">
              <el-button link type="primary" @click="viewUser(row.userId)">
                #{{ row.userId }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column
            prop="createdAt"
            label="建立時間"
            width="200"
            sortable="custom">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            :current-page="pagination.currentPage"
            :page-size="pagination.pageSize"
            :page-count="pagination.hasMore ? pagination.currentPage + 1 : pagination.currentPage"
            :disabled="loading || pagination.isLoading"
            :page-sizes="[10, 20, 30, 50]"
            layout="sizes, prev, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :pager-count="5"
            :hide-on-single-page="false" />
        </div>
      </el-card>
    </div>

    <!-- 物流信息表單 -->
    <ShipmentForm
      v-model="shipmentFormVisible"
      :order-id="currentOrderId"
      :shipment="currentShipment"
      @submit="handleShipmentSubmit"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, nextTick, ref } from 'vue'
import { ElMessage, ElIcon } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { getOrders, getOrderItems, getOrderPayment, getOrderShipment, updateOrderShipment } from '@/services'
import type { Order, OrderItem, Payment, Shipment, Pagination } from '@/model'
import { usePagination } from '@/composables/usePagination'
import ShipmentForm from '@/components/ShipmentForm.vue'

// 擴展的訂單類型，包含詳細信息
interface ExtendedOrder extends Order {
  orderItems?: OrderItem[]
  payments?: Payment[]
  shipments?: Shipment[]
  _detailLoaded?: boolean
  _detailLoading?: boolean
}

// Use pagination
const {
  items,
  loading,
  filters,
  pagination,
  loadItems,
  handleSearch,
  handleCurrentChange,
  handleSizeChange,
  handleSortChange,
} = usePagination<ExtendedOrder>({
  fetchList: getOrders,
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'desc',
  defaultFilters: {
    search: '',
    status: ''
  }
})

// Lifecycle
onMounted(() => {
  loadItems()
})

// 處理展開行，加載詳細信息
const handleExpandChange = async (row: ExtendedOrder, expandedRows: ExtendedOrder[]) => {
  const isExpanded = expandedRows.some(r => r.id === row.id)
  
  // 只在展開且未加載且未在加載中時才加載
  if (isExpanded && !row._detailLoaded && !row._detailLoading) {
    row._detailLoading = true
    
    try {
      const [orderItemsResult, paymentResult, shipment] = await Promise.all([
        getOrderItems(row.id),
        getOrderPayment(row.id),
        getOrderShipment(row.id)
      ])
      
      // 使用 nextTick 延遲數據更新，等展開動畫完成
      await nextTick()
      
      // 從 Pagination 中提取 list 字段，付款和物流為單個對象轉為數組
      row.orderItems = (orderItemsResult as Pagination<OrderItem>).list || []
      row.payments = paymentResult ? [paymentResult as Payment] : []
      // 物流為單個對象，轉為數組
      row.shipments = shipment ? [shipment as Shipment] : []
      row._detailLoaded = true
    } catch (error) {
      ElMessage.error('加載訂單詳情失敗')
    } finally {
      row._detailLoading = false
    }
  }
}


// 查看用戶
const viewUser = (userId: number) => {
  // TODO: 導航到用戶詳情頁
  console.log('查看用戶:', userId)
}


// 物流表單相關
const shipmentFormVisible = ref(false)
const currentOrderId = ref<number>(0)
const currentShipment = ref<Shipment | null>(null)
const currentOrderRow = ref<ExtendedOrder | null>(null)

const openShipmentForm = (order: ExtendedOrder, shipment: Shipment | null = null) => {
  currentOrderId.value = order.id
  currentShipment.value = shipment
  currentOrderRow.value = order
  shipmentFormVisible.value = true
}

const handleShipmentSubmit = async (formData: any) => {
  try {
    await updateOrderShipment({
      orderId: formData.orderId,
      method: formData.method,
      trackingNumber: formData.trackingNumber,
      shippingAddress: formData.shippingAddress,
      recipientName: formData.recipientName,
      recipientPhone: formData.recipientPhone
    })
    ElMessage.success(currentShipment.value ? '物流信息已更新' : '物流信息已創建')
    
    // 刷新當前訂單的物流信息
    if (currentOrderRow.value) {
      const newShipment = await getOrderShipment(currentOrderRow.value.id)
      currentOrderRow.value.shipments = newShipment ? [newShipment] : []
    }
  } catch (error) {
    ElMessage.error('操作失敗，請重試')
  }
}

// 訂單狀態標籤
const getOrderStatusType = (status: string) => {
  const types: Record<string, string> = {
    created: 'info',
    paid: 'primary',
    shipped: 'warning',
    completed: 'success',
    closed: 'danger'
  }
  return types[status] || 'info'
}

const getOrderStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    created: '已建立',
    paid: '已付款',
    shipped: '已出貨',
    completed: '已完成',
    closed: '已關閉'
  }
  return labels[status] || status
}

// 訂單項目狀態標籤
const getItemStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'info',
    shipped: 'warning',
    refunded: 'danger',
    cancelled: 'danger'
  }
  return types[status] || 'info'
}

const getItemStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待處理',
    shipped: '已出貨',
    refunded: '已退款',
    cancelled: '已取消'
  }
  return labels[status] || status
}

// 付款方式標籤
const getPaymentMethodLabel = (method: string | null) => {
  if (!method) return '-'
  const labels: Record<string, string> = {
    credit_card_one_time: '一次付清',
    atm_virtual: '虛擬帳號',
    taiwan_pay: '台灣支付',
    cash: '現金'
  }
  return labels[method] || method
}

const getPaymentStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'info',
    paid: 'success',
    failed: 'danger',
    refunded: 'warning'
  }
  return types[status] || 'info'
}

const getPaymentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '處理中',
    paid: '已付款',
    failed: '失敗',
    refunded: '已退款'
  }
  return labels[status] || status
}

// 物流方式標籤
const getShipmentMethodLabel = (method: string | null) => {
  if (!method) return '-'
  const labels: Record<string, string> = {
    post: '中華郵政',
    seven: '7-11',
    family: '全家',
    hilife: '萊爾富',
    ok: 'OK Mart',
    tcat: '黑貓',
    ecam: '宅配通'
  }
  return labels[method] || method
}

// 格式化日期時間
const formatDateTime = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}
</script>

<style scoped>
.orders-management-page {
  padding: 5px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.orders-container {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.order-number {
  font-weight: 600;
  color: var(--el-color-primary);
}

.amount {
  font-weight: 600;
  color: var(--el-color-danger);
}

.discount {
  color: var(--el-color-success);
}

.free-shipping {
  color: var(--el-color-success);
  font-size: 12px;
}

.order-detail {
  padding: 20px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: var(--el-text-color-primary);
  border-left: 3px solid var(--el-color-primary);
  padding-left: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-header h4 {
  margin: 0;
}

.detail-table {
  background-color: white;
  border-radius: 4px;
}

.detail-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: var(--el-text-color-secondary);
}

.shipment-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.shipment-info:last-child {
  margin-bottom: 0;
}

.tracking-number {
  font-size: 12px;
  color: var(--el-text-color-regular);
  font-family: monospace;
}

.no-shipment {
  color: var(--el-text-color-secondary);
}

.loading-shipment {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.no-data {
  padding: 20px;
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.product-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  cursor: pointer;
}

.no-image {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
