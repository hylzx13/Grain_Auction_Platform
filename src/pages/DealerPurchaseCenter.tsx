import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Grid,
  Divider,
  Slider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardMedia,
  useMediaQuery,
  useTheme,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  BarChart,
  PieChart,
  Calendar,
  MapPin,
  Award,
  ChevronLeft,
  Download,
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useAuction } from '../contexts/AuctionContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

// 定义拍卖项目接口
interface AuctionItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  startingPrice: number;
  currentPrice: number;
  bidIncrement: number;
  startTime: string;
  endTime: string;
  status: 'active' | 'completed' | 'pending';
  creatorId: string;
  creatorName: string;
  location: string;
  grainType: string;
  quantity: number;
  qualityScore: number;
  qualityDetails: {
    moisture: number;
    impurity: number;
    purity: number;
    protein: number;
    storageTime: number;
  };
  views: number;
  bids: number;
}

// 定义过滤器接口
interface Filters {
  grainType: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  minQualityScore: number;
  moisture: [number, number];
  impurity: [number, number];
  purity: [number, number];
  protein: [number, number];
  storageTime: [number, number];
  status: string;
}

// 历史价格数据接口
interface PriceHistory {
  date: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
}

const DealerPurchaseCenter: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getAuctions } = useAuction();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<AuctionItem[]>([]);
  const [selectedAuctions, setSelectedAuctions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [priceHistoryData, setPriceHistoryData] = useState<PriceHistory[]>([]);

  // 初始化过滤器
  const [filters, setFilters] = useState<Filters>({
    grainType: '',
    location: '',
    minPrice: 0,
    maxPrice: 100000,
    minQualityScore: 0,
    moisture: [0, 30],
    impurity: [0, 20],
    purity: [50, 100],
    protein: [0, 50],
    storageTime: [0, 365],
    status: 'active',
  });

  // 示例粮食类型和地区数据
  const grainTypes = ['大米', '小麦', '玉米', '大豆', '高粱'];
  const locations = ['黑龙江', '吉林', '辽宁', '内蒙古', '河北', '山东'];

  // 模拟价格历史数据
  useEffect(() => {
    const generatePriceHistory = (): PriceHistory[] => {
      const history: PriceHistory[] = [];
      const now = new Date();
      
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        
        const avgPrice = 5000 + Math.random() * 2000;
        const minPrice = avgPrice - Math.random() * 1000;
        const maxPrice = avgPrice + Math.random() * 1000;
        
        history.push({
          date: date.toLocaleDateString('zh-CN'),
          avgPrice: parseFloat(avgPrice.toFixed(2)),
          minPrice: parseFloat(minPrice.toFixed(2)),
          maxPrice: parseFloat(maxPrice.toFixed(2)),
        });
      }
      
      return history;
    };
    
    setPriceHistoryData(generatePriceHistory());
  }, []);

  // 加载拍卖数据
  useEffect(() => {
    const fetchAuctions = async () => {
      setIsLoading(true);
      try {
        // 实际项目中应该调用API获取数据
        const data = await getAuctions();
        setAuctions(data);
        setFilteredAuctions(data);
      } catch (error) {
        console.error('Failed to fetch auctions:', error);
        toast.error('获取拍卖数据失败，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    };

    // 验证用户权限
    if (user && user.role === 'dealer') {
      fetchAuctions();
    } else {
      // 重定向到登录页面或访问被拒绝页面
      navigate('/access-denied');
    }
  }, [getAuctions, user, navigate]);

  // 应用过滤器
  useEffect(() => {
    let results = [...auctions];

    // 应用搜索查询
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (auction) =>
          auction.title.toLowerCase().includes(query) ||
          auction.description.toLowerCase().includes(query) ||
          auction.creatorName.toLowerCase().includes(query)
      );
    }

    // 应用粮食类型过滤
    if (filters.grainType) {
      results = results.filter(
        (auction) => auction.grainType === filters.grainType
      );
    }

    // 应用地区过滤
    if (filters.location) {
      results = results.filter(
        (auction) => auction.location === filters.location
      );
    }

    // 应用价格范围过滤
    results = results.filter(
      (auction) =>
        auction.currentPrice >= filters.minPrice &&
        auction.currentPrice <= filters.maxPrice
    );

    // 应用质量评分过滤
    results = results.filter(
      (auction) => auction.qualityScore >= filters.minQualityScore
    );

    // 应用粮食质量指标过滤
    results = results.filter(
      (auction) =>
        auction.qualityDetails.moisture >= filters.moisture[0] &&
        auction.qualityDetails.moisture <= filters.moisture[1] &&
        auction.qualityDetails.impurity >= filters.impurity[0] &&
        auction.qualityDetails.impurity <= filters.impurity[1] &&
        auction.qualityDetails.purity >= filters.purity[0] &&
        auction.qualityDetails.purity <= filters.purity[1] &&
        auction.qualityDetails.protein >= filters.protein[0] &&
        auction.qualityDetails.protein <= filters.protein[1] &&
        auction.qualityDetails.storageTime >= filters.storageTime[0] &&
        auction.qualityDetails.storageTime <= filters.storageTime[1]
    );

    // 应用状态过滤
    if (filters.status) {
      results = results.filter((auction) => auction.status === filters.status);
    }

    setFilteredAuctions(results);
  }, [auctions, searchQuery, filters]);

  // 处理过滤器变更
  const handleFilterChange = (name: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 重置过滤器
  const resetFilters = () => {
    setFilters({
      grainType: '',
      location: '',
      minPrice: 0,
      maxPrice: 100000,
      minQualityScore: 0,
      moisture: [0, 30],
      impurity: [0, 20],
      purity: [50, 100],
      protein: [0, 50],
      storageTime: [0, 365],
      status: 'active',
    });
    setSearchQuery('');
  };

  // 处理拍卖项目选择
  const handleAuctionSelect = (auctionId: string) => {
    setSelectedAuctions((prev) => {
      if (prev.includes(auctionId)) {
        return prev.filter((id) => id !== auctionId);
      } else if (prev.length < 5) {
        return [...prev, auctionId];
      } else {
        toast.warning('最多只能选择5个项目进行比较');
        return prev;
      }
    });
  };

  // 切换标签页
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 格式化价格
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // 计算剩余时间
  const getTimeLeft = (endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const diff = end - now;

    if (diff <= 0) return '已结束';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}天 ${hours}时 ${minutes}分`;
  };

  // 获取选中的拍卖项目进行比较
  const getAuctionsToCompare = () => {
    return auctions.filter((auction) => selectedAuctions.includes(auction.id));
  };

  // 生成雷达图数据
  const getRadarData = (auctions: AuctionItem[]) => {
    const data = auctions.map((auction) => ({
      name: auction.title.length > 10 ? auction.title.substring(0, 10) + '...' : auction.title,
      水分: auction.qualityDetails.moisture,
      杂质: auction.qualityDetails.impurity,
      纯度: auction.qualityDetails.purity,
      蛋白质: auction.qualityDetails.protein,
      质量评分: auction.qualityScore / 20,
    }));
    return data;
  };

  // 容器动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  };

  // 项目动画变体
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  // 渲染过滤器面板
  const renderFilterPanel = () => {
    return (
      <Accordion expanded={showFilters} onChange={() => setShowFilters(!showFilters)}>
        <AccordionSummary expandIcon={showFilters ? <ChevronUp /> : <ChevronDown />}>
          <div className="flex items-center gap-2">
            <FilterList color="primary" />
            <Typography variant="subtitle1" fontWeight="bold">
              高级筛选
            </Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* 粮食类型 */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="grain-type-label">粮食类型</InputLabel>
                <Select
                  labelId="grain-type-label"
                  value={filters.grainType}
                  label="粮食类型"
                  onChange={(e) => handleFilterChange('grainType', e.target.value)}
                >
                  <MenuItem value="">全部</MenuItem>
                  {grainTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 地区 */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="location-label">地区</InputLabel>
                <Select
                  labelId="location-label"
                  value={filters.location}
                  label="地区"
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                >
                  <MenuItem value="">全部</MenuItem>
                  {locations.map((location) => (
                    <MenuItem key={location} value={location}>{location}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 状态 */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-label">状态</InputLabel>
                <Select
                  labelId="status-label"
                  value={filters.status}
                  label="状态"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">全部</MenuItem>
                  <MenuItem value="active">进行中</MenuItem>
                  <MenuItem value="pending">审核中</MenuItem>
                  <MenuItem value="completed">已结束</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* 价格范围 */}
            <Grid item xs={12} md={6}>
              <Typography gutterBottom variant="subtitle2">价格范围</Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={[filters.minPrice, filters.maxPrice]}
                  onChange={(_, value) => {
                    const [min, max] = value as [number, number];
                    handleFilterChange('minPrice', min);
                    handleFilterChange('maxPrice', max);
                  }}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100000}
                  step={100}
                  valueLabelFormat={(value) => formatPrice(value)}
                />
                <div className="flex justify-between">
                  <Typography variant="caption">{formatPrice(filters.minPrice)}</Typography>
                  <Typography variant="caption">{formatPrice(filters.maxPrice)}</Typography>
                </div>
              </Box>
            </Grid>

            {/* 质量评分 */}
            <Grid item xs={12} md={6}>
              <Typography gutterBottom variant="subtitle2">最低质量评分</Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={filters.minQualityScore}
                  onChange={(_, value) => handleFilterChange('minQualityScore', value as number)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
                  step={5}
                />
                <div className="flex justify-between">
                  <Typography variant="caption">0</Typography>
                  <Typography variant="caption">{filters.minQualityScore}</Typography>
                  <Typography variant="caption">100</Typography>
                </div>
              </Box>
            </Grid>

            {/* 水分含量 */}
            <Grid item xs={12} md={6}>
              <Typography gutterBottom variant="subtitle2">水分含量 ({filters.moisture[0]}% - {filters.moisture[1]}%)</Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={filters.moisture}
                  onChange={(_, value) => handleFilterChange('moisture', value as [number, number])}
                  valueLabelDisplay="auto"
                  min={0}
                  max={30}
                  step={0.5}
                  valueLabelFormat={(value) => `${value}%`}
                />
              </Box>
            </Grid>

            {/* 杂质率 */}
            <Grid item xs={12} md={6}>
              <Typography gutterBottom variant="subtitle2">杂质率 ({filters.impurity[0]}% - {filters.impurity[1]}%)</Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={filters.impurity}
                  onChange={(_, value) => handleFilterChange('impurity', value as [number, number])}
                  valueLabelDisplay="auto"
                  min={0}
                  max={20}
                  step={0.5}
                  valueLabelFormat={(value) => `${value}%`}
                />
              </Box>
            </Grid>

            {/* 品种纯度 */}
            <Grid item xs={12} md={6}>
              <Typography gutterBottom variant="subtitle2">品种纯度 ({filters.purity[0]}% - {filters.purity[1]}%)</Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={filters.purity}
                  onChange={(_, value) => handleFilterChange('purity', value as [number, number])}
                  valueLabelDisplay="auto"
                  min={50}
                  max={100}
                  step={0.5}
                  valueLabelFormat={(value) => `${value}%`}
                />
              </Box>
            </Grid>

            {/* 蛋白质含量 */}
            <Grid item xs={12} md={6}>
              <Typography gutterBottom variant="subtitle2">蛋白质含量 ({filters.protein[0]}% - {filters.protein[1]}%)</Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={filters.protein}
                  onChange={(_, value) => handleFilterChange('protein', value as [number, number])}
                  valueLabelDisplay="auto"
                  min={0}
                  max={50}
                  step={0.5}
                  valueLabelFormat={(value) => `${value}%`}
                />
              </Box>
            </Grid>

            {/* 存储时间 */}
            <Grid item xs={12}>
              <Typography gutterBottom variant="subtitle2">存储时间 ({filters.storageTime[0]} - {filters.storageTime[1]} 天)</Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={filters.storageTime}
                  onChange={(_, value) => handleFilterChange('storageTime', value as [number, number])}
                  valueLabelDisplay="auto"
                  min={0}
                  max={365}
                  step={1}
                  valueLabelFormat={(value) => `${value} 天`}
                />
              </Box>
            </Grid>

            {/* 重置按钮 */}
            <Grid item xs={12} className="flex justify-end">
              <Button variant="outlined" onClick={resetFilters}>
                重置筛选条件
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };

  // 渲染拍卖卡片
  const renderAuctionCard = (auction: AuctionItem) => {
    const isSelected = selectedAuctions.includes(auction.id);
    
    return (
      <motion.div key={auction.id} variants={itemVariants}>
        <Paper
          elevation={isSelected ? 4 : 2}
          className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg ${isSelected ? 'border-2 border-primary' : ''}`}
          onClick={() => navigate(`/auction/${auction.id}`)}
        >
          {/* 选中复选框 */}
          <div className="absolute top-2 right-2 z-10">
            <Button
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();
                handleAuctionSelect(auction.id);
              }}
              sx={{
                minWidth: '32px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                p: 0,
                backgroundColor: isSelected ? theme.palette.primary.main : 'white',
                color: isSelected ? 'white' : theme.palette.primary.main,
              }}
            >
              {isSelected && <CheckCircle fontSize="small" />}
            </Button>
          </div>

          {/* 拍卖状态标签 */}
          <div className="absolute top-2 left-2">
            <Chip
              label={
                auction.status === 'active'
                  ? '进行中'
                  : auction.status === 'pending'
                  ? '审核中'
                  : '已结束'
              }
              size="small"
              color={
                auction.status === 'active'
                  ? 'success'
                  : auction.status === 'pending'
                  ? 'warning'
                  : 'default'
              }
              icon={
                auction.status === 'active'
                  ? <Clock fontSize="small" />
                  : auction.status === 'pending'
                  ? <AlertCircle fontSize="small" />
                  : <CheckCircle fontSize="small" />
              }
            />
          </div>

          <Grid container>
            {/* 图片区域 */}
            <Grid item xs={12} sm={4} className="p-0">
              <Box
                component="img"
                src={auction.imageUrl}
                alt={auction.title}
                sx={{ width: '100%', height: 180, objectFit: 'cover' }}
              />
            </Grid>

            {/* 信息区域 */}
            <Grid item xs={12} sm={8} className="p-4">
              <Typography variant="h6" fontWeight="bold" gutterBottom className="line-clamp-2">
                {auction.title}
              </Typography>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <Chip label={auction.grainType} size="small" color="primary" variant="outlined" />
                <Chip label={`${auction.quantity} 吨`} size="small" color="secondary" variant="outlined" />
                <Chip 
                  icon={<MapPin fontSize="small" />} 
                  label={auction.location} 
                  size="small" 
                  variant="outlined" 
                />
              </div>

              {/* 价格信息 */}
              <div className="mb-3">
                <Typography variant="subtitle1" color="error" fontWeight="bold">
                  当前价: {formatPrice(auction.currentPrice)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  起拍价: {formatPrice(auction.startingPrice)}
                </Typography>
              </div>

              {/* 质量指标 */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center gap-1">
                  <Award fontSize="small" color="primary" />
                  <Typography variant="body2">质量评分: {auction.qualityScore}</Typography>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarToday fontSize="small" />
                  <Typography variant="body2">{getTimeLeft(auction.endTime)}</Typography>
                </div>
              </div>

              {/* 质量详情摘要 */}
              <div className="grid grid-cols-4 gap-1 text-xs">
                <div className="text-center">
                  <div className="text-gray-500">水分</div>
                  <div className={auction.qualityDetails.moisture < 15 ? 'text-green-600' : 'text-amber-600'}>
                    {auction.qualityDetails.moisture}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500">杂质</div>
                  <div className={auction.qualityDetails.impurity < 2 ? 'text-green-600' : 'text-amber-600'}>
                    {auction.qualityDetails.impurity}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500">纯度</div>
                  <div className={auction.qualityDetails.purity > 95 ? 'text-green-600' : 'text-amber-600'}>
                    {auction.qualityDetails.purity}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500">蛋白</div>
                  <div className={auction.qualityDetails.protein > 10 ? 'text-green-600' : 'text-amber-600'}>
                    {auction.qualityDetails.protein}%
                  </div>
                </div>
              </div>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>
    );
  };

  // 渲染比较对话框
  const renderCompareDialog = () => {
    const auctionsToCompare = getAuctionsToCompare();
    
    if (auctionsToCompare.length === 0) return null;
    
    return (
      <Dialog
        open={showCompareDialog}
        onClose={() => setShowCompareDialog(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>拍卖项目对比分析</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" color="text.secondary" mb={2}>
              对比 {auctionsToCompare.length} 个拍卖项目的关键指标
            </Typography>
            
            {/* 雷达图比较 */}
            <Paper elevation={2} className="p-4 mb-4">
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                质量指标雷达图对比
              </Typography>
              <Box sx={{ height: 400, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius="80%" data={getRadarData(auctionsToCompare)}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    {auctionsToCompare.map((auction, index) => {
                      const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
                      return (
                        <Radar
                          key={auction.id}
                          name={auction.title.length > 10 ? auction.title.substring(0, 10) + '...' : auction.title}
                          dataKey={['水分', '杂质', '纯度', '蛋白质', '质量评分'][index % 5]}
                          stroke={colors[index % colors.length]}
                          fill={colors[index % colors.length]}
                          fillOpacity={0.3}
                        />
                      );
                    })}
                    <Legend />
                    <RechartsTooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>

            {/* 详细数据表格 */}
            <Paper elevation={2} className="p-4">
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                详细数据对比
              </Typography>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">指标</th>
                      {auctionsToCompare.map((auction) => (
                        <th key={auction.id} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {auction.title.length > 15 ? auction.title.substring(0, 15) + '...' : auction.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">当前价格</td>
                      {auctionsToCompare.map((auction) => (
                        <td key={`price-${auction.id}`} className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {formatPrice(auction.currentPrice)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">水分含量</td>
                      {auctionsToCompare.map((auction) => (
                        <td key={`moisture-${auction.id}`} className={`px-4 py-2 whitespace-nowrap text-sm ${auction.qualityDetails.moisture < 15 ? 'text-green-600' : 'text-amber-600'}`}>
                          {auction.qualityDetails.moisture}%
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">杂质率</td>
                      {auctionsToCompare.map((auction) => (
                        <td key={`impurity-${auction.id}`} className={`px-4 py-2 whitespace-nowrap text-sm ${auction.qualityDetails.impurity < 2 ? 'text-green-600' : 'text-amber-600'}`}>
                          {auction.qualityDetails.impurity}%
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">品种纯度</td>
                      {auctionsToCompare.map((auction) => (
                        <td key={`purity-${auction.id}`} className={`px-4 py-2 whitespace-nowrap text-sm ${auction.qualityDetails.purity > 95 ? 'text-green-600' : 'text-amber-600'}`}>
                          {auction.qualityDetails.purity}%
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">蛋白质含量</td>
                      {auctionsToCompare.map((auction) => (
                        <td key={`protein-${auction.id}`} className={`px-4 py-2 whitespace-nowrap text-sm ${auction.qualityDetails.protein > 10 ? 'text-green-600' : 'text-amber-600'}`}>
                          {auction.qualityDetails.protein}%
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">存储时间</td>
                      {auctionsToCompare.map((auction) => (
                        <td key={`storage-${auction.id}`} className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {auction.qualityDetails.storageTime} 天
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">质量评分</td>
                      {auctionsToCompare.map((auction) => (
                        <td key={`score-${auction.id}`} className="px-4 py-2 whitespace-nowrap text-sm font-medium text-primary">
                          {auction.qualityScore}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCompareDialog(false)}>关闭</Button>
          <Button variant="contained" startIcon={<Download />}>
            导出对比报告
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // 渲染数据分析图表
  const renderAnalyticsCharts = () => {
    return (
      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} className="p-4 h-full">
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              <TrendingUp fontSize="small" className="inline mr-1" />
              市场价格趋势（近30天）
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avgPrice" stroke="#8884d8" name="平均价格" />
                  <Line type="monotone" dataKey="minPrice" stroke="#82ca9d" name="最低价格" />
                  <Line type="monotone" dataKey="maxPrice" stroke="#ff7300" name="最高价格" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} className="p-4 h-full">
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              <BarChart fontSize="small" className="inline mr-1" />
              粮食类型分布
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={grainTypes.map((type) => ({
                    name: type,
                    count: auctions.filter((a) => a.grainType === type).length,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={2} className="p-4">
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              <PieChart fontSize="small" className="inline mr-1" />
              质量评分分布
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={[
                    { range: '0-60', count: auctions.filter((a) => a.qualityScore >= 0 && a.qualityScore < 60).length },
                    { range: '60-70', count: auctions.filter((a) => a.qualityScore >= 60 && a.qualityScore < 70).length },
                    { range: '70-80', count: auctions.filter((a) => a.qualityScore >= 70 && a.qualityScore < 80).length },
                    { range: '80-90', count: auctions.filter((a) => a.qualityScore >= 80 && a.qualityScore < 90).length },
                    { range: '90-100', count: auctions.filter((a) => a.qualityScore >= 90 && a.qualityScore <= 100).length },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 页面标题 */}
        <motion.div variants={itemVariants} className="mb-6">
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
          <Typography variant="h4" fontWeight="bold">
            经销商采购中心
          </Typography>
          <Typography variant="body1" color="text.secondary">
            基于粮食核心指标的智能采购平台
          </Typography>
        </motion.div>

        {/* 标签页 */}
        <Paper elevation={0} className="mb-6">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons="auto"
          >
            <Tab label="拍卖列表" />
            <Tab label="数据分析" />
          </Tabs>
        </Paper>

        {/* 拍卖列表标签页 */}
        {tabValue === 0 && (
          <motion.div variants={itemVariants}>
            {/* 搜索和筛选区域 */}
            <Paper elevation={2} className="p-4 mb-6">
              <Box sx={{ position: 'relative', mb: 2 }}>
                <Search sx={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'text.secondary' }} />
                <TextField
                  fullWidth
                  placeholder="搜索拍卖项目、卖家或描述..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ pl: 8 }}
                  size="small"
                />
              </Box>

              {/* 高级筛选面板 */}
              {renderFilterPanel()}

              {/* 选中项操作 */}
              {selectedAuctions.length > 0 && (
                <Paper elevation={0} className="mt-4 p-2 bg-gray-50 flex items-center justify-between">
                  <Typography variant="body2">
                    已选择 {selectedAuctions.length} 个项目
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<CompareArrows />}
                    onClick={() => setShowCompareDialog(true)}
                  >
                    对比选中项目
                  </Button>
                </Paper>
              )}
            </Paper>

            {/* 拍卖列表 */}
            {isLoading ? (
              <div className="flex justify-center py-10">
                <CircularProgress />
              </div>
            ) : filteredAuctions.length === 0 ? (
              <Paper elevation={2} className="p-8 text-center">
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  未找到符合条件的拍卖项目
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  请尝试调整搜索条件或筛选器
                </Typography>
                <Button variant="outlined" onClick={resetFilters} className="mt-4">
                  重置筛选条件
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={4}>
                {filteredAuctions.map((auction) => (
                  <Grid item xs={12} sm={6} lg={4} key={auction.id}>
                    {renderAuctionCard(auction)}
                  </Grid>
                ))}
              </Grid>
            )}
          </motion.div>
        )}

        {/* 数据分析标签页 */}
        {tabValue === 1 && (
          <motion.div variants={itemVariants}>
            <Paper elevation={2} className="p-6 mb-6">
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                市场数据分析
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={4}>
                基于历史交易数据和当前拍卖信息的智能分析
              </Typography>
              {renderAnalyticsCharts()}
            </Paper>
          </motion.div>
        )}
      </motion.div>

      {/* 比较对话框 */}
      {renderCompareDialog()}
    </Container>
  );
};

export default DealerPurchaseCenter;
