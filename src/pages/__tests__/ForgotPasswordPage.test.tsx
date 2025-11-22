import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ForgotPasswordPage from '../ForgotPasswordPage';
import { AuthContext } from '@/contexts/AuthContext';
import { verificationService } from '@/services/verificationService';
import { passwordStrengthService } from '@/services/passwordStrengthService';

// Mock services
jest.mock('@/services/verificationService');
jest.mock('@/services/passwordStrengthService');

const theme = createTheme();

// Mock auth context
const mockAuthContext = {
  resetPassword: jest.fn().mockResolvedValueOnce({ success: true }),
};

// Mock verification service
const mockVerificationService = verificationService as jest.Mocked<typeof verificationService>;
mockVerificationService.sendVerificationCode.mockResolvedValueOnce({ success: true, message: '验证码已发送' });
mockVerificationService.verifyCode.mockResolvedValueOnce({ success: true });

// Mock password strength service
const mockPasswordStrengthService = passwordStrengthService as jest.Mocked<typeof passwordStrengthService>;
mockPasswordStrengthService.evaluatePassword.mockReturnValue({
  score: 5,
  strength: 'strong',
  suggestions: [],
});

describe('ForgotPasswordPage', () => {
  // 测试页面渲染
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <AuthContext.Provider value={mockAuthContext}>
            <ForgotPasswordPage />
          </AuthContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    );
    expect(screen.getByText('找回密码')).toBeInTheDocument();
  });

  // 测试初始状态显示验证表单
  it('displays verification form by default', () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <AuthContext.Provider value={mockAuthContext}>
            <ForgotPasswordPage />
          </AuthContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    );
    expect(screen.getByLabelText('手机号或邮箱')).toBeInTheDocument();
    expect(screen.getByText('获取验证码')).toBeInTheDocument();
  });

  // 测试验证码发送功能
  it('sends verification code when button is clicked', async () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <AuthContext.Provider value={mockAuthContext}>
            <ForgotPasswordPage />
          </AuthContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    );

    // 输入邮箱
    const emailInput = screen.getByLabelText('手机号或邮箱');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // 点击获取验证码按钮
    const sendCodeButton = screen.getByText('获取验证码');
    fireEvent.click(sendCodeButton);

    // 验证服务被调用
    expect(mockVerificationService.sendVerificationCode).toHaveBeenCalledWith('test@example.com');

    // 等待成功消息显示
    await waitFor(() => {
      expect(screen.getByText('验证码已发送')).toBeInTheDocument();
    });
  });

  // 测试验证码验证流程
  it('verifies code and transitions to password reset form', async () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <AuthContext.Provider value={mockAuthContext}>
            <ForgotPasswordPage />
          </AuthContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    );

    // 输入邮箱和验证码
    const emailInput = screen.getByLabelText('手机号或邮箱');
    const codeInput = screen.getByLabelText('验证码');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });

    // 点击继续按钮
    const verifyButton = screen.getByText('继续');
    fireEvent.click(verifyButton);

    // 验证验证服务被调用
    expect(mockVerificationService.verifyCode).toHaveBeenCalledWith('test@example.com', '123456');

    // 等待页面切换到密码重置表单
    await waitFor(() => {
      expect(screen.getByLabelText('新密码')).toBeInTheDocument();
    });
  });

  // 测试密码强度检测
  it('evaluates password strength when typing new password', async () => {
    // 首先完成验证码验证步骤
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <AuthContext.Provider value={mockAuthContext}>
            <ForgotPasswordPage />
          </AuthContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    );

    // 快速模拟验证过程
    const emailInput = screen.getByLabelText('手机号或邮箱');
    const codeInput = screen.getByLabelText('验证码');
    const verifyButton = screen.getByText('继续');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(verifyButton);

    // 等待密码重置表单显示
    await waitFor(() => {
      expect(screen.getByLabelText('新密码')).toBeInTheDocument();
    });

    // 输入新密码
    const passwordInput = screen.getByLabelText('新密码');
    fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } });

    // 验证密码强度服务被调用
    expect(mockPasswordStrengthService.evaluatePassword).toHaveBeenCalledWith('StrongPass123!');
  });

  // 测试密码重置功能
  it('resets password and navigates to success page', async () => {
    // 模拟导航函数
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    // 重新渲染组件以应用导航mock
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <AuthContext.Provider value={mockAuthContext}>
            <ForgotPasswordPage />
          </AuthContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    );

    // 快速模拟验证过程
    const emailInput = screen.getByLabelText('手机号或邮箱');
    const codeInput = screen.getByLabelText('验证码');
    const verifyButton = screen.getByText('继续');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(verifyButton);

    // 等待密码重置表单显示
    await waitFor(() => {
      expect(screen.getByLabelText('新密码')).toBeInTheDocument();
    });

    // 输入新密码和确认密码
    const passwordInput = screen.getByLabelText('新密码');
    const confirmInput = screen.getByLabelText('确认新密码');
    
    fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } });
    fireEvent.change(confirmInput, { target: { value: 'StrongPass123!' } });

    // 点击保存新密码按钮
    const resetButton = screen.getByText('保存新密码');
    fireEvent.click(resetButton);

    // 验证导航到成功页面
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/reset-password-success');
    });
  });

  // 测试输入验证
  it('shows error when passwords do not match', async () => {
    // 首先完成验证码验证步骤
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <AuthContext.Provider value={mockAuthContext}>
            <ForgotPasswordPage />
          </AuthContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    );

    // 快速模拟验证过程
    const emailInput = screen.getByLabelText('手机号或邮箱');
    const codeInput = screen.getByLabelText('验证码');
    const verifyButton = screen.getByText('继续');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(verifyButton);

    // 等待密码重置表单显示
    await waitFor(() => {
      expect(screen.getByLabelText('新密码')).toBeInTheDocument();
    });

    // 输入不匹配的密码
    const passwordInput = screen.getByLabelText('新密码');
    const confirmInput = screen.getByLabelText('确认新密码');
    
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmInput, { target: { value: 'DifferentPassword!' } });

    // 点击保存新密码按钮
    const resetButton = screen.getByText('保存新密码');
    fireEvent.click(resetButton);

    // 验证错误消息显示
    await waitFor(() => {
      expect(screen.getByText(/两次输入的密码不一致/i)).toBeInTheDocument();
    });
  });

  // 测试返回登录链接
  it('has link to login page', () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <AuthContext.Provider value={mockAuthContext}>
            <ForgotPasswordPage />
          </AuthContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    );

    const loginLink = screen.getByText('返回登录');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });
});
