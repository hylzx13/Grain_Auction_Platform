import React, { useState, useRef } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Link,
  Divider,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
  FormControl,
  InputAdornment,
  IconButton,
  Checkbox,
  Avatar,
  Step,
  StepLabel,
  Stepper
} from '@mui/material'
import { Mail, Lock, User, Phone, Building, Shield, ChevronRight, Eye, EyeOff, Upload, Check } from '@mui/icons-material'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { motion } from 'framer-motion'
// 移除对已删除AuthContext的引用
import { toast } from 'react-toastify'

// 用户角色类型
type UserRole = 'farmer' | 'dealer' | 'admin'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  
  // 模拟注册功能
  const register = async (userData: any) => {
    console.log('模拟注册:', userData);
    return { success: true };
  };
  
  const isAuthenticated = false;
  
  const [activeStep, setActiveStep] = useState(0)
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    realName: '',
    idCard: '',
    address: '',
    companyName: '',
    businessLicense: '',
    contactPerson: ''
  })
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 表单步骤
  const steps = ['基本信息', '身份验证', '注册完成']

  // 如果已登录，重定向到首页
  // 移除对isAuthenticated的依赖，因为我们已经将其设为false

  // 表单验证 - 根据当前步骤
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}
    
    // 第一步验证：基本信息
    if (activeStep === 0) {
      // 用户名验证
      if (!formData.username) {
        newErrors.username = '请输入用户名'
      } else if (formData.username.length < 3) {
        newErrors.username = '用户名至少3个字符'
      }
      
      // 邮箱验证
      if (!formData.email) {
        newErrors.email = '请输入邮箱地址'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = '请输入有效的邮箱地址'
      }
      
      // 密码验证
      if (!formData.password) {
        newErrors.password = '请输入密码'
      } else if (formData.password.length < 6) {
        newErrors.password = '密码长度至少为6位'
      } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = '密码必须包含字母和数字'
      }
      
      // 确认密码验证
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = '请确认密码'
      } else if (formData.confirmPassword !== formData.password) {
        newErrors.confirmPassword = '两次输入的密码不一致'
      }
      
      // 手机号验证
      if (!formData.phone) {
        newErrors.phone = '请输入手机号'
      } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
        newErrors.phone = '请输入有效的手机号'
      }
    }
    
    // 第二步验证：身份信息
    if (activeStep === 1) {
      // 真实姓名验证
      if (!formData.realName) {
        newErrors.realName = '请输入真实姓名'
      }
      
      // 身份证验证
      if (!formData.idCard) {
        newErrors.idCard = '请输入身份证号'
      } else if (!/^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/.test(formData.idCard)) {
        newErrors.idCard = '请输入有效的身份证号'
      }
      
      // 地址验证
      if (!formData.address) {
        newErrors.address = '请输入详细地址'
      }
      
      // 经销商特有验证
      if (selectedRole === 'dealer') {
        if (!formData.companyName) {
          newErrors.companyName = '请输入公司名称'
        }
        if (!formData.contactPerson) {
          newErrors.contactPerson = '请输入联系人'
        }
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 处理表单输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
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

  // 处理角色选择
  const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRole(event.target.value as UserRole)
  }

  // 处理许可证上传
  const handleLicenseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 这里可以实现文件上传逻辑
      setFormData(prev => ({
        ...prev,
        businessLicense: file.name
      }))
    }
  }

  // 切换密码可见性
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  // 处理下一步
  const handleNext = async () => {
    if (validateForm()) {
      if (activeStep === steps.length - 1) {
        // 最终提交注册
        handleSubmit()
      } else {
        setActiveStep(prevActiveStep => prevActiveStep + 1)
      }
    }
  }

  // 处理上一步
  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  // 提交注册
  const handleSubmit = async () => {
    if (!validateForm() || !agreedToTerms) {
      if (!agreedToTerms) {
        toast.error('请阅读并同意服务条款和隐私政策')
      }
      return
    }
    
    setIsLoading(true)
    
    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: selectedRole,
        realName: formData.realName,
        idCard: formData.idCard,
        address: formData.address,
        companyName: formData.companyName,
        contactPerson: formData.contactPerson
      }
      
      await register(userData)
      toast.success('注册成功！请登录')
      navigate('/login')
    } catch (error: any) {
      toast.error(error.message || '注册失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: 'beforeChildren',
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  }

  // 渲染步骤内容
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <motion.div variants={itemVariants} className="mb-6">
              <Typography variant="h6" className="mb-4 font-medium">
                选择用户类型
              </Typography>
              <RadioGroup value={selectedRole} onChange={handleRoleChange} row>
                <FormControlLabel 
                  value="farmer" 
                  control={<Radio color="primary" />} 
                  label="农户" 
                  sx={{ mr: 4 }}
                />
                <FormControlLabel 
                  value="dealer" 
                  control={<Radio color="primary" />} 
                  label="经销商" 
                  sx={{ mr: 4 }}
                />
                <FormControlLabel 
                  value="admin" 
                  control={<Radio color="primary" />} 
                  label="管理员" 
                />
              </RadioGroup>
            </motion.div>

            <motion.div variants={itemVariants}>
              <TextField
                fullWidth
                variant="outlined"
                margin="normal"
                label="用户名"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User className="text-gray-400" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderRadius: 1,
                    },
                  },
                }}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <TextField
                fullWidth
                variant="outlined"
                margin="normal"
                label="邮箱地址"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail className="text-gray-400" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderRadius: 1,
                    },
                  },
                }}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <TextField
                fullWidth
                variant="outlined"
                margin="normal"
                label="密码"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock className="text-gray-400" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility}>
                        {showPassword ? <EyeOff className="text-gray-400" /> : <Eye className="text-gray-400" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderRadius: 1,
                    },
                  },
                }}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <TextField
                fullWidth
                variant="outlined"
                margin="normal"
                label="确认密码"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock className="text-gray-400" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={toggleConfirmPasswordVisibility}>
                        {showConfirmPassword ? <EyeOff className="text-gray-400" /> : <Eye className="text-gray-400" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderRadius: 1,
                    },
                  },
                }}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <TextField
                fullWidth
                variant="outlined"
                margin="normal"
                label="手机号"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone className="text-gray-400" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderRadius: 1,
                    },
                  },
                }}
              />
            </motion.div>
          </>
        )
      case 1:
        return (
          <>
            <motion.div variants={itemVariants}>
              <TextField
                fullWidth
                variant="outlined"
                margin="normal"
                label="真实姓名"
                name="realName"
                value={formData.realName}
                onChange={handleChange}
                error={!!errors.realName}
                helperText={errors.realName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User className="text-gray-400" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderRadius: 1,
                    },
                  },
                }}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <TextField
                fullWidth
                variant="outlined"
                margin="normal"
                label="身份证号"
                name="idCard"
                value={formData.idCard}
                onChange={handleChange}
                error={!!errors.idCard}
                helperText={errors.idCard}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Shield className="text-gray-400" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderRadius: 1,
                    },
                  },
                }}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <TextField
                fullWidth
                variant="outlined"
                margin="normal"
                label="详细地址"
                name="address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleChange}
                error={!!errors.address}
                helperText={errors.address}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderRadius: 1,
                    },
                  },
                }}
              />
            </motion.div>

            {selectedRole === 'dealer' && (
              <>
                <motion.div variants={itemVariants}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    label="公司名称"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    error={!!errors.companyName}
                    helperText={errors.companyName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Building className="text-gray-400" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderRadius: 1,
                        },
                      },
                    }}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    label="联系人"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    error={!!errors.contactPerson}
                    helperText={errors.contactPerson}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <User className="text-gray-400" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderRadius: 1,
                        },
                      },
                    }}
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="mt-4">
                  <Typography variant="subtitle2" className="mb-2">
                    上传营业执照（可选）
                  </Typography>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLicenseUpload}
                    style={{ display: 'none' }}
                  />
                  <Button
                    variant="outlined"
                    component="span"
                    onClick={() => fileInputRef.current?.click()}
                    startIcon={<Upload />}
                    sx={{
                      py: 1,
                      borderRadius: 1,
                      textTransform: 'none',
                    }}
                  >
                    选择文件
                  </Button>
                  {formData.businessLicense && (
                    <div className="flex items-center mt-2 text-sm text-success">
                      <Check size={16} className="mr-1" />
                      <span>已上传: {formData.businessLicense}</span>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </>
        )
      case 2:
        return (
          <>
            <motion.div variants={itemVariants} className="text-center py-6">
              <Avatar sx={{ bgcolor: 'success.main', width: 80, height: 80, mb: 4 }}>
                <Check size={40} />
              </Avatar>
              <Typography variant="h5" component="h2" className="mb-2 font-medium">
                信息填写完成
              </Typography>
              <Typography variant="body1" color="text.secondary" className="mb-6">
                请确认以下信息无误，并阅读同意我们的服务条款
              </Typography>

              <div className="max-w-md mx-auto bg-gray-50 p-4 rounded-lg mb-6">
                <Typography variant="subtitle2" className="font-medium mb-2">
                  注册信息摘要
                </Typography>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">用户类型:</div>
                  <div className="font-medium">
                    {selectedRole === 'farmer' ? '农户' : 
                     selectedRole === 'dealer' ? '经销商' : '管理员'}
                  </div>
                  <div className="text-gray-600">用户名:</div>
                  <div>{formData.username}</div>
                  <div className="text-gray-600">邮箱:</div>
                  <div>{formData.email}</div>
                  <div className="text-gray-600">手机号:</div>
                  <div>{formData.phone}</div>
                  <div className="text-gray-600">真实姓名:</div>
                  <div>{formData.realName}</div>
                </div>
              </div>

              <motion.div variants={itemVariants} className="flex items-center justify-center mb-6">
                <Checkbox
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  color="primary"
                  size="small"
                  className="mr-2"
                />
                <Typography variant="body2" color="text.secondary" className="text-center">
                  我已阅读并同意
                  <Link href="/terms" className="text-primary hover:underline mx-1">服务条款</Link>
                  和
                  <Link href="/privacy" className="text-primary hover:underline mx-1">隐私政策</Link>
                </Typography>
              </motion.div>
            </motion.div>
          </>
        )
      default:
        return null
    }
  }

  return (
    
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          {/* 顶部标题 */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <Typography variant="h4" component="h1" fontWeight="bold" className="text-primary mb-2">
              创建账户
            </Typography>
            <Typography variant="body1" color="text.secondary">
              填写以下信息完成注册，开启您的粮食交易之旅
            </Typography>
          </motion.div>

          <Card elevation={3} className="overflow-hidden rounded-xl">
            <CardContent className="p-6">
              {/* 步骤指示器 */}
              <motion.div variants={itemVariants} className="mb-6">
                <Stepper activeStep={activeStep} alternativeLabel>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </motion.div>

              {/* 步骤内容 */}
              {renderStepContent(activeStep)}

              {/* 导航按钮 */}
              <motion.div variants={itemVariants} className="mt-8 flex justify-between">
                <Button
                  disabled={activeStep === 0 || isLoading}
                  onClick={handleBack}
                  variant="outlined"
                  sx={{
                    py: 1.2,
                    borderRadius: 1,
                    textTransform: 'none',
                  }}
                >
                  上一步
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={isLoading}
                  endIcon={activeStep !== steps.length - 1 ? <ChevronRight /> : null}
                  sx={{
                    py: 1.2,
                    borderRadius: 1,
                    textTransform: 'none',
                    backgroundColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    },
                    minWidth: 120,
                  }}
                  className="flex items-center justify-center"
                >
                  {isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : activeStep === steps.length - 1 ? (
                    '完成注册'
                  ) : (
                    '下一步'
                  )}
                </Button>
              </motion.div>
            </CardContent>
          </Card>

          {/* 登录提示 */}
          <motion.div variants={itemVariants} className="mt-6 text-center">
            <Typography variant="body2" color="text.secondary">
              已有账户？
              <Link
                component={RouterLink}
                to="/login"
                className="text-primary ml-1 font-medium hover:underline"
              >
                立即登录
              </Link>
            </Typography>
          </motion.div>
        </motion.div>
      </Container>
    
  )
}

export default RegisterPage