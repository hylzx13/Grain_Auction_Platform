import { secureStorage } from '../services/securityService';
import { UserInfo } from '../types/user';

// Token和用户信息存储键
const TOKEN_KEY = 'grain_auction_token';
const USER_INFO_KEY = 'grain_auction_user_info';

// 获取认证token
export const getToken = (): string | null => {
  return secureStorage.getItem(TOKEN_KEY);
};

// 设置认证token
export const setToken = (token: string): void => {
  secureStorage.setItem(TOKEN_KEY, token);
};

// 移除认证token
export const removeToken = (): void => {
  secureStorage.removeItem(TOKEN_KEY);
};

// 获取用户信息
export const getUserInfo = (): UserInfo | null => {
  return secureStorage.getItem(USER_INFO_KEY);
};

// 设置用户信息
export const setUserInfo = (userInfo: UserInfo): void => {
  secureStorage.setItem(USER_INFO_KEY, userInfo);
};

// 移除用户信息
export const removeUserInfo = (): void => {
  secureStorage.removeItem(USER_INFO_KEY);
};

// 清除所有认证数据（退出登录）
export const clearAuthData = (): void => {
  removeToken();
  removeUserInfo();
};

// 检查用户是否已登录
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};

// 检查用户权限
export const checkUserPermission = (requiredRole: string): boolean => {
  const userInfo = getUserInfo();
  if (!userInfo) return false;
  return userInfo.role === requiredRole || userInfo.role === 'admin';
};

// 刷新Token
export const refreshToken = async (): Promise<string | null> => {
  try {
    // 这里应该调用后端的刷新Token接口
    // 由于是演示，我们模拟一个成功的刷新
    const newToken = 'new_refreshed_token_' + Date.now();
    setToken(newToken);
    return newToken;
  } catch (error) {
    console.error('刷新Token失败:', error);
    // 刷新失败，清除认证信息
    clearAuthData();
    return null;
  }
};

// 验证Token是否即将过期
export const isTokenAboutToExpire = (): boolean => {
  // 实际应用中，应该解析Token的过期时间并进行判断
  // 这里简单返回false，假设Token永不过期
  return false;
};

// 初始化认证状态
export const initAuth = (): void => {
  // 检查Token是否即将过期，如果是则刷新
  if (isTokenAboutToExpire() && isAuthenticated()) {
    refreshToken();
  }
};

// 获取当前用户角色
export const getCurrentUserRole = (): string => {
  const userInfo = getUserInfo();
  return userInfo ? userInfo.role : 'guest';
};