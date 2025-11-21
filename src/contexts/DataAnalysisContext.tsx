import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from './AuthContext'
import { GrainItem } from './AuctionContext'
import { GrainProduct } from './ProductContext'

// 交易历史记录接口
export interface TransactionHistory {
  id: string
  auctionId: string
  productId: string
  productName: string
  variety: string
  origin: string
  transactionPrice: number
  quantity: number
  totalAmount: number
  buyerId: string
  buyerName: string
  sellerId: string
  sellerName: string
  transactionDate: string
  qualityScore: number
  marketIndex: number
}

// 价格预测结果接口
export interface PricePredictionResult {
  predictedPrice: number
  confidence: number
  historicalRange: {
    min: number
    max: number
    average: number
  }
  factors: {
    factorName: string
    weight: number
    impact: 'positive' | 'negative' | 'neutral'
  }[]
  recommendedStartingPrice: number
  recommendedBidRange: {
    min: number
    max: number
  }
  timestamp: string
}

// 市场趋势数据接口
export interface MarketTrendData {
  date: string
  averagePrice: number
  transactionVolume: number
  activeAuctions: number
  popularVarieties: {
    variety: string
    percentage: number
  }[]
}

// 分析报告接口
export interface AnalysisReport {
  id: string
  reportType: 'weekly' | 'monthly' | 'quarterly' | 'custom'
  title: string
  period: {
    startDate: string
    endDate: string
  }
  summary: string
  keyInsights: string[]
  dataVisualization: {
    type: 'lineChart' | 'barChart' | 'pieChart' | 'scatterPlot'
    title: string
    data: any
    description: string
  }[]
  recommendations: string[]
  generatedBy: string
  generatedAt: string
  isPublic: boolean
}

// 溢价分析接口
export interface PremiumAnalysis {
  variety: string
  origin: string
  avgBasePrice: number
  avgTransactionPrice: number
  premiumRate: number
  premiumTrend: 'increasing' | 'stable' | 'decreasing'
  keyContributingFactors: string[]
  sampleSize: number
  timePeriod: string
}

// 数据分析上下文接口
interface DataAnalysisContextType {
  transactionHistory: TransactionHistory[]
  pricePredictions: Map<string, PricePredictionResult>
  marketTrends: MarketTrendData[]
  analysisReports: AnalysisReport[]
  premiumAnalysis: PremiumAnalysis[]
  isLoading: boolean
  error: string | null
  
  // 获取交易历史
  fetchTransactionHistory: (filters?: {
    startDate?: string
    endDate?: string
    variety?: string
    origin?: string
    minPrice?: number
    maxPrice?: number
  }) => Promise<void>
  
  // 获取价格预测
  getPricePrediction: (productData: {
    variety: string
    origin: string
    qualityData: {
      moisture: number
      impurity: number
      purity: number
      protein: number
      storageTime: number
    }
    quantity: number
    season?: string
  }) => Promise<PricePredictionResult>
  
  // 获取市场趋势
  fetchMarketTrends: (period: 'week' | 'month' | 'quarter' | 'year') => Promise<void>
  
  // 获取分析报告
  fetchAnalysisReports: (reportType?: 'weekly' | 'monthly' | 'quarterly' | 'custom') => Promise<void>
  
  // 获取溢价分析
  fetchPremiumAnalysis: () => Promise<void>
  
  // 生成自定义报告
  generateCustomReport: (params: {
    startDate: string
    endDate: string
    focusAreas: string[]
    includeVisualizations: boolean
  }) => Promise<AnalysisReport>
  
  // 导出数据分析结果
  exportData: (dataType: 'transactions' | 'predictions' | 'trends' | 'reports', format: 'csv' | 'excel' | 'pdf') => Promise<string>
  
  // 获取商品推荐（基于历史数据）
  getProductRecommendations: (userId: string, limit?: number) => Promise<GrainProduct[]>
  
  // 监控市场异常
  detectMarketAnomalies: () => Promise<any[]>
}

// 创建上下文
const DataAnalysisContext = createContext<DataAnalysisContextType | undefined>(undefined)

