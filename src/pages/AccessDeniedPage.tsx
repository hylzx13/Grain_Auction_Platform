import React from 'react'
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  Alert
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Info, ArrowBack } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleGoHome = () => {
    navigate('/')
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleLogin = () => {
    navigate('/login')
  }

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        when: 'beforeChildren',
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  return (
    
      <Container maxWidth="md" sx={{ py: 16 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center"
        >
          <Paper elevation={3} className="w-full p-8 rounded-xl text-center">
            <motion.div variants={itemVariants} className="mb-6">
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'error.light',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 2rem',
                  animation: 'pulse 2s infinite'
                }}
              >
                <Lock fontSize="4rem" color="error.main" />
              </Box>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Typography variant="h3" component="h1" fontWeight="bold" className="text-error mb-4">
                访问被拒绝
              </Typography>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Typography variant="body1" className="mb-6 text-gray-700 max-w-md mx-auto">
                {user ? '您没有权限访问此页面，请联系管理员获取适当的权限。' : '请登录后再尝试访问此页面。'}
              </Typography>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-6">
              <Alert
                severity="warning"
                icon={<Info />}
                className="max-w-md mx-auto"
              >
                {user ? `您当前的用户角色是：${user.role === 'farmer' ? '农户' : user.role === 'dealer' ? '经销商' : '管理员'}` : '请使用正确的账户登录系统。'}
              </Alert>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3">
              <Button
                variant="contained"
                onClick={handleGoBack}
                startIcon={<ArrowBack />}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 500
                }}
              >
                返回上一页
              </Button>
              
              {user ? (
                <Button
                  variant="outlined"
                  onClick={handleGoHome}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 500
                  }}
                >
                  返回首页
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={handleLogin}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 500
                  }}
                >
                  前往登录
                </Button>
              )}
            </motion.div>
          </Paper>
        </motion.div>
      </Container>
    
  )
}

export default AccessDeniedPage