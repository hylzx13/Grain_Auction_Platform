import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab
} from '@mui/material';
import { Close } from '@mui/icons-material';

interface TermsPrivacyModalProps {
  open: boolean;
  onClose: () => void;
  requireReadingTime?: boolean;
  onReadingComplete?: () => void;
}

const TermsPrivacyModal: React.FC<TermsPrivacyModalProps> = ({
  open,
  onClose,
  requireReadingTime = false,
  onReadingComplete
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [readingTime, setReadingTime] = useState(5);
  const [canClose, setCanClose] = useState(!requireReadingTime);
  const [activeTab, setActiveTab] = useState(0);

  // 重置阅读时间和关闭状态
  useEffect(() => {
    if (open && requireReadingTime) {
      setReadingTime(5);
      setCanClose(false);
      
      // 开始倒计时
      const timer = setInterval(() => {
        setReadingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanClose(true); // 倒计时结束，激活按钮
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else if (open) {
      setCanClose(true);
    }
  }, [open, requireReadingTime]);

  // 服务条款内容
  const termsContent = (
    <>
      <Typography variant="h6" gutterBottom>接受条款</Typography>
      <Typography variant="body2" paragraph>
        通过访问或使用我们的粮食交易平台，您同意遵守本服务条款。如果您不同意，请勿使用我们的服务。
      </Typography>

      <Typography variant="h6" gutterBottom>服务描述</Typography>
      <Typography variant="body2" paragraph>
        我们的平台连接粮食买卖双方，提供交易、支付和物流支持。我们作为中介，不直接参与交易。
      </Typography>

      <Typography variant="h6" gutterBottom>用户账户</Typography>
      <Typography variant="body2" paragraph>
        您需要注册账户来使用某些功能。您负责保持账户信息安全，并对其所有活动负责。
      </Typography>

      <Typography variant="h6" gutterBottom>用户行为</Typography>
      <Typography variant="body2" paragraph>
        您同意：
      </Typography>
      <ul>
        <li>提供准确信息。</li>
        <li>不从事非法或欺诈活动。</li>
        <li>不侵犯他人知识产权。</li>
        <li>遵守所有适用法律。</li>
      </ul>

      <Typography variant="h6" gutterBottom>交易条款</Typography>
      <Typography variant="body2" paragraph>
        <strong>买卖双方责任</strong>：卖方确保粮食质量符合描述，买方按时支付。
      </Typography>
      <Typography variant="body2" paragraph>
        <strong>支付</strong>：支付通过第三方处理，我们不对支付问题负责。
      </Typography>
      <Typography variant="body2" paragraph>
        <strong>交付</strong>：交付由买卖双方协商，我们可能提供物流信息但不负责延迟或损失。
      </Typography>
      <Typography variant="body2" paragraph>
        <strong>争议解决</strong>：争议应首先通过平台沟通解决。如无法解决，可寻求法律途径。
      </Typography>

      <Typography variant="h6" gutterBottom>知识产权</Typography>
      <Typography variant="body2" paragraph>
        平台内容（如文本、图像、标志）是我们的财产，未经许可不得使用。
      </Typography>

      <Typography variant="h6" gutterBottom>免责声明</Typography>
      <Typography variant="body2" paragraph>
        服务按"现状"提供，我们不保证无错误或中断。我们不承担因使用服务引起的间接损失。
      </Typography>

      <Typography variant="h6" gutterBottom>终止</Typography>
      <Typography variant="body2" paragraph>
        我们可能终止或暂停您的账户，如果您违反条款。
      </Typography>

      <Typography variant="h6" gutterBottom>争议解决</Typography>
      <Typography variant="body2" paragraph>
        任何争议应通过友好协商解决。协商不成，提交有管辖权的法院解决。
      </Typography>

      <Typography variant="h6" gutterBottom>适用法律</Typography>
      <Typography variant="body2" paragraph>
        本条款受[国家/地区]法律管辖。
      </Typography>

      <Typography variant="h6" gutterBottom>变更</Typography>
      <Typography variant="body2" paragraph>
        我们可能修改条款。修改后，继续使用服务表示接受新条款。
      </Typography>
    </>
  );

  // 隐私政策内容
  const privacyContent = (
    <>
      <Typography variant="h6" gutterBottom>引言</Typography>
      <Typography variant="body2" paragraph>
        欢迎使用我们的粮食交易平台。我们重视您的隐私，并致力于保护您的个人信息。本隐私政策解释了我们会收集哪些信息、如何使用这些信息，以及您如何控制您的信息。
      </Typography>

      <Typography variant="h6" gutterBottom>信息收集</Typography>
      <Typography variant="body2" paragraph>
        我们可能收集以下类型的个人信息：
      </Typography>
      <ul>
        <li><strong>身份信息</strong>：如姓名、地址、电话号码、电子邮件地址。</li>
        <li><strong>交易信息</strong>：如交易记录、支付信息、订单详情。</li>
        <li><strong>技术信息</strong>：如IP地址、浏览器类型、访问时间、Cookie数据。</li>
        <li><strong>其他信息</strong>：您自愿提供的任何其他信息，例如在反馈中。</li>
      </ul>

      <Typography variant="h6" gutterBottom>信息使用</Typography>
      <Typography variant="body2" paragraph>
        我们使用收集的信息用于以下目的：
      </Typography>
      <ul>
        <li>提供和维护平台服务。</li>
        <li>处理交易和交付。</li>
        <li>与您沟通，例如发送通知。</li>
        <li>改进我们的服务。</li>
        <li>遵守法律义务。</li>
      </ul>

      <Typography variant="h6" gutterBottom>信息共享</Typography>
      <Typography variant="body2" paragraph>
        我们不会出售您的个人信息。我们可能在以下情况下共享信息：
      </Typography>
      <ul>
        <li>与必要的服务提供商（如支付处理商、物流公司）。</li>
        <li>为遵守法律要求或保护我们的权利。</li>
        <li>在业务转移时，如合并或收购。</li>
      </ul>

      <Typography variant="h6" gutterBottom>用户权利</Typography>
      <Typography variant="body2" paragraph>
        您有权：
      </Typography>
      <ul>
        <li>访问和获取您的个人信息副本。</li>
        <li>更正不准确的信息。</li>
        <li>删除您的个人信息，在适用法律允许的情况下。</li>
        <li>限制或反对处理您的信息。</li>
      </ul>

      <Typography variant="h6" gutterBottom>数据安全</Typography>
      <Typography variant="body2" paragraph>
        我们采取合理的安全措施保护您的信息，但无法保证绝对安全。
      </Typography>

      <Typography variant="h6" gutterBottom>Cookie和跟踪技术</Typography>
      <Typography variant="body2" paragraph>
        我们使用Cookie来增强用户体验。您可以通过浏览器设置禁用Cookie。
      </Typography>

      <Typography variant="h6" gutterBottom>政策变更</Typography>
      <Typography variant="body2" paragraph>
        我们可能更新本政策。变更后，我们会在平台上通知您。
      </Typography>

      <Typography variant="h6" gutterBottom>联系方式</Typography>
      <Typography variant="body2" paragraph>
        如果您有任何问题，请通过[电子邮件地址]联系我们。
      </Typography>
    </>
  );

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (canClose) {
          onReadingComplete?.();
          onClose();
        }
      }}
      maxWidth="md"
      fullWidth={isMobile}
      scroll="paper"
      sx={{
        '& .MuiDialog-paper': {
          maxHeight: '90vh',
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5">
          服务条款与隐私政策
        </Typography>
        <IconButton onClick={() => {
          if (canClose) {
            onReadingComplete?.();
            onClose();
          }
        }} disabled={!canClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              fontSize: '1rem',
              py: 1.5,
            },
            '& .Mui-selected': {
              fontWeight: 'bold',
            }
          }}
        >
          <Tab label="服务条款" />
          <Tab label="隐私政策" />
        </Tabs>
      </Box>
      
      <DialogContent sx={{ mt: 2, overflow: 'auto' }}>
        {activeTab === 0 && termsContent}
        {activeTab === 1 && privacyContent}
      </DialogContent>
      
      <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', p: 2 }}>
        {requireReadingTime && !canClose && (
          <Typography variant="body2" color="text.secondary">
            请阅读完全部内容，{readingTime}秒后可关闭
          </Typography>
        )}
        <Button
          onClick={() => {
            onReadingComplete?.();
            onClose();
          }}
          variant={canClose ? "contained" : "outlined"}
          disabled={!canClose}
          sx={{
            ml: 'auto',
            transition: 'all 0.3s ease',
            // 禁用状态（灰色）
            ...(!canClose && {
              bgcolor: 'rgba(0, 0, 0, 0.08)',
              color: 'rgba(0, 0, 0, 0.38)',
              borderColor: 'rgba(0, 0, 0, 0.23)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.12)',
                borderColor: 'rgba(0, 0, 0, 0.23)',
              }
            }),
            // 激活状态（绿色）
            ...(canClose && {
              bgcolor: '#4CAF50',
              '&:hover': {
                bgcolor: '#388E3C',
              }
            })
          }}
        >
          我已阅读并理解全部内容
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TermsPrivacyModal;