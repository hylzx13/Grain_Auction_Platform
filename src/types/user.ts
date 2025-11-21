// 用户角色枚举
export enum UserRole {
  FARMER = 'farmer', // 农户
  DEALER = 'dealer', // 经销商
  ADMIN = 'admin', // 管理员
  GUEST = 'guest', // 访客
}

// 用户信息接口
export interface UserInfo {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  realName?: string; // 真实姓名（实名认证）
  idNumber?: string; // 身份证号（加密存储）
  avatar?: string; // 头像URL
  isVerified: boolean; // 是否通过实名认证
  createdAt: string; // 创建时间
  lastLoginAt?: string; // 最后登录时间
}

// 登录请求接口
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// 注册请求接口
export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  phone: string;
  role: UserRole;
}

// 实名认证请求接口
export interface VerificationRequest {
  realName: string;
  idNumber: string;
  idCardFrontImage: string; // 身份证正面照片
  idCardBackImage: string; // 身份证反面照片
  businessLicenseImage?: string; // 营业执照照片（针对经销商）
}

// 用户设置接口
export interface UserSettings {
  language: string;
  notificationEnabled: boolean;
  theme: 'light' | 'dark';
  autoBidEnabled: boolean;
  maxAutoBidAmount?: number;
}

// 权限检查结果接口
export interface PermissionCheckResult {
  hasPermission: boolean;
  requiredRole: UserRole;
  currentRole: UserRole;
}