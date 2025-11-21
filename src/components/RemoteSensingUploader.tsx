import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Upload,
  CloudUpload,
  Camera,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Close,
  ZoomIn,
  ArrowForward,
  ChevronRight,
  FileDownload,
  BarChart2,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { remoteSensingService, RemoteSensingData, QualityInspectionReport } from '../services/remoteSensingService';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

interface RemoteSensingUploaderProps {
  onDataUploaded?: (type: 'remoteSensing' | 'inspection', data: RemoteSensingData | QualityInspectionReport) => void;
}

const RemoteSensingUploader: React.FC<RemoteSensingUploaderProps> = ({ onDataUploaded }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedData, setUploadedData] = useState<{
    remoteSensing: RemoteSensingData[];
    inspectionReports: QualityInspectionReport[];
  }>({
    remoteSensing: [],
    inspectionReports: [],
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理标签页切换
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (activeTab === 0) {
      // 遥感图像
      const validImageTypes = ['image/jpeg', 'image/png', 'image/tiff'];
      if (!validImageTypes.includes(file.type)) {
        showSnackbar('请选择有效的图像文件 (JPEG, PNG, TIFF)', 'error');
        return;
      }
      uploadRemoteSensingImage(file);
    } else {
      // 质检报告
      const validReportTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validReportTypes.includes(file.type)) {
        showSnackbar('请选择有效的报告文件 (JPEG, PNG, PDF)', 'error');
        return;
      }
      uploadInspectionReport(file);
    }

    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 上传遥感图像
  const uploadRemoteSensingImage = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
          }
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 200);

      // 调用服务上传图像
      const data = await remoteSensingService.uploadRemoteSensingImage(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // 更新已上传数据
      setUploadedData((prev) => ({
        ...prev,
        remoteSensing: [data, ...prev.remoteSensing],
      }));

      // 通知父组件
      if (onDataUploaded) {
        onDataUploaded('remoteSensing', data);
      }

      showSnackbar('遥感图像上传成功，正在分析...', 'success');
    } catch (error) {
      showSnackbar('上传失败，请重试', 'error');
    } finally {
      setIsUploading(false);
      // 重置进度条
      setTimeout(() => setUploadProgress(0), 500);
    }
  };

  // 上传质检报告
  const uploadInspectionReport = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
          }
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 200);

      // 调用服务上传报告
      const report = await remoteSensingService.uploadQualityInspectionReport(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // 更新已上传数据
      setUploadedData((prev) => ({
        ...prev,
        inspectionReports: [report, ...prev.inspectionReports],
      }));

      // 通知父组件
      if (onDataUploaded) {
        onDataUploaded('inspection', report);
      }

      showSnackbar('质检报告上传成功，正在提取数据...', 'success');
    } catch (error) {
      showSnackbar('上传失败，请重试', 'error');
    } finally {
      setIsUploading(false);
      // 重置进度条
      setTimeout(() => setUploadProgress(0), 500);
    }
  };

  // 显示通知
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // 关闭通知
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" fontSize="small" />;
      case 'processing':
        return <Clock color="primary" fontSize="small" />;
      case 'failed':
        return <AlertCircle color="error" fontSize="small" />;
      default:
        return <Clock color="warning" fontSize="small" />;
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '处理完成';
      case 'processing':
        return '处理中';
      case 'failed':
        return '处理失败';
      default:
        return '等待处理';
    }
  };

  // 渲染遥感数据卡片
  const renderRemoteSensingCard = (data: RemoteSensingData) => (
    <Card key={data.id} elevation={2} className="mb-4 overflow-hidden">
      <Grid container spacing={0}>
        <Grid item xs={4} className="p-0">
          <CardMedia
            component="img"
            height="140"
            image={data.imageUrl}
            alt="遥感图像"
            sx={{ cursor: 'pointer' }}
            onClick={() => setSelectedImage(data.imageUrl)}
          />
          <div className="absolute top-1 right-1">
            <Tooltip title="查看大图">
              <IconButton size="small" onClick={() => setSelectedImage(data.imageUrl)}>
                <ZoomIn fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </Grid>
        <Grid item xs={8} className="p-3">
          <div className="flex justify-between items-start mb-2">
            <Typography variant="subtitle1" fontWeight="bold">
              遥感图像分析
            </Typography>
            <Chip
              icon={getStatusIcon(data.processingStatus)}
              label={getStatusText(data.processingStatus)}
              size="small"
              color={
                data.processingStatus === 'completed'
                  ? 'success'
                  : data.processingStatus === 'processing'
                  ? 'primary'
                  : data.processingStatus === 'failed'
                  ? 'error'
                  : 'warning'
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
            <div className="text-gray-600">植被指数: {data.analysisResult.vegetationIndex.toFixed(2)}</div>
            <div className="text-gray-600">土壤湿度: {data.analysisResult.soilMoisture.toFixed(1)}%</div>
            <div className="text-gray-600">预估产量: {data.analysisResult.estimatedYield.toFixed(0)} kg/亩</div>
            <div className="text-gray-600">生育期: {data.analysisResult.growthStage}</div>
          </div>
          <div className="mt-2">
            <Typography variant="caption" color="text.secondary">
              采集日期: {data.analysisResult.acquisitionDate}
            </Typography>
          </div>
          <div className="mt-2">
            <Typography variant="subtitle2" className="mb-1">质量评估: {data.analysisResult.qualityAssessment.toFixed(0)}/100</Typography>
            <LinearProgress
              variant="determinate"
              value={data.analysisResult.qualityAssessment}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </div>
          <CardContent />
        </Grid>
      </Grid>
      <CardActions sx={{ px: 2, py: 1 }}>
        <Button size="small" startIcon={<FileDownload fontSize="small" />}>
          下载报告
        </Button>
      </CardActions>
    </Card>
  );

  // 渲染质检报告卡片
  const renderInspectionReportCard = (report: QualityInspectionReport) => (
    <Card key={report.id} elevation={2} className="mb-4 overflow-hidden">
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-3">
          <Typography variant="subtitle1" fontWeight="bold">
            质检报告
          </Typography>
          <Chip
            icon={getStatusIcon(report.processingStatus)}
            label={getStatusText(report.processingStatus)}
            size="small"
            color={
              report.processingStatus === 'completed'
                ? 'success'
                : report.processingStatus === 'processing'
                ? 'primary'
                : report.processingStatus === 'failed'
                ? 'error'
                : 'warning'
            }
          />
        </div>
        
        {report.processingStatus === 'completed' && (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
              <div className="flex items-center gap-2">
                <BarChart2 fontSize="small" color="primary" />
                <div>
                  <Typography variant="caption" color="text.secondary">水分含量</Typography>
                  <Typography variant="body2" fontWeight="bold">{report.extractedData.moisture}%</Typography>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BarChart2 fontSize="small" color="secondary" />
                <div>
                  <Typography variant="caption" color="text.secondary">杂质率</Typography>
                  <Typography variant="body2" fontWeight="bold">{report.extractedData.impurity}%</Typography>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BarChart2 fontSize="small" color="success" />
                <div>
                  <Typography variant="caption" color="text.secondary">品种纯度</Typography>
                  <Typography variant="body2" fontWeight="bold">{report.extractedData.purity}%</Typography>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BarChart2 fontSize="small" color="error" />
                <div>
                  <Typography variant="caption" color="text.secondary">蛋白质含量</Typography>
                  <Typography variant="body2" fontWeight="bold">{report.extractedData.protein}%</Typography>
                </div>
              </div>
            </div>
            
            <Divider sx={{ my: 2 }} />
            
            <div className="text-xs text-gray-600 mb-2">
              <div className="flex justify-between mb-1">
                <span>报告编号:</span>
                <span style={{ fontWeight: 'bold' }}>{report.extractedData.reportNumber}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>检验机构:</span>
                <span style={{ fontWeight: 'bold' }}>{report.extractedData.inspectionAgency}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>检验员:</span>
                <span style={{ fontWeight: 'bold' }}>{report.extractedData.inspectorName}</span>
              </div>
              <div className="flex justify-between">
                <span>检验日期:</span>
                <span style={{ fontWeight: 'bold' }}>{report.extractedData.inspectionDate}</span>
              </div>
            </div>
          </>
        )}
        
        {report.processingStatus === 'failed' && report.errorMessage && (
          <Alert severity="error" variant="filled" sx={{ mt: 2 }}>
            {report.errorMessage}
          </Alert>
        )}
      </CardContent>
      <CardActions sx={{ px: 2, py: 1 }}>
        <Button 
          size="small" 
          startIcon={<FileText fontSize="small" />}
          onClick={() => setSelectedReportId(report.id)}
        >
          查看报告
        </Button>
        <Button size="small" startIcon={<FileDownload fontSize="small" />}>
          下载报告
        </Button>
      </CardActions>
    </Card>
  );

  // 渲染上传区域
  const renderUploadZone = () => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="transition-all duration-300"
    >
      <Paper
        elevation={2}
        className="p-6 border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer text-center"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
          accept={activeTab === 0 ? 'image/jpeg,image/png,image/tiff' : 'image/jpeg,image/png,application/pdf'}
        />
        <Box sx={{ mb: 3 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', width: 80, height: 80 }}>
            {activeTab === 0 ? <Camera fontSize="large" /> : <FileText fontSize="large" />}
          </Avatar>
        </Box>
        <Typography variant="h6" gutterBottom>
          {activeTab === 0 ? '上传遥感图像' : '上传质检报告'}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          {activeTab === 0
            ? '支持 JPG、PNG、TIFF 格式，文件大小不超过 10MB'
            : '支持 JPG、PNG、PDF 格式，文件大小不超过 20MB'}
        </Typography>
        <Button
          variant="contained"
          component="span"
          startIcon={<CloudUpload />}
        >
          选择文件
        </Button>
      </Paper>
    </motion.div>
  );

  // 渲染上传进度
  const renderUploadProgress = () => {
    if (!isUploading) return null;

    return (
      <Paper elevation={3} className="p-4 mt-4">
        <div className="flex justify-between items-center mb-2">
          <Typography variant="subtitle2">
            正在上传...
          </Typography>
          <Typography variant="caption">
            {uploadProgress}%
          </Typography>
        </div>
        <LinearProgress
          variant="determinate"
          value={uploadProgress}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Paper>
    );
  };

  // 渲染已上传数据列表
  const renderUploadedDataList = () => {
    const dataToShow = activeTab === 0 ? uploadedData.remoteSensing : uploadedData.inspectionReports;

    if (dataToShow.length === 0) {
      return (
        <Paper elevation={1} className="p-6 text-center mt-6">
          <Typography variant="body1" color="text.secondary">
            暂无上传的数据
          </Typography>
        </Paper>
      );
    }

    return (
      <div className="mt-6">
        <Typography variant="subtitle1" fontWeight="bold" mb={2}>
          已上传数据 ({dataToShow.length})
        </Typography>
        <div>
          {dataToShow.map((item) =>
            activeTab === 0
              ? renderRemoteSensingCard(item as RemoteSensingData)
              : renderInspectionReportCard(item as QualityInspectionReport)
          )}
        </div>
      </div>
    );
  };

  // 渲染图像预览对话框
  const renderImagePreviewDialog = () => (
    <Dialog
      open={!!selectedImage}
      onClose={() => setSelectedImage(null)}
      maxWidth="lg"
    >
      <DialogTitle className="flex justify-between items-center">
        <Typography variant="h6">遥感图像预览</Typography>
        <IconButton onClick={() => setSelectedImage(null)}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        <div className="flex justify-center">
          <img
            src={selectedImage || ''}
            alt="预览图像"
            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setSelectedImage(null)}>
          关闭
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Paper elevation={0} sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<Camera />} label="遥感图像" />
          <Tab icon={<FileText />} label="质检报告" />
        </Tabs>
      </Paper>

      {renderUploadZone()}
      {renderUploadProgress()}
      {renderUploadedDataList()}
      {renderImagePreviewDialog()}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RemoteSensingUploader;