// 模拟交易历史数据
const mockTransactionHistory: TransactionHistory[] = [
  {
    id: 'tx1',
    auctionId: 'auction1',
    productId: 'product1',
    productName: '五常长粒香大米',
    variety: '长粒香',
    origin: '黑龙江五常',
    transactionPrice: 6.8,
    quantity: 5000,
    totalAmount: 34000,
    buyerId: 'buyer1',
    buyerName: '粮油贸易公司',
    sellerId: 'seller1',
    sellerName: '五常优质农场',
    transactionDate: '2024-03-15T10:30:00Z',
    qualityScore: 98.5,
    marketIndex: 105.2
  },
  {
    id: 'tx2',
    auctionId: 'auction2',
    productId: 'product2',
    productName: '舒兰稻花香大米',
    variety: '稻花香',
    origin: '吉林舒兰',
    transactionPrice: 7.5,
    quantity: 3000,
    totalAmount: 22500,
    buyerId: 'buyer2',
    buyerName: '高端超市连锁',
    sellerId: 'seller2',
    sellerName: '舒兰有机农场',
    transactionDate: '2024-03-12T14:20:00Z',
    qualityScore: 99.2,
    marketIndex: 108.7
  },
  {
    id: 'tx3',
    auctionId: 'auction3',
    productId: 'product3',
    productName: '盘锦蟹田大米',
    variety: '蟹田大米',
    origin: '辽宁盘锦',
    transactionPrice: 6.2,
    quantity: 4000,
    totalAmount: 24800,
    buyerId: 'buyer3',
    buyerName: '餐饮连锁集团',
    sellerId: 'seller3',
    sellerName: '盘锦生态农业合作社',
    transactionDate: '2024-03-10T09:15:00Z',
    qualityScore: 97.8,
    marketIndex: 103.5
  },
  {
    id: 'tx4',
    auctionId: 'auction4',
    productId: 'product1',
    productName: '五常长粒香大米',
    variety: '长粒香',
    origin: '黑龙江五常',
    transactionPrice: 6.9,
    quantity: 2500,
    totalAmount: 17250,
    buyerId: 'buyer4',
    buyerName: '食品加工企业',
    sellerId: 'seller1',
    sellerName: '五常优质农场',
    transactionDate: '2024-03-08T16:45:00Z',
    qualityScore: 98.3,
    marketIndex: 104.8
  },
  {
    id: 'tx5',
    auctionId: 'auction5',
    productId: 'product2',
    productName: '舒兰稻花香大米',
    variety: '稻花香',
    origin: '吉林舒兰',
    transactionPrice: 7.8,
    quantity: 1500,
    totalAmount: 11700,
    buyerId: 'buyer5',
    buyerName: '健康食品公司',
    sellerId: 'seller2',
    sellerName: '舒兰有机农场',
    transactionDate: '2024-03-05T11:20:00Z',
    qualityScore: 99.5,
    marketIndex: 110.2
  }
]

// 模拟市场趋势数据
const mockMarketTrends: MarketTrendData[] = [
  {
    date: '2024-03-01',
    averagePrice: 6.4,
    transactionVolume: 15000,
    activeAuctions: 25,
    popularVarieties: [
      { variety: '长粒香', percentage: 45 },
      { variety: '稻花香', percentage: 30 },
      { variety: '蟹田大米', percentage: 25 }
    ]
  },
  {
    date: '2024-03-08',
    averagePrice: 6.6,
    transactionVolume: 18000,
    activeAuctions: 28,
    popularVarieties: [
      { variety: '长粒香', percentage: 42 },
      { variety: '稻花香', percentage: 33 },
      { variety: '蟹田大米', percentage: 25 }
    ]
  },
  {
    date: '2024-03-15',
    averagePrice: 6.9,
    transactionVolume: 22000,
    activeAuctions: 32,
    popularVarieties: [
      { variety: '长粒香', percentage: 40 },
      { variety: '稻花香', percentage: 35 },
      { variety: '蟹田大米', percentage: 25 }
    ]
  },
  {
    date: '2024-03-22',
    averagePrice: 7.1,
    transactionVolume: 25000,
    activeAuctions: 35,
    popularVarieties: [
      { variety: '长粒香', percentage: 38 },
      { variety: '稻花香', percentage: 37 },
      { variety: '蟹田大米', percentage: 25 }
    ]
  }
]

