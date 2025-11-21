import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { io } from 'socket.io-client'

interface GrainItem {
  id: string
  name: string
  variety: string
  origin: string
  quantity: number
  unit: string
  startingPrice: number
  currentPrice: number
  increment: number
  startTime: string
  endTime: string
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  sellerId: string
  sellerName: string
  qualityReport: {
    moistureContent: number
    impurityRate: number
    proteinContent: number
    purity: number
    storageTime: string
    testDate: string
    testInstitution: string
  }
  remoteSensingData?: {
    imageUrl: string
    cultivatedArea: number
    growthStage: string
    plantingDate: string
    harvestDate: string
  }
  bids: Bid[]
}

interface Bid {
  id: string
  grainId: string
  buyerId: string
  buyerName: string
  price: number
  timestamp: string
}

interface AuctionContextType {
  grainItems: GrainItem[]
  currentItem: GrainItem | null
  isLoading: boolean
  error: string | null
  fetchGrainItems: () => Promise<void>
  fetchGrainItemById: (id: string) => Promise<void>
  placeBid: (grainId: string, price: number) => Promise<void>
  createAuction: (auctionData: Omit<GrainItem, 'id' | 'bids' | 'status' | 'currentPrice'>) => Promise<void>
  getRecommendedPrice: (grainData: Partial<GrainItem>) => Promise<number>
  onBidReceived: (callback: (bid: Bid) => void) => void
  onAuctionUpdate: (callback: (item: GrainItem) => void) => void
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined)

export const useAuction = () => {
  const context = useContext(AuctionContext)
  if (context === undefined) {
    throw new Error('useAuction must be used within an AuctionProvider')
  }
  return context
}

interface AuctionProviderProps {
  children: ReactNode
}

