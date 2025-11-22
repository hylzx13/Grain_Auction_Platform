import React from 'react'
import { Container, Typography, Box, Paper, Grid } from '@mui/material'
import { Link } from 'react-router-dom'

const ContentConceptPage: React.FC = () => {
  return (
    <Box sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        {/* 面包屑导航 */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
          <Link to="/content" style={{ textDecoration: 'none', color: '#4CAF50' }}>
            项目展示
          </Link>
          <Box sx={{ mx: 1, width: 4, height: 4, borderRadius: '50%', bgcolor: '#4CAF50' }} />
          <Typography variant="body2" color="text.secondary">
            概念介绍
          </Typography>
        </Box>

        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 6, color: '#333' }}>
          粮食遥感监测系统 - 概念介绍
        </Typography>

        <Grid container spacing={6}>
          {/* 主要内容 */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#4CAF50', mb: 4 }}>
                什么是粮食遥感监测系统？
              </Typography>
              
              <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                粮食遥感监测系统是一种利用卫星遥感技术、地理信息系统（GIS）和大数据分析等先进技术，对农田进行远距离、非接触式监测的综合解决方案。该系统能够实时获取农作物生长状况、土壤湿度、病虫害情况等关键信息，为农业生产决策提供科学依据。
              </Typography>
              
              <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                随着全球人口增长和气候变化的影响，粮食安全问题日益突出。传统的农业监测方法往往依赖人工实地考察，效率低下且覆盖范围有限。遥感技术的应用极大地提升了农业监测的效率和准确性，成为现代精准农业的重要支撑技术。
              </Typography>
            </Paper>

            <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#4CAF50', mb: 4 }}>
                核心概念与原理
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 3, bgcolor: '#f1f8e9', borderRadius: 2 }}>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#4CAF50' }}>
                      卫星遥感
                    </Typography>
                    <Typography variant="body2">
                      通过搭载在人造卫星上的传感器，接收和记录地球表面反射或辐射的电磁波信息，经数据处理和解译，获取地表物体的特性和变化规律。
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 3, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#4CAF50' }}>
                      多光谱成像
                    </Typography>
                    <Typography variant="body2">
                      同时获取物体在多个不同光谱波段的图像，不同波段对植被、土壤、水体等目标具有不同的识别能力。
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 3, bgcolor: '#e0f2f1', borderRadius: 2 }}>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#4CAF50' }}>
                      NDVI指数
                    </Typography>
                    <Typography variant="body2">
                      归一化植被指数，用于评估植被生长状态、覆盖度和生物量，是农业遥感监测的重要指标。
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 3, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#4CAF50' }}>
                      精准农业
                    </Typography>
                    <Typography variant="body2">
                      基于信息技术的现代农业管理方法，通过变量投入和精确作业，实现资源优化配置和效益最大化。
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={2} sx={{ p: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#4CAF50', mb: 4 }}>
                系统价值与意义
              </Typography>
              
              <Typography variant="body1" paragraph>
                粮食遥感监测系统在保障国家粮食安全、促进农业可持续发展方面具有重要价值：
              </Typography>
              
              <Box sx={{ pl: 4, mb: 3 }}>
                <Typography variant="body1" paragraph sx={{ mb: 2 }}>
                  • <strong>精准监测</strong>：实时获取大范围农田信息，监测作物生长状况和环境变化
                </Typography>
                <Typography variant="body1" paragraph sx={{ mb: 2 }}>
                  • <strong>灾害预警</strong>：及时发现病虫害、旱涝等自然灾害征兆，提前采取应对措施
                </Typography>
                <Typography variant="body1" paragraph sx={{ mb: 2 }}>
                  • <strong>产量预测</strong>：基于生长数据进行科学产量预测，辅助粮食市场调控
                </Typography>
                <Typography variant="body1" paragraph sx={{ mb: 2 }}>
                  • <strong>资源节约</strong>：优化灌溉、施肥等农业投入，减少资源浪费和环境污染
                </Typography>
                <Typography variant="body1" paragraph>
                  • <strong>决策支持</strong>：为政府和农业企业提供数据支持，助力科学决策
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* 侧边栏 */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#4CAF50' }}>
                相关链接
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Link to="/content/model" style={{ textDecoration: 'none' }}>
                  <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, '&:hover': { bgcolor: '#e8f5e9' } }}>
                    <Typography variant="body1" sx={{ color: '#333' }}>
                      智能价格预测模型
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      了解先进的粮食价格预测技术
                    </Typography>
                  </Box>
                </Link>
                <Link to="/content/implementation" style={{ textDecoration: 'none' }}>
                  <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, '&:hover': { bgcolor: '#e8f5e9' } }}>
                    <Typography variant="body1" sx={{ color: '#333' }}>
                      质检报告信息提取系统
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      探索AI在报告信息提取中的应用
                    </Typography>
                  </Box>
                </Link>
                <Link to="/content" style={{ textDecoration: 'none' }}>
                  <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, '&:hover': { bgcolor: '#e8f5e9' } }}>
                    <Typography variant="body1" sx={{ color: '#333' }}>
                      返回项目展示
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      查看所有技术项目
                    </Typography>
                  </Box>
                </Link>
              </Box>
            </Paper>

            <Paper elevation={2} sx={{ p: 4 }}>
              <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#4CAF50' }}>
                技术咨询
              </Typography>
              <Typography variant="body2" paragraph>
                如需了解更多关于粮食遥感监测系统的技术细节或商业合作，请联系我们的技术团队：
              </Typography>
              <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'medium' }}>
                tech@grainauction.com
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* 返回顶部按钮 */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Link to="#" style={{ textDecoration: 'none' }}>
            <Typography variant="body2" sx={{ color: '#4CAF50' }}>
              返回顶部
            </Typography>
          </Link>
        </Box>
      </Container>
    </Box>
  )
}

export default ContentConceptPage