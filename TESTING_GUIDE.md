# 粮食拍卖平台 - 测试指南

## 测试概述

本文档提供了粮食拍卖平台的全面测试指南，涵盖单元测试、集成测试、功能测试和性能测试，特别关注新实现的数据分析功能。

## 测试环境设置

### 前提条件
- Node.js 18.x 或更高版本
- npm 9.x 或更高版本
- Chrome/Firefox/Safari浏览器（推荐最新版本）

### 安装测试依赖

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### 配置Jest

在项目根目录创建 `jest.config.js` 文件：

```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
```

创建 `src/setupTests.ts` 文件：

```typescript
import '@testing-library/jest-dom';
```

## 单元测试

### 1. 数据分析组件测试

#### DataAnalyticsPage 测试

创建测试文件 `src/pages/__tests__/DataAnalyticsPage.test.tsx`：

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DataAnalyticsPage from '../DataAnalyticsPage';
import { DataAnalysisContext } from '../../context/DataAnalysisContext';

const theme = createTheme();

// Mock context data
const mockContextData = {
  tradingData: {
    monthly: [
      { month: '1月', 小麦: 1200, 玉米: 950, 大米: 1600 },
      { month: '2月', 小麦: 1300, 玉米: 1000, 大米: 1700 },
      // Add more mock data
    ],
    // Other mock data...
  },
  priceForecasts: [
    { date: '2024-01-01', 小麦: 1250, 玉米: 980, 大米: 1650, confidence: 0.95 },
    // Add more mock data
  ],
  marketAnomalies: [
    { date: '2024-01-15', product: '小麦', deviation: 0.25, type: '价格异常上涨' },
    // Add more mock data
  ],
  // Other mock methods...
};

describe('DataAnalyticsPage', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <DataAnalysisContext.Provider value={mockContextData}>
            <DataAnalyticsPage />
          </DataAnalysisContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    );
    expect(screen.getByText('数据分析仪表盘')).toBeInTheDocument();
  });

  it('renders trading trends tab by default', () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <DataAnalysisContext.Provider value={mockContextData}>
            <DataAnalyticsPage />
          </DataAnalysisContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    );
    expect(screen.getByText('交易趋势分析')).toBeInTheDocument();
  });

  it('switches to price forecast tab when clicked', () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <DataAnalysisContext.Provider value={mockContextData}>
            <DataAnalyticsPage />
          </DataAnalysisContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    );
    fireEvent.click(screen.getByText('价格预测模型'));
    expect(screen.getByText('价格预测模型')).toBeInTheDocument();
  });

  // Add more tests for filtering, export functionality, etc.
});
```

#### 其他组件测试

为其他关键组件编写类似的单元测试，例如：
- `DataAnalysisContext.test.tsx`
- `ChartComponents.test.tsx`

## 集成测试

### 数据分析功能集成测试

创建测试文件 `src/__tests__/integration/dataAnalytics.integration.test.tsx`：

```typescript
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { act } from 'react-dom/test-utils';
import DataAnalyticsPage from '../pages/DataAnalyticsPage';
import { DataAnalysisContext } from '../context/DataAnalysisContext';

const theme = createTheme();

