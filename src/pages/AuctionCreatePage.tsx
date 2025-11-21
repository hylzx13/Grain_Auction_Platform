import React, { useState, useEffect } from 'react'
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Upload
} from '@mui/material'
import {
  Upload as UploadIcon,
  Image as ImageIcon,
  Delete,
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Info,
  CheckCircle,
  AlertCircle,
  Save
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
// 移除对已删除上下文的引用
// 移除未使用的toast导入

interface AuctionFormData {
  title: string
  description: string
  grainType: string
  quantity: number
  startingPrice: number
  bidIncrement: number
  startTime: string
  endTime: string
  location: string
  qualityDetails: {
    moisture: number
    impurity: number
    purity: number
    protein: number
    storageTime: number
  }
  inspectionReportId: string
  remoteSensingDataId: string
}

const AuctionCreatePage: React.FC = () => {
  const navigate = useNavigate()
  
  // 模拟当前用户
  const user = {
    id: 'user1',
    username: 'testuser',
    role: 'farmer'
  };
  
  // 模拟拍卖创建功能
  const createAuction = async (auctionData: AuctionFormData) => {
    console.log('创建拍卖:', auctionData);
    return { success: true, auctionId: 'auction-' + Date.now() };
  };
  
  // 模拟获取认证信息
  const getCertifications = async () => {
    console.log('获取认证信息');
    return [];
  };
  
  const [formData, setFormData] = useState<AuctionFormData>({
    title: '',
    description: '',
    grainType: '',
    quantity: 0,
    startingPrice: 0,
    bidIncrement: 0,
    startTime: new Date().toISOString().split('T')[0],
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    location: '',
    qualityDetails: {
      moisture: 0,
      impurity: 0,
      purity: 0,
      protein: 0,
      storageTime: 0
    },
    inspectionReportId: '',
    remoteSensingDataId: ''
  })
  
  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [certifications, setCertifications] = useState<any[]>([])
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // 检查用户权限
  useEffect(() => {
    if (!user || user.role !== 'farmer') {
      navigate('/auctions')
    }
  }, [user, navigate])

  // 加载认证信息
  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const certs = await getCertifications()
        setCertifications(certs)
      } catch (error) {
        console.error('加载认证信息失败', error)
      }
    }
    
    fetchCertifications()
  }, [getCertifications])

  // 处理表单输入变化
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // 处理质量详情变化
  const handleQualityChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      qualityDetails: {
        ...prev.qualityDetails,
        [field]: value
      }
    }))
  }

  // 处理图片上传
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newImages = Array.from(files)
      if (images.length + newImages.length > 10) {
        // 最多只能上传10张图片
        return
      }
      
      setImages(prev => [...prev, ...newImages])
      
      // 生成预览URL
      newImages.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewUrls(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  // 删除图片
  const handleDeleteImage = (index: number) => {
    const newImages = [...images]
    const newPreviewUrls = [...previewUrls]
    newImages.splice(index, 1)
    newPreviewUrls.splice(index, 1)
    setImages(newImages)
    setPreviewUrls(newPreviewUrls)
  }

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}
    
    // 基本信息验证
    if (!formData.title.trim()) {
      newErrors.title = '请输入拍卖标题'
    }
    if (!formData.description.trim()) {
      newErrors.description = '请输入拍卖描述'
    }
    if (!formData.grainType) {
      newErrors.grainType = '请选择粮食类型'
    }
    if (formData.quantity <= 0) {
      newErrors.quantity = '请输入有效的数量'
    }
    if (formData.startingPrice <= 0) {
      newErrors.startingPrice = '请输入有效的起拍价'
    }
    if (formData.bidIncrement <= 0) {
      newErrors.bidIncrement = '请输入有效的加价幅度'
    }
    if (!formData.location.trim()) {
      newErrors.location = '请输入产地'
    }
    
    // 时间验证
    const startDate = new Date(formData.startTime)
    const endDate = new Date(formData.endTime)
    if (startDate < new Date()) {
      newErrors.startTime = '开始时间不能早于当前时间'
    }
    if (endDate <= startDate) {
      newErrors.endTime = '结束时间必须晚于开始时间'
    }
    
    // 质量信息验证
    if (formData.qualityDetails.moisture < 0 || formData.qualityDetails.moisture > 100) {
      newErrors.moisture = '水分含量必须在0-100之间'
    }
    if (formData.qualityDetails.impurity < 0 || formData.qualityDetails.impurity > 100) {
      newErrors.impurity = '杂质率必须在0-100之间'
    }
    if (formData.qualityDetails.purity < 0 || formData.qualityDetails.purity > 100) {
      newErrors.purity = '品种纯度必须在0-100之间'
    }
    if (formData.qualityDetails.protein < 0 || formData.qualityDetails.protein > 100) {
      newErrors.protein = '蛋白质含量必须在0-100之间'
    }
    
    // 图片验证
    if (images.length === 0) {
      newErrors.images = '请至少上传一张图片'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 提交表单
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!validateForm()) {
      // 请检查表单填写是否正确
      return
    }
    
    try {
      setIsSubmitting(true)
      
      // 在实际应用中，这里应该先上传图片
      // const uploadedImages = await uploadImages(images)
      
      const auctionData = {
        ...formData,
        // imageUrls: uploadedImages.map(img => img.url),
        imageUrl: previewUrls[0], // 使用第一张图片作为主图
        images: previewUrls, // 所有预览URL
        status: 'pending' as const
      }
      
      await createAuction(auctionData)
      // 拍卖创建成功，正在等待审核
      navigate('/auctions')
    } catch (error) {
      console.error('创建拍卖失败', error)
    } finally {
      setIsSubmitting(false)
    }
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
            创建新拍卖
          </Typography>
          <Typography variant="body1" color="text.secondary">
            填写以下信息来创建新的粮食拍卖项目
          </Typography>
        </motion.div>

        {/* 表单 */}
        <motion.div variants={itemVariants}>
          <Paper elevation={2} className="p-6">
            <form onSubmit={handleSubmit}>
              {/* 基本信息 */}
              <div className="mb-8">
                <Typography variant="h5" fontWeight="bold" className="mb-4 flex items-center gap-2">
                  <Info color="primary" />
                  基本信息
                </Typography>
                
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <TextField
                      label="拍卖标题"
                      fullWidth
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      error={!!errors.title}
                      helperText={errors.title}
                      placeholder="例如：东北优质大米 一等品 20吨"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.grainType}>
                      <InputLabel>粮食类型</InputLabel>
                      <Select
                        label="粮食类型"
                        value={formData.grainType}
                        onChange={(e) => handleInputChange('grainType', e.target.value)}
                      >
                        <MenuItem value="">请选择粮食类型</MenuItem>
                        <MenuItem value="大米">大米</MenuItem>
                        <MenuItem value="小麦">小麦</MenuItem>
                        <MenuItem value="玉米">玉米</MenuItem>
                        <MenuItem value="大豆">大豆</MenuItem>
                        <MenuItem value="高粱">高粱</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="数量 (吨)"
                      type="number"
                      fullWidth
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
                      error={!!errors.quantity}
                      helperText={errors.quantity}
                      inputProps={{ min: 0.1, step: 0.1 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="产地"
                      fullWidth
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      error={!!errors.location}
                      helperText={errors.location}
                      placeholder="例如：黑龙江省五常市"
                      InputProps={{
                        startAdornment: <MapPin color="action" />
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="详细描述"
                      fullWidth
                      multiline
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      error={!!errors.description}
                      helperText={errors.description}
                      placeholder="请详细描述您的粮食品质、种植环境、收获时间等信息..."
                    />
                  </Grid>
                </Grid>
              </div>

              <Divider className="my-8" />

              {/* 价格设置 */}
              <div className="mb-8">
                <Typography variant="h5" fontWeight="bold" className="mb-4 flex items-center gap-2">
                  <DollarSign color="primary" />
                  价格设置
                </Typography>
                
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="起拍价格 (元/吨)"
                      type="number"
                      fullWidth
                      value={formData.startingPrice}
                      onChange={(e) => handleInputChange('startingPrice', Number(e.target.value))}
                      error={!!errors.startingPrice}
                      helperText={errors.startingPrice}
                      InputProps={{
                        startAdornment: <span style={{ paddingRight: 8 }}>¥</span>
                      }}
                      inputProps={{ min: 0, step: 10 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="加价幅度 (元/吨)"
                      type="number"
                      fullWidth
                      value={formData.bidIncrement}
                      onChange={(e) => handleInputChange('bidIncrement', Number(e.target.value))}
                      error={!!errors.bidIncrement}
                      helperText={errors.bidIncrement}
                      InputProps={{
                        startAdornment: <span style={{ paddingRight: 8 }}>¥</span>
                      }}
                      inputProps={{ min: 1, step: 5 }}
                    />
                  </Grid>
                </Grid>
              </div>

              <Divider className="my-8" />

              {/* 时间设置 */}
              <div className="mb-8">
                <Typography variant="h5" fontWeight="bold" className="mb-4 flex items-center gap-2">
                  <CalendarToday color="primary" />
                  时间设置
                </Typography>
                
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="开始日期"
                      type="date"
                      fullWidth
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      error={!!errors.startTime}
                      helperText={errors.startTime}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="结束日期"
                      type="date"
                      fullWidth
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      error={!!errors.endTime}
                      helperText={errors.endTime}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </div>

              <Divider className="my-8" />

              {/* 质量信息 */}
              <div className="mb-8">
                <Typography variant="h5" fontWeight="bold" className="mb-4 flex items-center gap-2">
                  <Award color="primary" />
                  质量信息
                </Typography>
                
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="水分含量 (%)"
                      type="number"
                      fullWidth
                      value={formData.qualityDetails.moisture}
                      onChange={(e) => handleQualityChange('moisture', Number(e.target.value))}
                      error={!!errors.moisture}
                      helperText={errors.moisture || '建议低于15%'}
                      inputProps={{ min: 0, max: 100, step: 0.1 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="杂质率 (%)"
                      type="number"
                      fullWidth
                      value={formData.qualityDetails.impurity}
                      onChange={(e) => handleQualityChange('impurity', Number(e.target.value))}
                      error={!!errors.impurity}
                      helperText={errors.impurity || '建议低于2%'}
                      inputProps={{ min: 0, max: 100, step: 0.01 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="品种纯度 (%)"
                      type="number"
                      fullWidth
                      value={formData.qualityDetails.purity}
                      onChange={(e) => handleQualityChange('purity', Number(e.target.value))}
                      error={!!errors.purity}
                      helperText={errors.purity || '建议高于95%'}
                      inputProps={{ min: 0, max: 100, step: 0.1 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="蛋白质含量 (%)"
                      type="number"
                      fullWidth
                      value={formData.qualityDetails.protein}
                      onChange={(e) => handleQualityChange('protein', Number(e.target.value))}
                      error={!!errors.protein}
                      helperText={errors.protein || '建议高于10%'}
                      inputProps={{ min: 0, max: 100, step: 0.1 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="储存时间 (天)"
                      type="number"
                      fullWidth
                      value={formData.qualityDetails.storageTime}
                      onChange={(e) => handleQualityChange('storageTime', Number(e.target.value))}
                      helperText="从收获到现在的储存天数"
                      inputProps={{ min: 0, step: 1 }}
                    />
                  </Grid>
                </Grid>
              </div>

              <Divider className="my-8" />

              {/* 认证报告 */}
              <div className="mb-8">
                <Typography variant="h5" fontWeight="bold" className="mb-4 flex items-center gap-2">
                  <Shield color="primary" />
                  认证与报告
                </Typography>
                
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>质检报告</InputLabel>
                      <Select
                        label="质检报告"
                        value={formData.inspectionReportId}
                        onChange={(e) => handleInputChange('inspectionReportId', e.target.value)}
                      >
                        <MenuItem value="">请选择质检报告</MenuItem>
                        {certifications
                          .filter(cert => cert.type === 'inspection_report')
                          .map(cert => (
                            <MenuItem key={cert.id} value={cert.id}>
                              {cert.name} - {cert.date}
                            </MenuItem>
                          ))
                        }
                      </Select>
                      <Typography variant="caption" color="text.secondary" className="mt-1 block">
                        如果没有可用的质检报告，请先上传
                      </Typography>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>遥感数据分析</InputLabel>
                      <Select
                        label="遥感数据分析"
                        value={formData.remoteSensingDataId}
                        onChange={(e) => handleInputChange('remoteSensingDataId', e.target.value)}
                      >
                        <MenuItem value="">请选择遥感数据</MenuItem>
                        {certifications
                          .filter(cert => cert.type === 'remote_sensing')
                          .map(cert => (
                            <MenuItem key={cert.id} value={cert.id}>
                              {cert.name} - {cert.date}
                            </MenuItem>
                          ))
                        }
                      </Select>
                      <Typography variant="caption" color="text.secondary" className="mt-1 block">
                        如果没有可用的遥感数据，请先上传
                      </Typography>
                    </FormControl>
                  </Grid>
                </Grid>
              </div>

              <Divider className="my-8" />

              {/* 图片上传 */}
              <div className="mb-8">
                <Typography variant="h5" fontWeight="bold" className="mb-4 flex items-center gap-2">
                  <ImageIcon color="primary" />
                  图片上传
                </Typography>
                
                <div className="mb-4">
                  <Typography variant="body2" color="text.secondary" className="mb-2">
                    请上传清晰的粮食图片，第一张将作为封面图（最多10张）
                  </Typography>
                  {errors.images && (
                    <Typography variant="caption" color="error">
                      {errors.images}
                    </Typography>
                  )}
                </div>
                
                {/* 图片预览 */}
                {previewUrls.length > 0 && (
                  <Grid container spacing={2} className="mb-4">
                    {previewUrls.map((url, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <div className="relative">
                          <img
                            src={url}
                            alt={`预览图${index + 1}`}
                            className="w-full h-40 object-cover rounded-md"
                          />
                          <IconButton
                            className="absolute top-1 right-1 bg-black/50 text-white"
                            onClick={() => handleDeleteImage(index)}
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </div>
                      </Grid>
                    ))}
                  </Grid>
                )}
                
                {/* 上传按钮 */}
                {images.length < 10 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50">
                    <input
                      type="file"
                      id="image-upload"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <UploadIcon color="primary" fontSize="large" className="mb-2" />
                      <Typography variant="h6">点击上传图片</Typography>
                      <Typography variant="body2" color="text.secondary">
                        支持JPG、PNG格式，单张不超过10MB
                      </Typography>
                    </label>
                  </div>
                )}
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-center gap-4">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate('/auctions')}
                  disabled={isSubmitting}
                  sx={{ minWidth: 120 }}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
                  disabled={isSubmitting}
                  sx={{ minWidth: 150, py: 1.5 }}
                >
                  {isSubmitting ? '提交中...' : '创建拍卖'}
                </Button>
              </div>
            </form>
          </Paper>
        </motion.div>
      </motion.div>
    </Container>
  )
}

// 缺少的组件导入
import { Award, Shield, DollarSign } from '@mui/icons-material'

export default AuctionCreatePage
