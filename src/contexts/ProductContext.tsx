import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from './AuthContext'

// 粮食产品接口
export interface GrainProduct {
  id: string
  name: string
  variety: string
  origin: string
  description: string
  images: string[]
  specification: {
    packaging: string
    weight: number
    unit: string
  }
  qualityIndicators: {
    moisture: number
    impurity: number
    purity: number
    protein: number
    storageTime: number
  }
  inspectionReport: {
    reportId: string
    issueDate: string
    authority: string
    imageUrl: string
    summary: string
  }
  remoteSensingData: {
    imageUrl: string
    analysisDate: string
    plantingArea: number
    growthCondition: 'excellent' | 'good' | 'fair' | 'poor'
    predictedYield: number
  }
  certification: {
    type: string[]
    certificationNumber: string
    issueDate: string
    expireDate: string
  }
  averagePrice: number
  marketTrend: 'rising' | 'stable' | 'falling'
  isRecommended: boolean
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  createdBy: string
  createdAt: string
  updatedAt: string
}

// 产品过滤条件接口
interface ProductFilters {
  variety?: string
  origin?: string
  minMoisture?: number
  maxMoisture?: number
  minPurity?: number
  maxImpurity?: number
  certification?: string
  status?: string
  searchQuery?: string
}

// 产品上下文接口
interface ProductContextType {
  products: GrainProduct[]
  currentProduct: GrainProduct | null
  userProducts: GrainProduct[]
  recommendedProducts: GrainProduct[]
  isLoading: boolean
  error: string | null
  totalCount: number
  page: number
  pageSize: number
  
  // 获取产品列表
  fetchProducts: (filters?: ProductFilters, page?: number, pageSize?: number) => Promise<void>
  
  // 获取单个产品
  fetchProductById: (id: string) => Promise<void>
  
  // 获取用户产品
  fetchUserProducts: (status?: string) => Promise<void>
  
  // 获取推荐产品
  fetchRecommendedProducts: () => Promise<void>
  
  // 创建产品
  createProduct: (productData: Omit<GrainProduct, 'id' | 'averagePrice' | 'marketTrend' | 'isRecommended' | 'status' | 'createdBy' | 'createdAt' | 'updatedAt'>) => Promise<void>
  
  // 更新产品
  updateProduct: (id: string, productData: Partial<GrainProduct>) => Promise<void>
  
  // 删除产品
  deleteProduct: (id: string) => Promise<void>
  
  // 上传质检报告
  uploadInspectionReport: (productId: string, formData: FormData) => Promise<void>
  
  // 上传遥感数据
  uploadRemoteSensingData: (productId: string, formData: FormData) => Promise<void>
  
  // 搜索产品
  searchProducts: (query: string) => Promise<void>
  
  // 高级筛选
  filterProducts: (filters: ProductFilters) => Promise<void>
}

// 创建上下文
const ProductContext = createContext<ProductContextType | undefined>(undefined)

