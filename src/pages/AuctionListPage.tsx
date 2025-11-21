import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating
} from '@mui/material'
import {
  Search,
  FilterList,
  Clock,
  TrendingUp,
  DollarSign,
  MapPin,
  CalendarToday,
  Award,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Star,
  Eye
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

// 拍卖物品接口
interface AuctionItem {
  id: string
  title: string
  description: string
  imageUrl: string
  startingPrice: number
  currentPrice: number
  bidIncrement: number
  startTime: string
  endTime: string
  status: 'active' | 'completed' | 'pending'
  creatorId: string
  creatorName: string
  creatorType: 'farmer'
  views: number
  bids: number
  location: string
  grainType: string
  quantity: number
  qualityScore: number
}

// 模拟用户数据
const mockUser = {
  id: 'user1',
  username: 'testUser',
  userType: 'farmer',
  isAuthenticated: true
}

// 模拟拍卖数据
const mockAuctions: AuctionItem[] = [
  {
    id: 'auction1',
    title: '优质东北大米 一级精米 50kg装',
    description: '产自东北黑土地的优质大米，颗粒饱满，口感软糯，营养丰富',
    imageUrl: 'https://via.placeholder.com/800x600?text=Rice',
    startingPrice: 500,
    currentPrice: 560,
    bidIncrement: 10,
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    creatorId: 'farmer1',
    creatorName: '张农夫',
    creatorType: 'farmer',
    views: 156,
    bids: 23,
    location: '黑龙江省哈尔滨市',
    grainType: '大米',
    quantity: 1000,
    qualityScore: 95
  },
  {
    id: 'auction2',
    title: '有机小麦 高筋面粉原料 无农药残留',
    description: '有机种植的高筋小麦，适合制作面包和各类面食',
    imageUrl: 'https://via.placeholder.com/800x600?text=Wheat',
    startingPrice: 350,
    currentPrice: 390,
    bidIncrement: 5,
    startTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    creatorId: 'farmer2',
    creatorName: '李农场',
    creatorType: 'farmer',
    views: 98,
    bids: 15,
    location: '河南省郑州市',
    grainType: '小麦',
    quantity: 2000,
    qualityScore: 92
  },
  {
    id: 'auction3',
    title: '新鲜玉米 饲料原料 高淀粉含量',
    description: '刚收获的玉米，淀粉含量高，适合制作饲料',
    imageUrl: 'https://via.placeholder.com/800x600?text=Corn',
    startingPrice: 280,
    currentPrice: 280,
    bidIncrement: 5,
    startTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    creatorId: 'farmer3',
    creatorName: '王农业',
    creatorType: 'farmer',
    views: 76,
    bids: 0,
    location: '吉林省长春市',
    grainType: '玉米',
    quantity: 3000,
    qualityScore: 88
  },
  {
    id: 'auction4',
    title: '非转基因大豆 高蛋白含量',
    description: '传统种植的非转基因大豆，蛋白质含量高，适合榨油和豆制品',
    imageUrl: 'https://via.placeholder.com/800x600?text=Soybean',
    startingPrice: 420,
    currentPrice: 450,
    bidIncrement: 10,
    startTime: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    creatorId: 'farmer4',
    creatorName: '赵农户',
    creatorType: 'farmer',
    views: 203,
    bids: 18,
    location: '黑龙江省齐齐哈尔市',
    grainType: '大豆',
    quantity: 1500,
    qualityScore: 90
  },
  {
    id: 'auction5',
    title: '优质高粱 酿酒原料',
    description: '适合酿酒的优质高粱，颗粒饱满，品质优良',
    imageUrl: 'https://via.placeholder.com/800x600?text=Sorghum',
    startingPrice: 300,
    currentPrice: 300,
    bidIncrement: 5,
    startTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    creatorId: 'farmer5',
    creatorName: '刘庄稼',
    creatorType: 'farmer',
    views: 45,
    bids: 0,
    location: '山西省太原市',
    grainType: '高粱',
    quantity: 1200,
    qualityScore: 85
  }
]

const AuctionListPage: React.FC = () => {
  const navigate = useNavigate()
  const user = mockUser // 模拟用户数据
  const [auctions] = useState<AuctionItem[]>(mockAuctions) // 使用模拟拍卖数据
  const [isLoading] = useState(false) // 模拟加载状态
  const [filteredAuctions, setFilteredAuctions] = useState<AuctionItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [grainTypeFilter, setGrainTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('active')
  const [sortBy, setSortBy] = useState('currentPrice')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({})

  // 加载拍卖数据
  useEffect(() => {
    // 模拟加载拍卖数据
    console.log('拍卖数据已加载')
  }, [])

  // 搜索和筛选拍卖
  useEffect(() => {
    let result = [...auctions]
    
    // 搜索筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        auction =>
          auction.title.toLowerCase().includes(query) ||
          auction.description.toLowerCase().includes(query) ||
          auction.location.toLowerCase().includes(query)
      )
    }
    
    // 粮食类型筛选
    if (grainTypeFilter !== 'all') {
      result = result.filter(auction => auction.grainType === grainTypeFilter)
    }
    
    // 状态筛选
    if (statusFilter !== 'all') {
      result = result.filter(auction => auction.status === statusFilter)
    }
    
    // 排序
    result.sort((a, b) => {
      if (sortBy === 'currentPrice') {
        return sortDirection === 'asc' ? a.currentPrice - b.currentPrice : b.currentPrice - a.currentPrice
      } else if (sortBy === 'endTime') {
        const dateA = new Date(a.endTime).getTime()
        const dateB = new Date(b.endTime).getTime()
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
      } else if (sortBy === 'bids') {
        return sortDirection === 'asc' ? a.bids - b.bids : b.bids - a.bids
      } else if (sortBy === 'views') {
        return sortDirection === 'asc' ? a.views - b.views : b.views - a.views
      }
      return 0
    })
    
    setFilteredAuctions(result)
  }, [auctions, searchQuery, grainTypeFilter, statusFilter, sortBy, sortDirection])

  // 更新倒计时
  useEffect(() => {
    const updateTimeLeft = () => {
      const newTimeLeft: { [key: string]: string } = {}
      filteredAuctions.forEach(auction => {
        if (auction.status === 'active') {
          const now = new Date().getTime()
          const endTime = new Date(auction.endTime).getTime()
          const difference = endTime - now
          
          if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24))
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            
            if (days > 0) {
              newTimeLeft[auction.id] = `${days}天 ${hours}小时`
            } else if (hours > 0) {
              newTimeLeft[auction.id] = `${hours}小时 ${minutes}分钟`
            } else {
              newTimeLeft[auction.id] = `${minutes}分钟`
            }
          } else {
            newTimeLeft[auction.id] = '已结束'
          }
        }
      })
      setTimeLeft(newTimeLeft)
    }
    
    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 60000) // 每分钟更新一次
    
    return () => clearInterval(interval)
  }, [filteredAuctions])

  // 处理排序变化
  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDirection('desc')
    }
  }

  // 处理拍卖卡片点击
  const handleAuctionClick = (auctionId: string) => {
    navigate(`/auction/${auctionId}`)
  }

  // 创建新拍卖
  const handleCreateAuction = () => {
    // 导航到创建拍卖页面
    navigate('/auction/create')
  }

  // 格式化价格
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2
    }).format(price)
  }

  // 动画变体
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
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.5
      }
    })
  }

  return (
    
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          {/* 页面标题和创建按钮 */}
          <motion.div variants={itemVariants} className="mb-6 flex justify-between items-center flex-wrap gap-4">
          <div>
              <Typography variant="h4" component="h1" fontWeight="bold" className="text-primary mb-1">
                拍卖市场
              </Typography>
              <Typography variant="body2" color="text.secondary">
                浏览和参与最新的粮食拍卖
              </Typography>
            </div>
            <Button
              variant="contained"
              onClick={handleCreateAuction}
              sx={{
                borderRadius: 2,
                px: 3
              }}
            >
              创建拍卖
            </Button>
          </motion.div>

          {/* 搜索和筛选 */}
          <motion.div variants={itemVariants} className="mb-6 bg-white p-4 rounded-lg shadow-sm">
            <Grid container spacing={3}
              sx={{
                '& .MuiTextField-root': {
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderRadius: 1,
                    },
                  },
                },
              }}
            >
              <Grid item xs={12} md={5}>
                <TextField
                  label="搜索拍卖物品"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <Search />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth>
                  <InputLabel>粮食类型</InputLabel>
                  <Select
                    label="粮食类型"
                    value={grainTypeFilter}
                    onChange={(e) => setGrainTypeFilter(e.target.value)}
                  >
                    <MenuItem value="all">全部类型</MenuItem>
                    <MenuItem value="大米">大米</MenuItem>
                    <MenuItem value="小麦">小麦</MenuItem>
                    <MenuItem value="玉米">玉米</MenuItem>
                    <MenuItem value="大豆">大豆</MenuItem>
                    <MenuItem value="高粱">高粱</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth>
                  <InputLabel>拍卖状态</InputLabel>
                  <Select
                    label="拍卖状态"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">全部状态</MenuItem>
                    <MenuItem value="active">进行中</MenuItem>
                    <MenuItem value="completed">已完成</MenuItem>
                    <MenuItem value="pending">审核中</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <FormControl fullWidth>
                  <InputLabel>排序方式</InputLabel>
                  <Select
                    label="排序方式"
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                  >
                    <MenuItem value="currentPrice">价格优先 {sortBy === 'currentPrice' && (sortDirection === 'asc' ? '↑' : '↓')}</MenuItem>
                    <MenuItem value="endTime">结束时间 {sortBy === 'endTime' && (sortDirection === 'asc' ? '↑' : '↓')}</MenuItem>
                    <MenuItem value="bids">竞价次数 {sortBy === 'bids' && (sortDirection === 'asc' ? '↑' : '↓')}</MenuItem>
                    <MenuItem value="views">浏览量 {sortBy === 'views' && (sortDirection === 'asc' ? '↑' : '↓')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </motion.div>

          {/* 拍卖统计 */}
          <motion.div variants={itemVariants} className="mb-6">
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" className="p-4 text-center"
                  sx={{
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(21, 101, 192, 0.04)',
                  }}
                >
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {auctions.filter(a => a.status === 'active').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    进行中拍卖
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" className="p-4 text-center"
                  sx={{
                    borderColor: 'success.main',
                    backgroundColor: 'rgba(46, 125, 50, 0.04)',
                  }}
                >
                  <Typography variant="h4" color="success" fontWeight="bold">
                    {auctions.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    总拍卖数
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" className="p-4 text-center"
                  sx={{
                    borderColor: 'warning.main',
                    backgroundColor: 'rgba(255, 193, 7, 0.04)',
                  }}
                >
                  <Typography variant="h4" color="warning" fontWeight="bold">
                    {auctions.filter(a => a.status === 'pending').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    审核中拍卖
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" className="p-4 text-center"
                  sx={{
                    borderColor: 'error.main',
                    backgroundColor: 'rgba(211, 47, 47, 0.04)',
                  }}
                >
                  <Typography variant="h4" color="error" fontWeight="bold">
                    {auctions.reduce((sum, a) => sum + a.bids, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    总竞价次数
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </motion.div>

          {/* 拍卖列表 */}
          {isLoading ? (
            <motion.div variants={itemVariants} className="flex justify-center py-12">
              <CircularProgress size={48} />
            </motion.div>
          ) : filteredAuctions.length === 0 ? (
            <motion.div variants={itemVariants} className="py-12 text-center">
              <Alert severity="info" className="max-w-md mx-auto">
                没有找到符合条件的拍卖
              </Alert>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants}
              initial="hidden"
              animate="visible"
              custom={filteredAuctions.length}
            >
              <Grid container spacing={4}
                sx={{
                  '& .MuiCard-root': {
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                    },
                  },
                }}
              >
                {filteredAuctions.map((auction, index) => (
                  <Grid item xs={12} sm={6} md={4} key={auction.id}>
                    <motion.div
                      custom={index}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Card
                        variant="outlined"
                        className="h-full cursor-pointer relative overflow-hidden"
                        onClick={() => handleAuctionClick(auction.id)}
                      >
                        {/* 状态标签 */}
                        {auction.status === 'active' && (
                          <Chip
                            label="进行中"
                            color="success"
                            size="small"
                            className="absolute top-2 right-2 z-10"
                          />
                        )}
                        {auction.status === 'pending' && (
                          <Chip
                            label="审核中"
                            color="warning"
                            size="small"
                            className="absolute top-2 right-2 z-10"
                          />
                        )}
                        {auction.status === 'completed' && (
                          <Chip
                            label="已完成"
                            color="default"
                            size="small"
                            className="absolute top-2 right-2 z-10"
                          />
                        )}

                        {/* 拍卖图片 */}
                        <CardMedia
                          component="img"
                          height="200"
                          image={auction.imageUrl}
                          alt={auction.title}
                          sx={{ objectFit: 'cover' }}
                        />

                        <CardContent className="flex-grow display: flex flex-direction: column gap: 8px">
                          {/* 拍卖标题 */}
                          <Typography variant="h6" className="font-bold line-clamp-2 mb-2">
                            {auction.title}
                          </Typography>

                          {/* 粮食类型和产地 */}
                          <div className="flex justify-between items-center mb-2">
                            <Chip
                              label={auction.grainType}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            <div className="flex items-center gap-1 text-gray-600">
                              <MapPin fontSize="small" />
                              <Typography variant="caption">
                                {auction.location}
                              </Typography>
                            </div>
                          </div>

                          {/* 质量评分 */}
                          <div className="flex items-center gap-1 mb-3">
                            <Typography variant="caption" className="font-medium">
                              质量评分：
                            </Typography>
                            <Rating
                              value={auction.qualityScore / 20} // 假设质量评分为0-100，转换为1-5星
                              precision={0.5}
                              readOnly
                              size="small"
                            />
                            <Typography variant="caption" color="primary">
                              {auction.qualityScore}
                            </Typography>
                          </div>

                          {/* 价格信息 */}
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <Typography variant="caption" color="text.secondary">
                                当前价格
                              </Typography>
                              <Typography variant="subtitle1" color="error" fontWeight="bold">
                                {formatPrice(auction.currentPrice)}
                              </Typography>
                            </div>
                            <div className="flex justify-between items-center">
                              <Typography variant="caption" color="text.secondary">
                                起拍价格
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatPrice(auction.startingPrice)}
                              </Typography>
                            </div>
                          </div>

                          {/* 时间和竞价信息 */}
                          <div className="flex justify-between items-center text-sm mb-2">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock fontSize="small" />
                              <Typography variant="caption">
                                {auction.status === 'active' ? timeLeft[auction.id] || '计算中...' : formatDate(auction.endTime)}
                              </Typography>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <TrendingUp fontSize="small" />
                              <Typography variant="caption">
                                {auction.bids} 次竞价
                              </Typography>
                            </div>
                          </div>

                          {/* 查看详情按钮 */}
                          <Button
                            endIcon={<ArrowRight />}
                            variant="text"
                            fullWidth
                            sx={{ mt: 'auto' }}
                          >
                            查看详情
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}
        </motion.div>
      </Container>
    
  )
}

// 格式化日期
  // 在组件内部定义formatDate函数
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

export default AuctionListPage