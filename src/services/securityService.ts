import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import CryptoJS from 'crypto-js';
import { getToken, setToken, removeToken } from '../utils/auth';
import { UserRole } from '../types/user';

// 加密配置
const getEnv = (key: string, fallback: string) => {
  const value = (import.meta as any)?.env?.[key]
  return value ?? fallback
}

const SECURITY_CONFIG = {
  ENCRYPTION_KEY: getEnv('VITE_ENCRYPTION_KEY', 'grainAuctionPlatform2024'),
  IV: getEnv('VITE_ENCRYPTION_IV', 'platformIv20240123'),
  API_BASE_URL: getEnv('VITE_API_BASE_URL', 'http://localhost:3001/api'),
};

// 创建安全的axios实例
const secureAxiosInstance: AxiosInstance = axios.create({
  baseURL: SECURITY_CONFIG.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Platform-Name': 'GrainAuctionPlatform',
    'X-Platform-Version': '1.0.0',
  },
});

// 请求拦截器 - 添加token和加密数据
secureAxiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 添加认证token
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 加密敏感数据（如交易金额、个人信息等）
    if (config.data && typeof config.data === 'object') {
      const sensitiveKeys = ['amount', 'price', 'personalInfo', 'idNumber', 'bankAccount'];
      const data = { ...config.data };
      
      // 检查是否需要加密整个请求体
      if (config.headers?.['X-Encrypt-Body'] === 'true') {
        config.data = {
          encrypted: encrypt(JSON.stringify(data)),
        };
      } else {
        // 仅加密敏感字段
        sensitiveKeys.forEach(key => {
          if (data[key]) {
            data[key] = encrypt(String(data[key]));
          }
        });
        config.data = data;
      }
    }

    // 添加时间戳防止重放攻击
    config.headers = {
      ...config.headers,
      'X-Request-Timestamp': Date.now().toString(),
    };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 解密数据和处理错误
secureAxiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 解密响应数据
    if (response.data && response.data.encrypted) {
      try {
        const decrypted = decrypt(response.data.encrypted);
        response.data = JSON.parse(decrypted);
      } catch (error) {
        console.error('解密响应数据失败:', error);
        throw new Error('数据解密失败');
      }
    }

    return response;
  },
  (error) => {
    // 处理认证错误
    if (error.response?.status === 401) {
      // 清除token并跳转到登录页
      removeToken();
      window.location.href = '/login';
    }

    // 处理服务器错误
    if (error.response?.status >= 500) {
      console.error('服务器错误:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// AES加密函数
export const encrypt = (text: string): string => {
  const key = CryptoJS.enc.Utf8.parse(SECURITY_CONFIG.ENCRYPTION_KEY);
  const iv = CryptoJS.enc.Utf8.parse(SECURITY_CONFIG.IV);
  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
};

// AES解密函数
export const decrypt = (ciphertext: string): string => {
  const key = CryptoJS.enc.Utf8.parse(SECURITY_CONFIG.ENCRYPTION_KEY);
  const iv = CryptoJS.enc.Utf8.parse(SECURITY_CONFIG.IV);
  const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
};

// 生成数字签名
export const generateSignature = (data: any, timestamp: number): string => {
  const sortedData = Object.keys(data)
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('&');
  const signatureData = `${sortedData}&timestamp=${timestamp}`;
  return CryptoJS.HmacSHA256(signatureData, SECURITY_CONFIG.ENCRYPTION_KEY).toString();
};

// 验证数字签名
export const verifySignature = (data: any, signature: string, timestamp: number): boolean => {
  const generatedSignature = generateSignature(data, timestamp);
  return generatedSignature === signature;
};

// 权限检查函数
export const checkPermission = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  return requiredRoles.includes(userRole);
};

// 敏感数据脱敏
export const maskSensitiveData = (data: string, type: 'phone' | 'id' | 'bank'): string => {
  switch (type) {
    case 'phone':
      return data.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    case 'id':
      return data.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
    case 'bank':
      return data.replace(/(\d{4})\d{12}(\d{4})/, '$1************$2');
    default:
      return data;
  }
};

// 安全存储服务
export const secureStorage = {
  // 加密存储
  setItem: (key: string, value: any): void => {
    const encryptedValue = encrypt(JSON.stringify(value));
    localStorage.setItem(key, encryptedValue);
  },

  // 解密获取
  getItem: (key: string): any => {
    const encryptedValue = localStorage.getItem(key);
    if (!encryptedValue) return null;
    
    try {
      const decryptedValue = decrypt(encryptedValue);
      return JSON.parse(decryptedValue);
    } catch (error) {
      console.error('解密存储数据失败:', error);
      return null;
    }
  },

  // 删除存储项
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },

  // 清空所有存储
  clear: (): void => {
    localStorage.clear();
  },
};

// WebSocket安全连接工厂
export const createSecureWebSocket = (url: string, token: string): WebSocket => {
  // 在连接参数中添加token和时间戳
  const timestamp = Date.now();
  const signature = generateSignature({ url }, timestamp);
  
  // 创建带有安全参数的WebSocket连接
  const wsUrl = `${url}?token=${encodeURIComponent(token)}&timestamp=${timestamp}&signature=${encodeURIComponent(signature)}`;
  
  return new WebSocket(wsUrl);
};

// 防XSS过滤函数
export const sanitizeHTML = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

export default secureAxiosInstance;
