import type { PickItem } from "@/model";
import { request } from "./Request";


/**
 * 獲取訂單揀貨項目列表
 * @param params 獲取揀貨項目參數
 * @param params.orderId 訂單 ID，必填
 * @returns 返回揀貨項目列表
 */
export async function getPickItems(params: {
  orderId: number;
}): Promise<PickItem[]> {
  return await request<PickItem[]>(`/api/orders/pick-items`, 'get', params);
}