export const AuctionProvider: React.FC<AuctionProviderProps> = ({ children }) => {
  const [grainItems, setGrainItems] = useState<GrainItem[]>([])
  const [currentItem, setCurrentItem] = useState<GrainItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [socket, setSocket] = useState<any>(null)
  const [bidCallbacks, setBidCallbacks] = useState<Array<(bid: Bid) => void>>([])
  const [auctionUpdateCallbacks, setAuctionUpdateCallbacks] = useState<Array<(item: GrainItem) => void>>([])

  // 初始化Socket连接
  useEffect(() => {
    // 在实际环境中，这里会连接到真实的Socket服务器
    // const socketInstance = io('http://localhost:8000')
    
    // 模拟Socket实例
    const mockSocket = {
      on: (event: string, callback: Function) => {
        // 模拟事件监听
        if (event === 'bid_place') {
          // 可以在这里添加模拟的bid事件触发逻辑
        }
        if (event === 'auction_update') {
          // 可以在这里添加模拟的auction_update事件触发逻辑
        }
        return mockSocket
      },
      emit: (event: string, data: any) => {
        console.log(`Emitted ${event}:`, data)
        return mockSocket
      },
      disconnect: () => console.log('Socket disconnected')
    }

    setSocket(mockSocket)

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  // 模拟获取粮食拍卖列表
  const fetchGrainItems = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // 在实际环境中，这里会调用后端API
      // const response = await axios.get('/api/auctions')
      
      // 模拟数据
      const mockData: GrainItem[] = [
        {
          id: '1',
          name: '东北大米',
          variety: '五常大米',
          origin: '黑龙江省五常市',
          quantity: 5000,
          unit: '吨',
          startingPrice: 6500,
          currentPrice: 6800,
          increment: 100,
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          sellerId: 'seller1',
          sellerName: '五常市优质农产品合作社',
          qualityReport: {
            moistureContent: 14.5,
            impurityRate: 0.5,
            proteinContent: 7.8,
            purity: 99.5,
            storageTime: '30天',
            testDate: '2024-01-15',
            testInstitution: '黑龙江省农产品质量检测中心'
          },
          remoteSensingData: {
            imageUrl: '/remote-sensing-1.jpg',
            cultivatedArea: 1200,
            growthStage: '成熟期',
            plantingDate: '2023-05-10',
            harvestDate: '2023-10-20'
          },
          bids: [
            { id: 'bid1', grainId: '1', buyerId: 'buyer1', buyerName: '粮油贸易有限公司', price: 6600, timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
            { id: 'bid2', grainId: '1', buyerId: 'buyer2', buyerName: '食品加工集团', price: 6700, timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
            { id: 'bid3', grainId: '1', buyerId: 'buyer3', buyerName: '农产品进出口公司', price: 6800, timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() }
          ]
        },
        {
          id: '2',
          name: '东北大米',
          variety: '方正大米',
          origin: '黑龙江省方正县',
          quantity: 3000,
          unit: '吨',
          startingPrice: 6200,
          currentPrice: 6200,
          increment: 100,
          startTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          sellerId: 'seller2',
          sellerName: '方正县水稻种植专业合作社',
          qualityReport: {
            moistureContent: 14.2,
            impurityRate: 0.4,
            proteinContent: 7.6,
            purity: 99.6,
            storageTime: '25天',
            testDate: '2024-01-14',
            testInstitution: '黑龙江省农产品质量检测中心'
          },
          bids: []
        }
      ]

      setGrainItems(mockData)
    } catch (err) {
      setError('获取拍卖列表失败')
      console.error('Fetch grain items error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // 根据ID获取拍卖物品
  const fetchGrainItemById = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      // 在实际环境中，这里会调用后端API
      // const response = await axios.get(`/api/auctions/${id}`)
      
      // 模拟获取单个物品
      const item = grainItems.find(item => item.id === id)
      if (item) {
        setCurrentItem(item)
      } else {
        throw new Error('物品不存在')
      }
    } catch (err) {
      setError('获取拍卖物品失败')
      console.error('Fetch grain item error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // 出价
  const placeBid = async (grainId: string, price: number) => {
    try {
      // 在实际环境中，这里会调用后端API
      // const response = await axios.post('/api/bids', { grainId, price })
      
      // 模拟出价
      const newBid: Bid = {
        id: `bid_${Date.now()}`,
        grainId,
        buyerId: 'current_user',
        buyerName: '当前用户',
        price,
        timestamp: new Date().toISOString()
      }

      // 更新本地状态
      setGrainItems(prev => prev.map(item => 
        item.id === grainId 
          ? { ...item, currentPrice: price, bids: [...item.bids, newBid] }
          : item
      ))

      if (currentItem?.id === grainId) {
        setCurrentItem({
          ...currentItem,
          currentPrice: price,
          bids: [...currentItem.bids, newBid]
        })
      }

      // 通知所有bid监听器
      bidCallbacks.forEach(callback => callback(newBid))

      // 通过Socket通知其他人
      if (socket) {
        socket.emit('place_bid', { grainId, price })
      }
    } catch (err) {
      console.error('Place bid error:', err)
      throw err
    }
  }

  // 创建拍卖
  const createAuction = async (auctionData: Omit<GrainItem, 'id' | 'bids' | 'status' | 'currentPrice'>) => {
    try {
      // 在实际环境中，这里会调用后端API
      // const response = await axios.post('/api/auctions', auctionData)
      
      // 模拟创建拍卖
      const newAuction: GrainItem = {
        ...auctionData,
        id: `auction_${Date.now()}`,
        bids: [],
        status: 'pending',
        currentPrice: auctionData.startingPrice
      }

      setGrainItems(prev => [newAuction, ...prev])

      // 通过Socket通知其他人
      if (socket) {
        socket.emit('create_auction', newAuction)
      }
    } catch (err) {
      console.error('Create auction error:', err)
      throw err
    }
  }

  // 获取推荐价格（使用XGBoost算法）
  const getRecommendedPrice = async (grainData: Partial<GrainItem>): Promise<number> => {
    try {
      // 在实际环境中，这里会调用后端API，使用XGBoost模型预测价格
      // const response = await axios.post('/api/predict-price', grainData)
      // return response.data.recommendedPrice
      
      // 模拟价格预测逻辑
      let basePrice = 6000 // 基础价格
      
      // 根据质量指标调整价格
      if (grainData.qualityReport) {
        // 水分含量越低，价格越高
        if (grainData.qualityReport.moistureContent < 14) basePrice += 200
        else if (grainData.qualityReport.moistureContent < 15) basePrice += 100
        
        // 杂质率越低，价格越高
        if (grainData.qualityReport.impurityRate < 0.5) basePrice += 150
        
        // 蛋白质含量越高，价格越高
        if (grainData.qualityReport.proteinContent > 8) basePrice += 250
        else if (grainData.qualityReport.proteinContent > 7.5) basePrice += 150
        
        // 纯度越高，价格越高
        if (grainData.qualityReport.purity > 99.5) basePrice += 300
        else if (grainData.qualityReport.purity > 99) basePrice += 200
      }
      
      // 根据品种调整价格
      if (grainData.variety === '五常大米') basePrice += 500
      else if (grainData.variety === '方正大米') basePrice += 300
      
      return basePrice
    } catch (err) {
      console.error('Get recommended price error:', err)
      throw err
    }
  }

  // 注册bid接收回调
  const onBidReceived = (callback: (bid: Bid) => void) => {
    setBidCallbacks(prev => [...prev, callback])
    return () => {
      setBidCallbacks(prev => prev.filter(cb => cb !== callback))
    }
  }

  // 注册auction更新回调
  const onAuctionUpdate = (callback: (item: GrainItem) => void) => {
    setAuctionUpdateCallbacks(prev => [...prev, callback])
    return () => {
      setAuctionUpdateCallbacks(prev => prev.filter(cb => cb !== callback))
    }
  }

  const value = {
    grainItems,
    currentItem,
    isLoading,
    error,
    fetchGrainItems,
    fetchGrainItemById,
    placeBid,
    createAuction,
    getRecommendedPrice,
    onBidReceived,
    onAuctionUpdate
  }

  return (
    <AuctionContext.Provider value={value}>
      {children}
    </AuctionContext.Provider>
  )
}

export type { GrainItem, Bid }