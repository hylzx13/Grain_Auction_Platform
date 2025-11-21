import axios from 'axios';

// 遥感数据接口定义
export interface RemoteSensingData {
  id: string;
  imageUrl: string;
  analysisResult: {
    vegetationIndex: number;
    soilMoisture: number;
    estimatedYield: number;
    growthStage: string;
    qualityAssessment: number;
    acquisitionDate: string;
  };
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
}

// 质检报告接口定义
export interface QualityInspectionReport {
  id: string;
  reportFileUrl: string;
  extractedData: {
    moisture: number;
    impurity: number;
    purity: number;
    protein: number;
    fattyAcid?: number;
    glutenContent?: number;
    amyloseContent?: number;
    inspectionDate: string;
    inspectionAgency: string;
    inspectorName: string;
    reportNumber: string;
  };
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
}

// OpenEO配置
const OPENEO_API_URL = 'https://earthengine.openeo.org/v1.0';
const OPENEO_AUTH_TOKEN = process.env.REACT_APP_OPENEO_AUTH_TOKEN || '';

// DeepSeek API配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/ocr';
const DEEPSEEK_API_KEY = process.env.REACT_APP_DEEPSEEK_API_KEY || '';

// 初始化OpenEO客户端
class OpenEOClient {
  private baseUrl: string;
  private authToken: string;
  private client: axios.AxiosInstance;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // 获取可用的数据集合
  async getCollections() {
    try {
      const response = await this.client.get('/collections');
      return response.data.collections;
    } catch (error) {
      console.error('Failed to fetch OpenEO collections:', error);
      throw error;
    }
  }

  // 执行空间数据查询
  async executeQuery(bbox: [number, number, number, number], dateRange: [string, string]) {
    try {
      const processGraph = {
        process_graph: {
          loadcollection: {
            process_id: 'load_collection',
            arguments: {
              id: 'COPERNICUS/S2_SR',
              spatial_extent: {
                west: bbox[0],
                south: bbox[1],
                east: bbox[2],
                north: bbox[3],
              },
              temporal_extent: dateRange,
              bands: ['B4', 'B8', 'B11'],
            },
          },
          ndvi: {
            process_id: 'ndvi',
            arguments: {
              data: { from_node: 'loadcollection' },
              nir: 'B8',
              red: 'B4',
            },
          },
          savi: {
            process_id: 'apply',
            arguments: {
              data: { from_node: 'loadcollection' },
              process: {
                process_graph: {
                  red: {
                    process_id: 'array_element',
                    arguments: {
                      data: { from_parameter: 'data' },
                      label: 'B4',
                    },
                  },
                  nir: {
                    process_id: 'array_element',
                    arguments: {
                      data: { from_parameter: 'data' },
                      label: 'B8',
                    },
                  },
                  add_nir_red: {
                    process_id: 'add',
                    arguments: {
                      x: { from_node: 'nir' },
                      y: { from_node: 'red' },
                    },
                  },
                  sub_nir_red: {
                    process_id: 'subtract',
                    arguments: {
                      x: { from_node: 'nir' },
                      y: { from_node: 'red' },
                    },
                  },
                  add_one: {
                    process_id: 'add',
                    arguments: {
                      x: { from_node: 'add_nir_red' },
                      y: 0.4,
                    },
                  },
                  multiply_factor: {
                    process_id: 'multiply',
                    arguments: {
                      x: 1.5,
                      y: { from_node: 'sub_nir_red' },
                    },
                  },
                  divide: {
                    process_id: 'divide',
                    arguments: {
                      x: { from_node: 'multiply_factor' },
                      y: { from_node: 'add_one' },
                    },
                  },
                },
              },
            },
          },
          reduce: {
            process_id: 'reduce_dimension',
            arguments: {
              data: { from_node: 'ndvi' },
              dimension: 't',
              reducer: {
                process_graph: {
                  mean: {
                    process_id: 'mean',
                    arguments: {
                      data: { from_parameter: 'data' },
                    },
                  },
                },
              },
            },
          },
          save: {
            process_id: 'save_result',
            arguments: {
              data: { from_node: 'reduce' },
              format: 'PNG',
            },
          },
        },
      };

      const response = await this.client.post('/jobs', processGraph);
      return response.data;
    } catch (error) {
      console.error('Failed to execute OpenEO query:', error);
      throw error;
    }
  }

  // 获取作业状态
  async getJobStatus(jobId: string) {
    try {
      const response = await this.client.get(`/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get job status for ${jobId}:`, error);
      throw error;
    }
  }

