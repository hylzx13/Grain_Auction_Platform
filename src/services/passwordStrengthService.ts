// 密码强度检测服务

/**
 * 密码强度级别
 */
export type PasswordStrength = 'weak' | 'medium' | 'strong';

/**
 * 密码强度检测结果
 */
export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number;
  message: string;
  suggestions: string[];
}

/**
 * 检测密码强度
 * 基于以下规则评分：
 * - 长度：至少8位字符（1分），12位以上额外加分（额外1分）
 * - 包含小写字母（1分）
 * - 包含大写字母（1分）
 * - 包含数字（1分）
 * - 包含特殊字符（1分）
 * 
 * 评分标准：
 * - 0-2分：弱
 * - 3-4分：中
 * - 5-6分：强
 */
export const checkPasswordStrength = (password: string): PasswordStrengthResult => {
  let score = 0;
  const suggestions: string[] = [];
  
  // 检查长度
  if (password.length >= 8) {
    score += 1;
    if (password.length >= 12) {
      score += 1;
    }
  } else {
    suggestions.push('密码长度至少需要8位字符');
  }
  
  // 检查小写字母
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('包含小写字母');
  }
  
  // 检查大写字母
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('包含大写字母');
  }
  
  // 检查数字
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('包含数字');
  }
  
  // 检查特殊字符
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('包含特殊字符');
  }
  
  // 确定密码强度级别
  let strength: PasswordStrength = 'weak';
  let message = '';
  
  if (score <= 2) {
    strength = 'weak';
    message = '密码强度：弱';
  } else if (score <= 4) {
    strength = 'medium';
    message = '密码强度：中';
  } else {
    strength = 'strong';
    message = '密码强度：强';
  }
  
  // 如果是强密码，清空建议
  if (strength === 'strong' && suggestions.length === 0) {
    suggestions.push('密码强度很好！');
  }
  
  return {
    strength,
    score,
    message,
    suggestions
  };
};

/**
 * 获取密码强度对应的颜色
 */
export const getStrengthColor = (strength: PasswordStrength): string => {
  switch (strength) {
    case 'weak':
      return '#f44336'; // 红色
    case 'medium':
      return '#ff9800'; // 橙色
    case 'strong':
      return '#4caf50'; // 绿色
    default:
      return '#9e9e9e'; // 灰色
  }
};

/**
 * 验证密码是否匹配
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

/**
 * 生成密码强度条的百分比宽度
 */
export const getStrengthProgressWidth = (strength: PasswordStrength): number => {
  switch (strength) {
    case 'weak':
      return 33;
    case 'medium':
      return 66;
    case 'strong':
      return 100;
    default:
      return 0;
  }
};
