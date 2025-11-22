// 日志服务 - 用于记录敏感操作和安全事件

/**
 * 日志级别
 */
export type LogLevel = 'info' | 'warning' | 'error' | 'security';

/**
 * 日志记录选项
 */
export interface LogOptions {
  userId?: string;
  ipAddress?: string;
  action: string;
  details?: Record<string, any>;
  sensitive?: boolean;
}

/**
 * 日志记录器类
 */
class Logger {
  /**
   * 记录日志
   */
  log(level: LogLevel, options: LogOptions): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      userId: options.userId || 'anonymous',
      ipAddress: options.ipAddress || 'unknown',
      action: options.action,
      details: options.sensitive ? this.sanitizeDetails(options.details) : options.details,
    };

    // 在开发环境中打印到控制台
    if (process.env.NODE_ENV === 'development') {
      this.printToConsole(level, logEntry);
    }

    // 在生产环境中，应该发送到日志服务或存储到数据库
    // 这里仅作为示例，实际项目中应该实现真实的日志存储
    if (process.env.NODE_ENV === 'production') {
      this.sendToLogService(logEntry);
    }
  }

  /**
   * 清理敏感信息
   */
  private sanitizeDetails(details?: Record<string, any>): Record<string, any> | undefined {
    if (!details) return details;

    const sanitized = { ...details };
    
    // 清理常见的敏感字段
    const sensitiveFields = ['password', 'token', 'verificationCode', 'creditCard', 'ssn'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * 打印到控制台
   */
  private printToConsole(level: LogLevel, logEntry: any): void {
    const levelColors = {
      info: '\x1b[32m', // 绿色
      warning: '\x1b[33m', // 黄色
      error: '\x1b[31m', // 红色
      security: '\x1b[35m', // 紫色
    };
    
    const resetColor = '\x1b[0m';
    const color = levelColors[level] || '';
    
    console.log(`${color}[${level.toUpperCase()}]${resetColor}`, JSON.stringify(logEntry, null, 2));
  }

  /**
   * 发送到日志服务
   * 实际项目中应该实现真实的API调用
   */
  private sendToLogService(logEntry: any): void {
    // 这里应该调用实际的日志服务API
    // 例如: fetch('https://logs.yourdomain.com/api/logs', { method: 'POST', body: JSON.stringify(logEntry) });
    console.log('Sending log to service:', logEntry.timestamp, logEntry.level, logEntry.action);
  }

  /**
   * 记录信息日志
   */
  info(options: LogOptions): void {
    this.log('info', options);
  }

  /**
   * 记录警告日志
   */
  warning(options: LogOptions): void {
    this.log('warning', options);
  }

  /**
   * 记录错误日志
   */
  error(options: LogOptions): void {
    this.log('error', options);
  }

  /**
   * 记录安全相关日志
   */
  security(options: LogOptions): void {
    this.log('security', options);
  }
}

// 创建单例实例
const logger = new Logger();

// 导出常用的安全事件日志函数
export const securityLogger = {
  /**
   * 记录登录尝试
   */
  loginAttempt: (userId: string, success: boolean, ipAddress?: string): void => {
    logger.security({
      userId,
      ipAddress,
      action: success ? 'login_success' : 'login_failure',
      details: { success },
    });
  },

  /**
   * 记录忘记密码请求
   */
  forgotPasswordRequest: (contact: string, ipAddress?: string): void => {
    logger.security({
      userId: contact,
      ipAddress,
      action: 'forgot_password_request',
      sensitive: true,
      details: { contact },
    });
  },

  /**
   * 记录验证码发送
   */
  verificationCodeSent: (contact: string, success: boolean, reason?: string, ipAddress?: string): void => {
    logger.security({
      userId: contact,
      ipAddress,
      action: 'verification_code_sent',
      details: { success, reason },
    });
  },

  /**
   * 记录验证码验证
   */
  verificationCodeVerified: (contact: string, success: boolean, attemptsLeft?: number, ipAddress?: string): void => {
    logger.security({
      userId: contact,
      ipAddress,
      action: 'verification_code_verified',
      details: { success, attemptsLeft },
    });
  },

  /**
   * 记录密码重置
   */
  passwordReset: (contact: string, success: boolean, passwordStrength?: string, ipAddress?: string): void => {
    logger.security({
      userId: contact,
      ipAddress,
      action: 'password_reset',
      details: { success, passwordStrength },
    });
  },

  /**
   * 记录账户锁定
   */
  accountLocked: (contact: string, reason: string, lockDuration: number, ipAddress?: string): void => {
    logger.warning({
      userId: contact,
      ipAddress,
      action: 'account_locked',
      details: { reason, lockDuration },
    });
  },

  /**
   * 记录可疑活动
   */
  suspiciousActivity: (contact: string, activity: string, details: Record<string, any>, ipAddress?: string): void => {
    logger.error({
      userId: contact,
      ipAddress,
      action: 'suspicious_activity',
      details: { activity, ...details },
    });
  },
};

export default logger;