// 模拟产品数据
const mockProducts: GrainProduct[] = [
  {
    id: '1',
    name: '五常长粒香大米 - 特级',
    variety: '长粒香',
    origin: '黑龙江五常',
    description: '五常大米，黑龙江省哈尔滨市五常市特产，中国国家地理标志产品。五常大米受产区独特的地理、气候等因素影响，干物质积累多，直链淀粉含量适中，支链淀粉含量较高。由于水稻成熟期产区昼夜温差大，大米中可速溶的双链糖积累较多，对人体健康非常有益。',
    images: [
      '/products/wuchang-1.jpg',
      '/products/wuchang-2.jpg',
      '/products/wuchang-3.jpg'
    ],
    specification: {
      packaging: '真空包装',
      weight: 5,
      unit: 'kg'
    },
    qualityIndicators: {
      moisture: 13.5,
      impurity: 0.5,
      purity: 99.8,
      protein: 7.8,
      storageTime: 15
    },
    inspectionReport: {
      reportId: 'QA-WC-2024-001',
      issueDate: '2024-03-10',
      authority: '中国农科院粮食质量检测中心',
      imageUrl: '/reports/wuchang-report.jpg',
      summary: '该批大米质量优良，各项指标均符合国家标准。米粒饱满，色泽清白，蒸煮后饭香浓郁，口感软糯。'
    },
    remoteSensingData: {
      imageUrl: '/remote-sensing/wuchang-field.jpg',
      analysisDate: '2024-09-15',
      plantingArea: 500,
      growthCondition: 'excellent',
      predictedYield: 6500
    },
    certification: {
      type: ['有机食品', '绿色食品'],
      certificationNumber: 'ORG-2024-00123',
      issueDate: '2024-01-05',
      expireDate: '2025-01-04'
    },
    averagePrice: 6.5,
    marketTrend: 'rising',
    isRecommended: true,
    status: 'approved',
    createdBy: 'farmer1',
    createdAt: '2024-03-15T08:30:00Z',
    updatedAt: '2024-03-20T10:15:00Z'
  },
  {
    id: '2',
    name: '舒兰稻花香大米 - 有机认证',
    variety: '稻花香',
    origin: '吉林舒兰',
    description: '舒兰稻花香大米，产自吉林省舒兰市，采用有机种植方式，无农药、无化肥，保证纯天然品质。大米颗粒饱满，蒸煮后饭香四溢，口感绵软略粘，饭粒表面油光艳丽。',
    images: [
      '/products/shulan-1.jpg',
      '/products/shulan-2.jpg'
    ],
    specification: {
      packaging: '礼盒装',
      weight: 10,
      unit: 'kg'
    },
    qualityIndicators: {
      moisture: 13.2,
      impurity: 0.3,
      purity: 99.9,
      protein: 8.2,
      storageTime: 10
    },
    inspectionReport: {
      reportId: 'QA-SL-2024-002',
      issueDate: '2024-03-12',
      authority: '中国有机食品认证中心',
      imageUrl: '/reports/shulan-report.jpg',
      summary: '经检测，该产品符合有机食品标准，无农药残留，营养成分丰富，品质优良。'
    },
    remoteSensingData: {
      imageUrl: '/remote-sensing/shulan-field.jpg',
      analysisDate: '2024-09-20',
      plantingArea: 300,
      growthCondition: 'excellent',
      predictedYield: 7000
    },
    certification: {
      type: ['有机食品', '地理标志产品'],
      certificationNumber: 'ORG-2024-00234',
      issueDate: '2024-01-10',
      expireDate: '2025-01-09'
    },
    averagePrice: 7.8,
    marketTrend: 'stable',
    isRecommended: true,
    status: 'approved',
    createdBy: 'farmer2',
    createdAt: '2024-03-18T14:20:00Z',
    updatedAt: '2024-03-22T09:45:00Z'
  },
  {
    id: '3',
    name: '盘锦蟹田大米 - 生态种植',
    variety: '蟹田大米',
    origin: '辽宁盘锦',
    description: '盘锦蟹田大米，辽宁省盘锦市特产，中国国家地理标志产品。采用稻蟹共生的生态种植模式，水稻为河蟹提供栖息地和食物，河蟹为水稻清除害虫和杂草，形成了良性的生态循环系统。',
    images: [
      '/products/panjin-1.jpg',
      '/products/panjin-2.jpg',
      '/products/panjin-3.jpg',
      '/products/panjin-4.jpg'
    ],
    specification: {
      packaging: '编织袋包装',
      weight: 25,
      unit: 'kg'
    },
    qualityIndicators: {
      moisture: 13.8,
      impurity: 0.6,
      purity: 99.7,
      protein: 7.5,
      storageTime: 20
    },
    inspectionReport: {
      reportId: 'QA-PJ-2024-003',
      issueDate: '2024-03-15',
      authority: '辽宁省农产品质量检测中心',
      imageUrl: '/reports/panjin-report.jpg',
      summary: '该批蟹田大米品质良好，无重金属污染，口感独特，营养均衡。'
    },
    remoteSensingData: {
      imageUrl: '/remote-sensing/panjin-field.jpg',
      analysisDate: '2024-09-25',
      plantingArea: 400,
      growthCondition: 'good',
      predictedYield: 6800
    },
    certification: {
      type: ['绿色食品', '生态产品'],
      certificationNumber: 'GREEN-2024-00345',
      issueDate: '2024-01-15',
      expireDate: '2025-01-14'
    },
    averagePrice: 5.8,
    marketTrend: 'falling',
    isRecommended: false,
    status: 'approved',
    createdBy: 'farmer3',
    createdAt: '2024-03-20T11:10:00Z',
    updatedAt: '2024-03-25T16:30:00Z'
  }
]

