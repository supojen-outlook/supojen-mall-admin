import type { Profile } from "@/model"
import { request } from "./Request"


/**
 * 获取用户资料
 * @returns 返回用户资料
 */
export async function getProfile(): Promise<Profile> {
  return await request<Profile>('/api/profile', 'GET')
}

/**
 * 用户登录
 * @param username 用户名
 * @param password 密码
 * @returns 返回登录结果，包含用户信息和认证令牌
 * @throws 当登录失败时抛出错误
 */
export async function signIn(params:{
  email: string, 
  password: string
}): Promise<void> {
  return await request<void>('/api/signin', 'POST', params)
}

/**
 * 用户登出
 * @returns 返回登出结果
 */
export async function signOut(): Promise<void> {
  return await request<void>('/api/signout', 'POST')
}

/**
 * 用户注册
 * @param params 注册参数
 * @param params.email 邮箱
 * @returns 返回注册结果
 */
export async function signUp(params:{
  email: string, 
}): Promise<void> {
  return await request<void>('/api/signup', 'GET', params)
}

/**
 * 用户注册确认
 * @param params 注册确认参数
 * @param params.email 邮箱
 * @param params.password 密码
 * @param params.passwordConfirmed 确认密码
 * @param params.code 验证码
 * @returns 返回注册确认结果
 */
export async function signUpConfirm(params:{
  email: string, 
  password: string,
  passwordConfirmed: string,
  code: string
}): Promise<void> {
  return await request<void>('/api/signup/confirmed', 'POST', params)
}

/**
 * 重置密码
 * @param params 重置密码参数
 * @param params.email 邮箱
 * @returns 返回重置密码结果
 */
export async function resetPassword(params:{
  email: string,
}): Promise<void> {
  return await request<void>('/api/reset-password', 'GET', params)
}

/**
 * 重置密码确认
 * @param params 重置密码确认参数
 * @param params.email 邮箱
 * @param params.password 密码
 * @param params.passwordConfirmed 确认密码
 * @param params.code 验证码
 * @returns 返回重置密码确认结果
 */
export async function resetPasswordConfirm(params:{
  email: string,
  password: string,
  passwordConfirmed: string,
  code: string
}): Promise<void> {
  return await request<void>('/api/reset-password/confirmed', 'POST', params)
}