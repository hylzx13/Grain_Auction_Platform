import { createSecureWebSocket } from './securityService';
import { getToken } from '../utils/auth';

// WebSocket连接管理器
class WebSocketManager {
  private connections: Map<string, { socket: WebSocket; callbacks: Map<string, Function[]> }> = new Map();
  private maxConnections = 500;
  private reconnectAttempts = 3;
  private reconnectDelay = 1000;

  // 创建并管理WebSocket连接
  connect(channel: string, url: string): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      // 检查连接数限制
      if (this.connections.size >= this.maxConnections) {
        reject(new Error('WebSocket连接数已达上限'));
        return;
      }

      // 检查是否已存在连接
      if (this.connections.has(channel)) {
        resolve(this.connections.get(channel)!.socket);
        return;
      }

      const token = getToken();
      if (!token) {
        reject(new Error('未找到认证token'));
        return;
      }

      // 创建安全的WebSocket连接
      const socket = createSecureWebSocket(url, token);
      const callbacks = new Map<string, Function[]>();

      socket.onopen = () => {
        console.log(`WebSocket连接已建立: ${channel}`);
        this.connections.set(channel, { socket, callbacks });
        resolve(socket);
      };

      socket.onerror = (error) => {
        console.error(`WebSocket错误: ${channel}`, error);
        reject(error);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(channel, data);
        } catch (error) {
          console.error(`处理WebSocket消息失败: ${channel}`, error);
        }
      };

      socket.onclose = (event) => {
        console.log(`WebSocket连接已关闭: ${channel}`, event);
        this.connections.delete(channel);
        
        // 自动重连
        if (!event.wasClean) {
          this.reconnect(channel, url);
        }
      };
    });
  }

  // 重新连接
  private reconnect(channel: string, url: string): void {
    let attempts = 0;
    const reconnectInterval = setInterval(() => {
      if (attempts < this.reconnectAttempts) {
        attempts++;
        console.log(`尝试重新连接WebSocket: ${channel}, 第${attempts}次`);
        this.connect(channel, url).catch(() => {});
      } else {
        clearInterval(reconnectInterval);
        console.error(`WebSocket重连失败: ${channel}`);
      }
    }, this.reconnectDelay * attempts * 2); // 指数退避
  }

  // 发送消息
  send(channel: string, data: any): boolean {
    const connection = this.connections.get(channel);
    if (!connection || connection.socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      connection.socket.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`发送WebSocket消息失败: ${channel}`, error);
      return false;
    }
  }

  // 处理接收到的消息
  private handleMessage(channel: string, data: any): void {
    const connection = this.connections.get(channel);
    if (!connection) return;

    const { type, payload } = data;
    const callbacks = connection.callbacks.get(type);

    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`执行WebSocket回调失败: ${channel}`, error);
        }
      });
    }
  }

  // 订阅消息类型
  subscribe(channel: string, messageType: string, callback: Function): void {
    const connection = this.connections.get(channel);
    if (!connection) return;

    if (!connection.callbacks.has(messageType)) {
      connection.callbacks.set(messageType, []);
    }

    connection.callbacks.get(messageType)!.push(callback);
  }

  // 取消订阅
  unsubscribe(channel: string, messageType: string, callback: Function): void {
    const connection = this.connections.get(channel);
    if (!connection || !connection.callbacks.has(messageType)) return;

    const callbacks = connection.callbacks.get(messageType)!;
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }

    // 如果没有回调了，删除该消息类型
    if (callbacks.length === 0) {
      connection.callbacks.delete(messageType);
    }
  }

  // 关闭连接
  disconnect(channel: string): void {
    const connection = this.connections.get(channel);
    if (connection) {
      connection.socket.close();
      this.connections.delete(channel);
    }
  }

  // 关闭所有连接
  disconnectAll(): void {
    this.connections.forEach((connection, channel) => {
      connection.socket.close();
    });
    this.connections.clear();
  }

  // 获取连接状态
  getConnectionStatus(channel: string): 'connected' | 'connecting' | 'disconnected' {
    const connection = this.connections.get(channel);
    if (!connection) return 'disconnected';

    switch (connection.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      default:
        return 'disconnected';
    }
  }
}

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// 请求限流管理器
class RequestRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private timeWindow: number;

  constructor(maxRequests: number = 10, timeWindow: number = 1000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
  }

  // 检查请求是否允许
  allowRequest(key: string): boolean {
    const now = Date.now();
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const requestTimes = this.requests.get(key)!;
    
    // 清理过期的请求记录
    const recentRequests = requestTimes.filter(time => now - time < this.timeWindow);
    this.requests.set(key, recentRequests);

    // 检查是否超过限制
    if (recentRequests.length < this.maxRequests) {
      recentRequests.push(now);
      return true;
    }

    return false;
  }

  // 获取剩余请求次数
  getRemainingRequests(key: string): number {
    const now = Date.now();
    
    if (!this.requests.has(key)) {
      return this.maxRequests;
    }

    const requestTimes = this.requests.get(key)!;
    const recentRequests = requestTimes.filter(time => now - time < this.timeWindow);
    
    return Math.max(0, this.maxRequests - recentRequests.length);
  }

  // 清理所有请求记录
  clear(): void {
    this.requests.clear();
  }
}

// 创建全局实例
export const wsManager = new WebSocketManager();
export const apiRateLimiter = new RequestRateLimiter(20, 1000); // API请求：每秒20次
export const bidRateLimiter = new RequestRateLimiter(5, 1000); // 竞价请求：每秒5次

// 批量请求处理
export const batchRequests = async <T extends any[]>(
  items: T,
  batchSize: number,
  processBatch: (batch: T) => Promise<any>
): Promise<any[]> => {
  const results: any[] = [];
  const totalBatches = Math.ceil(items.length / batchSize);

  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const end = start + batchSize;
    const batch = items.slice(start, end);

    // 加入延迟避免请求过于密集
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const batchResults = await processBatch(batch);
    results.push(...batchResults);
  }

  return results;
};

// 并发控制函数
export const concurrentControl = async <T extends any[]>(
  items: T,
  maxConcurrent: number,
  processItem: (item: T[number]) => Promise<any>
): Promise<any[]> => {
  const results: any[] = [];
  const runningPromises: Promise<void>[] = [];

  for (const item of items) {
    // 当运行中的Promise数量达到最大并发数时，等待任一Promise完成
    if (runningPromises.length >= maxConcurrent) {
      await Promise.race(runningPromises);
    }

    // 创建处理单个item的Promise
    const promise = processItem(item).then((result) => {
      results.push(result);
      // 从运行中的Promises中移除已完成的
      const index = runningPromises.indexOf(promise as any);
      if (index !== -1) {
        runningPromises.splice(index, 1);
      }
    });

    runningPromises.push(promise as any);
  }

  // 等待所有Promise完成
  await Promise.all(runningPromises);
  return results;
};

export default {
  wsManager,
  apiRateLimiter,
  bidRateLimiter,
  debounce,
  throttle,
  batchRequests,
  concurrentControl,
};