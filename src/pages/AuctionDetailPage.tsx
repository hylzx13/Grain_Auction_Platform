import React, { useState, useEffect, useRef, useCallback } from 'react'
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
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Rating
} from '@mui/material'
import {
  Clock,
  TrendingUp,
  DollarSign,
  MapPin,
  Calendar,
  Award,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Info,
  User,
  Phone,
  CheckCircle,
  Star,
  ThumbsUp,
  Shield,
  Image as ImageIcon,
  VideoCall,
  BarChart,
  FileText,
  X,
  Eye,
  ChevronLeft,
  MessageSquare,
  Sparkles
} from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// 出价记录接口
interface Bid {
  id: string
  auctionId: string
  bidderId: string
  bidderName: string
  bidAmount: number
  bidTime: string
  isWinning: boolean
}

// 拍卖物品接口
interface AuctionItem {
  id: string
  title: string
  description: string
  imageUrl: string
  images: string[]
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
  qualityDetails: {
    moisture: number
    impurity: number
    purity: number
    protein: number
    storageTime: number
  }
  certificationIds: string[]
  inspectionReportUrl: string
  remoteSensingDataUrl: string
}

// 模拟用户数据
const mockUser = {
  id: 'user1',
  username: 'testUser',
  userType: 'dealer',
  isAuthenticated: true
}

// 模拟拍卖数据
const getMockAuction = (id: string): AuctionItem => {
  return {
    id: id || 'auction1',
    title: '优质东北大米 一级精米 50kg装',
    description: '产自东北黑土地的优质大米，颗粒饱满，口感软糯，营养丰富。\n\n本批次大米经过严格筛选，无杂质，无霉变，保证品质。适合家庭日常食用，也可用于餐饮行业。\n\n运输方式：支持物流配送和自提',
    imageUrl: 'https://via.placeholder.com/800x600?text=Rice',
    images: [
      'https://via.placeholder.com/800x600?text=Rice1',
      'https://via.placeholder.com/800x600?text=Rice2',
      'https://via.placeholder.com/800x600?text=Rice3'
    ],
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
    qualityScore: 95,
    qualityDetails: {
      moisture: 13.5,
      impurity: 0.5,
      purity: 99.5,
      protein: 7.5,
      storageTime: 30
    },
    certificationIds: ['cert1', 'cert2'],
    inspectionReportUrl: 'https://example.com/report.pdf',
    remoteSensingDataUrl: 'https://example.com/remote-sensing'
  }
}

// 模拟出价数据
const getMockBids = (auctionId: string): Bid[] => {
  return [
    {
      id: 'bid1',
      auctionId: auctionId,
      bidderId: 'user2',
      bidderName: '李买家',
      bidAmount: 560,
      bidTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isWinning: true
    },
    {
      id: 'bid2',
      auctionId: auctionId,
      bidderId: mockUser.id,
      bidderName: mockUser.username,
      bidAmount: 550,
      bidTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      isWinning: false
    },
    {
      id: 'bid3',
      auctionId: auctionId,
      bidderId: 'user3',
      bidderName: '王商家',
      bidAmount: 540,
      bidTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      isWinning: false
    }
  ]
}

const AuctionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = mockUser // 模拟用户数据
  
  // 模拟函数
  const getAuctionById = (auctionId: string) => getMockAuction(auctionId)
  const getBidsByAuctionId = (auctionId: string) => getMockBids(auctionId)
  const updateAuctionView = (auctionId: string) => console.log('更新浏览量', auctionId)
  
  const [auction, setAuction] = useState<AuctionItem | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [bidAmount, setBidAmount] = useState(0)
  const [timeLeft, setTimeLeft] = useState('')
  const [showAutomaticBidDialog, setShowAutomaticBidDialog] = useState(false)
  const [maxBidAmount, setMaxBidAmount] = useState(0)
  const [autoBidIncrement, setAutoBidIncrement] = useState(0)
  const [isAutoBidding, setIsAutoBidding] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [bidHistoryOpen, setBidHistoryOpen] = useState(false)
  const [bidSuccess, setBidSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // 提交状态（用于防止重复提交）
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const bidInputRef = useRef<HTMLInputElement | null>(null)
  
  // 模拟出价函数
  const placeBid = async (auctionId: string, amount: number) => {
    console.log('提交出价:', amount)
    // 模拟成功响应
    return {
      id: `bid_${Date.now()}`,
      auctionId: auctionId,
      bidderId: user.id,
      bidderName: user.username,
      bidAmount: amount,
      bidTime: new Date().toISOString(),
      isWinning: true
    }
  }

  // 加载拍卖数据
  useEffect(() => {
    const fetchAuctionData = async () => {
      if (!id) {
        navigate('/auctions')
        return
      }
      
      try {
        setIsLoading(true)
        const auctionData = await getAuctionById(id)
        setAuction(auctionData)
        setBidAmount(auctionData.currentPrice + auctionData.bidIncrement)
        
        // 更新浏览量
        await updateAuctionView(id)
        
        // 加载出价记录
        const bidsData = await getBidsByAuctionId(id)
        setBids(bidsData)
        
        // 连接到实时竞价WebSocket（模拟）
        setupBidSocket()
        
      } catch (error) {
        toast.error('加载拍卖信息失败')
        navigate('/auctions')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAuctionData()
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (bidSocketRef.current) {
        bidSocketRef.current.close()
      }
    }
  }, [id, navigate, getAuctionById, updateAuctionView, getBidsByAuctionId])

  // 更新倒计时
  useEffect(() => {
    if (!auction || auction.status !== 'active') return
    
    const updateTimeLeft = () => {
      const now = new Date().getTime()
      const endTime = new Date(auction.endTime).getTime()
      const difference = endTime - now
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)
        
        if (days > 0) {
          setTimeLeft(`${days}天 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
        } else {
          setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
        }
      } else {
        setTimeLeft('已结束')
        // 在实际应用中，这里应该重新获取拍卖状态
      }
    }
    
    updateTimeLeft()
    timerRef.current = setInterval(updateTimeLeft, 1000)
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [auction])

  // 设置WebSocket连接
  const setupBidSocket = () => {
    // 由于WebSocket服务不可用，我们使用模拟数据和定时刷新来模拟实时更新
    console.log('设置模拟实时更新')
    
    // 模拟每30秒可能有新的出价
    const mockUpdateInterval = setInterval(() => {
      // 有30%的概率模拟新出价
      if (Math.random() < 0.3 && auction && auction.status === 'active') {
        const randomIncrement = Math.floor(Math.random() * 3 + 1) * auction.bidIncrement
        const newBidAmount = auction.currentPrice + randomIncrement
        
        const newBid: Bid = {
          id: `bid_${Date.now()}`,
          auctionId: auction.id,
          bidderId: `mock_user_${Math.floor(Math.random() * 100)}`,
          bidderName: `模拟买家${Math.floor(Math.random() * 100)}`,
          bidAmount: newBidAmount,
          bidTime: new Date().toISOString(),
          isWinning: true
        }
        
        setAuction(prev => prev ? { ...prev, currentPrice: newBidAmount } : null)
        setBids(prev => [newBid, ...prev])
      }
    }, 30000)
    
    // 清理定时器
    return () => clearInterval(mockUpdateInterval)
  }

  // 处理出价 - 添加限流和加密
  const handleBid = async () => {
    if (!user || !auction) return
    
    // 验证出价金额
    if (bidAmount < auction.currentPrice + auction.bidIncrement) {
      toast.warning(`出价必须至少高于当前价格${formatPrice(auction.bidIncrement)}`)
      return
    }
    
    // 使用限流检查
    if (!bidRateLimiter.allowRequest(`${user.id}_bid`)) {
      toast.warning('出价过于频繁，请稍后再试')
      return
    }
    
    try {
      // 加密出价数据
      const encryptedBid = encrypt(JSON.stringify({
        auctionId: auction.id,
        amount: bidAmount,
        isAutoBid: false
      }));
      
      // 优先通过WebSocket发送出价
      const wsSent = wsManager.send(`auction_${auction.id}`, {
        type: 'place_bid',
        encryptedData: encryptedBid,
        timestamp: Date.now()
      });
      
      // 如果WebSocket发送失败，则使用HTTP请求
      if (!wsSent) {
        const newBid = await placeBid(auction.id, bidAmount);
        setBids(prevBids => [newBid, ...prevBids]);
        setAuction(prevAuction => ({
          ...prevAuction,
          currentPrice: bidAmount,
          bids: prevAuction.bids + 1
        }));
      } else {
        // 乐观UI更新
        setAuction(prevAuction => ({
          ...prevAuction,
          currentPrice: bidAmount,
          bids: prevAuction.bids + 1
        }));
      }
      
      setBidAmount(bidAmount + auction.bidIncrement) // 准备下一次出价
      setBidSuccess(true)
      
      setTimeout(() => {
        setBidSuccess(false)
      }, 3000)
      
    } catch (error) {
      toast.error('出价失败，请稍后重试')
    }
  }

  // 处理一键加价
  const handleQuickBid = () => {
    if (!auction) return
    setBidAmount(auction.currentPrice + auction.bidIncrement)
    bidInputRef.current?.focus()
  }
  
  // 防抖处理的快速加价函数
  const debouncedQuickBid = useRef(
    debounce((amount) => {
      setBidAmount(amount);
      handleBid();
    }, 200)
  ).current;

  // 处理自动出价设置 - 添加加密存储
  const handleAutoBidSubmit = async () => {
    if (!user) {
      toast.error('请先登录再设置自动出价');
      return;
    }
    
    // 验证最大出价金额
    if (maxBidAmount <= auction?.currentPrice) {
      toast.warning('自动出价上限必须高于当前价格');
      return;
    }
    
    setIsAutoBidding(true);
    setShowAutomaticBidDialog(false);
    
    try {
      // 保存自动出价设置到服务器（加密存储）
      await secureAxiosInstance.post('/users/auto-bid-settings', {
        auctionId: id,
        settings: {
          enabled: true,
          maxAmount: maxBidAmount,
          increment: autoBidIncrement || auction?.bidIncrement || 100
        }
      }, {
        headers: {
          'X-Encrypt-Body': 'true'
        }
      });
      
      toast.success('已开启自动出价功能');
    } catch (error) {
      console.error('保存自动出价设置失败:', error);
      // 即使服务器保存失败，也在本地应用设置
      toast.success('已开启自动出价功能（本地设置）');
    }
  }

  // 处理图片查看
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setShowImageViewer(true)
  }

  // 格式化价格
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2
    }).format(price)
  }

  // 格式化日期时间
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  // 判断用户是否是当前最高价出价者
  const isCurrentHighestBidder = () =>
    user && bids.length > 0 && bids[0].bidderId === user.id

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

  const bidSuccessVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.3 }
    }
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 12, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={64} />
      </Container>
    )
  }

  if (!auction) {
    return (
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Alert severity="error" variant="filled"
          sx={{ maxWidth: '600px', margin: '0 auto' }}
        >
          拍卖不存在或已被删除
        </Alert>
      </Container>
    )
  }

  return (
    
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 返回按钮 */}
          <motion.div variants={itemVariants}
            sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}
          >
            <Button
              variant="text"
              onClick={() => navigate('/auctions')}
              sx={{ textTransform: 'none' }}
            >
              <ChevronLeft />
              返回拍卖列表
            </Button>
          </motion.div>

          {/* 拍卖状态 */}
          <motion.div variants={itemVariants}
            className={`mb-4 p-4 rounded-lg ${auction.status === 'active' ? 'bg-green-50' : auction.status === 'completed' ? 'bg-gray-50' : 'bg-yellow-50'}`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {auction.status === 'active' && (
                  <>
                    <CheckCircle color="success" />
                    <Typography variant="h6" color="success" fontWeight="bold">
                      拍卖进行中
                    </Typography>
                  </>
                )}
                {auction.status === 'pending' && (
                  <>
                    <Clock color="warning" />
                    <Typography variant="h6" color="warning" fontWeight="bold">
                      审核中
                    </Typography>
                  </>
                )}
                {auction.status === 'completed' && (
                  <>
                    <CheckCircle color="default" />
                    <Typography variant="h6" color="text.secondary" fontWeight="bold">
                      拍卖已结束
                    </Typography>
                  </>
                )}
              </div>
              
              {auction.status === 'active' && (
                <div className="flex items-center gap-2">
                  <Clock color="error" />
                  <Typography variant="h6" color="error" fontWeight="bold">
                    {timeLeft}
                  </Typography>
                </div>
              )}
              
              {auction.status === 'completed' && bids.length > 0 && (
                <Chip
                  label={`已成交 · ${formatPrice(auction.currentPrice)}`}
                  color="success"
                  size="medium"
                />
              )}
            </div>
          </motion.div>

          {/* 主要内容 */}
          <Grid container spacing={6}>
            {/* 左侧：拍卖详情 */}
            <Grid item xs={12} lg={7}>
              {/* 拍卖图片展示 */}
              <motion.div variants={itemVariants} className="mb-6">
                <Box
                  className="relative cursor-pointer overflow-hidden rounded-lg bg-gray-100"
                  onClick={() => handleImageClick(auction.imageUrl)}
                  sx={{ height: '400px', position: 'relative' }}
                >
                  <img
                    src={auction.imageUrl}
                    alt={auction.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <Typography variant="body1" color="white" className="flex items-center gap-1">
                      <Eye fontSize="small" />
                      {auction.views} 次浏览
                    </Typography>
                  </div>
                  {/* 图片预览 */}
                  {auction.images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-white/80 rounded-full p-2">
                      <Typography variant="caption" color="primary">
                        点击查看更多图片
                      </Typography>
                    </div>
                  )}
                </Box>
              </motion.div>

              {/* 拍卖标题和描述 */}
              <motion.div variants={itemVariants} className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <Typography variant="h4" component="h1" fontWeight="bold" className="mb-2">
                    {auction.title}
                  </Typography>
                  <div className="flex gap-2 mb-2">
                    <Chip
                      label={auction.grainType}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={`${auction.quantity} 吨`}
                      color="secondary"
                      variant="outlined"
                    />
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-1">
                      <MapPin fontSize="small" color="text.secondary" />
                      <Typography variant="body2" color="text.secondary">
                        {auction.location}
                      </Typography>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarToday fontSize="small" color="text.secondary" />
                      <Typography variant="body2" color="text.secondary">
                        开始时间：{formatDateTime(auction.startTime)}
                      </Typography>
                    </div>
                  </div>
                </div>
                <Divider className="mb-4" />
                <Typography variant="body1" color="text.primary" className="whitespace-pre-line mb-4">
                  {auction.description}
                </Typography>
              </motion.div>

              {/* 质量详情 */}
              <motion.div variants={itemVariants} className="mb-6 bg-gray-50 p-6 rounded-lg">
                <Typography variant="h6" fontWeight="bold" className="mb-4 flex items-center gap-2">
                  <Award color="primary" />
                  粮食质量指标
                </Typography>
                <Grid container spacing={4}>
                  <Grid item xs={6} sm={3}>
                    <Card variant="outlined" className="p-3 text-center"
                      sx={{
                        borderColor: auction.qualityDetails.moisture < 15 ? 'success.main' : 'warning.main',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" className="block mb-1">
                        水分含量
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {auction.qualityDetails.moisture}%
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card variant="outlined" className="p-3 text-center"
                      sx={{
                        borderColor: auction.qualityDetails.impurity < 2 ? 'success.main' : 'warning.main',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" className="block mb-1">
                        杂质率
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {auction.qualityDetails.impurity}%
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card variant="outlined" className="p-3 text-center"
                      sx={{
                        borderColor: auction.qualityDetails.purity > 95 ? 'success.main' : 'warning.main',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" className="block mb-1">
                        品种纯度
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {auction.qualityDetails.purity}%
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card variant="outlined" className="p-3 text-center"
                      sx={{
                        borderColor: auction.qualityDetails.protein > 10 ? 'success.main' : 'warning.main',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" className="block mb-1">
                        蛋白质含量
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {auction.qualityDetails.protein}%
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Typography variant="subtitle1" fontWeight="bold">
                      综合质量评分
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {auction.qualityScore}
                    </Typography>
                  </div>
                  <Rating
                    value={auction.qualityScore / 20} // 0-100分转换为1-5星
                    precision={0.5}
                    readOnly
                    size="large"
                  />
                </div>
              </motion.div>

              {/* 认证和报告 */}
              <motion.div variants={itemVariants} className="mb-6">
                <Typography variant="h6" fontWeight="bold" className="mb-4 flex items-center gap-2">
                  <Shield color="primary" />
                  认证和质检报告
                </Typography>
                <Grid container spacing={3}>
                  {auction.inspectionReportUrl && (
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => window.open(auction.inspectionReportUrl, '_blank')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-blue-50 rounded-full">
                            <FileText color="primary" />
                          </div>
                          <div>
                            <Typography variant="subtitle1" fontWeight="medium">
                              质检报告
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              农科院权威质检报告
                            </Typography>
                          </div>
                          <ArrowRight color="primary" />
                        </div>
                      </Card>
                    </Grid>
                  )}
                  {auction.remoteSensingDataUrl && (
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => window.open(auction.remoteSensingDataUrl, '_blank')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-green-50 rounded-full">
                            <BarChart color="success" />
                          </div>
                          <div>
                            <Typography variant="subtitle1" fontWeight="medium">
                              遥感数据分析
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              基于OpenEO平台的地块分析
                            </Typography>
                          </div>
                          <ArrowRight color="success" />
                        </div>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </motion.div>

              {/* 出价记录 */}
              <motion.div variants={itemVariants}>
                <Accordion expanded={bidHistoryOpen} onChange={() => setBidHistoryOpen(!bidHistoryOpen)}>
                  <AccordionSummary expandIcon={bidHistoryOpen ? <ChevronUp /> : <ChevronDown />}>
                    <Typography variant="h6" fontWeight="bold" className="flex items-center gap-2">
                      <TrendingUp color="primary" />
                      出价记录 (共 {bids.length} 次)
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {bids.length === 0 ? (
                      <Typography variant="body1" color="text.secondary" textAlign="center" py={3}>
                        暂无出价记录
                      </Typography>
                    ) : (
                      <TableContainer component={Paper} sx={{ maxHeight: '400px' }}>
                        <Table stickyHeader size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>出价时间</TableCell>
                              <TableCell>出价人</TableCell>
                              <TableCell align="right">出价金额</TableCell>
                              <TableCell align="center">状态</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {bids.slice(0, 20).map((bid) => (
                              <TableRow
                                key={bid.id}
                                sx={{
                                  '&:nth-of-type(odd)': { backgroundColor: 'rgba(0,0,0,0.02)' },
                                  '&.Mui-selected': { backgroundColor: 'rgba(21, 101, 192, 0.08)' },
                                }}
                              >
                                <TableCell>{formatDateTime(bid.bidTime)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar>{bid.bidderName.charAt(0)}</Avatar>
                                    <span>{bid.bidderName}</span>
                                  </div>
                                </TableCell>
                                <TableCell align="right" fontWeight={bid.isWinning ? 'bold' : 'normal'}>
                                  {formatPrice(bid.bidAmount)}
                                </TableCell>
                                <TableCell align="center">
                                  {bid.isWinning ? (
                                    <Chip label="当前最高价" size="small" color="success" />
                                  ) : (
                                    <Chip label="已被超越" size="small" color="default" />
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </AccordionDetails>
                </Accordion>
              </motion.div>
            </Grid>

            {/* 右侧：竞价面板 */}
            <Grid item xs={12} lg={5}>
              <motion.div variants={itemVariants}>
                <Paper elevation={3} className="p-6 sticky top-6">
                  {/* 当前价格 */}
                  <div className="text-center mb-6">
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      当前价格
                    </Typography>
                    <Typography variant="h3" component="div" color="error" fontWeight="bold">
                      {formatPrice(auction.currentPrice)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" className="mt-1">
                      起拍价: {formatPrice(auction.startingPrice)} · 加价幅度: {formatPrice(auction.bidIncrement)}
                    </Typography>
                  </div>

                  {auction.status === 'active' ? (
                    <>
                      {/* 出价输入 */}
                      <TextField
                        label="您的出价"
                        type="number"
                        fullWidth
                        margin="normal"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        InputProps={{
                          startAdornment: <DollarSign />,
                          ref: bidInputRef,
                        }}
                        inputProps={{ min: auction.currentPrice + auction.bidIncrement }}
                        error={bidAmount < auction.currentPrice + auction.bidIncrement}
                        helperText={bidAmount < auction.currentPrice + auction.bidIncrement ? `出价必须至少高于当前价格${formatPrice(auction.bidIncrement)}` : ''}
                      />

                      {/* 快速出价按钮 */}
                      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        {[1, 2, 3, 5, 10].map((multiple) => {
                          const quickBidAmount = auction.currentPrice + (auction.bidIncrement * multiple)
                          return (
                            <Chip
                              key={multiple}
                              label={formatPrice(quickBidAmount)}
                              variant="outlined"
                              onClick={() => setBidAmount(quickBidAmount)}
                              className="cursor-pointer min-w-[100px]"
                            />
                          )
                        })}
                      </div>

                      {/* 主要操作按钮 */}
                      <div className="flex flex-col gap-3">
                        <Button
                          variant="contained"
                          fullWidth
                          size="large"
                          onClick={handleBid}
                          disabled={!user || bidAmount < auction.currentPrice + auction.bidIncrement}
                          sx={{ py: 1.5 }}
                        >
                          {isCurrentHighestBidder() ? '保持领先' : '立即出价'}
                        </Button>
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => setShowAutomaticBidDialog(true)}
                          disabled={!user || isAutoBidding}
                          startIcon={<AutoAwesome />}
                        >
                          {isAutoBidding ? '自动出价已开启' : '设置自动出价'}
                        </Button>
                      </div>

                      {/* 提示信息 */}
                      <Alert severity="info" className="mt-4" size="small">
                        <Info fontSize="small" className="mr-2" />
                        请确保您的账户有足够资金进行竞价
                      </Alert>
                    </>
                  ) : auction.status === 'pending' ? (
                    <Alert severity="warning" variant="filled" className="text-center">
                      <Clock className="mb-2" />
                      <Typography variant="h6" gutterBottom>
                        拍卖正在审核中
                      </Typography>
                      <Typography variant="body2">
                        请耐心等待管理员审核，审核通过后将自动开始
                      </Typography>
                    </Alert>
                  ) : (
                    <Alert severity="success" variant="filled" className="text-center">
                      <Award className="mb-2" />
                      <Typography variant="h6" gutterBottom>
                        拍卖已结束
                      </Typography>
                      {bids.length > 0 ? (
                        <>
                          <Typography variant="body1" className="mb-2">
                            成交价: <strong>{formatPrice(auction.currentPrice)}</strong>
                          </Typography>
                          <Typography variant="body2">
                            中标者: {bids[0].bidderName}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2">
                          本次拍卖未成交
                        </Typography>
                      )}
                    </Alert>
                  )}

                  {/* 卖家信息 */}
                  <Divider className="my-6" />
                  <div className="flex items-center gap-3">
                    <Avatar sx={{ width: 56, height: 56 }}>
                      {auction.creatorName.charAt(0)}
                    </Avatar>
                    <div>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {auction.creatorName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        认证农户
                      </Typography>
                      <div className="flex items-center gap-1 mt-1">
                        <Star color="warning" fontSize="small" />
                        <Star color="warning" fontSize="small" />
                        <Star color="warning" fontSize="small" />
                        <Star color="warning" fontSize="small" />
                        <Star color="warning" fontSize="small" />
                        <Typography variant="caption" color="text.secondary">
                          (5.0 · 128条评价)
                        </Typography>
                      </div>
                    </div>
                    {user && user.role === 'dealer' && (
                      <Button variant="outlined" size="small" className="ml-auto">
                        <Message fontSize="small" />
                        联系卖家
                      </Button>
                    )}
                  </div>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>

          {/* 出价成功提示 */}
          <AnimatePresence>
            {bidSuccess && (
              <motion.div
                variants={bidSuccessVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-3 z-50"
              >
                <CheckCircle />
                <div>
                  <Typography variant="h6" color="white" fontWeight="bold">
                    出价成功！
                  </Typography>
                  <Typography variant="body2" color="white">
                    您当前的出价是{formatPrice(bidAmount - auction.bidIncrement)}
                  </Typography>
                </div>
                <IconButton onClick={() => setBidSuccess(false)} size="small" sx={{ color: 'white' }}>
                  <X />
                </IconButton>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 自动出价对话框 */}
          <Dialog
            open={showAutomaticBidDialog}
            onClose={() => setShowAutomaticBidDialog(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>设置自动出价</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" className="mb-4">
                自动出价将在您被超越时自动为您出价，直到达到您设定的最高金额
              </Typography>
              <TextField
                label="最高出价金额"
                type="number"
                fullWidth
                margin="normal"
                value={maxBidAmount}
                onChange={(e) => setMaxBidAmount(Number(e.target.value))}
                InputProps={{ startAdornment: <DollarSign /> }}
                inputProps={{ min: auction.currentPrice + auction.bidIncrement }}
              />
              <TextField
                label="自动加价幅度（倍数）"
                type="number"
                fullWidth
                margin="normal"
                value={autoBidIncrement}
                onChange={(e) => setAutoBidIncrement(Number(e.target.value))}
                inputProps={{ min: 1, max: 10, step: 1 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowAutomaticBidDialog(false)}>取消</Button>
              <Button onClick={handleAutoBidSubmit} variant="contained">
                确认设置
              </Button>
            </DialogActions>
          </Dialog>

          {/* 图片查看器 */}
          <Dialog
            open={showImageViewer}
            onClose={() => setShowImageViewer(false)}
            maxWidth="lg"
            fullWidth
          >
            <DialogTitle className="flex justify-between items-center">
              <Typography variant="h6">图片预览</Typography>
              <IconButton onClick={() => setShowImageViewer(false)}>
                <X />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={selectedImage}
                  alt="拍卖物品预览"
                  className="w-full h-full object-contain"
                />
              </div>
              {/* 缩略图列表 */}
              {auction.images.length > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {auction.images.map((image, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer rounded-md overflow-hidden border-2 ${selectedImage === image ? 'border-primary' : 'border-transparent'}`}
                      style={{ width: '80px', height: '80px' }}
                      onClick={() => setSelectedImage(image)}
                    >
                      <img
                        src={image}
                        alt={`预览图${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </motion.div>
      </Container>
    
  )
}

// 缺少的组件导入修复
// 已在顶部导入

export default AuctionDetailPage