import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from './AuthContext'

// 质检报告接口
export interface InspectionReport {
  id: string
  productId: string
  reportNumber: string
  issueDate: string
  authority: string
  inspector: string
  status: 'pending' | 'approved' | 'rejected'
  images: string[]
  scanUrl?: string
  extractedData: {
    grainType: string
    variety: string
    batchNumber: string
    productionDate: string
    moisture: number
    impurity: number
    purity: number
    protein: number
    glutenContent?: number
    amyloseContent?: number
    damagedKernelRate?: number
    foreignMatter?: number
    pesticideResidue?: {
      detected: boolean
      details?: { [key: string]: number }
    }
    heavyMetals?: {
      detected: boolean
      details?: { [key: string]: number }
    }
    qualityGrade: 'excellent' | 'good' | 'fair' | 'poor'
    complianceStatus: 'compliant' | 'non-compliant' | 'partial-compliant'
    notes?: string
  }
  processingStatus: 'uploaded' | 'analyzing' | 'completed' | 'failed'
  confidenceScore?: number
  verificationLogs: {
    timestamp: string
    action: string
    performedBy: string
    details: string
  }[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

// 遥感数据接口
export interface RemoteSensingData {
  id: string
  productId: string
  imageId: string
  acquisitionDate: string
  satellite: string
  resolution: string
  imageUrl: string
  thumbnailUrl?: string
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed'
  processingProgress?: number
  analyzedData: {
    plantingArea: number
    growthStage: string
    growthCondition: 'excellent' | 'good' | 'fair' | 'poor'
    vegetationIndex: number
    predictedYield: number
    potentialIssues: {
      type: string
      severity: 'low' | 'medium' | 'high'
      areaAffected: number
      recommendedAction?: string
    }[]
    colorAnalysis: {
      averageGreenness: number
      uniformity: number
      anomaliesDetected: boolean
    }
    irrigationStatus?: 'optimal' | 'insufficient' | 'excessive'
    soilMoisture?: number
    temperatureData?: {
      average: number
      range: {
        min: number
        max: number
      }
      anomalies?: boolean
    }
  }
  confidenceLevel?: number
  qualityMetrics: {
    cloudCoverage: number
    imageQuality: 'excellent' | 'good' | 'fair' | 'poor'
    dataCompleteness: number
  }
  processingLogs: {
    timestamp: string
    stage: string
    status: 'success' | 'warning' | 'error'
    details: string
  }[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

// 提取任务接口
export interface ExtractionTask {
  id: string
  type: 'inspection' | 'remote_sensing'
  targetId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  startTime?: string
  endTime?: string
  errorMessage?: string
  resultId?: string
  metadata: {
    fileName?: string
    fileSize?: number
    uploadedBy: string
    processingMethod: string
  }
}

// 报告上下文接口
interface ReportContextType {
  inspectionReports: InspectionReport[]
  remoteSensingData: RemoteSensingData[]
  userReports: InspectionReport[]
  userRemoteSensingData: RemoteSensingData[]
  extractionTasks: ExtractionTask[]
  currentReport: InspectionReport | null
  currentRemoteSensing: RemoteSensingData | null
  isLoading: boolean
  error: string | null
  
  // 质检报告相关功能
  uploadInspectionReport: (productId: string, formData: FormData) => Promise<string>
  fetchInspectionReports: (productId?: string, status?: string) => Promise<void>
  fetchInspectionReportById: (id: string) => Promise<void>
  fetchUserInspectionReports: (status?: string) => Promise<void>
  verifyInspectionReport: (id: string, verificationData: {
    status: 'approved' | 'rejected'
    notes?: string
  }) => Promise<void>
  
  // 遥感数据相关功能
  uploadRemoteSensingImage: (productId: string, formData: FormData) => Promise<string>
  fetchRemoteSensingData: (productId?: string, status?: string) => Promise<void>
  fetchRemoteSensingById: (id: string) => Promise<void>
  fetchUserRemoteSensingData: (status?: string) => Promise<void>
  
  // 提取任务相关功能
  fetchExtractionTasks: (status?: string) => Promise<void>
  cancelExtractionTask: (taskId: string) => Promise<void>
  
  // 数据集成与分析
  integrateWithOpenEO: (imageUrl: string, parameters: any) => Promise<any>
  extractTextFromReport: (reportId: string) => Promise<{ extractedText: string; confidence: number }>
  generateQualitySummary: (reportIds: string[], remoteSensingIds: string[]) => Promise<{ summary: string; rating: number }>
}

// 创建上下文
const ReportContext = createContext<ReportContextType | undefined>(undefined)

// 模拟质检报告数据
const mockInspectionReports: InspectionReport[] = [
  {
    id: 'report1',
    productId: 'product1',
    reportNumber: 'QA-2024-001',
    issueDate: '2024-03-10',
    authority: '中国农科院粮食质量检测中心',
    inspector: '张明',
    status: 'approved',
    images: ['/inspection-reports/sample1-1.jpg', '/inspection-reports/sample1-2.jpg'],
    scanUrl: '/inspection-reports/sample1-full.pdf',
    extractedData: {
      grainType: 'rice',
      variety: '长粒香',
      batchNumber: 'WC20240310-001',
      productionDate: '2024-02-28',
      moisture: 13.5,
      impurity: 0.5,
      purity: 99.8,
      protein: 7.8,
      glutenContent: 0.05,
      amyloseContent: 18.2,
      damagedKernelRate: 0.3,
      foreignMatter: 0.2,
      pesticideResidue: {
        detected: false
      },
      heavyMetals: {
        detected: false
      },
      qualityGrade: 'excellent',
      complianceStatus: 'compliant',
      notes: '各项指标均优于国家标准'
    },
    processingStatus: 'completed',
    confidenceScore: 0.98,
    verificationLogs: [
      {
        timestamp: '2024-03-10T10:30:00Z',
        action: 'upload',
        performedBy: 'farmer1',
        details: '上传质检报告扫描件'
      },
      {
        timestamp: '2024-03-10T10:45:00Z',
        action: 'extraction',
        performedBy: 'system',
        details: '自动提取报告数据完成'
      },
      {
        timestamp: '2024-03-10T14:20:00Z',
        action: 'verification',
        performedBy: 'admin1',
        details: '审核通过'
      }
    ],
    createdAt: '2024-03-10T10:30:00Z',
    updatedAt: '2024-03-10T14:20:00Z',
    createdBy: 'farmer1'
  },
  {
    id: 'report2',
    productId: 'product2',
    reportNumber: 'QA-2024-002',
    issueDate: '2024-03-12',
    authority: '中国有机食品认证中心',
    inspector: '李华',
    status: 'approved',
    images: ['/inspection-reports/sample2-1.jpg', '/inspection-reports/sample2-2.jpg'],
    scanUrl: '/inspection-reports/sample2-full.pdf',
    extractedData: {
      grainType: 'rice',
      variety: '稻花香',
      batchNumber: 'SL20240312-001',
      productionDate: '2024-03-01',
      moisture: 13.2,
      impurity: 0.3,
      purity: 99.9,
      protein: 8.2,
      glutenContent: 0.04,
      amyloseContent: 17.8,
      damagedKernelRate: 0.2,
      foreignMatter: 0.1,
      pesticideResidue: {
        detected: false
      },
      heavyMetals: {
        detected: false
      },
      qualityGrade: 'excellent',
      complianceStatus: 'compliant',
      notes: '符合有机食品标准'
    },
    processingStatus: 'completed',
    confidenceScore: 0.99,
    verificationLogs: [
      {
        timestamp: '2024-03-12T09:15:00Z',
        action: 'upload',
        performedBy: 'farmer2',
        details: '上传有机认证报告'
      },
      {
        timestamp: '2024-03-12T09:30:00Z',
        action: 'extraction',
        performedBy: 'system',
        details: '自动提取报告数据完成'
      },
      {
        timestamp: '2024-03-12T15:40:00Z',
        action: 'verification',
        performedBy: 'admin2',
        details: '审核通过'
      }
    ],
    createdAt: '2024-03-12T09:15:00Z',
    updatedAt: '2024-03-12T15:40:00Z',
    createdBy: 'farmer2'
  }
]

// 模拟遥感数据
const mockRemoteSensingData: RemoteSensingData[] = [
  {
    id: 'rs1',
    productId: 'product1',
    imageId: 'SAT-2024-0915-001',
    acquisitionDate: '2024-09-15',
    satellite: '高分九号',
    resolution: '2m',
    imageUrl: '/remote-sensing/wuchang-field-full.jpg',
    thumbnailUrl: '/remote-sensing/wuchang-field-thumb.jpg',
    analysisStatus: 'completed',
    processingProgress: 100,
    analyzedData: {
      plantingArea: 500,
      growthStage: '成熟期',
      growthCondition: 'excellent',
      vegetationIndex: 0.88,
      predictedYield: 6500,
      potentialIssues: [],
      colorAnalysis: {
        averageGreenness: 0.92,
        uniformity: 0.95,
        anomaliesDetected: false
      },
      irrigationStatus: 'optimal',
      soilMoisture: 65,
      temperatureData: {
        average: 25.8,
        range: {
          min: 22.3,
          max: 28.5
        },
        anomalies: false
      }
    },
    confidenceLevel: 0.96,
    qualityMetrics: {
      cloudCoverage: 2,
      imageQuality: 'excellent',
      dataCompleteness: 99
    },
    processingLogs: [
      {
        timestamp: '2024-09-15T11:30:00Z',
        stage: 'upload',
        status: 'success',
        details: '遥感影像上传成功'
      },
      {
        timestamp: '2024-09-15T11:35:00Z',
        stage: 'preprocessing',
        status: 'success',
        details: '影像预处理完成'
      },
      {
        timestamp: '2024-09-15T11:50:00Z',
        stage: 'analysis',
        status: 'success',
        details: '植被指数计算完成'
      },
      {
        timestamp: '2024-09-15T12:10:00Z',
        stage: 'yield_prediction',
        status: 'success',
        details: '产量预测完成'
      },
      {
        timestamp: '2024-09-15T12:20:00Z',
        stage: 'completion',
        status: 'success',
        details: '分析任务完成'
      }
    ],
    createdAt: '2024-09-15T11:30:00Z',
    updatedAt: '2024-09-15T12:20:00Z',
    createdBy: 'farmer1'
  },
  {
    id: 'rs2',
    productId: 'product2',
    imageId: 'SAT-2024-0920-002',
    acquisitionDate: '2024-09-20',
    satellite: 'Landsat-8',
    resolution: '30m',
    imageUrl: '/remote-sensing/shulan-field-full.jpg',
    thumbnailUrl: '/remote-sensing/shulan-field-thumb.jpg',
    analysisStatus: 'completed',
    processingProgress: 100,
    analyzedData: {
      plantingArea: 300,
      growthStage: '成熟期',
      growthCondition: 'excellent',
      vegetationIndex: 0.91,
      predictedYield: 7000,
      potentialIssues: [],
      colorAnalysis: {
        averageGreenness: 0.94,
        uniformity: 0.92,
        anomaliesDetected: false
      },
      irrigationStatus: 'optimal',
      soilMoisture: 68,
      temperatureData: {
        average: 24.5,
        range: {
          min: 21.8,
          max: 27.2
        },
        anomalies: false
      }
    },
    confidenceLevel: 0.97,
    qualityMetrics: {
      cloudCoverage: 1,
      imageQuality: 'excellent',
      dataCompleteness: 98
    },
    processingLogs: [
      {
        timestamp: '2024-09-20T09:45:00Z',
        stage: 'upload',
        status: 'success',
        details: '遥感影像上传成功'
      },
      {
        timestamp: '2024-09-20T10:00:00Z',
        stage: 'analysis',
        status: 'success',
        details: '分析完成'
      }
    ],
    createdAt: '2024-09-20T09:45:00Z',
    updatedAt: '2024-09-20T10:00:00Z',
    createdBy: 'farmer2'
  }
]

interface ReportProviderProps {
  children: ReactNode
}

export const ReportProvider: React.FC<ReportProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const [inspectionReports, setInspectionReports] = useState<InspectionReport[]>([])
  const [remoteSensingData, setRemoteSensingData] = useState<RemoteSensingData[]>([])
  const [userReports, setUserReports] = useState<InspectionReport[]>([])
  const [userRemoteSensingData, setUserRemoteSensingData] = useState<RemoteSensingData[]>([])
  const [extractionTasks, setExtractionTasks] = useState<ExtractionTask[]>([])
  const [currentReport, setCurrentReport] = useState<InspectionReport | null>(null)
  const [currentRemoteSensing, setCurrentRemoteSensing] = useState<RemoteSensingData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 上传质检报告
  const uploadInspectionReport = useCallback(async (productId: string, formData: FormData): Promise<string> => {
    try {
      if (!user) throw new Error('用户未登录')
      
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.post(`/api/reports/inspection/upload/${productId}`, formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //     Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      //   }
      // })
      // return response.data.taskId
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 创建模拟任务ID
      const taskId = `task_${Date.now()}`
      
      // 添加到任务列表
      const newTask: ExtractionTask = {
        id: taskId,
        type: 'inspection',
        targetId: productId,
        status: 'processing',
        progress: 30,
        startTime: new Date().toISOString(),
        metadata: {
          fileName: formData.get('file')?.toString() || 'unknown.pdf',
          fileSize: 1024 * 1024, // 1MB 模拟大小
          uploadedBy: user.username,
          processingMethod: 'OCR + ML Analysis'
        }
      }
      
      setExtractionTasks(prev => [newTask, ...prev])
      
      toast.success('质检报告上传成功，正在处理...')
      
      // 模拟异步处理进度更新
      setTimeout(() => {
        setExtractionTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, progress: 70 } : task
        ))
      }, 2000)
      
      setTimeout(() => {
        setExtractionTasks(prev => prev.map(task => 
          task.id === taskId ? { 
            ...task, 
            progress: 100, 
            status: 'completed',
            endTime: new Date().toISOString()
          } : task
        ))
      }, 4000)
      
      return taskId
    } catch (err: any) {
      setError(err.message || '上传质检报告失败')
      toast.error(err.message || '上传质检报告失败，请重试')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // 获取质检报告列表
  const fetchInspectionReports = useCallback(async (productId?: string, status?: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.get('/api/reports/inspection', { 
      //   params: { productId, status } 
      // })
      // setInspectionReports(response.data)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      let filteredReports = [...mockInspectionReports]
      
      if (productId) {
        filteredReports = filteredReports.filter(report => report.productId === productId)
      }
      
      if (status) {
        filteredReports = filteredReports.filter(report => report.status === status)
      }
      
      setInspectionReports(filteredReports)
    } catch (err: any) {
      setError(err.message || '获取质检报告失败')
      toast.error('获取质检报告失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 获取单个质检报告
  const fetchInspectionReportById = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.get(`/api/reports/inspection/${id}`)
      // setCurrentReport(response.data)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const report = mockInspectionReports.find(r => r.id === id)
      if (report) {
        setCurrentReport(report)
      } else {
        throw new Error('质检报告不存在')
      }
    } catch (err: any) {
      setError(err.message || '获取质检报告详情失败')
      toast.error('获取质检报告详情失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 获取用户的质检报告
  const fetchUserInspectionReports = useCallback(async (status?: string) => {
    try {
      if (!user) throw new Error('用户未登录')
      
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.get('/api/user/reports/inspection', {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      //   params: { status }
      // })
      // setUserReports(response.data)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 400))
      
      let filteredReports = mockInspectionReports.filter(report => report.createdBy === user.id)
      
      if (status) {
        filteredReports = filteredReports.filter(report => report.status === status)
      }
      
      setUserReports(filteredReports)
    } catch (err: any) {
      setError(err.message || '获取用户质检报告失败')
      toast.error('获取用户质检报告失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // 审核质检报告
  const verifyInspectionReport = useCallback(async (id: string, verificationData: {
    status: 'approved' | 'rejected'
    notes?: string
  }) => {
    try {
      if (!user) throw new Error('用户未登录')
      if (user.role !== 'admin' && user.role !== 'inspector') throw new Error('只有管理员或审核员可以审核报告')
      
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // await axios.post(`/api/reports/inspection/${id}/verify`, verificationData, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      // })
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 更新本地状态
      const updatedReport = {
        ...(currentReport || mockInspectionReports.find(r => r.id === id)),
        status: verificationData.status,
        updatedAt: new Date().toISOString(),
        verificationLogs: [
          ...((currentReport || mockInspectionReports.find(r => r.id === id))?.verificationLogs || []),
          {
            timestamp: new Date().toISOString(),
            action: 'verification',
            performedBy: user.username,
            details: verificationData.status === 'approved' ? '审核通过' : `审核拒绝: ${verificationData.notes || ''}`
          }
        ]
      }
      
      if (updatedReport) {
        setInspectionReports(prev => prev.map(r => r.id === id ? updatedReport! : r))
        setUserReports(prev => prev.map(r => r.id === id ? updatedReport! : r))
        if (currentReport?.id === id) {
          setCurrentReport(updatedReport)
        }
      }
      
      toast.success(`质检报告已${verificationData.status === 'approved' ? '通过' : '拒绝'}审核`)
    } catch (err: any) {
      setError(err.message || '审核质检报告失败')
      toast.error(err.message || '审核质检报告失败，请重试')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user, currentReport])

  // 上传遥感影像
  const uploadRemoteSensingImage = useCallback(async (productId: string, formData: FormData): Promise<string> => {
    try {
      if (!user) throw new Error('用户未登录')
      
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.post(`/api/reports/remote-sensing/upload/${productId}`, formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //     Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      //   }
      // })
      // return response.data.taskId
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 创建模拟任务ID
      const taskId = `rs_task_${Date.now()}`
      
      // 添加到任务列表
      const newTask: ExtractionTask = {
        id: taskId,
        type: 'remote_sensing',
        targetId: productId,
        status: 'processing',
        progress: 20,
        startTime: new Date().toISOString(),
        metadata: {
          fileName: formData.get('image')?.toString() || 'unknown.tif',
          fileSize: 10 * 1024 * 1024, // 10MB 模拟大小
          uploadedBy: user.username,
          processingMethod: 'Remote Sensing Analysis + ML'
        }
      }
      
      setExtractionTasks(prev => [newTask, ...prev])
      
      toast.success('遥感影像上传成功，正在分析...')
      
      // 模拟异步处理进度更新
      const updateProgress = (progress: number, delay: number) => {
        setTimeout(() => {
          setExtractionTasks(prev => prev.map(task => 
            task.id === taskId ? { ...task, progress } : task
          ))
        }, delay)
      }
      
      updateProgress(40, 2000)
      updateProgress(60, 4000)
      updateProgress(80, 6000)
      
      setTimeout(() => {
        setExtractionTasks(prev => prev.map(task => 
          task.id === taskId ? { 
            ...task, 
            progress: 100, 
            status: 'completed',
            endTime: new Date().toISOString()
          } : task
        ))
      }, 8000)
      
      return taskId
    } catch (err: any) {
      setError(err.message || '上传遥感影像失败')
      toast.error(err.message || '上传遥感影像失败，请重试')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // 获取遥感数据列表
  const fetchRemoteSensingData = useCallback(async (productId?: string, status?: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.get('/api/reports/remote-sensing', { 
      //   params: { productId, status } 
      // })
      // setRemoteSensingData(response.data)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      let filteredData = [...mockRemoteSensingData]
      
      if (productId) {
        filteredData = filteredData.filter(data => data.productId === productId)
      }
      
      if (status) {
        filteredData = filteredData.filter(data => data.analysisStatus === status)
      }
      
      setRemoteSensingData(filteredData)
    } catch (err: any) {
      setError(err.message || '获取遥感数据失败')
      toast.error('获取遥感数据失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 获取单个遥感数据
  const fetchRemoteSensingById = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.get(`/api/reports/remote-sensing/${id}`)
      // setCurrentRemoteSensing(response.data)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const data = mockRemoteSensingData.find(d => d.id === id)
      if (data) {
        setCurrentRemoteSensing(data)
      } else {
        throw new Error('遥感数据不存在')
      }
    } catch (err: any) {
      setError(err.message || '获取遥感数据详情失败')
      toast.error('获取遥感数据详情失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 获取用户的遥感数据
  const fetchUserRemoteSensingData = useCallback(async (status?: string) => {
    try {
      if (!user) throw new Error('用户未登录')
      
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.get('/api/user/reports/remote-sensing', {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      //   params: { status }
      // })
      // setUserRemoteSensingData(response.data)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 400))
      
      let filteredData = mockRemoteSensingData.filter(data => data.createdBy === user.id)
      
      if (status) {
        filteredData = filteredData.filter(data => data.analysisStatus === status)
      }
      
      setUserRemoteSensingData(filteredData)
    } catch (err: any) {
      setError(err.message || '获取用户遥感数据失败')
      toast.error('获取用户遥感数据失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // 获取提取任务列表
  const fetchExtractionTasks = useCallback(async (status?: string) => {
    try {
      if (!user) throw new Error('用户未登录')
      
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.get('/api/reports/tasks', {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      //   params: { status }
      // })
      // setExtractionTasks(response.data)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 400))
      
      // 模拟任务数据
      const mockTasks: ExtractionTask[] = [
        {
          id: 'task1',
          type: 'inspection',
          targetId: 'product1',
          status: 'completed',
          progress: 100,
          startTime: '2024-03-10T10:30:00Z',
          endTime: '2024-03-10T10:45:00Z',
          metadata: {
            fileName: 'inspection_report.pdf',
            fileSize: 1024 * 1024,
            uploadedBy: user.username,
            processingMethod: 'OCR + ML Analysis'
          }
        },
        {
          id: 'task2',
          type: 'remote_sensing',
          targetId: 'product2',
          status: 'processing',
          progress: 60,
          startTime: new Date(Date.now() - 300000).toISOString(),
          metadata: {
            fileName: 'field_image.tif',
            fileSize: 10 * 1024 * 1024,
            uploadedBy: user.username,
            processingMethod: 'Remote Sensing Analysis + ML'
          }
        }
      ]
      
      let filteredTasks = mockTasks
      if (status) {
        filteredTasks = mockTasks.filter(task => task.status === status)
      }
      
      setExtractionTasks(filteredTasks)
    } catch (err: any) {
      setError(err.message || '获取任务列表失败')
      toast.error('获取任务列表失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // 取消提取任务
  const cancelExtractionTask = useCallback(async (taskId: string) => {
    try {
      if (!user) throw new Error('用户未登录')
      
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // await axios.post(`/api/reports/tasks/${taskId}/cancel`, {}, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      // })
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 更新本地状态
      setExtractionTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: 'failed', 
              progress: 0,
              errorMessage: '任务已取消',
              endTime: new Date().toISOString()
            } 
          : task
      ))
      
      toast.success('任务已取消')
    } catch (err: any) {
      setError(err.message || '取消任务失败')
      toast.error(err.message || '取消任务失败，请重试')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // 集成OpenEO进行遥感分析
  const integrateWithOpenEO = useCallback(async (imageUrl: string, parameters: any) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 实际环境中可能会调用OpenEO API
      // const response = await axios.post('/api/integration/openeo/analyze', {
      //   imageUrl,
      //   parameters
      // }, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      // })
      // return response.data
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // 模拟OpenEO分析结果
      const mockResult = {
        processingJobId: `openeo_job_${Date.now()}`,
        status: 'completed',
        results: {
          vegetationIndices: {
            ndvi: 0.88,
            evi: 0.75,
            gndvi: 0.92
          },
          landCoverClassification: {
            cropArea: 485.5,
            waterArea: 5.2,
            otherArea: 9.3
          },
          healthAssessment: {
            overallHealth: 'excellent',
            affectedArea: 0,
            confidence: 0.97
          },
          yieldPrediction: {
            value: 6520,
            confidenceInterval: [6400, 6650]
          }
        },
        visualizationUrl: '/visualizations/openeo_result.jpg'
      }
      
      toast.success('OpenEO分析完成')
      return mockResult
    } catch (err: any) {
      setError(err.message || 'OpenEO集成失败')
      toast.error(err.message || 'OpenEO集成失败，请重试')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 从报告中提取文本
  const extractTextFromReport = useCallback(async (reportId: string): Promise<{ extractedText: string; confidence: number }> => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 实际环境中可能会调用OCR服务
      // const response = await axios.post('/api/reports/extract-text', { reportId }, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      // })
      // return response.data
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟OCR提取结果
      const mockExtraction = {
        extractedText: '粮食质量检测报告\n报告编号: QA-2024-001\n检测日期: 2024-03-10\n检测机构: 中国农科院粮食质量检测中心\n检测品种: 长粒香大米\n产地: 黑龙江五常\n批次号: WC20240310-001\n生产日期: 2024-02-28\n\n质量指标:\n水分含量: 13.5%\n杂质含量: 0.5%\n品种纯度: 99.8%\n蛋白质含量: 7.8%\n\n检测结论: 该批次大米质量优良，各项指标均符合国家标准。',
        confidence: 0.98
      }
      
      return mockExtraction
    } catch (err: any) {
      setError(err.message || '文本提取失败')
      toast.error(err.message || '文本提取失败，请重试')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 生成质量总结报告
  const generateQualitySummary = useCallback(async (reportIds: string[], remoteSensingIds: string[]): Promise<{ summary: string; rating: number }> => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 实际环境中的API调用
      // const response = await axios.post('/api/reports/quality-summary', {
      //   reportIds,
      //   remoteSensingIds
      // }, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      // })
      // return response.data
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 模拟质量总结
      const mockSummary = {
        summary: '根据质检报告和遥感数据分析，该批次粮食产品质量评级为优。质检报告显示各项指标均符合或优于国家标准，特别是品种纯度和蛋白质含量表现突出。遥感数据显示作物生长状况极佳，植被指数高，无病虫害影响，产量预测准确。综合判断，该产品具有较高的市场价值和竞争力。',
        rating: 98.5
      }
      
      toast.success('质量总结生成成功')
      return mockSummary
    } catch (err: any) {
      setError(err.message || '生成质量总结失败')
      toast.error(err.message || '生成质量总结失败，请重试')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const contextValue: ReportContextType = {
    inspectionReports,
    remoteSensingData,
    userReports,
    userRemoteSensingData,
    extractionTasks,
    currentReport,
    currentRemoteSensing,
    isLoading,
    error,
    uploadInspectionReport,
    fetchInspectionReports,
    fetchInspectionReportById,
    fetchUserInspectionReports,
    verifyInspectionReport,
    uploadRemoteSensingImage,
    fetchRemoteSensingData,
    fetchRemoteSensingById,
    fetchUserRemoteSensingData,
    fetchExtractionTasks,
    cancelExtractionTask,
    integrateWithOpenEO,
    extractTextFromReport,
    generateQualitySummary
  }

  return (
    <ReportContext.Provider value={contextValue}>
      {children}
    </ReportContext.Provider>
  )
}

// 自定义Hook：使用报告上下文
export const useReport = () => {
  const context = useContext(ReportContext)
  if (context === undefined) {
    throw new Error('useReport must be used within a ReportProvider')
  }
  return context
}