describe('Data Analytics Integration Tests', () => {
  it('loads and displays forecast data correctly', async () => {
    const mockContextWithLoader = {
      ...mockContextData,
      loadForecastData: jest.fn().mockResolvedValueOnce(mockContextData.priceForecasts),
    };

    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <DataAnalysisContext.Provider value={mockContextWithLoader}>
            <DataAnalyticsPage />
          </DataAnalysisContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    );

    // Switch to forecast tab
    act(() => {
      fireEvent.click(screen.getByText('价格预测模型'));
    });

    // Wait for forecast data to load
    await waitFor(() => {
      expect(screen.getByText(/价格预测/i)).toBeInTheDocument();
    });
  });

  it('exports data correctly when export button is clicked', async () => {
    // Mock download functionality
    Object.defineProperty(window, 'document', {
      value: {
        createElement: jest.fn().mockReturnValue({
          setAttribute: jest.fn(),
          click: jest.fn(),
        }),
        body: {
          appendChild: jest.fn(),
          removeChild: jest.fn(),
        },
      },
    });

    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <DataAnalysisContext.Provider value={mockContextData}>
            <DataAnalyticsPage />
          </DataAnalysisContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    );

    // Click export button
    fireEvent.click(screen.getByText('导出数据'));

    // Verify export action
    expect(window.document.createElement).toHaveBeenCalledWith('a');
  });
});
```

## 功能测试

### 1. 交易趋势分析功能测试

测试步骤：

1. 导航到数据分析页面 (`/analytics`)
2. 验证交易趋势分析标签页是否默认选中
3. 检查月度交易量图表是否正确显示
4. 测试产品筛选器功能：
   - 选择不同产品（小麦、玉米、大米）
   - 验证图表数据是否相应更新
5. 测试时间范围选择器功能：
   - 选择不同时间范围（近30天、近90天、全年）
   - 验证图表数据是否相应更新
6. 检查图表交互功能：
   - 悬停在数据点上查看详细信息
   - 验证工具提示是否显示正确数据

### 2. 价格预测模型功能测试

测试步骤：

1. 导航到数据分析页面 (`/analytics`)
2. 点击「价格预测模型」标签页
3. 验证价格预测图表是否正确显示
4. 测试产品选择器功能
5. 检查置信度指标是否显示
6. 验证价格趋势预测的显示是否符合预期

### 3. 市场异常检测功能测试

测试步骤：

1. 导航到数据分析页面 (`/analytics`)
2. 点击「市场异常检测」标签页
3. 验证异常数据列表是否显示
4. 测试异常类型筛选功能
5. 检查异常详情展示是否完整

### 4. 个性化推荐功能测试

测试步骤：

1. 导航到数据分析页面 (`/analytics`)
2. 点击「个性化推荐」标签页
3. 验证推荐产品列表是否显示
4. 检查推荐原因说明是否合理
5. 测试点击推荐产品的跳转功能

## 性能测试

### 1. 页面加载性能

使用Chrome DevTools的Performance和Lighthouse工具测试：

- 首次内容绘制 (FCP)：目标 < 1.8秒
- 最大内容绘制 (LCP)：目标 < 2.5秒
- 首次输入延迟 (FID)：目标 < 100ms
- 累积布局偏移 (CLS)：目标 < 0.1

### 2. 大数据渲染性能

测试在大数据集下的性能表现：

1. 准备包含大量交易记录的测试数据（如10,000条记录）
2. 测量图表渲染时间
3. 验证交互响应性
4. 检查内存使用情况

### 3. 筛选和排序性能

测试复杂筛选和排序操作的性能：

1. 应用多重筛选条件
2. 测试不同排序方式
3. 测量响应时间，确保在1秒内完成

## 兼容性测试

确保在以下环境中正常运行：

### 浏览器兼容性
- Google Chrome (最新两个版本)
- Mozilla Firefox (最新两个版本)
- Apple Safari (最新两个版本)
- Microsoft Edge (最新两个版本)

### 设备兼容性
- 桌面端 (1920x1080, 1366x768)
- 平板设备 (iPad, Galaxy Tab)
- 移动设备 (iPhone, Android)

## 测试数据准备

为确保测试的全面性，准备以下测试数据：

### 1. 交易数据
- 正常交易记录（不同产品、价格、数量）
- 异常交易记录（价格异常高/低、数量异常大/小）
- 大量历史数据（模拟过去2-3年的数据）

### 2. 预测数据
- 不同置信度级别的预测结果
- 不同时间跨度的预测（短期、中期、长期）

### 3. 异常检测数据
- 价格异常数据
- 交易量异常数据
- 季节性异常模式

## 自动化测试配置

配置GitHub Actions或其他CI/CD工具进行自动化测试：

创建 `.github/workflows/test.yml` 文件：

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x]

    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    - run: npm ci
    - run: npm test
    - run: npm run build --if-present
```

## 测试报告模板

使用以下模板记录测试结果：

| 测试功能 | 测试用例 | 预期结果 | 实际结果 | 通过/失败 | 备注 |
|---------|---------|---------|---------|---------|------|
| 交易趋势分析 | 产品筛选功能 | 图表数据根据选择产品更新 | | | |
| 交易趋势分析 | 时间范围选择 | 图表数据根据选择时间范围更新 | | | |
| 价格预测模型 | 预测图表渲染 | 正确显示价格预测曲线和置信区间 | | | |
| 市场异常检测 | 异常类型筛选 | 根据选择的异常类型过滤数据 | | | |
| 个性化推荐 | 推荐产品显示 | 显示个性化推荐的产品列表 | | | |
| 数据导出 | Excel导出功能 | 成功导出数据为Excel格式 | | | |

## 常见问题排查

### 图表不显示
- 检查DataAnalysisContext是否正确提供数据
- 验证API响应格式是否符合预期
- 检查浏览器控制台是否有错误信息

### 筛选功能失效
- 检查状态更新是否正确
- 验证筛选逻辑是否有问题
- 确认筛选条件是否正确传递给图表组件

### 导出功能失败
- 检查xlsx库是否正确安装
- 验证数据转换逻辑是否正确
- 测试浏览器的下载权限设置

### 性能问题
- 使用React DevTools Profiler分析性能瓶颈
- 考虑实现虚拟滚动或数据分页
- 优化图表渲染，避免不必要的重新渲染

## 回归测试

每次更新代码后，确保执行以下回归测试：

1. 核心功能回归测试
   - 登录与权限控制
   - 拍卖流程
   - 数据分析基础功能

2. 关键路径测试
   - 从首页到数据分析页面的导航
   - 应用不同筛选条件并查看结果
   - 导出数据并验证数据完整性

3. 边界测试
   - 测试空数据情况的处理
   - 测试极端值的显示
   - 测试长文本和特殊字符的显示

---

遵循此测试指南可以确保粮食拍卖平台的数据分析功能和其他核心功能正常工作，提供良好的用户体验。