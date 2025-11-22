import { useEffect } from 'react';
import { useCallback, useState } from 'react';
import { securityLogger } from './loggingService';

// 验证码类型定义
export interface VerificationCode {
  code: string;
  expiresAt: number;
  attempts: number;
}

// 验证码存储（在实际应用中应该使用Redis或其他持久化存储）
const verificationStore: Record<string, VerificationCode> = {};

// 频率限制存储
const rateLimitStore: Record<string, number> = {};

// 验证码有效期（毫秒）
const CODE_EXPIRY = 15 * 60 * 1000; // 15分钟

// 频率限制时间（毫秒）
const RATE_LIMIT = 60 * 1000; // 60秒

// 最大尝试次数
const MAX_ATTEMPTS = 5;

// 临时锁定时间（毫秒）
const LOCK_TIME = 30 * 60 * 1000; // 30分钟

// 锁定存储
const lockStore: Record<string, number> = {};

/**
 * 生成6位随机数字验证码
 */
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * 检查账户是否被锁定
 */
export const isAccountLocked = (contact: string): boolean => {
  const lockTime = lockStore[contact];
  const now = Date.now();
  
  if (lockTime && (now - lockTime) < LOCK_TIME) {
    return true;
  }
  
  // 锁定时间已过，解除锁定
  if (lockTime) {
    delete lockStore[contact];
  }
  
  return false;
};

/**
 * 获取剩余锁定时间（分钟）
 */
export const getRemainingLockTime = (contact: string): number => {
  const lockTime = lockStore[contact];
  const now = Date.now();
  
  if (!lockTime) return 0;
  
  const elapsed = now - lockTime;
  const remaining = Math.ceil((LOCK_TIME - elapsed) / (1000 * 60));
  
  return remaining > 0 ? remaining : 0;
};

/**
 * 锁定账户
 */
export const lockAccount = (contact: string): void => {
  lockStore[contact] = Date.now();
  console.log(`账户 ${contact} 已被临时锁定30分钟`);
};

/**
 * 检查是否可以发送验证码（频率限制和账户锁定）
 */
export const canSendVerificationCode = (contact: string): boolean => {
  // 检查账户是否被锁定
  if (isAccountLocked(contact)) {
    return false;
  }
  
  const lastSentTime = rateLimitStore[contact];
  const now = Date.now();
  
  if (lastSentTime && (now - lastSentTime) < RATE_LIMIT) {
    return false;
  }
  
  return true;
};

/**
 * 获取剩余冷却时间（秒）
 */
export const getRemainingCooldown = (contact: string): number => {
  const lastSentTime = rateLimitStore[contact];
  const now = Date.now();
  
  if (!lastSentTime) return 0;
  
  const elapsed = now - lastSentTime;
  const remaining = Math.ceil((RATE_LIMIT - elapsed) / 1000);
  
  return remaining > 0 ? remaining : 0;
};

/**
 * 发送验证码
 */
export const sendVerificationCode = async (contact: string): Promise<{ success: boolean; error?: string; cooldown?: number; lockTime?: number }> => {
  try {
    // 记录忘记密码请求
    securityLogger.forgotPasswordRequest(contact);
    
    // 检查账户是否被锁定
    if (isAccountLocked(contact)) {
      const lockTime = getRemainingLockTime(contact);
      securityLogger.verificationCodeSent(contact, false, 'account_locked');
      return { 
        success: false, 
        error: `账户已被临时锁定，请${lockTime}分钟后再试`,
        lockTime
      };
    }
    
    // 检查频率限制
    if (!canSendVerificationCode(contact)) {
      const cooldown = getRemainingCooldown(contact);
      securityLogger.verificationCodeSent(contact, false, 'rate_limited');
      return { 
        success: false, 
        error: '发送过于频繁，请稍后再试',
        cooldown
      };
    }
    
    // 生成验证码
    const code = generateVerificationCode();
    const now = Date.now();
    
    // 存储验证码
    verificationStore[contact] = {
      code,
      expiresAt: now + CODE_EXPIRY,
      attempts: 0
    };
    
    // 更新频率限制
    rateLimitStore[contact] = now;
    
    // 记录验证码发送成功
    console.log(`向 ${contact} 发送验证码: ${code}`);
    securityLogger.verificationCodeSent(contact, true);
    
    // 这里应该集成实际的短信或邮件发送服务
    // 例如: await smsService.sendSMS(contact, `您的验证码是: ${code}`);
    // 或者: await emailService.sendEmail(contact, '验证码', `您的验证码是: ${code}`);
    
    return { success: true, cooldown: 60 };
  } catch (error) {
    console.error('发送验证码失败:', error);
    securityLogger.verificationCodeSent(contact, false, 'server_error');
    return { success: false, error: '发送验证码失败，请稍后重试' };
  }
};

