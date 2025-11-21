import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'farmer' | 'dealer' | 'admin' | 'any'
  redirectPath?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'any',
  redirectPath = '/login'
}) => {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  // 如果正在加载认证状态，显示加载状态或返回null
  if (isLoading) {
    return null // 或者可以返回一个加载指示器
  }

  // 如果用户未登录，重定向到登录页面
  if (!user) {
    // 将当前位置保存在state中，以便登录后重定向回来
    return <Navigate to={redirectPath} replace state={{ from: location }} />
  }

  // 检查用户角色是否满足要求
  if (requiredRole !== 'any' && user.role !== requiredRole) {
    // 如果角色不匹配，重定向到访问被拒绝页面或首页
    return <Navigate to="/access-denied" replace state={{ from: location }} />
  }

  // 如果所有条件都满足，渲染受保护的内容
  return <React.Fragment>{children}</React.Fragment>
}

export default ProtectedRoute