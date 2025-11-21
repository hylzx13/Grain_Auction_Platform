import React, { useState } from 'react'
import { Box, Container, Typography, TextField, Button, Paper, Avatar, Link, Grid, Alert, CircularProgress, useMediaQuery, useTheme } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const LoginPage: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // 清除对应字段的错误信息
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
    // 清除全局错误信息
    setErrorMessage(null)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名'
    }

    if (!formData.password) {
      newErrors.password = 'Please enter password'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await login({
        username: formData.username,
        password: formData.password
      })
      // Login success -> redirect based on role
      navigate('/')
    } catch (error) {
      setErrorMessage('Login failed, please check your username and password')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        py: 8
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.98)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}
          >
            <Avatar sx={{ m: 1, bgcolor: theme.palette.primary.main }} />
            <Typography component="h1" variant="h5" fontWeight="bold"
            >
              登录账户
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}
            >
              欢迎使用粮食拍卖平台
            </Typography>
          </Box>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3 }}
            >
              {errorMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate
            >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="用户名"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: errors.username ? theme.palette.error.main : theme.palette.divider,
                  },
                  '&:hover fieldset': {
                    borderColor: errors.username ? theme.palette.error.main : theme.palette.primary.light,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: errors.username ? theme.palette.error.main : theme.palette.primary.main,
                  },
                },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="密码"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: errors.password ? theme.palette.error.main : theme.palette.divider,
                  },
                  '&:hover fieldset': {
                    borderColor: errors.password ? theme.palette.error.main : theme.palette.primary.light,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: errors.password ? theme.palette.error.main : theme.palette.primary.main,
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 500,
                borderRadius: 2,
                bgcolor: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                }
              }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                '登录'
              )}
            </Button>

            <Grid container
              >
              <Grid item xs
                >
                <Link href="#" variant="body2">
                  忘记密码？
                </Link>
              </Grid>
              <Grid item>
                <Link
                  component={RouterLink}
                  to="/register"
                  variant="body2"
                  underline="hover"
                >
                  还没有账号？立即注册
                </Link>
              </Grid>
            </Grid>
          </form>

          <Box sx={{ mt: 4, textAlign: 'center' }}
          >
            <Typography variant="body2" color="text.secondary"
            >
              登录即表示您同意我们的
              <Link href="#" variant="body2"
                >
                服务条款
              </Link>
              和
              <Link href="#" variant="body2"
                >
                隐私政策
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default LoginPage