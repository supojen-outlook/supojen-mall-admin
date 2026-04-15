export type MembershipLevel = 'bronze' | 'silver' | 'gold' | 'vip';

/**
 * Profile API 回應模型
 * 
 * @property points - 用戶積分
 * @property id - 用戶ID
 * @property status - 用戶狀態
 * @property displayName - 顯示名稱
 * @property fullName - 用戶全名
 * @property birthDate - 生日
 * @property gender - 性別
 * @property avatar - 頭像URL
 * @property email - 電子郵件
 * @property emailVerified - 郵件是否已驗證
 * @property membershipLevel - 會員等級
 * @property note - 備註
 */
export interface Profile {
  points: number;
  id: number;
  status: string;
  displayName: string;
  fullName: string;
  birthDate: string;
  gender: string | null;
  avatar: string;
  email: string;
  emailVerified: boolean;
  membershipLevel: MembershipLevel;
  note: string | null;
}