// 模拟分析报告数据
const mockAnalysisReports: AnalysisReport[] = [
  {
    id: 'report1',
    reportType: 'weekly',
    title: '2024年第12周市场分析报告',
    period: {
      startDate: '2024-03-11',
      endDate: '2024-03-17'
    },
    summary: '本周东北大米市场价格呈现上涨趋势，平均涨幅2.5%。稻花香品种需求增加，溢价率达到15%。',
    keyInsights: [
      '有机认证大米价格持续攀升，市场需求旺盛',
      '黑龙江产区大米质量评分领先全国',
      '大型连锁企业采购量增加，推动价格上涨',
      '新一季稻米即将上市，市场预期乐观'
    ],
    dataVisualization: [
      {
        type: 'lineChart',
        title: '大米价格趋势（近4周）',
        data: {
          dates: ['2024-02-19', '2024-02-26', '2024-03-04', '2024-03-11'],
          prices: [6.2, 6.5, 6.8, 7.1]
        },
        description: '显示了近4周大米平均价格的变化趋势，呈稳步上升态势'
      },
      {
        type: 'pieChart',
        title: '各品种市场份额',
        data: {
          labels: ['长粒香', '稻花香', '蟹田大米', '其他'],
          values: [40, 35, 20, 5]
        },
        description: '展示了当前市场各主要大米品种的市场份额分布'
      }
    ],
    recommendations: [
      '建议农户抓住当前价格上涨时机，合理安排销售计划',
      '经销商可考虑增加稻花香品种的采购比例',
      '关注天气变化对新一季稻米生长的潜在影响',
      '加强品质管理，提高产品竞争力'
    ],
    generatedBy: 'system',
    generatedAt: '2024-03-18T08:00:00Z',
    isPublic: true
  }
]

// 模拟溢价分析数据
const mockPremiumAnalysis: PremiumAnalysis[] = [
  {
    variety: '长粒香',
    origin: '黑龙江五常',
    avgBasePrice: 6.2,
    avgTransactionPrice: 6.9,
    premiumRate: 11.3,
    premiumTrend: 'increasing',
    keyContributingFactors: ['地理标志认证', '品质稳定', '品牌溢价'],
    sampleSize: 156,
    timePeriod: '近3个月'
  },
  {
    variety: '稻花香',
    origin: '吉林舒兰',
    avgBasePrice: 7.0,
    avgTransactionPrice: 7.8,
    premiumRate: 11.4,
    premiumTrend: 'increasing',
    keyContributingFactors: ['有机认证', '口感独特', '市场需求增加'],
    sampleSize: 98,
    timePeriod: '近3个月'
  },
  {
    variety: '蟹田大米',
    origin: '辽宁盘锦',
    avgBasePrice: 5.8,
    avgTransactionPrice: 6.3,
    premiumRate: 8.6,
    premiumTrend: 'stable',
    keyContributingFactors: ['生态种植', '营养丰富'],
    sampleSize: 75,
    timePeriod: '近3个月'
  }
]

interface DataAnalysisProviderProps {
  children: ReactNode
}

