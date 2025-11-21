import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  Grid,
  Divider,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  TrendingUp,
  BarChart,
  PieChart,
  CalendarToday,
  MapPin,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  ChevronLeft,
  Settings,
  FilterList,
  AlertCircle,
  BarChart3,
  Zap,
  Target,
  FileText
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { useDataAnalysis } from '../contexts/DataAnalysisContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const DataAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    transactionHistory, 
    pricePredictions, 
    marketTrends, 
    marketAnomalies,
    premiumAnalysis,
    productRecommendations,
    isLoading,
    error,
    fetchTransactionHistory,
    getPricePrediction,
    fetchMarketTrends,
    detectMarketAnomalies,
    fetchPremiumAnalysis,
    getProductRecommendations,
    generateCustomReport,
    exportData
  } = useDataAnalysis();

  const [tabValue, setTabValue] = useState(0);
  const [selectedGrainType, setSelectedGrainType] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [timeRange, setTimeRange] = useState(30);
  const [exportFormat, setExportFormat] = useState('csv');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchTransactionHistory(selectedGrainType, selectedRegion, timeRange);
        await fetchMarketTrends(selectedGrainType, selectedRegion, timeRange);
        await detectMarketAnomalies(selectedGrainType, selectedRegion, timeRange);
        await fetchPremiumAnalysis(selectedGrainType, selectedRegion);
        await getProductRecommendations(user?.id);
      } catch (err) {
        handleError('加载数据分析失败');
      }
    };

    loadData();
  }, [selectedGrainType, selectedRegion, timeRange, user?.id]);

  const handleError = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
  };

  const handleSuccess = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleExportData = async () => {
    try {
      await exportData(
        { transactionHistory, pricePredictions, marketTrends },
        exportFormat
      );
      handleSuccess(`数据已成功导出为${exportFormat.toUpperCase()}格式`);
    } catch (err) {
      handleError('导出数据失败');
    }
  };

  const handleGenerateReport = async () => {
    try {
      await generateCustomReport({
        grainType: selectedGrainType,
        region: selectedRegion,
        timeRange,
        includePredictions: true,
        includeAnomalies: true,
        includePremium: true
      });
      handleSuccess('分析报告已生成');
    } catch (err) {
      handleError('生成报告失败');
    }
  };

  const getAnomalySeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const grainTypes = ['all', '小麦', '大米', '玉米', '大豆', '高粱'];
  const regions = ['all', '华东', '华北', '华南', '西南', '西北', '东北'];
  const timeRanges = [7, 14, 30, 90, 180];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // 交易趋势数据处理
  const trendChartData = marketTrends.map(item => ({
    date: item.date,
    avgPrice: item.averagePrice,
    volume: item.transactionVolume,
    count: item.transactionCount
  }));

  // 价格预测数据处理
  const predictionChartData = pricePredictions.map(pred => ({
    date: pred.date,
    predictedPrice: pred.price,
    confidence: pred.confidence * 100,
    upperBound: pred.price * (1 + pred.confidenceMargin),
    lowerBound: pred.price * (1 - pred.confidenceMargin)
  }));

  // 质量指标雷达图数据
  const qualityRadarData = [
    { subject: '水分', A: 85, B: 90, fullMark: 100 },
    { subject: '纯度', A: 92, B: 88, fullMark: 100 },
    { subject: '蛋白质', A: 78, B: 85, fullMark: 100 },
    { subject: '杂质率', A: 90, B: 95, fullMark: 100 },
    { subject: '存储条件', A: 88, B: 82, fullMark: 100 },
  ];

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
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error" className="mb-4">
          <AlertCircle className="mr-2" />
          加载数据失败，请稍后重试
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          重新加载
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 页面标题和导航 */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="text"
                onClick={() => navigate('/')}
                sx={{ textTransform: 'none' }}
              >
                <ChevronLeft />
                返回首页
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExportData}
              >
                导出数据
              </Button>
              <Button
                variant="contained"
                startIcon={<FileText />}
                onClick={handleGenerateReport}
              >
                生成报告
              </Button>
            </div>
          </div>
          <Typography variant="h4" fontWeight="bold" className="flex items-center gap-2">
            <BarChart3 fontSize="large" />
            智能数据分析中心
          </Typography>
          <Typography variant="body1" color="text.secondary">
            基于大数据的粮食交易趋势分析和价格预测
          </Typography>
        </motion.div>

        {/* 筛选器 */}
        <motion.div variants={itemVariants} className="mb-6">
          <Paper elevation={2} className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <FilterList fontSize="small" color="text.secondary" />
                <Typography variant="subtitle2" fontWeight="medium">筛选条件：</Typography>
              </div>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>粮食类型</InputLabel>
                <Select
                  value={selectedGrainType}
                  label="粮食类型"
                  onChange={(e) => setSelectedGrainType(e.target.value)}
                >
                  {grainTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      {type === 'all' ? '全部类型' : type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>地区</InputLabel>
                <Select
                  value={selectedRegion}
                  label="地区"
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  {regions.map(region => (
                    <MenuItem key={region} value={region}>
                      {region === 'all' ? '全部地区' : region}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>时间范围</InputLabel>
                <Select
                  value={timeRange}
                  label="时间范围"
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  {timeRanges.map(days => (
                    <MenuItem key={days} value={days}>
                      近{days}天
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </Paper>
        </motion.div>

        {/* 核心指标卡片 */}
        <motion.div variants={itemVariants} className="mb-6">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card variant="outlined" className="h-full">
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    平均交易价格
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" className="flex items-center gap-1">
                    ¥{marketTrends.length > 0 ? marketTrends[marketTrends.length - 1].averagePrice.toFixed(2) : '0.00'}
                    <Chip
                      label={`+${((marketTrends.length > 1 ? (marketTrends[marketTrends.length - 1].averagePrice - marketTrends[marketTrends.length - 2].averagePrice) / marketTrends[marketTrends.length - 2].averagePrice * 100 : 0).toFixed(1))}%`}
                      size="small"
                      color="success"
                      variant="outlined"
                      icon={<ArrowUpRight fontSize="small" />}
                    />
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    较上期上涨
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} lg={3}>
              <Card variant="outlined" className="h-full">
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    交易量
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" className="flex items-center gap-1">
                    {marketTrends.length > 0 ? marketTrends[marketTrends.length - 1].transactionVolume.toLocaleString() : '0'}
                    <Chip
                      label={`+${((marketTrends.length > 1 ? (marketTrends[marketTrends.length - 1].transactionVolume - marketTrends[marketTrends.length - 2].transactionVolume) / marketTrends[marketTrends.length - 2].transactionVolume * 100 : 0).toFixed(1))}%`}
                      size="small"
                      color="success"
                      variant="outlined"
                      icon={<ArrowUpRight fontSize="small" />}
                    />
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    单位：吨
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} lg={3}>
              <Card variant="outlined" className="h-full">
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    交易笔数
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" className="flex items-center gap-1">
                    {marketTrends.length > 0 ? marketTrends[marketTrends.length - 1].transactionCount.toLocaleString() : '0'}
                    <Chip
                      label={`-${((marketTrends.length > 1 ? (marketTrends[marketTrends.length - 2].transactionCount - marketTrends[marketTrends.length - 1].transactionCount) / marketTrends[marketTrends.length - 2].transactionCount * 100 : 0).toFixed(1))}%`}
                      size="small"
                      color="error"
                      variant="outlined"
                      icon={<ArrowDownRight fontSize="small" />}
                    />
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    较上期下降
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} lg={3}>
              <Card variant="outlined" className="h-full">
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    市场异常
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" className="flex items-center gap-1">
                    {marketAnomalies.length}
                    <Chip
                      label="个异常检测"
                      size="small"
                      color={marketAnomalies.length > 0 ? "warning" : "success"}
                      variant="outlined"
                    />
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {marketAnomalies.length > 0 ? '需要关注' : '市场稳定'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>

        {/* 标签页 */}
        <motion.div variants={itemVariants}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            className="mb-4"
          >
            <Tab label="交易趋势" icon={<TrendingUp fontSize="small" />} iconPosition="start" />
            <Tab label="价格预测" icon={<Target fontSize="small" />} iconPosition="start" />
            <Tab label="市场分析" icon={<BarChart fontSize="small" />} iconPosition="start" />
            <Tab label="异常检测" icon={<AlertCircle fontSize="small" />} iconPosition="start" />
            <Tab label="产品推荐" icon={<Zap fontSize="small" />} iconPosition="start" />
          </Tabs>

          {/* 交易趋势标签页 */}
          {tabValue === 0 && (
            <div>
              <Grid container spacing={4}>
                <Grid item xs={12} lg={8}>
                  <Paper elevation={2} className="p-4">
                    <Typography variant="subtitle1" fontWeight="bold" mb={2} className="flex items-center gap-1">
                      <TrendingUp fontSize="small" />
                      价格走势（近{timeRange}天）
                    </Typography>
                    <Box sx={{ height: 350 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendChartData}>
                          <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <RechartsTooltip />
                          <Legend />
                          <Area 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="avgPrice" 
                            stroke="#8884d8" 
                            fillOpacity={1} 
                            fill="url(#colorPrice)" 
                            name="平均价格（元/吨）"
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="volume" 
                            stroke="#82ca9d" 
                            name="交易量（吨）"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} lg={4}>
                  <Paper elevation={2} className="p-4">
                    <Typography variant="subtitle1" fontWeight="bold" mb={2} className="flex items-center gap-1">
                      <PieChart fontSize="small" />
                      粮食类型分布
                    </Typography>
                    <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={grainTypes.filter(t => t !== 'all').map(type => ({
                              name: type,
                              value: transactionHistory.filter(t => t.grainType === type).length
                            })).filter(item => item.value > 0)}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {grainTypes.filter(t => t !== 'all').map((type, index) => {
                              const count = transactionHistory.filter(t => t.grainType === type).length;
                              if (count > 0) {
                                return (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                );
                              }
                              return null;
                            }).filter(Boolean)}
                          </Pie>
                          <RechartsTooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper elevation={2} className="p-4">
                    <Typography variant="subtitle1" fontWeight="bold" mb={2} className="flex items-center gap-1">
                      <CalendarToday fontSize="small" />
                      交易活跃度趋势
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={trendChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#82ca9d" name="交易笔数" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </div>
          )}

          {/* 价格预测标签页 */}
          {tabValue === 1 && (
            <div>
              <Grid container spacing={4}>
                <Grid item xs={12} lg={8}>
                  <Paper elevation={2} className="p-4">
                    <Typography variant="subtitle1" fontWeight="bold" mb={2} className="flex items-center gap-1">
                      <Target fontSize="small" />
                      未来价格预测
                    </Typography>
                    <Box sx={{ height: 400 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={predictionChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="predictedPrice" 
                            stroke="#8884d8" 
                            strokeWidth={2}
                            name="预测价格"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="upperBound" 
                            stroke="#ff7300" 
                            strokeDasharray="5 5"
                            name="上限"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="lowerBound" 
                            stroke="#00C49F" 
                            strokeDasharray="5 5"
                            name="下限"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} lg={4}>
                  <Paper elevation={2} className="p-4">
                    <Typography variant="subtitle1" fontWeight="bold" mb={3} className="flex items-center gap-1">
                      <Info fontSize="small" />
                      预测模型信息
                    </Typography>
                    <Card variant="outlined" className="mb-3">
                      <CardContent>
                        <Typography variant="subtitle2" fontWeight="medium">
                          模型类型
                        </Typography>
                        <Typography variant="body2">
                          XGBoost 梯度提升树
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card variant="outlined" className="mb-3">
                      <CardContent>
                        <Typography variant="subtitle2" fontWeight="medium">
                          平均置信度
                        </Typography>
                        <Typography variant="body2">
                          {(pricePredictions.reduce((sum, p) => sum + p.confidence, 0) / pricePredictions.length * 100).toFixed(1)}%
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card variant="outlined" className="mb-3">
                      <CardContent>
                        <Typography variant="subtitle2" fontWeight="medium">
                          主要影响因素
                        </Typography>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {['季节性', '市场需求', '产量预测', '天气因素', '政策影响'].map((factor, index) => (
                            <Chip key={index} label={factor} size="small" variant="outlined" />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" fontWeight="medium">
                          历史准确率
                        </Typography>
                        <Typography variant="body2">
                          87.5%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper elevation={2} className="p-4">
                    <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                      质量指标与价格关系分析
                    </Typography>
                    <Box sx={{ height: 400 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart outerRadius="80%" data={qualityRadarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar name="优质样本" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                          <Radar name="普通样本" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </div>
          )}

          {/* 市场分析标签页 */}
          {tabValue === 2 && (
            <div>
              <Grid container spacing={4}>
                <Grid item xs={12} lg={6}>
                  <Paper elevation={2} className="p-4">
                    <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                      地区分布分析
                    </Typography>
                    <Box sx={{ height: 350 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                          data={regions.filter(r => r !== 'all').map(region => ({
                            name: region,
                            count: transactionHistory.filter(t => t.location.includes(region)).length
                          })).filter(item => item.count > 0)}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={80} />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#8884d8" name="交易数量" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} lg={6}>
                  <Paper elevation={2} className="p-4">
                    <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                      溢价分析
                    </Typography>
                    <Box sx={{ height: 350 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={premiumAnalysis}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="grainType" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="premiumRate" fill="#82ca9d" name="溢价率(%)" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </div>
          )}

          {/* 异常检测标签页 */}
          {tabValue === 3 && (
            <div>
              <Paper elevation={2} className="p-4 mb-4">
                <Typography variant="subtitle1" fontWeight="bold" mb={3} className="flex items-center gap-1">
                  <AlertCircle fontSize="small" />
                  市场异常检测结果
                </Typography>
                {marketAnomalies.length === 0 ? (
                  <Alert severity="success">
                    当前市场运行正常，未检测到异常情况
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {marketAnomalies.map((anomaly, index) => (
                      <Card key={anomaly.id} variant="outlined" className="border-l-4" sx={{ borderLeftColor: getAnomalySeverityColor(anomaly.severity) === 'error' ? '#d32f2f' : getAnomalySeverityColor(anomaly.severity) === 'warning' ? '#f57c00' : '#1976d2' }}>
                        <CardContent>
                          <div className="flex justify-between items-start mb-2">
                            <Typography variant="subtitle2" fontWeight="bold">
                              {anomaly.title}
                            </Typography>
                            <Chip
                              label={anomaly.severity === 'high' ? '高风险' : anomaly.severity === 'medium' ? '中风险' : '低风险'}
                              size="small"
                              color={getAnomalySeverityColor(anomaly.severity)}
                              variant="outlined"
                            />
                          </div>
                          <Typography variant="body2" color="text.secondary" className="mb-2">
                            {anomaly.description}
                          </Typography>
                          <div className="flex justify-between items-center">
                            <Typography variant="caption" color="text.secondary">
                              检测时间：{new Date(anomaly.detectedAt).toLocaleString()}
                            </Typography>
                            <Tooltip title="查看详情">
                              <IconButton size="small">
                                <Info fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </Paper>
            </div>
          )}

          {/* 产品推荐标签页 */}
          {tabValue === 4 && (
            <div>
              <Paper elevation={2} className="p-4 mb-4">
                <Typography variant="subtitle1" fontWeight="bold" mb={3}>
                  个性化采购推荐
                </Typography>
                {productRecommendations.length === 0 ? (
                  <Alert severity="info">
                    根据您的历史采购记录，暂无推荐商品
                  </Alert>
                ) : (
                  <Grid container spacing={3}>
                    {productRecommendations.map((product, index) => (
                      <Grid item xs={12} sm={6} md={4} key={product.id}>
                        <motion.div
                          whileHover={{ y: -5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card variant="outlined" className="h-full">
                            <CardHeader
                              avatar={
                                <Avatar sx={{ bgcolor: COLORS[index % COLORS.length] }}>
                                  {product.grainType.charAt(0)}
                                </Avatar>
                              }
                              title={product.grainType}
                              subheader={product.location}
                            />
                            <CardContent>
                              <Typography variant="body1" fontWeight="bold" color="primary" className="mb-2">
                                推荐指数：{product.score}/10
                              </Typography>
                              <Typography variant="body2" color="text.secondary" className="mb-3">
                                {product.reason}
                              </Typography>
                              <div className="flex justify-between items-center">
                                <Typography variant="body2">
                                  预计价格：¥{product.expectedPrice}/吨
                                </Typography>
                                <Button variant="outlined" size="small">
                                  查看详情
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </div>
          )}
        </motion.div>
      </motion.div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbarSeverity}
          onClose={() => setSnackbarOpen(false)}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DataAnalyticsPage;