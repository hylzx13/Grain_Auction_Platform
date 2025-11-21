# 粮食拍卖平台 - 部署指南

## 项目概述

本项目是一个专业级粮食拍卖平台，集成了遥感技术与农科院质检报告功能，旨在提供智能化的粮食交易与分析服务。

## 完成的功能模块

1. **用户管理系统**
   - 用户注册、登录与权限控制
   - 农户、经销商、管理员多角色支持
   - 个人资料管理与实名认证

2. **拍卖核心功能**
   - 拍卖大厅与竞价系统
   - 实时价格更新与倒计时
   - 出价历史记录与成交确认

3. **数据智能分析功能** 🔥
   - 交易趋势分析与可视化
   - 基于XGBoost的价格预测模型
   - 市场异常检测
   - 个性化产品推荐
   - 多维度数据图表展示
   - 数据导出与报告生成

4. **遥感技术集成**
   - 地块遥感数据分析
   - 基于OpenEO平台的遥感数据处理

5. **农科院质检报告**
   - 质检报告查看与验证
   - 质量指标评分与展示

## 技术栈

- **前端框架**: React 18 + TypeScript
- **状态管理**: React Context API
- **UI组件库**: Material-UI (MUI) 5
- **路由管理**: React Router 6
- **图表可视化**: Recharts
- **动画效果**: Framer Motion
- **构建工具**: Vite 5
- **HTTP客户端**: Axios
- **表格导出**: xlsx
- **通知组件**: react-toastify
- **实时通信**: Socket.io

## 部署步骤

### 1. 环境准备

确保服务器已安装以下软件：
- Node.js 18.x 或更高版本
- npm 9.x 或更高版本（或 yarn 1.22.x 或更高版本）
- Git

### 2. 克隆项目

```bash
git clone <项目仓库地址>
cd grain-auction-platform
```

### 3. 安装依赖

使用npm：
```bash
npm install
```

或使用yarn：
```bash
yarn install
```

### 4. 环境变量配置

在项目根目录创建 `.env` 文件，配置以下环境变量：

```env
# 后端API基础URL
VITE_API_BASE_URL=http://your-api-server:8000

# Socket.io服务器地址
VITE_SOCKET_URL=http://your-socket-server:3001

# OpenEO平台配置
VITE_OPENEOSERVICE_URL=http://your-openeo-server
VITE_OPENEOSERVICE_API_KEY=your-api-key

# 文件上传配置
VITE_FILE_UPLOAD_ENDPOINT=/api/upload
VITE_MAX_FILE_SIZE=10485760
```

### 5. 构建项目

```bash
npm run build
# 或
yarn build
```

构建完成后，静态文件将生成在 `dist` 目录中。

### 6. 部署静态文件

将 `dist` 目录中的文件部署到您的Web服务器。推荐使用：

- **Nginx**: 高性能的HTTP和反向代理服务器
- **Apache**: 流行的Web服务器
- **CDN**: 如Vercel、Netlify等支持静态网站托管的服务

#### Nginx配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/grain-auction-platform/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api {
        proxy_pass http://your-api-server:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. 启动开发服务器（可选）

如果需要在本地进行开发和测试：

```bash
npm run dev
# 或
yarn dev
```

然后访问 `http://localhost:3000` 查看项目。

## 测试指南

### 单元测试

项目使用React Testing Library和Jest进行单元测试。运行测试：

```bash
npm test
# 或
yarn test
```

### 功能测试

1. **用户流程测试**
   - 注册不同角色的用户
   - 登录与权限验证
   - 个人资料管理

2. **拍卖流程测试**
   - 创建拍卖
   - 参与竞价
   - 成交确认

3. **数据分析功能测试**
   - 检查数据可视化是否正确显示
   - 验证价格预测结果
   - 测试数据导出功能

4. **响应式设计测试**
   - 在不同屏幕尺寸上测试界面显示
   - 移动端交互体验

## 常见问题与解决方案

### 构建失败
- 检查Node.js版本是否兼容
- 确保所有依赖已正确安装
- 检查TypeScript类型错误

### API连接问题
- 确认API服务器是否正在运行
- 检查环境变量配置是否正确
- 验证CORS设置是否允许跨域请求

### 性能优化建议
- 使用CDN加速静态资源加载
- 启用Gzip/Brotli压缩
- 配置适当的缓存策略
- 考虑使用服务端渲染(SSR)或静态站点生成(SSG)以提高首屏加载速度

## 维护与更新

- 定期更新依赖包以修复安全漏洞
- 监控服务器性能并及时扩容
- 收集用户反馈，持续优化用户体验

## 安全注意事项

- 确保生产环境中不暴露敏感配置信息
- 定期更新API密钥和凭证
- 实施适当的访问控制和速率限制
- 监控异常访问模式

---

如有任何问题，请联系技术支持团队。祝您部署顺利！