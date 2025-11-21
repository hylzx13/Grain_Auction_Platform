import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Avatar,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Tooltip
} from '@mui/material'
import { User, Lock, Mail, Phone, Building, Home, CalendarToday, Award, Edit, Save, Cancel, Upload, ChevronDown, Check, AlertCircle, Info, Shield } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import { SlideIn, ScaleIn } from '../components/animations'
import { useResponsiveBreakpoints } from '../components/layouts/ResponsiveGrid'

interface UserInfoForm {
  username: string
  realName: string
  email: string
  phone: string
  address: string
  companyName?: string
  contactPerson?: string
  profileImage?: string
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { user, updateUserInfo, updatePassword, logout } = useAuth()
  const [activeTab, setActiveTab] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfoForm>({
    username: '',
    realName: '',
    email: '',
    phone: '',
    address: '',
    companyName: '',
    contactPerson: ''
  })
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [fileInputRef] = useState(
    React.useRef<HTMLInputElement>(null)
  )
  const { isMobile } = useResponsiveBreakpoints()

  // 初始化用户信息
  useEffect(() => {
    if (user) {
      setUserInfo({
        username: user.username || '',
        realName: user.realName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        companyName: user.companyName || '',
        contactPerson: user.contactPerson || '',
        profileImage: user.profileImage
      })
    }
  }, [user])

