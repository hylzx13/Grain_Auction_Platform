import React from 'react'
import { Container, Typography, Box, Grid, Paper } from '@mui/material'
import { Link } from 'react-router-dom'

const ContentDisplayPage: React.FC = () => {
  const projects = [
    {
      title: '粮食遥感监测系统',
      description: '利用卫星遥感技术监测粮食生长状况，提供精准农业数据分析',
      category: '技术创新'
    },
    {
      title: '智能价格预测模型',
      description: '基于历史数据和市场因素，预测粮食价格走势，辅助决策',
      category: '数据分析'
    },
    {
      title: '质检报告信息提取系统',
      description: '自动从农科院质检报告中提取关键信息，实现数据结构化',
      category: '人工智能'
    }
  ]

  return (
    <Box sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 6, color: '#333' }}>
          项目展示
        </Typography>
        
        <Grid container spacing={4}>
          {projects.map((project, index) => {
            // 根据项目索引确定导航路径
            const getPath = () => {
              switch(index) {
                case 0: return '/content/concept'; // 概念介绍页面
                case 1: return '/content/model';   // 模型讲解页面
                case 2: return '/content/implementation'; // 实现方式页面
                default: return '/content';
              }
            };
            
            return (
              <Grid item xs={12} md={4} key={index}>
                <Link 
                  to={getPath()} 
                  style={{ textDecoration: 'none' }}
                >
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 4, 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s, cursor 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 5,
                        cursor: 'pointer'
                      }
                    }}
                  >
                    <Typography variant="h6" component="h2" gutterBottom sx={{ color: '#4CAF50' }}>
                      {project.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {project.category}
                    </Typography>
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                      {project.description}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 2, color: '#4CAF50', display: 'flex', alignItems: 'center' }}>
                      了解更多 
                      <Box sx={{ ml: 1, width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: '6px solid #4CAF50' }} />
                    </Typography>
                  </Paper>
                </Link>
              </Grid>
            );
          })}
        </Grid>
        
        <Box sx={{ mt: 10, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            更多项目信息，请联系我们的技术团队
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default ContentDisplayPage