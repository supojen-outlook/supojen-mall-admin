import type { Pagination, Role } from "@/model";
import { request } from "./Request";



/**
 * 獲取角色列表
 * @param params 獲取角色列表參數
 * @param params.cursor 分頁游標
 * @param params.size 分頁大小
 * @param params.search 搜索關鍵字
 * @returns 返回角色列表
 */
export async function getRoles(params:{
  cursor?: string;
  size?: number;
  search?: string;
}): Promise<Pagination<Role>> {
  return await request<Pagination<Role>>(`/api/users/roles`, 'get', params);
}