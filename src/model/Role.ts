/**
 * Role API 回應模型
 * 
 * 角色實體，用於定義系統中的使用者角色權限
 * 
 * @property id - 角色唯一識別碼
 * @property code - 角色編碼
 * @property name - 角色名稱
 * @property description - 角色描述
 */
export interface Role {
  id: number;
  code: string;
  name: string;
  description: string | null;
}
