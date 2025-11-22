import React from 'react'
import { Container, Typography, Box, Paper, Grid } from '@mui/material'
import { Link } from 'react-router-dom'

const ContentModelPage: React.FC = () => {
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
            模型讲解
          </Typography>
        </Box>

        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 6, color: '#333' }}>
          智能价格预测模型 - 详细讲解
        </Typography>

        <Grid container spacing={6}>
          {/* 主要内容 */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#4CAF50', mb: 4 }}>
                模型概述
              </Typography>
              
              <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                智能价格预测模型是我们平台的核心技术之一，旨在利用先进的机器学习算法和大数据分析技术，预测粮食市场价格走势。该模型综合考虑了历史价格数据、市场供需关系、宏观经济指标、气候条件等多种因素，为粮食交易提供科学的价格参考。
              </Typography>
              
              <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                与传统的统计分析方法相比，我们的智能预测模型具有更高的准确性和实时性，能够更好地应对市场波动，为交易双方创造更大的价值。
              </Typography>
            </Paper>

            <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#4CAF50', mb: 4 }}>
                技术架构与核心算法
              </Typography>
              
              <Box sx={{ mb: 5 }}>
                <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#333' }}>
                  1. 数据层
                </Typography>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 3, bgcolor: '#f1f8e9', borderRadius: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        历史交易数据
                      </Typography>
                      <Typography variant="body2">
                        包含过去5-10年的粮食交易价格、交易量、品种、质量等级等详细信息
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 3, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        市场供需数据
                      </Typography>
                      <Typography variant="body2">
                        包括主产区产量预测、库存水平、进出口数据、消费需求等
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 3, bgcolor: '#e0f2f1', borderRadius: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        宏观经济指标
                      </Typography>
                      <Typography variant="body2">
                        GDP增速、CPI指数、农业政策变化、能源价格等经济相关因素
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 3, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        气候与环境数据
                      </Typography>
                      <Typography variant="body2">
                        气象数据、自然灾害记录、土壤状况等影响粮食生产的环境因素
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              
              <Box sx={{ mb: 5 }}>
                <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#333' }}>
                  2. 算法层
                </Typography>
                <Box sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 2, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    集成学习框架
                  </Typography>
                  <Typography variant="body2" paragraph>
                    我们的模型采用先进的集成学习方法，结合多种算法的优势，提高预测准确性：
                  </Typography>
                  <Box sx={{ pl: 4 }}>
                    <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                      • <strong>随机森林</strong>：处理非线性关系和特征重要性分析
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                      • <strong>LSTM神经网络</strong>：捕捉时间序列数据中的长期依赖关系
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                      • <strong>梯度提升树</strong>：优化预测精度和减少误差
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • <strong>贝叶斯优化</strong>：自动调整模型参数，提升性能
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box>
                <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#333' }}>
                  3. 应用层
                </Typography>
                <Typography variant="body2" paragraph>
                  模型输出结果通过直观的可视化界面呈现给用户，包括：
                </Typography>
                <Box sx={{ pl: 4 }}>
                  <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                    • 短期（1-7天）价格预测趋势图
                  </Typography>
                  <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                    • 中长期（1-6个月）价格区间预测
                  </Typography>
                  <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                    • 影响因素重要性分析
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • 异常波动预警
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Paper elevation={2} sx={{ p: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#4CAF50', mb: 4 }}>
                模型优势与创新点
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 3, bgcolor: '#f1f8e9', borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#4CAF50', fontSize: '1rem' }}>
                      多源数据融合
                    </Typography>
                    <Typography variant="body2">
                      创新性地整合农业、气象、经济等多领域数据，构建全方位的特征体系，全面捕捉影响价格的各种因素。
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 3, bgcolor: '#e8f5e9', borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#4CAF50', fontSize: '1rem' }}>
                      实时学习与更新
                    </Typography>
                    <Typography variant="body2">
                      模型采用在线学习机制，能够根据新数据持续优化，适应市场变化，保持预测准确性。
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 3, bgcolor: '#e0f2f1', borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#4CAF50', fontSize: '1rem' }}>
                      可解释性设计
                    </Typography>
                    <Typography variant="body2">
                      在保证预测准确性的同时，注重模型的可解释性，使用户能够理解预测结果背后的关键因素。
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 3, bgcolor: '#e3f2fd', borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#4CAF50', fontSize: '1rem' }}>
                      自适应算法选择
                    </Typography>
                    <Typography variant="body2">
                      根据不同粮食品种和市场特点，自动选择最适合的算法组合，实现个性化预测。
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* 侧边栏 */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#4CAF50' }}>
                相关链接
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Link to="/content/concept" style={{ textDecoration: 'none' }}>
                  <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, '&:hover': { bgcolor: '#e8f5e9' } }}>
                    <Typography variant="body1" sx={{ color: '#333' }}>
                      粮食遥感监测系统
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      了解卫星遥感在农业监测中的应用
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

            <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#4CAF50' }}>
                技术指标
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">预测准确率</Typography>
                  <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>85%+</Typography>
                </Box>
                <Box sx={{ width: '100%', height: 8, bgcolor: '#e0e0e0', borderRadius: 4 }}>
                  <Box sx={{ width: '85%', height: '100%', bgcolor: '#4CAF50', borderRadius: 4 }} />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                  <Typography variant="body2">数据更新频率</Typography>
                  <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>每小时</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                  <Typography variant="body2">历史数据覆盖</Typography>
                  <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>10年</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                  <Typography variant="body2">支持粮食品种</Typography>
                  <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>15+</Typography>
                </Box>
              </Box>
            </Paper>

            <Paper elevation={2} sx={{ p: 4 }}>
              <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#4CAF50' }}>
                技术咨询
              </Typography>
              <Typography variant="body2" paragraph>
                如需了解更多关于智能价格预测模型的技术细节或商业合作，请联系我们的技术团队：
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

export default ContentModelPage