  // 处理用户信息表单变化
  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }))
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // 处理密码表单变化
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }))
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // 验证用户信息表单
  const validateUserInfoForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}
    
    if (!userInfo.username.trim()) {
      newErrors.username = '用户名不能为空'
    }
    
    if (!userInfo.realName.trim()) {
      newErrors.realName = '真实姓名不能为空'
    }
    
    if (!userInfo.email.trim()) {
      newErrors.email = '邮箱地址不能为空'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }
    
    if (!userInfo.phone.trim()) {
      newErrors.phone = '手机号不能为空'
    } else if (!/^1[3-9]\d{9}$/.test(userInfo.phone)) {
      newErrors.phone = '请输入有效的手机号'
    }
    
    if (!userInfo.address.trim()) {
      newErrors.address = '详细地址不能为空'
    }
    
    if (user?.role === 'dealer') {
      if (!userInfo.companyName?.trim()) {
        newErrors.companyName = '公司名称不能为空'
      }
      if (!userInfo.contactPerson?.trim()) {
        newErrors.contactPerson = '联系人不能为空'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 验证密码表单
  const validatePasswordForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}
    
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = '请输入当前密码'
    }
    
    if (!passwordForm.newPassword) {
      newErrors.newPassword = '请输入新密码'
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = '新密码长度至少为6位'
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(passwordForm.newPassword)) {
      newErrors.newPassword = '新密码必须包含字母和数字'
    }
    
    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = '请确认新密码'
    } else if (passwordForm.confirmPassword !== passwordForm.newPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 更新用户信息
  const handleUpdateUserInfo = async () => {
    if (!validateUserInfoForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      await updateUserInfo(userInfo)
      toast.success('用户信息更新成功')
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error.message || '更新失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 更新密码
  const handleUpdatePassword = async () => {
    if (!validatePasswordForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword)
      toast.success('密码更新成功')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      toast.error(error.message || '密码更新失败，请检查当前密码是否正确')
    } finally {
      setIsLoading(false)
    }
  }

  // 处理头像上传
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 这里可以实现头像上传逻辑
      // 模拟上传成功
      const newAvatarUrl = `https://randomuser.me/api/portraits/${user?.gender === 'female' ? 'women' : 'men'}/${Math.floor(Math.random() * 100)}.jpg`
      
      setUserInfo(prev => ({
        ...prev,
        profileImage: newAvatarUrl
      }))
      
      toast.success('头像上传成功')
      setAvatarDialogOpen(false)
    }
  }

  // 切换编辑模式
  const handleEditToggle = () => {
    setIsEditing(!isEditing)
    if (isEditing) {
      // 取消编辑，恢复原始用户信息
      if (user) {
        setUserInfo({
          username: user.username || '',
          realName: user.realName || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          companyName: user.companyName || '',
          contactPerson: user.contactPerson || '',
          profileImage: user.profileImage
        })
      }
      setErrors({})
    }
  }

  // 处理登出
  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        when: 'beforeChildren',
        staggerChildren: 0.12
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: 'easeOut' }
    }
  }

  // 渲染用户信息表单
  const renderUserInfoForm = () => (
    <>
      <motion.div variants={itemVariants} className="mb-6 flex justify-between items-center">
        <Typography variant="h5" component="h2" fontWeight="600">
          基本信息
        </Typography>
        {!isEditing ? (
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outlined"
              onClick={handleEditToggle}
              startIcon={<Edit />}
              size="small"
              sx={{
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              编辑信息
            </Button>
          </motion.div>
        ) : null}
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col items-center mb-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ cursor: 'pointer' }}
        >
          <Avatar
            src={userInfo.profileImage || undefined}
            alt={userInfo.username}
            sx={{
              width: 100,
              height: 100,
              mb: 2,
              border: '3px solid rgba(76, 175, 80, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: '0 0 0 4px rgba(76, 175, 80, 0.1)'
              }
            }}
            onClick={() => setAvatarDialogOpen(true)}
          >
            {!userInfo.profileImage && userInfo.username.charAt(0).toUpperCase()}
          </Avatar>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }}>
          <Typography 
            variant="body2" 
            color="primary" 
            className="cursor-pointer"
            onClick={() => setAvatarDialogOpen(true)}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <Upload size={14} />
            点击更换头像
          </Typography>
        </motion.div>
      </motion.div>

      <Grid container spacing={3}
        sx={{
          '& .MuiTextField-root': {
            width: '100%',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderRadius: 8,
                transition: 'border-color 0.2s ease',
              },
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            },
          },
        }}
      >
        <Grid item xs={12} sm={6}>
          <TextField
            label="用户名"
            name="username"
            value={userInfo.username}
            onChange={handleUserInfoChange}
            error={!!errors.username}
            helperText={errors.username}
            disabled={!isEditing}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="真实姓名"
            name="realName"
            value={userInfo.realName}
            onChange={handleUserInfoChange}
            error={!!errors.realName}
            helperText={errors.realName}
            disabled={!isEditing}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="邮箱地址"
            name="email"
            type="email"
            value={userInfo.email}
            onChange={handleUserInfoChange}
            error={!!errors.email}
            helperText={errors.email}
            disabled={!isEditing}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="手机号"
            name="phone"
            value={userInfo.phone}
            onChange={handleUserInfoChange}
            error={!!errors.phone}
            helperText={errors.phone}
            disabled={!isEditing}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="详细地址"
            name="address"
            multiline
            rows={2}
            value={userInfo.address}
            onChange={handleUserInfoChange}
            error={!!errors.address}
            helperText={errors.address}
            disabled={!isEditing}
            required
          />
        </Grid>
        
        {user?.role === 'dealer' && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                label="公司名称"
                name="companyName"
                value={userInfo.companyName || ''}
                onChange={handleUserInfoChange}
                error={!!errors.companyName}
                helperText={errors.companyName}
                disabled={!isEditing}
                required
                sx={{ transition: 'all 0.3s ease' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="联系人"
                name="contactPerson"
                value={userInfo.contactPerson || ''}
                onChange={handleUserInfoChange}
                error={!!errors.contactPerson}
                helperText={errors.contactPerson}
                disabled={!isEditing}
                required
                sx={{ transition: 'all 0.3s ease' }}
              />
            </Grid>
          </>
        )}
      </Grid>

      {isEditing && (
        <motion.div 
          variants={itemVariants} 
          className="mt-6 flex flex-wrap justify-end gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outlined"
              onClick={handleEditToggle}
              startIcon={<Cancel />}
              disabled={isLoading}
              sx={{
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              取消
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="contained"
              onClick={handleUpdateUserInfo}
              startIcon={<Save />}
              disabled={isLoading}
              sx={{
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                textTransform: 'none'
              }}
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                '保存更改'
              )}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </>
  )

  // 渲染密码修改表单
  const renderPasswordForm = () => (
    <>
      <motion.div variants={itemVariants} className="mb-6">
        <Typography variant="h5" component="h2" fontWeight="600">
          密码设置
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-1">
          定期更改密码可以提高账户安全性
        </Typography>
      </motion.div>

      <Grid container spacing={3}
        sx={{
          '& .MuiTextField-root': {
            width: '100%',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderRadius: 1,
              },
            },
          },
        }}
      >
        <Grid item xs={12}>
          <TextField
            label="当前密码"
            name="currentPassword"
            type="password"
            value={passwordForm.currentPassword}
            onChange={handlePasswordChange}
            error={!!errors.currentPassword}
            helperText={errors.currentPassword}
            disabled={isLoading}
            required
            sx={{ transition: 'all 0.3s ease' }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="新密码"
            name="newPassword"
            type="password"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            error={!!errors.newPassword}
            helperText={errors.newPassword}
            disabled={isLoading}
            required
            sx={{ transition: 'all 0.3s ease' }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="确认新密码"
            name="confirmPassword"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            disabled={isLoading}
            required
            sx={{ transition: 'all 0.3s ease' }}
          />
        </Grid>
      </Grid>

      <motion.div 
        variants={itemVariants} 
        className="mt-6 flex flex-wrap justify-end gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
              })
              setErrors({})
            }}
            disabled={isLoading}
            sx={{
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            清空
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="contained"
            onClick={handleUpdatePassword}
            disabled={isLoading}
            sx={{
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              textTransform: 'none'
            }}
          >
            {isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              '修改密码'
            )}
          </Button>
        </motion.div>
      </motion.div>
    </>
  )

  // 渲染账户安全信息
  const renderSecurityInfo = () => (
    <>
      <motion.div variants={itemVariants} className="mb-6">
        <Typography variant="h5" component="h2" fontWeight="600">
          账户安全
        </Typography>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          variants={itemVariants}
        >
          <Card 
            variant="outlined"
            sx={{
              borderRadius: 2,
              border: user?.isVerified ? '2px solid rgba(76, 175, 80, 0.3)' : '1px solid #e0e0e0',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                borderColor: user?.isVerified ? 'primary.main' : 'rgba(0, 0, 0, 0.1)'
              },
            }}
          >
            <CardContent className="flex flex-wrap justify-between items-center">
              <div className="flex items-center mb-3 sm:mb-0">
                <Box 
                  sx={{ 
                    bgcolor: user?.isVerified ? 'success.light' : 'info.light', 
                    p: 1.5, 
                    borderRadius: '50%', 
                    mr: 3,
                    transition: 'background-color 0.3s ease'
                  }}
                >
                  <Shield 
                    className={user?.isVerified ? 'text-success.main' : 'text-info.main'} 
                    sx={{ transition: 'color 0.3s ease' }}
                  />
                </Box>
                <div>
                  <Typography variant="subtitle1" fontWeight="600">
                    实名认证
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.isVerified ? '已通过认证' : '未认证'}
                  </Typography>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={user?.isVerified ? "outlined" : "contained"}
                  color={user?.isVerified ? "default" : "primary"}
                  size="small"
                  disabled={user?.isVerified || isLoading}
                  sx={{
                    borderRadius: 1,
                    transition: 'all 0.2s ease',
                    textTransform: 'none'
                  }}
                >
                  {user?.isVerified ? (
                    <>
                      <Check size={16} className="mr-1" />
                      已认证
                    </>
                  ) : (
                    '去认证'
                  )}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          variants={itemVariants}
        >
          <Card 
            variant="outlined"
            sx={{
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                borderColor: 'rgba(0, 0, 0, 0.1)'
              },
            }}
          >
            <CardContent className="flex justify-between items-center">
              <div className="flex items-center">
                <Box 
                  sx={{ 
                    bgcolor: 'warning.light', 
                    p: 1.5, 
                    borderRadius: '50%', 
                    mr: 3,
                    transition: 'background-color 0.3s ease'
                  }}
                >
                  <CalendarToday className="text-warning.main" />
                </Box>
                <div>
                  <Typography variant="subtitle1" fontWeight="600">
                    账户创建时间
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-' }
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          variants={itemVariants}
        >
          <Card 
            variant="outlined"
            sx={{
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                borderColor: 'rgba(0, 0, 0, 0.1)'
              },
            }}
          >
            <CardContent className="flex justify-between items-center">
              <div className="flex items-center">
                <Box 
                  sx={{ 
                    bgcolor: 'success.light', 
                    p: 1.5, 
                    borderRadius: '50%', 
                    mr: 3,
                    transition: 'background-color 0.3s ease'
                  }}
                >
                  <Award className="text-success.main" />
                </Box>
                <div>
                  <Typography variant="subtitle1" fontWeight="600">
                    用户等级
                  </Typography>
                  <Tooltip title={`用户角色: ${user?.role}`} placement="top">
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ cursor: 'help' }}
                    >
                      {user?.role === 'farmer' ? '普通农户' : user?.role === 'dealer' ? '经销商' : '管理员'}
                    </Typography>
                  </Tooltip>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="mt-8"
          >
            <Typography variant="h6" className="mb-4 font-medium"
              sx={{ fontWeight: 600 }}
            >
              安全验证
            </Typography>
            <Card 
              variant="outlined"
              sx={{
                borderRadius: 2,
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  borderColor: 'rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <CardContent>
                <Grid container spacing={{ xs: 3, sm: 4 }}>
                  <Grid item xs={12} sm={6}>
                    <motion.div 
                      className="flex items-center justify-between"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center">
                        <Box 
                          sx={{ 
                            bgcolor: 'primary.light', 
                            p: 1.5, 
                            borderRadius: '50%', 
                            mr: 3,
                            transition: 'background-color 0.3s ease',
                            '&:hover': {
                              bgcolor: 'primary.main',
                            }
                          }}
                        >
                          <Phone className="text-primary.main" />
                        </Box>
                        <div>
                          <Typography variant="subtitle1" fontWeight="600">
                            手机验证
                          </Typography>
                          <Tooltip 
                            title={user?.isPhoneVerified ? '手机已验证' : '请验证手机号以提升账户安全性'}
                            placement="top"
                          >
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ cursor: 'help' }}
                            >
                              {user?.isPhoneVerified ? (
                                <span className="flex items-center">
                                  <Check className="text-success.main mr-1" sx={{ fontSize: 16 }} />
                                  已验证
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <AlertCircle className="text-warning.main mr-1" sx={{ fontSize: 16 }} />
                                  未验证
                                </span>
                              )}
                            </Typography>
                          </Tooltip>
                        </div>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {}}
                          sx={{
                            borderRadius: 1.5,
                            borderColor: user?.isPhoneVerified ? 'success.main' : 'primary.main',
                            color: user?.isPhoneVerified ? 'success.main' : 'primary.main',
                            '&:hover': {
                              borderColor: user?.isPhoneVerified ? 'success.main' : 'primary.main',
                              bgcolor: user?.isPhoneVerified ? 'success.light' : 'primary.light',
                            },
                            transition: 'all 0.2s ease',
                            minWidth: isMobile ? '80px' : '100px',
                          }}
                        >
                          {user?.isPhoneVerified ? '重新验证' : '验证'}
                        </Button>
                      </motion.div>
                    </motion.div>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <motion.div 
                      className="flex items-center justify-between"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center">
                        <Box 
                          sx={{ 
                            bgcolor: 'info.light', 
                            p: 1.5, 
                            borderRadius: '50%', 
                            mr: 3,
                            transition: 'background-color 0.3s ease',
                            '&:hover': {
                              bgcolor: 'info.main',
                            }
                          }}
                        >
                          <Mail className="text-info.main" />
                        </Box>
                        <div>
                          <Typography variant="subtitle1" fontWeight="600">
                            邮箱验证
                          </Typography>
                          <Tooltip 
                            title={user?.isEmailVerified ? '邮箱已验证' : '请验证邮箱以提升账户安全性'}
                            placement="top"
                          >
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ cursor: 'help' }}
                            >
                              {user?.isEmailVerified ? (
                                <span className="flex items-center">
                                  <Check className="text-success.main mr-1" sx={{ fontSize: 16 }} />
                                  已验证
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <AlertCircle className="text-warning.main mr-1" sx={{ fontSize: 16 }} />
                                  未验证
                                </span>
                              )}
                            </Typography>
                          </Tooltip>
                        </div>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {}}
                          sx={{
                            borderRadius: 1.5,
                            borderColor: user?.isEmailVerified ? 'success.main' : 'info.main',
                            color: user?.isEmailVerified ? 'success.main' : 'info.main',
                            '&:hover': {
                              borderColor: user?.isEmailVerified ? 'success.main' : 'info.main',
                              bgcolor: user?.isEmailVerified ? 'success.light' : 'info.light',
                            },
                            transition: 'all 0.2s ease',
                            minWidth: isMobile ? '80px' : '100px',
                          }}
                        >
                          {user?.isEmailVerified ? '重新验证' : '验证'}
                        </Button>
                      </motion.div>
                    </motion.div>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>

        <motion.div variants={itemVariants} className="mt-8 space-y-4">
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={handleLogout}
              disabled={isLoading}
              sx={{
                borderRadius: 1.5,
                transition: 'all 0.3s ease',
                py: 1
              }}
            >
              退出登录
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={() => {
                // 这里可以添加确认对话框逻辑
                alert('注销账号将删除您的所有数据，此操作不可恢复');
                // handleDeleteAccount();
              }}
              disabled={isLoading}
              sx={{
                borderRadius: 1.5,
                borderColor: 'error.main',
                color: 'error.main',
                '&:hover': {
                  borderColor: 'error.main',
                  bgcolor: 'error.light',
                },
                transition: 'all 0.3s ease',
                py: 1
              }}
            >
              注销账号
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Typography 
              variant="caption" 
              color="text.secondary" 
              className="text-center"
              sx={{ display: 'block', opacity: 0.8 }}
            >
              注销账号将删除您的所有数据，此操作不可恢复
            </Typography>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
   )

  return (
    
      <Container maxWidth="md" sx={{ py: 8 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          {/* 页面标题 */}
          <motion.div variants={itemVariants} className="mb-6">
            <Typography variant="h4" component="h1" fontWeight="bold" className="text-primary mb-2">
              个人中心
            </Typography>
            <Typography variant="body2" color="text.secondary">
              管理您的账户信息和安全设置
            </Typography>
          </motion.div>

          {/* 标签切换 */}
          <motion.div variants={itemVariants} className="mb-6">
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '0.95rem',
                },
              }}
            >
              <Tab label="基本信息" />
              <Tab label="密码设置" />
              <Tab label="账户安全" />
            </Tabs>
          </motion.div>

          {/* 内容区域 */}
          <Card elevation={3} className="overflow-hidden rounded-xl">
            <CardContent className="p-6">
              {activeTab === 0 && renderUserInfoForm()}
              {activeTab === 1 && renderPasswordForm()}
              {activeTab === 2 && renderSecurityInfo()}
            </CardContent>
          </Card>
        </motion.div>

        {/* 头像上传对话框 */}
        <Dialog open={avatarDialogOpen} onClose={() => setAvatarDialogOpen(false)}>
          <DialogTitle>更换头像</DialogTitle>
          <DialogContent>
            <Box className="py-4 text-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                component="span"
                onClick={() => fileInputRef.current?.click()}
                startIcon={<Upload />}
                sx={{
                  py: 1.5,
                  px: 4,
                  textTransform: 'none',
                }}
              >
                选择图片
              </Button>
              <Typography variant="body2" color="text.secondary" className="mt-2">
                支持 JPG, PNG 格式，文件大小不超过 2MB
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAvatarDialogOpen(false)}>
              取消
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    
  )
}

export default UserProfilePage