  // 启动作业
  async startJob(jobId: string) {
    try {
      const response = await this.client.post(`/jobs/${jobId}/results`);
      return response.data;
    } catch (error) {
      console.error(`Failed to start job ${jobId}:`, error);
      throw error;
    }
  }
}

// DeepSeek OCR客户端
class DeepSeekOCRClient {
  private baseUrl: string;
  private apiKey: string;
  private client: axios.AxiosInstance;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // 分析图像中的文本
  async analyzeImage(imageUrl: string) {
    try {
      const response = await this.client.post('', {
        image_url: imageUrl,
        model: 'deepseek-ocr',
        lang: 'zh',
        output_format: 'json',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to analyze image with DeepSeek OCR:', error);
      throw error;
    }
  }

  // 提取质检报告数据
  async extractInspectionReport(imageUrl: string) {
    try {
      const ocrResult = await this.analyzeImage(imageUrl);
      
      // 从OCR结果中提取结构化数据
      const extractedData = this.parseInspectionReport(ocrResult);
      
      return extractedData;
    } catch (error) {
      console.error('Failed to extract inspection report data:', error);
      throw error;
    }
  }

  // 解析质检报告
  private parseInspectionReport(ocrData: any) {
    // 模拟从OCR结果中提取结构化数据
    // 实际项目中需要根据OCR返回的具体格式进行解析
    const text = ocrData.text || '';
    
    // 使用正则表达式从文本中提取关键信息
    const moistureMatch = text.match(/水分[：:](\d+\.?\d*)/);
    const impurityMatch = text.match(/杂质[：:](\d+\.?\d*)/);
    const purityMatch = text.match(/纯度[：:](\d+\.?\d*)/);
    const proteinMatch = text.match(/蛋白质[：:](\d+\.?\d*)/);
    const reportNumberMatch = text.match(/报告编号[：:]([^\n]+)/);
    const agencyMatch = text.match(/检验机构[：:]([^\n]+)/);
    const dateMatch = text.match(/检验日期[：:](\d{4}[-/]\d{1,2}[-/]\d{1,2})/);
    const inspectorMatch = text.match(/检验员[：:]([^\n]+)/);

    return {
      moisture: moistureMatch ? parseFloat(moistureMatch[1]) : 0,
      impurity: impurityMatch ? parseFloat(impurityMatch[1]) : 0,
      purity: purityMatch ? parseFloat(purityMatch[1]) : 0,
      protein: proteinMatch ? parseFloat(proteinMatch[1]) : 0,
      inspectionDate: dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0],
      inspectionAgency: agencyMatch ? agencyMatch[1].trim() : '未知机构',
      inspectorName: inspectorMatch ? inspectorMatch[1].trim() : '未知',
      reportNumber: reportNumberMatch ? reportNumberMatch[1].trim() : '',
    };
  }
}

// 遥感图像分析服务
class RemoteSensingService {
  private openEOClient: OpenEOClient;
  private deepSeekOCRClient: DeepSeekOCRClient;

  constructor() {
    this.openEOClient = new OpenEOClient(OPENEO_API_URL, OPENEO_AUTH_TOKEN);
    this.deepSeekOCRClient = new DeepSeekOCRClient(DEEPSEEK_API_URL, DEEPSEEK_API_KEY);
  }

