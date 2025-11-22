import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Avatar,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const ResetPasswordSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [countdown, setCountdown] = useState(5);

  // 倒计时自动跳转
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(timer);
          // 跳转到登录页面
          navigate('/login');
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    // 清理定时器
    return () => clearInterval(timer);
  }, [navigate]);

  // 立即跳转处理
  const handleImmediateRedirect = () => {
    navigate('/login');
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        py: 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          borderRadius: 2,
          width: '100%',
          textAlign: 'center',
          backgroundColor: 'background.paper',
          boxShadow: theme.shadows[3],
        }}
      >
        {/* 成功图标 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 4,
          }}
        >
          <Avatar
            sx={{
              bgcolor: theme.palette.success.main,
              width: isMobile ? 70 : 80,
              height: isMobile ? 70 : 80,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </Avatar>
        </Box>

        {/* 成功消息 */}
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          密码重置成功！
        </Typography>

        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
          您的密码已成功重置，请使用新密码登录系统。
        </Typography>

        {/* 安全提示卡片 */}
        <Card sx={{ mb: 4, bgcolor: 'background.default', borderLeft: '4px solid', borderColor: theme.palette.info.main }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              <strong>安全提示：</strong> 请妥善保管您的新密码，避免与其他网站使用相同密码。
            </Typography>
          </CardContent>
        </Card>

        {/* 倒计时信息 */}
        <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
          页面将在 <strong>{countdown}</strong> 秒后自动跳转至登录页面
        </Typography>

        {/* 立即跳转按钮 */}
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/login"
          fullWidth
          size={isMobile ? 'small' : 'medium'}
          onClick={handleImmediateRedirect}
          sx={{
            py: 1.5,
            fontWeight: 'bold',
          }}
        >
          立即前往登录
        </Button>

        {/* 备选链接 */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            如有问题，请联系客服支持
          </Typography>
        </Box>
      </Paper>

      {/* 页脚版权信息 */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="caption" color="text.secondary">
          © 2024 粮食拍卖平台 - 版权所有
        </Typography>
      </Box>
    </Container>
  );
};

export default ResetPasswordSuccessPage;
