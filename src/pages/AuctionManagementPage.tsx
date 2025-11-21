import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  Search,
  ChevronLeft,
  Edit,
  Delete,
  Plus,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  Download,
  Share2
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuction } from '../contexts/AuctionContext'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'

interface AuctionItem {
  id: string
  title: string
  grainType: string
  quantity: number
  startingPrice: number
  currentPrice: number
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  startTime: string
  endTime: string
  location: string
  imageUrl: string
  bidCount: number
}

const AuctionManagementPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getMyAuctions, cancelAuction } = useAuction()
  
  const [auctions, setAuctions] = useState<AuctionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedAuction, setSelectedAuction] = useState<AuctionItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // 检查用户权限
  useEffect(() => {
    if (!user || user.role !== 'farmer') {
      toast.error('只有农户可以查看拍卖管理')
      navigate('/auctions')
    }
  }, [user, navigate])

  // 加载我的拍卖列表
  const loadAuctions = async () => {
    try {
      setLoading(true)
      const data = await getMyAuctions()
      setAuctions(data)
    } catch (error) {
      console.error('加载拍卖列表失败', error)
      toast.error('加载拍卖列表失败')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadAuctions()
  }, [])

  // 刷新列表
  const handleRefresh = () => {
    setRefreshing(true)
    loadAuctions()
  }

  // 过滤拍卖列表
  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         auction.grainType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         auction.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || auction.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // 获取状态样式
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'primary', label: '待审核', icon: <Clock fontSize="small" /> }
      case 'active':
        return { color: 'success', label: '进行中', icon: <CheckCircle fontSize="small" /> }
      case 'completed':
        return { color: 'default', label: '已完成', icon: <Info fontSize="small" /> }
      case 'cancelled':
        return { color: 'error', label: '已取消', icon: <AlertCircle fontSize="small" /> }
      default:
        return { color: 'default', label: '未知状态', icon: <Info fontSize="small" /> }
    }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // 打开删除确认对话框
  const handleOpenDeleteDialog = (auction: AuctionItem) => {
    setSelectedAuction(auction)
    setOpenDeleteDialog(true)
  }

  // 关闭删除确认对话框
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false)
    setSelectedAuction(null)
  }

  // 确认删除（取消）拍卖
  const handleConfirmDelete = async () => {
    if (!selectedAuction) return
    
    try {
      setDeleting(true)
      await cancelAuction(selectedAuction.id)
      toast.success('拍卖已取消')
      handleCloseDeleteDialog()
      loadAuctions() // 重新加载列表
    } catch (error) {
      console.error('取消拍卖失败', error)
      toast.error('取消拍卖失败，请稍后重试')
    } finally {
      setDeleting(false)
    }
  }

  // 导航到拍卖详情
  const handleViewDetails = (auctionId: string) => {
    navigate(`/auction/${auctionId}`)
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

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 返回按钮 */}
        <motion.div variants={itemVariants} className="mb-6">
          <Button
            variant="text"
            onClick={() => navigate('/auctions')}
            startIcon={<ChevronLeft />}
            sx={{ textTransform: 'none' }}
          >
            返回拍卖列表
          </Button>
        </motion.div>

        {/* 页面标题 */}
        <motion.div variants={itemVariants} className="mb-8">
          <Typography variant="h4" component="h1" fontWeight="bold" className="mb-2">
            我的拍卖管理
          </Typography>
          <Typography variant="body1" color="text.secondary">
            查看和管理您创建的所有拍卖项目
          </Typography>
        </motion.div>

        {/* 操作栏 */}
        <motion.div variants={itemVariants} className="mb-6">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h6">拍卖列表</Typography>
            <Button
              variant="contained"
              startIcon={<Create />}
              onClick={() => navigate('/auction/create')}
            >
              创建新拍卖
            </Button>
          </Box>

          <Paper elevation={1} className="p-4">
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {/* 搜索框 */}
              <Box sx={{ flexGrow: 1, minWidth: 200 }}>
                <TextField
                  fullWidth
                  placeholder="搜索拍卖标题、粮食类型或产地"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search color="action" />
                  }}
                />
              </Box>

              {/* 状态筛选 */}
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>状态</InputLabel>
                <Select
                  label="状态"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  startAdornment={<FilterList color="action" />}
                >
                  <MenuItem value="all">全部状态</MenuItem>
                  <MenuItem value="pending">待审核</MenuItem>
                  <MenuItem value="active">进行中</MenuItem>
                  <MenuItem value="completed">已完成</MenuItem>
                  <MenuItem value="cancelled">已取消</MenuItem>
                </Select>
              </FormControl>

              {/* 刷新按钮 */}
              <Tooltip title="刷新列表">
                <IconButton onClick={handleRefresh} disabled={refreshing}>
                  {refreshing ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Refresh />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        </motion.div>

        {/* 拍卖列表 */}
        <motion.div variants={itemVariants}>
          <Paper elevation={2}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress size={40} />
              </Box>
            ) : filteredAuctions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 12 }}>
                <Alert severity="info" icon={<Info />}>
                  暂无符合条件的拍卖项目
                </Alert>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/auction/create')}
                  className="mt-4"
                >
                  创建第一个拍卖
                </Button>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'background.default' }}>
                      <TableCell>拍卖标题</TableCell>
                      <TableCell>粮食类型</TableCell>
                      <TableCell>数量 (吨)</TableCell>
                      <TableCell>起拍价 (元/吨)</TableCell>
                      <TableCell>当前价 (元/吨)</TableCell>
                      <TableCell>状态</TableCell>
                      <TableCell>开始时间</TableCell>
                      <TableCell>结束时间</TableCell>
                      <TableCell>出价次数</TableCell>
                      <TableCell>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAuctions.map((auction) => {
                      const statusStyles = getStatusStyles(auction.status)
                      return (
                        <TableRow key={auction.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {auction.imageUrl && (
                                <img
                                  src={auction.imageUrl}
                                  alt={auction.title}
                                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                                />
                              )}
                              <Typography fontWeight="medium">
                                {auction.title}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{auction.grainType}</TableCell>
                          <TableCell>{auction.quantity.toFixed(1)}</TableCell>
                          <TableCell>{auction.startingPrice.toLocaleString()}</TableCell>
                          <TableCell>
                            <Typography fontWeight="bold" color="primary">
                              {auction.currentPrice.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={statusStyles.icon}
                              label={statusStyles.label}
                              color={statusStyles.color as any}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{formatDate(auction.startTime)}</TableCell>
                          <TableCell>{formatDate(auction.endTime)}</TableCell>
                          <TableCell>{auction.bidCount}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="查看详情">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewDetails(auction.id)}
                                >
                                  <Info />
                                </IconButton>
                              </Tooltip>
                              
                              {(auction.status === 'pending' || auction.status === 'active') && (
                                <Tooltip title="取消拍卖">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleOpenDeleteDialog(auction)}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              {auction.status === 'completed' && (
                                <>
                                  <Tooltip title="下载成交报告">
                                    <IconButton size="small">
                                    <Download />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="分享">
                                    <IconButton size="small">
                                    <Share2 />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </motion.div>
      </motion.div>

      {/* 删除确认对话框 */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main' }}>确认取消拍卖</DialogTitle>
        <DialogContent>
          <Alert severity="warning" className="mb-4">
            您确定要取消这个拍卖吗？此操作无法撤销。
          </Alert>
          {selectedAuction && (
            <Box>
              <Typography variant="subtitle1">拍卖信息：</Typography>
              <Typography>{selectedAuction.title}</Typography>
              <Typography color="text.secondary">
                粮食类型：{selectedAuction.grainType} | 数量：{selectedAuction.quantity}吨
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleting}>
            取消
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={20} /> : '确认取消'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default AuctionManagementPage