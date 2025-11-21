import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import secureAxiosInstance, { encrypt, decrypt, secureStorage } from '../services/securityService'
import { getUserInfo, setUserInfo, removeUserInfo, refreshToken as refreshUserToken } from '../utils/auth'
import { UserRole } from '../types/user'

interface User {
  id: string
  username: string
  role: UserRole
  email: string
  phone: string
  isVerified: boolean
  createdAt: string
  maxBidLimit?: number
  // 农户特有信息
  farmName?: string
  farmLocation?: string
  // 经销商特有信息
  companyName?: string
  businessLicense?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: { username: string; password: string }) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

export interface RegisterData {
  username: string
  password: string
  email: string
  phone: string
  role: UserRole
  // 农户特有信息
  farmName?: string
  farmLocation?: string
  // 经销商特有信息
  companyName?: string
  businessLicense?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 初始化时检查本地存储的token
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userInfo = getUserInfo()
        if (userInfo) {
          setUser(userInfo)
          // 启动token自动刷新
          startTokenRefreshTimer()
        }
      } catch (error) {
        console.error('Token validation error:', error)
        removeUserInfo()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
    }
  }, [])
  
  // 启动token自动刷新计时器
  const startTokenRefreshTimer = () => {
    // 每55分钟刷新一次token（假设token有效期为60分钟）
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current)
    }
    
    refreshTimerRef.current = setInterval(async () => {
      try {
        await refreshToken()
      } catch (error) {
        console.error('Token refresh failed:', error)
        // 刷新失败时清除用户信息
        logout()
      }
    }, 55 * 60 * 1000)
  }

  const login = async (credentials: { username: string; password: string }) => {
    try {
      // 加密登录凭证
      const encryptedCredentials = encrypt(JSON.stringify(credentials))
      
      // 尝试调用真实API
      let response
      try {
        response = await secureAxiosInstance.post('/auth/login', {
          encryptedData: encryptedCredentials
        }, {
          headers: {
            'X-Encrypt-Body': 'true'
          }
        })
      } catch (apiError) {
        console.log('API调用失败，使用模拟数据')
        // 模拟登录响应
        response = {
          data: {
            token: 'mock-jwt-token-' + Date.now(),
            refreshToken: 'mock-refresh-token-' + Date.now(),
            user: {
              id: '1',
              username: credentials.username,
              role: UserRole.FARMER,
              email: `${credentials.username}@example.com`,
              phone: '13800138000',
              isVerified: true,
              createdAt: new Date().toISOString(),
              maxBidLimit: 100000 // 最大出价限制
            }
          }
        }
      }

      const { token, refreshToken, user: userData } = response.data
      
      // 安全存储token和用户信息
      setUserInfo(userData, token, refreshToken)
      setUser(userData)
      
      // 启动token自动刷新
      startTokenRefreshTimer()
      
      return userData
    } catch (error) {
      console.error('Login error:', error)
      throw new Error('登录失败，请检查用户名和密码')
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      // 加密注册数据
      const encryptedData = encrypt(JSON.stringify(userData))
      
      // 尝试调用真实API
      try {
        await secureAxiosInstance.post('/auth/register', {
          encryptedData
        }, {
          headers: {
            'X-Encrypt-Body': 'true'
          }
        })
      } catch (apiError) {
        console.log('API调用失败，模拟注册成功')
        // 模拟注册成功，实际环境中应根据后端响应处理
      }
      
      return { success: true, message: '注册成功，请登录' }
    } catch (error) {
      console.error('Register error:', error)
      throw new Error('注册失败，请稍后重试')
    }
  }

  const logout = () => {
    // 清除token自动刷新计时器
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
    
    // 安全清除用户信息
    removeUserInfo()
    setUser(null)
    
    // 可选：调用后端登出API
    secureAxiosInstance.post('/auth/logout').catch(console.error)
  }
  
  // 刷新token
  const refreshToken = async () => {
    try {
      const newToken = await refreshUserToken()
      if (newToken) {
        console.log('Token refreshed successfully')
        return true
      }
      return false
    } catch (error) {
      console.error('Token refresh error:', error)
      throw error
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    if (user) {
      try {
        // 加密更新数据
        const encryptedData = encrypt(JSON.stringify(userData))
        
        // 尝试调用真实API
        try {
          const response = await secureAxiosInstance.put('/users/profile', {
            encryptedData
          }, {
            headers: {
              'X-Encrypt-Body': 'true'
            }
          })
          
          // 更新本地用户信息
          const updatedUser = { ...user, ...response.data.user }
          setUser(updatedUser)
          
          // 同步更新安全存储
          const currentInfo = getUserInfo()
          if (currentInfo) {
            setUserInfo(updatedUser, undefined, undefined)
          }
        } catch (apiError) {
          console.log('API调用失败，仅更新本地用户信息')
          // 仅更新本地用户信息
          const updatedUser = { ...user, ...userData }
          setUser(updatedUser)
        }
      } catch (error) {
        console.error('Update user error:', error)
        throw error
      }
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// 权限检查Hook
export const usePermission = (requiredRoles: Array<UserRole>) => {
  const { user, isAuthenticated } = useAuth()
  
  // 未登录用户没有任何权限
  if (!isAuthenticated || !user) {
    return false
  }
  
  // 管理员拥有所有权限
  if (user.role === UserRole.ADMIN) {
    return true
  }
  
  // 检查用户角色是否在允许的角色列表中
  return requiredRoles.includes(user.role)
}

// 高级权限检查Hook - 支持基于资源和操作的细粒度权限控制
export const useResourcePermission = (resource: string, action: string) => {
  const { user, isAuthenticated } = useAuth()
  
  if (!isAuthenticated || !user) {
    return false
  }
  
  // 定义角色权限映射
  const rolePermissions: Record<UserRole, Record<string, string[]>> = {
    [UserRole.FARMER]: {
      auction: ['create', 'view', 'edit', 'delete'],
      profile: ['view', 'edit'],
      bid: ['view'] // 农户可以查看竞价但不能参与
    },
    [UserRole.DEALER]: {
      auction: ['view'],
      profile: ['view', 'edit'],
      bid: ['create', 'view', 'edit'] // 经销商可以参与竞价
    },
    [UserRole.ADMIN]: {
      auction: ['create', 'view', 'edit', 'delete', 'approve'],
      profile: ['view', 'edit', 'delete'],
      bid: ['view'],
      user: ['create', 'view', 'edit', 'delete', 'verify']
    }
  }
  
  // 管理员拥有所有权限
  if (user.role === UserRole.ADMIN) {
    return true
  }
  
  // 检查资源权限
  const resourceActions = rolePermissions[user.role][resource]
  return resourceActions ? resourceActions.includes(action) : false
}