export const DataAnalysisProvider: React.FC<DataAnalysisProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory[]>([])
  const [pricePredictions] = useState<Map<string, PricePredictionResult>>(new Map())
  const [marketTrends, setMarketTrends] = useState<MarketTrendData[]>([])
  const [analysisReports, setAnalysisReports] = useState<AnalysisReport[]>([])
  const [premiumAnalysis, setPremiumAnalysis] = useState<PremiumAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取交易历史
  const fetchTransactionHistory = useCallback(async (filters?: {
    startDate?: string
    endDate?: string
    variety?: string
    origin?: string
    minPrice?: number
    maxPrice?: number
  }) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.get('/api/analysis/transactions', { params: filters })
      // setTransactionHistory(response.data)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 600))
      
      let filteredTransactions = [...mockTransactionHistory]
      
      // 应用过滤条件
      if (filters) {
        if (filters.startDate) {
          filteredTransactions = filteredTransactions.filter(tx => 
            new Date(tx.transactionDate) >= new Date(filters.startDate!)
          )
        }
        if (filters.endDate) {
          filteredTransactions = filteredTransactions.filter(tx => 
            new Date(tx.transactionDate) <= new Date(filters.endDate!)
          )
        }
        if (filters.variety) {
          filteredTransactions = filteredTransactions.filter(tx => 
            tx.variety.toLowerCase().includes(filters.variety!.toLowerCase())
          )
        }
        if (filters.origin) {
          filteredTransactions = filteredTransactions.filter(tx => 
            tx.origin.toLowerCase().includes(filters.origin!.toLowerCase())
          )
        }
        if (filters.minPrice !== undefined) {
          filteredTransactions = filteredTransactions.filter(tx => 
            tx.transactionPrice >= filters.minPrice!
          )
        }
        if (filters.maxPrice !== undefined) {
          filteredTransactions = filteredTransactions.filter(tx => 
            tx.transactionPrice <= filters.maxPrice!
          )
        }
      }
      
      // 按交易日期排序
      filteredTransactions.sort((a, b) => 
        new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
      )
      
      setTransactionHistory(filteredTransactions)
    } catch (err: any) {
      setError(err.message || '获取交易历史失败')
      toast.error('获取交易历史失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 获取价格预测 (使用模拟的XGBoost预测逻辑)
  const getPricePrediction = useCallback(async (productData: {
    variety: string
    origin: string
    qualityData: {
      moisture: number
      impurity: number
      purity: number
      protein: number
      storageTime: number
    }
    quantity: number
    season?: string
  }): Promise<PricePredictionResult> => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 实际环境中可能会调用机器学习服务或API
      // const response = await axios.post('/api/analysis/predict-price', productData)
      // return response.data
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 模拟XGBoost预测逻辑
      const { variety, origin, qualityData, quantity, season = 'spring' } = productData
      
      // 基础价格（基于品种和产地）
      let basePrice = 5.0
      if (variety.includes('稻花香')) basePrice += 1.5
      else if (variety.includes('长粒香')) basePrice += 1.0
      else if (variety.includes('蟹田')) basePrice += 0.8
      
      // 产地溢价
      if (origin.includes('五常')) basePrice += 0.5
      else if (origin.includes('舒兰')) basePrice += 0.4
      else if (origin.includes('盘锦')) basePrice += 0.3
      
      // 质量因子
      let qualityFactor = 0
      // 纯度越高，价格越高
      qualityFactor += (qualityData.purity - 99) * 0.2
      // 蛋白质含量影响
      qualityFactor += Math.max(0, (qualityData.protein - 7.5) * 0.3)
      // 水分含量越低越好
      qualityFactor += Math.max(0, (14 - qualityData.moisture) * 0.1)
      // 杂质率越低越好
      qualityFactor += Math.max(0, (1 - qualityData.impurity) * 0.2)
      // 储存时间越短越好
      qualityFactor -= Math.min(0.3, qualityData.storageTime / 100)
      
      // 数量因子（量大从优）
      let quantityFactor = 0
      if (quantity > 10000) quantityFactor -= 0.2
      else if (quantity > 5000) quantityFactor -= 0.1
      else if (quantity < 1000) quantityFactor += 0.1
      
      // 季节因子
      let seasonFactor = 0
      if (season === 'spring') seasonFactor += 0.2 // 春季价格略高
      else if (season === 'autumn') seasonFactor -= 0.1 // 新米上市，价格略低
      
      // 计算最终预测价格
      const predictedPrice = parseFloat((basePrice + qualityFactor + quantityFactor + seasonFactor).toFixed(2))
      
      // 计算置信度（基于数据完整性和历史准确性）
      let confidence = 0.85
      if (qualityData.purity < 98) confidence -= 0.05
      if (qualityData.moisture > 15) confidence -= 0.05
      
      // 生成预测结果
      const result: PricePredictionResult = {
        predictedPrice,
        confidence,
        historicalRange: {
          min: predictedPrice * 0.9,
          max: predictedPrice * 1.1,
          average: predictedPrice
        },
        factors: [
          { factorName: '品种', weight: 0.35, impact: variety.includes('稻花香') ? 'positive' : variety.includes('长粒香') ? 'positive' : 'neutral' },
          { factorName: '产地', weight: 0.25, impact: origin.includes('五常') ? 'positive' : origin.includes('舒兰') ? 'positive' : 'neutral' },
          { factorName: '纯度', weight: 0.15, impact: qualityData.purity >= 99.5 ? 'positive' : qualityData.purity < 98 ? 'negative' : 'neutral' },
          { factorName: '蛋白质含量', weight: 0.10, impact: qualityData.protein > 8 ? 'positive' : qualityData.protein < 7 ? 'negative' : 'neutral' },
          { factorName: '储存时间', weight: 0.08, impact: qualityData.storageTime < 15 ? 'positive' : qualityData.storageTime > 30 ? 'negative' : 'neutral' },
          { factorName: '交易量', weight: 0.07, impact: quantity > 5000 ? 'positive' : quantity < 1000 ? 'negative' : 'neutral' }
        ],
        recommendedStartingPrice: parseFloat((predictedPrice * 0.95).toFixed(2)),
        recommendedBidRange: {
          min: predictedPrice,
          max: predictedPrice * 1.1
        },
        timestamp: new Date().toISOString()
      }
      
      return result
    } catch (err: any) {
      setError(err.message || '价格预测失败')
      toast.error('价格预测失败，请重试')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 获取市场趋势
  const fetchMarketTrends = useCallback(async (period: 'week' | 'month' | 'quarter' | 'year') => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.get('/api/analysis/market-trends', { params: { period } })
      // setMarketTrends(response.data)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setMarketTrends(mockMarketTrends)
    } catch (err: any) {
      setError(err.message || '获取市场趋势失败')
      toast.error('获取市场趋势失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 获取分析报告
  const fetchAnalysisReports = useCallback(async (reportType?: 'weekly' | 'monthly' | 'quarterly' | 'custom') => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.get('/api/analysis/reports', { params: { reportType } })
      // setAnalysisReports(response.data)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 400))
      
      let filteredReports = [...mockAnalysisReports]
      if (reportType) {
        filteredReports = filteredReports.filter(report => report.reportType === reportType)
      }
      
      setAnalysisReports(filteredReports)
    } catch (err: any) {
      setError(err.message || '获取分析报告失败')
      toast.error('获取分析报告失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 获取溢价分析
  const fetchPremiumAnalysis = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.get('/api/analysis/premium-analysis')
      // setPremiumAnalysis(response.data)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 400))
      
      setPremiumAnalysis(mockPremiumAnalysis)
    } catch (err: any) {
      setError(err.message || '获取溢价分析失败')
      toast.error('获取溢价分析失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 生成自定义报告
  const generateCustomReport = useCallback(async (params: {
    startDate: string
    endDate: string
    focusAreas: string[]
    includeVisualizations: boolean
  }): Promise<AnalysisReport> => {
    try {
      if (!user) throw new Error('用户未登录')
      
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.post('/api/analysis/generate-report', params, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      // })
      // return response.data
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // 生成模拟报告
      const customReport: AnalysisReport = {
        id: `custom_${Date.now()}`,
        reportType: 'custom',
        title: `自定义分析报告 (${params.startDate} 至 ${params.endDate})`,
        period: {
          startDate: params.startDate,
          endDate: params.endDate
        },
        summary: `根据您的要求，生成了从 ${params.startDate} 到 ${params.endDate} 的自定义分析报告，重点关注${params.focusAreas.join('、')}等方面。`,
        keyInsights: [
          '市场整体呈现稳定增长态势',
          `${params.focusAreas[0]}方面表现突出，增长显著`,
          '消费者对高品质产品的需求持续增加',
          '建议关注市场动态变化，及时调整策略'
        ],
        dataVisualization: params.includeVisualizations ? [
          {
            type: 'lineChart',
            title: '价格走势分析',
            data: {
              dates: [params.startDate, new Date(new Date(params.startDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], params.endDate],
              prices: [6.5, 6.8, 7.2]
            },
            description: '展示了分析期间的价格变化趋势'
          }
        ] : [],
        recommendations: [
          '根据市场趋势，建议调整产品结构',
          '加强与重点客户的合作关系',
          '关注品质提升，增强产品竞争力',
          '定期分析市场数据，把握机遇'
        ],
        generatedBy: user.username,
        generatedAt: new Date().toISOString(),
        isPublic: false
      }
      
      // 添加到报告列表
      setAnalysisReports(prev => [customReport, ...prev])
      
      toast.success('自定义报告生成成功')
      return customReport
    } catch (err: any) {
      setError(err.message || '生成自定义报告失败')
      toast.error(err.message || '生成自定义报告失败，请重试')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // 导出数据分析结果
  const exportData = useCallback(async (dataType: 'transactions' | 'predictions' | 'trends' | 'reports', format: 'csv' | 'excel' | 'pdf'): Promise<string> => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.get('/api/analysis/export', {
      //   params: { dataType, format },
      //   responseType: 'blob'
      // })
      // return URL.createObjectURL(response.data)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟导出URL
      const mockUrl = `/exports/${dataType}_export_${Date.now()}.${format}`
      
      toast.success('数据导出成功')
      return mockUrl
    } catch (err: any) {
      setError(err.message || '导出数据失败')
      toast.error(err.message || '导出数据失败，请重试')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 获取商品推荐
  const getProductRecommendations = useCallback(async (userId: string, limit: number = 5): Promise<GrainProduct[]> => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.get('/api/analysis/recommendations', {
      //   params: { userId, limit }
      // })
      // return response.data
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 模拟推荐产品（这里简化处理，实际应该基于用户历史行为）
      const mockRecommendedProducts: GrainProduct[] = [
        {
          id: 'rec1',
          name: '推荐产品1',
          variety: '长粒香',
          origin: '黑龙江五常',
          description: '基于您的历史偏好推荐',
          images: ['/products/rec1.jpg'],
          specification: { packaging: '真空包装', weight: 5, unit: 'kg' },
          qualityIndicators: { moisture: 13.5, impurity: 0.5, purity: 99.8, protein: 7.8, storageTime: 15 },
          inspectionReport: {
            reportId: 'REC-QA-001',
            issueDate: '2024-03-01',
            authority: '质检中心',
            imageUrl: '/reports/rec-report.jpg',
            summary: '质量优良'
          },
          remoteSensingData: {
            imageUrl: '/remote-sensing/rec-field.jpg',
            analysisDate: '2024-09-01',
            plantingArea: 100,
            growthCondition: 'excellent',
            predictedYield: 6500
          },
          certification: { type: ['有机食品'], certificationNumber: 'REC-001', issueDate: '2024-01-01', expireDate: '2025-01-01' },
          averagePrice: 6.5,
          marketTrend: 'rising',
          isRecommended: true,
          status: 'approved',
          createdBy: 'farmer_rec',
          createdAt: '2024-03-01T00:00:00Z',
          updatedAt: '2024-03-01T00:00:00Z'
        }
      ]
      
      return mockRecommendedProducts.slice(0, limit)
    } catch (err: any) {
      setError(err.message || '获取推荐失败')
      toast.error('获取推荐失败，请重试')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 监控市场异常
  const detectMarketAnomalies = useCallback(async (): Promise<any[]> => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.get('/api/analysis/anomalies')
      // return response.data
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 模拟异常检测结果
      const anomalies = [
        {
          id: 'anom1',
          type: 'price_spike',
          variety: '稻花香',
          origin: '吉林舒兰',
          detectedAt: new Date().toISOString(),
          severity: 'high',
          description: '稻花香价格出现异常上涨，24小时内涨幅超过8%',
          recommendation: '建议关注市场动态，避免盲目跟风'
        },
        {
          id: 'anom2',
          type: 'volume_drop',
          variety: '蟹田大米',
          origin: '辽宁盘锦',
          detectedAt: new Date().toISOString(),
          severity: 'medium',
          description: '蟹田大米交易量异常下降，较上周下降30%',
          recommendation: '建议分析原因，调整销售策略'
        }
      ]
      
      return anomalies
    } catch (err: any) {
      setError(err.message || '异常检测失败')
      toast.error('异常检测失败，请重试')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 初始化数据
  useEffect(() => {
    fetchTransactionHistory()
    fetchMarketTrends('month')
    fetchPremiumAnalysis()
  }, [fetchTransactionHistory, fetchMarketTrends, fetchPremiumAnalysis])

  const contextValue: DataAnalysisContextType = {
    transactionHistory,
    pricePredictions,
    marketTrends,
    analysisReports,
    premiumAnalysis,
    isLoading,
    error,
    fetchTransactionHistory,
    getPricePrediction,
    fetchMarketTrends,
    fetchAnalysisReports,
    fetchPremiumAnalysis,
    generateCustomReport,
    exportData,
    getProductRecommendations,
    detectMarketAnomalies
  }

  return (
    <DataAnalysisContext.Provider value={contextValue}>
      {children}
    </DataAnalysisContext.Provider>
  )
}

// 自定义Hook：使用数据分析上下文
export const useDataAnalysis = () => {
  const context = useContext(DataAnalysisContext)
  if (context === undefined) {
    throw new Error('useDataAnalysis must be used within a DataAnalysisProvider')
  }
  return context
}