  // 上传遥感图像
  async uploadRemoteSensingImage(imageFile: File): Promise<RemoteSensingData> {
    try {
      // 创建FormData对象
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('timestamp', new Date().toISOString());

      // 上传图像到服务器
      const uploadResponse = await axios.post('/api/upload/remote-sensing', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { imageUrl, id } = uploadResponse.data;

      // 创建初始遥感数据对象
      const remoteSensingData: RemoteSensingData = {
        id,
        imageUrl,
        analysisResult: {
          vegetationIndex: 0,
          soilMoisture: 0,
          estimatedYield: 0,
          growthStage: '未知',
          qualityAssessment: 0,
          acquisitionDate: new Date().toISOString().split('T')[0],
        },
        processingStatus: 'pending',
      };

      // 开始异步分析
      this.analyzeRemoteSensingImage(id, imageUrl);

      return remoteSensingData;
    } catch (error) {
      console.error('Failed to upload remote sensing image:', error);
      throw error;
    }
  }

  // 分析遥感图像
  private async analyzeRemoteSensingImage(id: string, imageUrl: string): Promise<void> {
    try {
      // 更新状态为处理中
      await axios.patch(`/api/remote-sensing/${id}`, {
        processingStatus: 'processing',
      });

      // 模拟分析过程
      // 实际项目中这里应该调用OpenEO API进行真正的分析
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 模拟分析结果
      const analysisResult = {
        vegetationIndex: 0.75 + Math.random() * 0.2,
        soilMoisture: 45 + Math.random() * 10,
        estimatedYield: 8000 + Math.random() * 2000,
        growthStage: ['抽穗期', '成熟期', '灌浆期', '乳熟期'][Math.floor(Math.random() * 4)],
        qualityAssessment: 85 + Math.random() * 15,
        acquisitionDate: new Date().toISOString().split('T')[0],
      };

      // 更新分析结果
      await axios.patch(`/api/remote-sensing/${id}`, {
        processingStatus: 'completed',
        analysisResult,
      });
    } catch (error) {
      console.error(`Failed to analyze remote sensing image ${id}:`, error);
      
      // 更新状态为失败
      await axios.patch(`/api/remote-sensing/${id}`, {
        processingStatus: 'failed',
        errorMessage: '分析失败，请重试',
      });
    }
  }

  // 获取遥感数据详情
  async getRemoteSensingData(id: string): Promise<RemoteSensingData> {
    try {
      const response = await axios.get(`/api/remote-sensing/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get remote sensing data for ${id}:`, error);
      throw error;
    }
  }

  // 获取地块的历史遥感数据
  async getFieldRemoteSensingHistory(fieldId: string): Promise<RemoteSensingData[]> {
    try {
      const response = await axios.get(`/api/fields/${fieldId}/remote-sensing`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get remote sensing history for field ${fieldId}:`, error);
      throw error;
    }
  }

  // 使用OpenEO分析特定地块
  async analyzeFieldWithOpenEO(bbox: [number, number, number, number], dateRange: [string, string]) {
    try {
      // 创建并启动作业
      const jobInfo = await this.openEOClient.executeQuery(bbox, dateRange);
      const jobId = jobInfo.job_id;
      
      // 启动作业
      await this.openEOClient.startJob(jobId);
      
      return { jobId, status: 'processing' };
    } catch (error) {
      console.error('Failed to analyze field with OpenEO:', error);
      throw error;
    }
  }

  // 上传质检报告
  async uploadQualityInspectionReport(reportFile: File): Promise<QualityInspectionReport> {
    try {
      // 创建FormData对象
      const formData = new FormData();
      formData.append('report', reportFile);
      formData.append('timestamp', new Date().toISOString());

      // 上传报告到服务器
      const uploadResponse = await axios.post('/api/upload/inspection-report', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { reportFileUrl, id } = uploadResponse.data;

      // 创建初始报告对象
      const report: QualityInspectionReport = {
        id,
        reportFileUrl,
        extractedData: {
          moisture: 0,
          impurity: 0,
          purity: 0,
          protein: 0,
          inspectionDate: new Date().toISOString().split('T')[0],
          inspectionAgency: '',
          inspectorName: '',
          reportNumber: '',
        },
        processingStatus: 'pending',
      };

      // 开始异步分析
      this.extractReportData(id, reportFileUrl);

      return report;
    } catch (error) {
      console.error('Failed to upload quality inspection report:', error);
      throw error;
    }
  }

  // 提取报告数据
  private async extractReportData(id: string, reportFileUrl: string): Promise<void> {
    try {
      // 更新状态为处理中
      await axios.patch(`/api/inspection-reports/${id}`, {
        processingStatus: 'processing',
      });

      // 使用DeepSeek OCR提取数据
      const extractedData = await this.deepSeekOCRClient.extractInspectionReport(reportFileUrl);

      // 更新报告数据
      await axios.patch(`/api/inspection-reports/${id}`, {
        processingStatus: 'completed',
        extractedData,
      });
    } catch (error) {
      console.error(`Failed to extract data from report ${id}:`, error);
      
      // 更新状态为失败
      await axios.patch(`/api/inspection-reports/${id}`, {
        processingStatus: 'failed',
        errorMessage: '数据提取失败，请重试',
      });
    }
  }

  // 获取质检报告详情
  async getQualityInspectionReport(id: string): Promise<QualityInspectionReport> {
    try {
      const response = await axios.get(`/api/inspection-reports/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get quality inspection report for ${id}:`, error);
      throw error;
    }
  }

  // 生成质量评估综合报告
  async generateComprehensiveReport(remoteSensingIds: string[], inspectionReportIds: string[]) {
    try {
      const response = await axios.post('/api/reports/comprehensive', {
        remoteSensingIds,
        inspectionReportIds,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to generate comprehensive report:', error);
      throw error;
    }
  }
}

// 导出服务实例
export const remoteSensingService = new RemoteSensingService();

export default remoteSensingService;