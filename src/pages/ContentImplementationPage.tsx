import React from 'react'
import { Container, Typography, Box, Paper, Grid } from '@mui/material'
import { Link } from 'react-router-dom'

const ContentImplementationPage: React.FC = () => {
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
            实现方式
          </Typography>
        </Box>

        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 6, color: '#333' }}>
          质检报告信息提取系统 - 技术实现
        </Typography>

        <Grid container spacing={6}>
          {/* 主要内容 */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#4CAF50', mb: 4 }}>
                系统概述
              </Typography>
              
              <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                质检报告信息提取系统是一套基于人工智能技术的自动化信息处理解决方案，专门用于从农科院等权威机构出具的粮食质检报告中提取关键信息，并将非结构化的文本数据转化为结构化数据。该系统大幅提高了信息处理效率，减少了人工操作误差，为粮食拍卖平台提供了可靠的数据支持。
              </Typography>
              
              <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                系统采用了先进的OCR（光学字符识别）技术、自然语言处理（NLP）和深度学习算法，能够处理不同格式、不同来源的质检报告，实现高效、准确的信息提取和结构化处理。
              </Typography>
            </Paper>

            <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#4CAF50', mb: 4 }}>
                技术架构与实现细节
              </Typography>
              
              <Box sx={{ mb: 6 }}>
                <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#333' }}>
                  1. 系统架构
                </Typography>
                
                <Box sx={{ p: 4, bgcolor: '#f5f5f5', borderRadius: 2, mb: 4 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
                    系统采用分层架构设计，主要包括以下几个核心层次：
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                      数据采集层
                    </Typography>
                    <Typography variant="body2">
                      支持多种输入方式，包括PDF上传、图片扫描、在线表单等，实现质检报告的数字化采集。
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                      预处理层
                    </Typography>
                    <Typography variant="body2">
                      对采集的文档进行图像增强、去噪、倾斜校正等预处理，提高后续识别的准确性。
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                      识别提取层
                    </Typography>
                    <Typography variant="body2">
                      核心处理层，使用OCR和NLP技术识别并提取报告中的关键信息。
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                      结构化处理层
                    </Typography>
                    <Typography variant="body2">
                      将提取的信息按照预设的数据模型进行结构化处理，生成标准格式的数据。
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                      数据存储层
                    </Typography>
                    <Typography variant="body2">
                      使用关系型数据库和NoSQL数据库相结合的方式，存储结构化数据和原始文档。
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                      应用服务层
                    </Typography>
                    <Typography variant="body2">
                      提供API接口和Web服务，支持与粮食拍卖平台等其他系统的集成。
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ mb: 6 }}>
                <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#333' }}>
                  2. 核心技术实现
                </Typography>
                
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 3, bgcolor: '#f1f8e9', borderRadius: 2, height: '100%' }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ color: '#4CAF50' }}>
                        高级OCR技术
                      </Typography>
                      <Typography variant="body2" paragraph>
                        采用基于深度学习的OCR引擎，具备以下特点：
                      </Typography>
                      <Typography variant="body2">
                        • 支持多种字体和排版格式识别
                        • 具备手写体识别能力
                        • 能够处理复杂背景和低质量文档
                        • 识别准确率达到99%以上
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 3, bgcolor: '#e8f5e9', borderRadius: 2, height: '100%' }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ color: '#4CAF50' }}>
                        自然语言处理
                      </Typography>
                      <Typography variant="body2" paragraph>
                        运用先进的NLP技术进行语义理解和信息提取：
                      </Typography>
                      <Typography variant="body2">
                        • 命名实体识别（NER）提取关键实体
                        • 关系抽取建立实体间联系
                        • 情感分析评估报告内容倾向
                        • 领域特定模型针对农业术语优化
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 3, bgcolor: '#e0f2f1', borderRadius: 2, height: '100%' }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ color: '#4CAF50' }}>
                        深度学习模型
                      </Typography>
                      <Typography variant="body2" paragraph>
                        系统采用的深度学习模型架构：
                      </Typography>
                      <Typography variant="body2">
                        • 文本识别：CRNN + Transformer架构
                        • 信息抽取：BERT-Base预训练模型微调
                        • 文档分类：ResNet特征提取 + 全连接层
                        • 表格理解：Graph Neural Network建模表格结构
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 3, bgcolor: '#e3f2fd', borderRadius: 2, height: '100%' }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ color: '#4CAF50' }}>
                        知识图谱
                      </Typography>
                      <Typography variant="body2" paragraph>
                        构建粮食质检领域知识图谱：
                      </Typography>
                      <Typography variant="body2">
                        • 定义粮食品种、检测指标、标准阈值等实体
                        • 建立实体间的关联关系
                        • 支持基于知识的推理和验证
                        • 提高信息提取的准确性和一致性
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Paper>

            <Paper elevation={2} sx={{ p: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#4CAF50', mb: 4 }}>
                系统工作流程
              </Typography>
              
              <Box sx={{ position: 'relative', p: 4 }}>
                {/* 工作流程图 */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'center', md: 'flex-start' }, gap: 4 }}>
                    <Box sx={{ flex: 1, p: 3, bgcolor: '#f1f8e9', borderRadius: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 1 }}>
                        1. 文档上传
                      </Typography>
                      <Typography variant="body2">
                        用户上传质检报告文件
                        （支持PDF、JPG、PNG等格式）
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: { xs: 'none', md: 'block' }, width: 20, height: 1, bgcolor: '#4CAF50', mt: 4 }} />
                    <Box sx={{ display: { xs: 'block', md: 'none' }, width: 1, height: 20, bgcolor: '#4CAF50' }} />
                    
                    <Box sx={{ flex: 1, p: 3, bgcolor: '#e8f5e9', borderRadius: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 1 }}>
                        2. 预处理
                      </Typography>
                      <Typography variant="body2">
                        图像增强、倾斜校正、
                        去噪、二值化处理
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: { xs: 'none', md: 'block' }, width: 20, height: 1, bgcolor: '#4CAF50', mt: 4 }} />
                    <Box sx={{ display: { xs: 'block', md: 'none' }, width: 1, height: 20, bgcolor: '#4CAF50' }} />
                    
                    <Box sx={{ flex: 1, p: 3, bgcolor: '#e0f2f1', borderRadius: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 1 }}>
                        3. OCR识别
                      </Typography>
                      <Typography variant="body2">
                        文本识别、版面分析、
                        表格检测与识别
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'center', md: 'flex-start' }, gap: 4, mt: 2 }}>
                    <Box sx={{ flex: 1, p: 3, bgcolor: '#e3f2fd', borderRadius: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 1 }}>
                        4. 信息提取
                      </Typography>
                      <Typography variant="body2">
                        关键信息抽取、
                        实体识别、关系分析
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: { xs: 'none', md: 'block' }, width: 20, height: 1, bgcolor: '#4CAF50', mt: 4 }} />
                    <Box sx={{ display: { xs: 'block', md: 'none' }, width: 1, height: 20, bgcolor: '#4CAF50' }} />
                    
                    <Box sx={{ flex: 1, p: 3, bgcolor: '#f3e5f5', borderRadius: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 1 }}>
                        5. 结构化处理
                      </Typography>
                      <Typography variant="body2">
                        数据标准化、
                        格式转换、数据验证
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: { xs: 'none', md: 'block' }, width: 20, height: 1, bgcolor: '#4CAF50', mt: 4 }} />
                    <Box sx={{ display: { xs: 'block', md: 'none' }, width: 1, height: 20, bgcolor: '#4CAF50' }} />
                    
                    <Box sx={{ flex: 1, p: 3, bgcolor: '#fce4ec', borderRadius: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 1 }}>
                        6. 结果输出
                      </Typography>
                      <Typography variant="body2">
                        结构化数据输出、
                        可视化展示、API调用
                      </Typography>
                    </Box>
                  </Box>
                </Box>
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
                支持的文档类型
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 24, height: 24, bgcolor: '#4CAF50', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, mr: 2 }}>PDF</Box>
                  <Typography variant="body2">Adobe PDF文档</Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 24, height: 24, bgcolor: '#4CAF50', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, mr: 2 }}>JPG</Box>
                  <Typography variant="body2">JPEG图像文件</Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 24, height: 24, bgcolor: '#4CAF50', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, mr: 2 }}>PNG</Box>
                  <Typography variant="body2">PNG图像文件</Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 24, height: 24, bgcolor: '#4CAF50', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, mr: 2 }}>DOC</Box>
                  <Typography variant="body2">Microsoft Word文档</Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 24, height: 24, bgcolor: '#4CAF50', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, mr: 2 }}>表格</Box>
                  <Typography variant="body2">结构化表格文档</Typography>
                </Box>
              </Box>
            </Paper>

            <Paper elevation={2} sx={{ p: 4 }}>
              <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#4CAF50' }}>
                技术咨询
              </Typography>
              <Typography variant="body2" paragraph>
                如需了解更多关于质检报告信息提取系统的技术细节或商业合作，请联系我们的技术团队：
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

export default ContentImplementationPage