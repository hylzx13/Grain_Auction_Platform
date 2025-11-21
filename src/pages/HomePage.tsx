import React from 'react'
import { Box, Container, Typography, Grid, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const HomePage: React.FC = () => {
  const navigate = useNavigate()

  const handleQuickStart = () => {
    navigate('/auction')
  }

  return (
    <Box sx={{ bgcolor: '#F5F7FA', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: '#4CAF50',
          color: 'white',
          py: 16,
          px: 2,
          backgroundImage: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  letterSpacing: '-0.025em',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                专业级粮食拍卖平台
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                深度集成遥感技术与农科院质检报告信息提取功能
              </Typography>
              <Typography variant="body1" sx={{ mb: 6, fontSize: '1.1rem' }}>
                为农户提供透明、高效的粮食销售渠道，为经销商提供可靠的采购平台。
                通过先进技术确保粮食质量可追溯，提升市场置信度与交易透明度。
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="secondary"
                  size="large"
                  onClick={handleQuickStart}
                  sx={{ bgcolor: '#FF9800', '&:hover': { bgcolor: '#F57C00' } }}
                >
                  立即开始
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'rgba(255,255,255,0.8)' } }}
                >
                  了解更多
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="white" gutterBottom>
                  欢迎使用粮食拍卖平台
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                  点击下方按钮开始浏览拍卖项目
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom sx={{ mb: 2 }}>
          平台核心功能
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 10, maxWidth: 700, mx: 'auto' }}>
          我们的平台集成了先进的技术和完善的功能，为粮食交易提供全方位的支持和保障
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 2, boxShadow: 1, textAlign: 'center' }}>
              <Typography variant="h5" color="primary" gutterBottom>
                实时拍卖竞价
              </Typography>
              <Typography variant="body1" color="text.secondary">
                支持阶梯式加价、定时竞价与自动出价策略
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 2, boxShadow: 1, textAlign: 'center' }}>
              <Typography variant="h5" color="primary" gutterBottom>
                智能价格预测
              </Typography>
              <Typography variant="body1" color="text.secondary">
                采用XGBoost算法构建商品起拍价预测模型
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 2, boxShadow: 1, textAlign: 'center' }}>
              <Typography variant="h5" color="primary" gutterBottom>
                遥感技术验证
              </Typography>
              <Typography variant="body1" color="text.secondary">
                提供种植面积、生长阶段等关键数据验证
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: '#4CAF50',
          color: 'white',
          py: 12,
          px: 2,
          mt: 12,
          backgroundImage: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom sx={{ mb: 6 }}>
            准备好开始您的粮食交易了吗？
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/register')}
              sx={{ bgcolor: 'white', color: '#4CAF50', '&:hover': { bgcolor: '#f0f0f0' } }}
            >
              立即注册
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => navigate('/login')}
              sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'rgba(255,255,255,0.8)' } }}
            >
              登录系统
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default HomePage