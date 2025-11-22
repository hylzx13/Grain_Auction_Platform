import React, { useState, useEffect } from 'react'
import { Box, Container, Typography, TextField, Button, Paper, Avatar, Link, Alert, CircularProgress, useMediaQuery, useTheme, LinearProgress } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useVerificationCode } from '../services/verificationService'
import { checkPasswordStrength, getStrengthColor, getStrengthProgressWidth } from '../services/passwordStrengthService'
import { securityLogger } from '../services/loggingService'

const ForgotPasswordPage: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()
  
  // 状态管理
  const [step, setStep] = useState<'verify' | 'reset'>('verify')
  const [formData, setFormData] = useState({
    contact: '', // 手机号或邮箱
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // 密码强度相关状态
  const [passwordStrength, setPasswordStrength] = useState({
    strength: 'weak' as const,
    score: 0,
    message: '',
    suggestions: []
  })
  
  // 使用验证码服务
  const { countdown, error: verificationError, sendCode, verifyCode, setCountdown } = useVerificationCode()
  
  // 密码强度检测
  useEffect(() => {
    if (formData.newPassword) {
      const result = checkPasswordStrength(formData.newPassword)
      setPasswordStrength(result)
    } else {
      setPasswordStrength({
        strength: 'weak',
        score: 0,
        message: '',
        suggestions: []
      })
    }
  }, [formData.newPassword])
  
  // 验证两次密码是否匹配
  useEffect(() => {
    if (formData.confirmPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: '两次输入的密码不一致' }))
      } else if (errors.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: '' }))
      }
    }
  }, [formData.newPassword, formData.confirmPassword, errors.confirmPassword])
  
  // 处理倒计时
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [countdown])
  
  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // 对验证码进行特殊处理，只允许数字输入
    let processedValue = value
    if (name === 'verificationCode') {
      processedValue = value.replace(/[^0-9]/g, '')
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }))
    
    // 清除对应字段的错误信息
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    
    // 清除全局错误信息
    setErrorMessage(null)
    
    // 密码强度检测会通过useEffect自动处理，不需要在这里额外调用
  }
  
  // 验证联系方式（手机号或邮箱）
  const isValidContact = (contact: string): boolean => {
    // 手机号验证（简单版）
    const phoneRegex = /^1[3-9]\d{9}$/
    // 邮箱验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return phoneRegex.test(contact) || emailRegex.test(contact)
  }
  
  // 密码强度检测使用从外部引入的函数
  
  // 验证验证码表单
  const validateVerifyForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.contact.trim()) {
      newErrors.contact = '请输入手机号或邮箱'
    } else if (!isValidContact(formData.contact)) {
      newErrors.contact = '请输入有效的手机号或邮箱'
    }
    
    if (!formData.verificationCode.trim()) {
      newErrors.verificationCode = '请输入验证码'
    } else if (!/^\d{6}$/.test(formData.verificationCode)) {
      newErrors.verificationCode = '验证码必须是6位数字'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  // 后续将使用更完善的验证函数实现
    
    // 验证确认密码
    const newErrors: Record<string, string> = {}
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认新密码'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  // 验证重置密码表单
  const validateResetForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.newPassword) {
      newErrors.newPassword = '请输入新密码'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = '密码至少需要8个字符'
    } else {
      // 检查密码复杂性
      const hasUpperCase = /[A-Z]/.test(formData.newPassword)
      const hasLowerCase = /[a-z]/.test(formData.newPassword)
      const hasNumbers = /\d/.test(formData.newPassword)
      const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)
      
      if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars)) {
        newErrors.newPassword = '密码必须同时包含大小写字母、数字和特殊字符'
      } else if (passwordStrength.score < 3) {
        newErrors.newPassword = '密码强度不足，请使用更复杂的密码组合'
      }
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认新密码'
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  // 发送验证码
  const handleSendCode = async () => {
    if (!formData.contact.trim() || !isValidContact(formData.contact)) {
      setErrors({ contact: '请输入有效的手机号或邮箱' })
      return
    }
    
    // 清除之前的错误
    setErrorMessage(null)
    
    // 记录忘记密码请求
    securityLogger.forgotPasswordRequested(formData.contact)
    
    const result = await sendCode(formData.contact)
    
    if (result.success) {
      setSuccessMessage('验证码已发送，请查收')
      setTimeout(() => setSuccessMessage(null), 3000)
      
      // 记录日志
      console.log(`向 ${formData.contact} 发送了验证码`)
      securityLogger.verificationCodeSent(formData.contact, true)
    } else {
      const errorMsg = result.error || verificationError || '发送验证码失败'
      setErrorMessage(errorMsg)
      securityLogger.verificationCodeSent(formData.contact, false, errorMsg)
    }
  }
  
  // 验证验证码
  const handleVerifyCode = async () => {
    if (!validateVerifyForm()) return
    
    setLoading(true)
    try {
      const result = await verifyCode(formData.contact, formData.verificationCode)
      
      if (!result.success) {
        setErrorMessage(result.error || '验证码错误')
        // 记录验证失败，但错误日志已在verifyCode中记录
        return
      }
      
      // 验证成功，进入重置密码步骤
      setStep('reset')
      setSuccessMessage('验证成功，请设置新密码')
      setTimeout(() => setSuccessMessage(null), 3000)
      
      // 记录日志
      console.log(`用户 ${formData.contact} 验证码验证成功`)
      securityLogger.passwordResetInitiated(formData.contact)
    } catch (error) {
      setErrorMessage('验证过程中出现错误，请稍后重试')
      console.error('验证验证码错误:', error)
      securityLogger.verificationCodeVerified(formData.contact, false, 0)
    } finally {
      setLoading(false)
    }
  }
  
  // 重置密码
  const handleResetPassword = async () => {
    if (!validateResetForm()) {
      // 验证失败时记录日志
      securityLogger.passwordResetFailed(formData.contact, 'validation_error')
      return
    }
    
    setLoading(true)
    try {
        // 这里应该调用实际的密码重置API
        console.log('重置密码:', formData)
        console.log(`为用户 ${formData.contact} 重置密码，密码强度：${passwordStrength.score}/6`)
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 记录密码重置成功
        securityLogger.passwordResetSuccess(formData.contact)
        
        // 跳转到密码重置成功页面
        navigate('/reset-password-success')
    } catch (error) {
      console.error('重置密码失败:', error)
      setErrorMessage('重置密码失败，请稍后重试')
      securityLogger.passwordResetFailed(formData.contact, 'server_error')
    } finally {
      setLoading(false)
    }
  }
  
  // 渲染验证码步骤
  const renderVerifyStep = () => (
    <>
      <TextField
        margin="normal"
        required
        fullWidth
        id="contact"
        label="手机号或邮箱"
        name="contact"
        autoComplete="username"
        autoFocus
        value={formData.contact}
        onChange={handleChange}
        error={!!errors.contact}
        helperText={errors.contact || '请输入您的手机号或邮箱地址'}
        placeholder="例如: user@example.com 或 13800138000"
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: errors.contact ? theme.palette.error.main : theme.palette.divider,
            },
            '&:hover fieldset': {
              borderColor: errors.contact ? theme.palette.error.main : theme.palette.primary.light,
            },
            '&.Mui-focused fieldset': {
              borderColor: errors.contact ? theme.palette.error.main : theme.palette.primary.main,
            },
          },
        }}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        id="verificationCode"
        label="验证码"
        name="verificationCode"
        InputProps={{
          endAdornment: (
            <Button
              variant="outlined"
              size="small"
              onClick={handleSendCode}
              disabled={countdown > 0 || loading}
              sx={{
                ml: 1,
                minWidth: 'auto',
                color: countdown > 0 ? theme.palette.text.secondary : theme.palette.primary.main,
                borderColor: countdown > 0 ? theme.palette.divider : theme.palette.primary.main,
                '&:hover': {
                  borderColor: countdown > 0 ? theme.palette.divider : theme.palette.primary.dark,
                  backgroundColor: 'transparent'
                }
              }}
            >
              {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
            </Button>
          )
        }}
        value={formData.verificationCode}
        onChange={handleChange}
        error={!!errors.verificationCode}
        helperText={errors.verificationCode || '请输入6位数字验证码'}
        placeholder="请输入收到的验证码"
        inputProps={{ maxLength: 6 }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: errors.verificationCode ? theme.palette.error.main : theme.palette.divider,
            },
            '&:hover fieldset': {
              borderColor: errors.verificationCode ? theme.palette.error.main : theme.palette.primary.light,
            },
            '&.Mui-focused fieldset': {
              borderColor: errors.verificationCode ? theme.palette.error.main : theme.palette.primary.main,
            },
          },
        }}
      />

      <Button
        type="button"
        fullWidth
        variant="contained"
        sx={{
          mt: 3,
          mb: 2,
          py: isMobile ? 1.25 : 1.5,
          fontSize: { xs: '0.9375rem', sm: '1rem' },
          fontWeight: 500,
          borderRadius: 2,
          bgcolor: theme.palette.primary.main,
          '&:hover': {
            bgcolor: theme.palette.primary.dark,
          },
          '&.Mui-disabled': {
            bgcolor: theme.palette.action.disabledBackground,
            color: theme.palette.action.disabled
          },
          transition: 'all 0.2s ease-in-out',
          transform: 'translateY(0)',
          '&:active': {
            transform: 'translateY(2px)'
          }
        }}
        onClick={handleVerifyCode}
        disabled={loading}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          '继续'
        )}
      </Button>
    </>
  )
  
  // 渲染重置密码步骤
  const renderResetStep = () => (
    <>
      <TextField
        margin="normal"
        required
        fullWidth
        id="newPassword"
        label="新密码"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        value={formData.newPassword}
        onChange={handleChange}
        error={!!errors.newPassword}
        helperText={errors.newPassword || '密码必须包含大小写字母、数字和特殊符号'}
        placeholder="请输入强密码"
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: errors.newPassword ? theme.palette.error.main : theme.palette.divider,
              transition: 'border-color 0.2s ease',
            },
            '&:hover fieldset': {
              borderColor: errors.newPassword ? theme.palette.error.main : theme.palette.primary.light,
            },
            '&.Mui-focused fieldset': {
              borderColor: errors.newPassword ? theme.palette.error.main : theme.palette.primary.main,
              boxShadow: errors.newPassword 
                ? `0 0 0 2px ${theme.palette.error.main}33` 
                : `0 0 0 2px ${theme.palette.primary.main}33`
            },
          },
        }}
      />
          
          {/* 密码强度显示 */}
          {formData.newPassword && (
            <Box sx={{ 
              mt: 1, 
              mb: 2,
              animation: 'slideInUp 0.3s ease-out',
              '@keyframes slideInUp': {
                '0%': { opacity: 0, transform: 'translateY(10px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' }
              }
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography 
                  variant="caption" 
                  color={getStrengthColor(passwordStrength.strength)}
                  sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  密码强度: {passwordStrength.strength === 'weak' ? '弱' : passwordStrength.strength === 'medium' ? '中' : '强'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  分数: {passwordStrength.score}/6
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={getStrengthProgressWidth(passwordStrength.strength)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease-in-out',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getStrengthColor(passwordStrength.strength),
                    transition: 'background-color 0.3s ease'
                  }
                }}
              />
              <Box sx={{ mt: 1 }}>
                {passwordStrength.suggestions && passwordStrength.suggestions.length > 0 ? (
                  passwordStrength.suggestions.map((suggestion, index) => (
                    <Typography 
                      key={index} 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        display: 'block', 
                        mb: 0.5, 
                        fontSize: { xs: '0.75rem', sm: '0.8125rem' }
                      }}
                    >
                      • {suggestion}
                    </Typography>
                  ))
                ) : (
                  <Box>
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        display: 'block', 
                        mb: 0.5, 
                        fontSize: { xs: '0.75rem', sm: '0.8125rem' }
                      }}
                    >
                      • 包含大小写字母
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        display: 'block', 
                        mb: 0.5, 
                        fontSize: { xs: '0.75rem', sm: '0.8125rem' }
                      }}
                    >
                      • 包含数字和特殊符号
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        display: 'block', 
                        fontSize: { xs: '0.75rem', sm: '0.8125rem' }
                      }}
                    >
                      • 长度至少8个字符
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}

      <TextField
        margin="normal"
        required
        fullWidth
        id="confirmPassword"
        label="确认新密码"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword || '请再次输入密码以确认'}
        placeholder="请再次输入密码"
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: errors.confirmPassword ? theme.palette.error.main : theme.palette.divider,
              transition: 'border-color 0.2s ease',
            },
            '&:hover fieldset': {
              borderColor: errors.confirmPassword ? theme.palette.error.main : theme.palette.primary.light,
            },
            '&.Mui-focused fieldset': {
              borderColor: errors.confirmPassword ? theme.palette.error.main : theme.palette.primary.main,
              boxShadow: errors.confirmPassword 
                ? `0 0 0 2px ${theme.palette.error.main}33` 
                : `0 0 0 2px ${theme.palette.primary.main}33`
            },
          },
        }}
      />

      <Button
        type="button"
        fullWidth
        variant="contained"
        sx={{
          mt: 3,
          mb: 2,
          py: isMobile ? 1.25 : 1.5,
          fontSize: { xs: '0.9375rem', sm: '1rem' },
          fontWeight: 500,
          borderRadius: 2,
          bgcolor: theme.palette.primary.main,
          '&:hover': {
            bgcolor: theme.palette.primary.dark,
          },
          '&.Mui-disabled': {
            bgcolor: theme.palette.action.disabledBackground,
            color: theme.palette.action.disabled
          },
          transition: 'all 0.2s ease-in-out',
          transform: 'translateY(0)',
          '&:active': {
            transform: 'translateY(2px)'
          }
        }}
        onClick={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          '保存新密码'
        )}
      </Button>
    </>
  );
export default ForgotPasswordPage