import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ResetPasswordSuccessPage from '../ResetPasswordSuccessPage';

const theme = createTheme();

// 模拟setTimeout
jest.useFakeTimers();

describe('ResetPasswordSuccessPage', () => {
  // 测试页面渲染
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <ResetPasswordSuccessPage />
        </ThemeProvider>
      </BrowserRouter>
    );
    expect(screen.getByText('密码重置成功')).toBeInTheDocument();
  });

  // 测试成功消息和图标显示
  it('displays success message and icon', () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <ResetPasswordSuccessPage />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // 验证成功图标
    const successIcon = screen.getByTestId('success-icon');
    expect(successIcon).toBeInTheDocument();
    
    // 验证成功消息
    expect(screen.getByText('您的密码已成功重置')).toBeInTheDocument();
    expect(screen.getByText('请使用新密码登录')).toBeInTheDocument();
  });

  // 测试倒计时显示
  it('displays countdown timer', () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <ResetPasswordSuccessPage />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // 验证倒计时显示初始值
    expect(screen.getByText('将在 5 秒后自动跳转到登录页')).toBeInTheDocument();
    
    // 模拟1秒后
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // 验证倒计时更新
    expect(screen.getByText('将在 4 秒后自动跳转到登录页')).toBeInTheDocument();
  });

  // 测试立即跳转按钮功能
  it('navigates to login page when immediate button is clicked', () => {
    // 模拟导航函数
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <ResetPasswordSuccessPage />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // 点击立即跳转按钮
    const navigateButton = screen.getByText('立即跳转');
    fireEvent.click(navigateButton);
    
    // 验证导航函数被调用
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  // 测试自动跳转功能
  it('automatically navigates to login page after countdown', () => {
    // 模拟导航函数
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <ResetPasswordSuccessPage />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // 模拟倒计时结束
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    // 验证导航函数被调用
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  // 测试安全提示卡片显示
  it('displays security tips card', () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <ResetPasswordSuccessPage />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // 验证安全提示卡片
    expect(screen.getByText('安全提示')).toBeInTheDocument();
    expect(screen.getByText(/定期更改密码/i)).toBeInTheDocument();
    expect(screen.getByText(/不要与他人共享密码/i)).toBeInTheDocument();
    expect(screen.getByText(/使用密码管理器/i)).toBeInTheDocument();
  });

  // 测试组件卸载时清除定时器
  it('clears timer on component unmount', () => {
    // 模拟导航函数
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    const { unmount } = render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <ResetPasswordSuccessPage />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // 记录定时器ID
    const originalClearTimeout = window.clearTimeout;
    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout').mockImplementation(originalClearTimeout);
    
    // 卸载组件
    unmount();
    
    // 验证clearTimeout被调用
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    
    // 恢复原始函数
    clearTimeoutSpy.mockRestore();
  });

  // 测试响应式设计相关元素
  it('contains responsive design elements', () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <ResetPasswordSuccessPage />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // 验证容器元素存在
    const container = screen.getByTestId('success-page-container');
    expect(container).toBeInTheDocument();
    
    // 验证内容卡片存在
    const card = screen.getByTestId('success-card');
    expect(card).toBeInTheDocument();
  });
});