interface ProductProviderProps {
  children: ReactNode
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const [products, setProducts] = useState<GrainProduct[]>([])
  const [currentProduct, setCurrentProduct] = useState<GrainProduct | null>(null)
  const [userProducts, setUserProducts] = useState<GrainProduct[]>([])
  const [recommendedProducts, setRecommendedProducts] = useState<GrainProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // 获取产品列表
  const fetchProducts = useCallback(async (filters?: ProductFilters, pageNum: number = 1, pageSizeNum: number = 10) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.get('/api/products', { 
      //   params: { ...filters, page: pageNum, pageSize: pageSizeNum } 
      // })
      // setProducts(response.data.items)
      // setTotalCount(response.data.totalCount)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      let filteredProducts = [...mockProducts]
      
      // 应用过滤条件
      if (filters) {
        if (filters.variety) {
          filteredProducts = filteredProducts.filter(product => 
            product.variety.toLowerCase().includes(filters.variety!.toLowerCase())
          )
        }
        if (filters.origin) {
          filteredProducts = filteredProducts.filter(product => 
            product.origin.toLowerCase().includes(filters.origin!.toLowerCase())
          )
        }
        if (filters.minMoisture !== undefined) {
          filteredProducts = filteredProducts.filter(product => 
            product.qualityIndicators.moisture >= filters.minMoisture!
          )
        }
        if (filters.maxMoisture !== undefined) {
          filteredProducts = filteredProducts.filter(product => 
            product.qualityIndicators.moisture <= filters.maxMoisture!
          )
        }
        if (filters.minPurity !== undefined) {
          filteredProducts = filteredProducts.filter(product => 
            product.qualityIndicators.purity >= filters.minPurity!
          )
        }
        if (filters.maxImpurity !== undefined) {
          filteredProducts = filteredProducts.filter(product => 
            product.qualityIndicators.impurity <= filters.maxImpurity!
          )
        }
        if (filters.certification) {
          filteredProducts = filteredProducts.filter(product => 
            product.certification.type.some(type => 
              type.toLowerCase().includes(filters.certification!.toLowerCase())
            )
          )
        }
        if (filters.status) {
          filteredProducts = filteredProducts.filter(product => 
            product.status === filters.status
          )
        }
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase()
          filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.variety.toLowerCase().includes(query) ||
            product.origin.toLowerCase().includes(query)
          )
        }
      }
      
      setTotalCount(filteredProducts.length)
      setPage(pageNum)
      setPageSize(pageSizeNum)
      
      // 分页
      const startIndex = (pageNum - 1) * pageSizeNum
      const endIndex = startIndex + pageSizeNum
      setProducts(filteredProducts.slice(startIndex, endIndex))
    } catch (err: any) {
      setError(err.message || '获取产品列表失败')
      toast.error('获取产品列表失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 获取单个产品
  const fetchProductById = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.get(`/api/products/${id}`)
      // setCurrentProduct(response.data)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const product = mockProducts.find(p => p.id === id)
      if (product) {
        setCurrentProduct(product)
      } else {
        throw new Error('产品不存在')
      }
    } catch (err: any) {
      setError(err.message || '获取产品详情失败')
      toast.error('获取产品详情失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 获取用户产品
  const fetchUserProducts = useCallback(async (status?: string) => {
    try {
      if (!user) throw new Error('用户未登录')
      
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.get('/api/user/products', {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      //   params: { status }
      // })
      // setUserProducts(response.data)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 400))
      
      // 模拟用户的产品
      let userProductsList = mockProducts.filter(product => product.createdBy === user.id)
      
      if (status) {
        userProductsList = userProductsList.filter(product => product.status === status)
      }
      
      setUserProducts(userProductsList)
    } catch (err: any) {
      setError(err.message || '获取用户产品失败')
      toast.error('获取用户产品失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // 获取推荐产品
  const fetchRecommendedProducts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.get('/api/products/recommended')
      // setRecommendedProducts(response.data)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 推荐产品（状态为已批准且被标记为推荐）
      const recommended = mockProducts.filter(product => 
        product.status === 'approved' && product.isRecommended
      )
      
      setRecommendedProducts(recommended)
    } catch (err: any) {
      setError(err.message || '获取推荐产品失败')
      toast.error('获取推荐产品失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 创建产品
  const createProduct = useCallback(async (productData: Omit<GrainProduct, 'id' | 'averagePrice' | 'marketTrend' | 'isRecommended' | 'status' | 'createdBy' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!user) throw new Error('用户未登录')
      if (user.role !== 'farmer' && user.role !== 'admin') throw new Error('只有农户可以创建产品')
      
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.post('/api/products', productData, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      // })
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const newProduct: GrainProduct = {
        ...productData,
        id: Date.now().toString(),
        averagePrice: 0,
        marketTrend: 'stable',
        isRecommended: false,
        status: 'pending',
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // 更新本地状态
      setProducts(prev => [newProduct, ...prev])
      setUserProducts(prev => [newProduct, ...prev])
      
      toast.success('产品创建成功，等待审核')
    } catch (err: any) {
      setError(err.message || '创建产品失败')
      toast.error(err.message || '创建产品失败，请重试')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // 更新产品
  const updateProduct = useCallback(async (id: string, productData: Partial<GrainProduct>) => {
    try {
      if (!user) throw new Error('用户未登录')
      
      setIsLoading(true)
      setError(null)
      
      // 检查权限
      const product = products.find(p => p.id === id) || currentProduct
      if (!product) {
        await fetchProductById(id)
        return
      }
      
      if (product.createdBy !== user.id && user.role !== 'admin') {
        throw new Error('无权限修改此产品')
      }
      
      // 实际环境中的API调用
      // const response = await axios.put(`/api/products/${id}`, productData, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      // })
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 600))
      
      const updatedProduct = {
        ...product,
        ...productData,
        updatedAt: new Date().toISOString()
      }
      
      // 更新本地状态
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p))
      setUserProducts(prev => prev.map(p => p.id === id ? updatedProduct : p))
      if (currentProduct?.id === id) {
        setCurrentProduct(updatedProduct)
      }
      
      toast.success('产品更新成功')
    } catch (err: any) {
      setError(err.message || '更新产品失败')
      toast.error(err.message || '更新产品失败，请重试')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user, products, currentProduct, fetchProductById])

  // 删除产品
  const deleteProduct = useCallback(async (id: string) => {
    try {
      if (!user) throw new Error('用户未登录')
      
      setIsLoading(true)
      setError(null)
      
      // 检查权限
      const product = products.find(p => p.id === id) || currentProduct
      if (!product) {
        await fetchProductById(id)
        return
      }
      
      if (product.createdBy !== user.id && user.role !== 'admin') {
        throw new Error('无权限删除此产品')
      }
      
      // 实际环境中的API调用
      // await axios.delete(`/api/products/${id}`, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      // })
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 400))
      
      // 更新本地状态
      setProducts(prev => prev.filter(p => p.id !== id))
      setUserProducts(prev => prev.filter(p => p.id !== id))
      setRecommendedProducts(prev => prev.filter(p => p.id !== id))
      if (currentProduct?.id === id) {
        setCurrentProduct(null)
      }
      
      toast.success('产品删除成功')
    } catch (err: any) {
      setError(err.message || '删除产品失败')
      toast.error(err.message || '删除产品失败，请重试')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user, products, currentProduct, fetchProductById])

  // 上传质检报告
  const uploadInspectionReport = useCallback(async (productId: string, formData: FormData) => {
    try {
      if (!user) throw new Error('用户未登录')
      
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.post(`/api/products/${productId}/inspection-report`, formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //     Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      //   }
      // })
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('质检报告上传成功')
    } catch (err: any) {
      setError(err.message || '上传质检报告失败')
      toast.error(err.message || '上传质检报告失败，请重试')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // 上传遥感数据
  const uploadRemoteSensingData = useCallback(async (productId: string, formData: FormData) => {
    try {
      if (!user) throw new Error('用户未登录')
      
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.post(`/api/products/${productId}/remote-sensing`, formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //     Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      //   }
      // })
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('遥感数据上传成功，正在分析...')
    } catch (err: any) {
      setError(err.message || '上传遥感数据失败')
      toast.error(err.message || '上传遥感数据失败，请重试')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // 搜索产品
  const searchProducts = useCallback(async (query: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      await fetchProducts({ searchQuery: query })
    } catch (err: any) {
      setError(err.message || '搜索产品失败')
      toast.error('搜索产品失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [fetchProducts])

  // 高级筛选
  const filterProducts = useCallback(async (filters: ProductFilters) => {
    try {
      setIsLoading(true)
      setError(null)
      
      await fetchProducts(filters, 1, pageSize)
    } catch (err: any) {
      setError(err.message || '筛选产品失败')
      toast.error('筛选产品失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [fetchProducts, pageSize])

  const contextValue: ProductContextType = {
    products,
    currentProduct,
    userProducts,
    recommendedProducts,
    isLoading,
    error,
    totalCount,
    page,
    pageSize,
    fetchProducts,
    fetchProductById,
    fetchUserProducts,
    fetchRecommendedProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadInspectionReport,
    uploadRemoteSensingData,
    searchProducts,
    filterProducts
  }

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  )
}

// 自定义Hook：使用产品上下文
export const useProduct = () => {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider')
  }
  return context
}

// 自定义Hook：使用单个产品
export const useSingleProduct = (id: string) => {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error('useSingleProduct must be used within a ProductProvider')
  }
  
  const product = context.products.find(p => p.id === id) || context.currentProduct
  
  return {
    ...context,
    product
  }
}