/**
 * 验证验证码
 */
export const verifyCode = async (contact: string, code: string): Promise<{ success: boolean; error?: string; lockTime?: number }> => {
  try {
    // 检查账户是否被锁定
    if (isAccountLocked(contact)) {
      const lockTime = getRemainingLockTime(contact);
      securityLogger.verificationCodeVerified(contact, false, 0);
      return { 
        success: false, 
        error: `账户已被临时锁定，请${lockTime}分钟后再试`,
        lockTime
      };
    }
    
    // 检查验证码是否存在
    const storedCode = verificationStore[contact];
    
    if (!storedCode) {
      securityLogger.verificationCodeVerified(contact, false, 0);
      return { success: false, error: '验证码不存在或已过期' };
    }
    
    // 检查验证码是否过期
    if (Date.now() > storedCode.expiresAt) {
      delete verificationStore[contact];
      securityLogger.verificationCodeVerified(contact, false, 0);
      return { success: false, error: '验证码已过期，请重新获取' };
    }
    
    // 增加尝试次数
    storedCode.attempts += 1;
    const remainingAttempts = MAX_ATTEMPTS - storedCode.attempts;
    
    // 检查是否超过最大尝试次数
    if (storedCode.attempts > MAX_ATTEMPTS) {
      delete verificationStore[contact];
      // 锁定账户
      lockAccount(contact);
      securityLogger.accountLocked(contact, 'exceeded_verification_attempts', 30);
      securityLogger.verificationCodeVerified(contact, false, 0);
      return { 
        success: false, 
        error: '尝试次数过多，账户已被临时锁定30分钟',
        lockTime: 30
      };
    }
    
    // 验证验证码是否正确
    if (storedCode.code !== code) {
      // 检查是否达到最大尝试次数，达到则锁定账户
      if (storedCode.attempts >= MAX_ATTEMPTS) {
        lockAccount(contact);
        delete verificationStore[contact];
        securityLogger.accountLocked(contact, 'exceeded_verification_attempts', 30);
        securityLogger.verificationCodeVerified(contact, false, 0);
        return { 
          success: false, 
          error: '验证码错误次数过多，账户已被临时锁定30分钟',
          lockTime: 30
        };
      }
      
      // 记录验证失败
      securityLogger.verificationCodeVerified(contact, false, remainingAttempts);
      return { 
        success: false, 
        error: `验证码错误，还剩${remainingAttempts}次尝试机会` 
      };
    }
    
    // 验证成功，移除验证码
    delete verificationStore[contact];
    
    console.log(`验证码验证成功: ${contact}`);
    securityLogger.verificationCodeVerified(contact, true);
    return { success: true };
  } catch (error) {
    console.error('验证验证码失败:', error);
    securityLogger.verificationCodeVerified(contact, false, 0);
    return { success: false, error: '验证验证码失败，请稍后重试' };
  }
};

/**
 * React Hook for Verification Code Management
 */
export const useVerificationCode = () => {
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 处理倒计时
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);
  
  // 发送验证码
  const sendCode = useCallback(async (contact: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await sendVerificationCode(contact);
      
      if (!result.success) {
        setError(result.error);
        if (result.cooldown) {
          setCountdown(result.cooldown);
        }
        return false;
      }
      
      setCountdown(result.cooldown || 60);
      return true;
    } catch (err) {
      setError('发送验证码时发生错误');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 验证验证码
  const verifyCodeCallback = useCallback((contact: string, code: string) => {
    return verifyCode(contact, code);
  }, []);
  
  return {
    countdown,
    error,
    loading,
    sendCode,
    verifyCode: verifyCodeCallback
  };
};

// 清理过期验证码的函数（在实际应用中可以定期调用）
export const cleanupExpiredCodes = () => {
  const now = Date.now();
  Object.keys(verificationStore).forEach(contact => {
    if (verificationStore[contact].expiresAt < now) {
      delete verificationStore[contact];
    }
  });
};

// 定期清理过期验证码
setInterval(cleanupExpiredCodes, 5 * 60 * 1000); // 每5分钟清理一次