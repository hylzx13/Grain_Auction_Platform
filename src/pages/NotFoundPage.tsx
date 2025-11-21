import React from 'react'
import { Container, Typography, Box, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="md" sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h1" component="h1" gutterBottom sx={{ color: '#4CAF50', mb: 2 }}>
          404
        </Typography>
        <Typography variant="h4" gutterBottom>
          页面不存在
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
          您访问的页面可能已经移动、删除或输入了错误的地址
        </Typography>
        <Button
          variant="contained"
          onClick={handleGoHome}
          sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' } }}
        >
          返回首页
        </Button>
      </Container>
    </Box>
  )
}

export default NotFoundPage