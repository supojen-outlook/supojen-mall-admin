import type { Pagination, User, MembershipLevel } from '@/model'
import { request } from './Request'

/**
 * 查詢用戶列表
 * 
 * @param params - 查詢參數
 * @param params.size - 每頁大小，預設 20
 * @param params.cursor - 分頁遊標，用於獲取下一頁
 * @param params.search - 搜索關鍵字，可搜索用戶名稱、郵箱
 * @param params.status - 用戶狀態，用於篩選
 * @param params.membershipLevel - 會員等級：bronze青銅、silver白銀、gold黃金、vip尊榮
 * @returns Promise<Pagination<User>> - 分頁的用戶列表
 */
export async function getUsers(params?: {
  size?: number;
  cursor?: string;
  search?: string;
  status?: string;
  membershipLevel?: MembershipLevel;
}): Promise<Pagination<User>> {
  // 過濾掉空值、null 和 undefined 的參數
  const filteredParams = params ? Object.fromEntries(
    Object.entries(params).filter(([_, value]) => 
      value !== undefined && value !== null && value !== ''
    )
  ) : {};
  
  return await request<Pagination<User>>('/api/users', 'GET', filteredParams)
}

/**
 * 新增用戶
 * 
 * @param data - 用戶數據
 * @param data.displayName - 顯示名稱，必填
 * @param data.fullName - 用戶全名，必填
 * @param data.email - 電子郵件，必填
 * @param data.password - 密碼，必填
 * @param data.birthDate - 生日，格式 YYYY-MM-DD
 * @param data.gender - 性別
 * @param data.avatar - 頭像 URL
 * @param data.membershipLevel - 會員等級：bronze、silver、gold、vip
 * @param data.status - 用戶狀態
 * @param data.note - 備註
 * @returns Promise<User> - 創建成功的完整用戶信息
 */
export async function createUser(data: {
  displayName: string;
  fullName: string;
  email: string;
  password: string;
  birthDate?: string;
  gender?: string | null;
  avatar?: string;
  membershipLevel?: MembershipLevel;
  status?: string;
  note?: string | null;
}): Promise<User> {
  return await request<User>('/api/users', 'POST', data)
}

/**
 * 更新用戶資料
 * 
 * @param data - 用戶更新數據
 * @param data.id - 用戶 ID，必填
 * @param data.displayName - 顯示名稱
 * @param data.fullName - 用戶全名
 * @param data.email - 電子郵件
 * @param data.birthDate - 生日，格式 YYYY-MM-DD
 * @param data.gender - 性別
 * @param data.avatar - 頭像 URL
 * @param data.membershipLevel - 會員等級：bronze、silver、gold、vip
 * @param data.status - 用戶狀態
 * @param data.note - 備註
 * @returns Promise<User> - 更新成功的完整用戶信息
 */
export async function updateUser(data: {
  id: number;
  displayName?: string;
  fullName?: string;
  email?: string;
  birthDate?: string;
  gender?: string | null;
  avatar?: string;
  membershipLevel?: MembershipLevel;
  status?: string;
  note?: string | null;
}): Promise<User> {
  return await request<User>('/api/users', 'PUT', data)
}
