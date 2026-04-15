/**
 * 促銷活動回應模型
 * 促銷活動實體，用於管理系統中的各種行銷活動與限制
 * @property id - 促銷活動唯一識別碼
 * @property name - 促銷活動名稱
 * @property description - 促銷活動描述
 * @property startDate - 促銷開始時間 (ISO 8601 格式)
 * @property endDate - 促銷結束時間 (ISO 8601 格式)
 * @property channel - 適用通路：app行動版/web網頁版/all全部
 * @property userScope - 適用會員：all全部/bronze青銅/silver白銀/gold黃金/vip尊榮
 * @property limitPerUser - 每人可使用次數，null 表示不限制
 * @property limitTotal - 總可使用次數，null 表示不限制
 * @property usedCount - 目前已使用次數
 * @property status - 促銷活動狀態：draft草稿/active啟用/expired過期/disabled停用
 * @property createdAt - 記錄建立時間 (ISO 8601 格式)
 */
export interface Promotion {
  id: number;
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  channel: 'app' | 'web' | 'all';
  userScope: 'all' | 'bronze' | 'silver' | 'gold' | 'vip';
  limitPerUser: number | null;
  limitTotal: number | null;
  usedCount: number;
  status: 'draft' | 'active' | 'expired' | 'disabled';
  createdAt: string;
}