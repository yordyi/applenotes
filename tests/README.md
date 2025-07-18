# 截图测试说明

## 概述

这个测试套件提供了全面的截图测试功能，包括：

- 🖼️ **自动截图测试** - 多视口、多浏览器、多主题
- 🔍 **图片对比功能** - 像素级差异检测
- 📊 **详细报告生成** - HTML格式的可视化报告
- 🎯 **特定区域测试** - 组件级别的截图对比
- 🚀 **高性能处理** - 优化的图片处理和对比算法

## 文件结构

```
tests/
├── screenshot.spec.ts          # 主要截图测试文件
├── image-comparison.spec.ts    # 图片对比测试文件
├── screenshot.config.ts        # 测试配置文件
├── utils/
│   └── screenshot-utils.ts     # 截图工具类
├── screenshots/
│   ├── reference/              # 参考图片目录
│   ├── actual/                 # 实际图片目录
│   ├── diff/                   # 差异图片目录
│   └── reports/                # 测试报告目录
└── README.md                   # 说明文档
```

## 快速开始

### 1. 安装依赖

```bash
npm install
npm run playwright:install
```

### 2. 运行截图测试

```bash
# 基础截图测试
npm run test:screenshot

# 图片对比测试
npm run test:visual

# 运行所有视觉测试
npm run test:visual:all

# 调试模式
npm run test:screenshot:debug

# 更新参考图片
npm run test:screenshot:update
```

### 3. 查看测试报告

测试完成后，查看生成的HTML报告：

```bash
npm run test:e2e:report
```

## 测试配置

### 视口配置

支持多种设备视口测试：

- **Desktop**: 1920x1080 (标准桌面)
- **Laptop**: 1366x768 (笔记本)
- **Tablet**: 768x1024 (平板)
- **Mobile**: 375x667 (手机)
- **Ultrawide**: 3440x1440 (超宽屏)

### 浏览器支持

- ✅ Chromium (Chrome/Edge)
- ✅ Firefox
- ✅ WebKit (Safari)

### 主题测试

- 🌞 Light Mode (浅色主题)
- 🌙 Dark Mode (深色主题)
- 🔄 System (系统主题)

## 测试套件

### 基础界面测试

测试主要页面的基本渲染：

```typescript
// 测试主页在不同视口下的显示
test('主页响应式测试', async ({ page }) => {
  // 自动在多个视口下测试
});
```

### 交互状态测试

测试用户交互状态：

```typescript
// 测试悬停、焦点、选中等状态
test('交互状态测试', async ({ page }) => {
  // 测试按钮悬停状态
  // 测试输入框焦点状态
  // 测试菜单展开状态
});
```

### 主题对比测试

测试不同主题下的显示效果：

```typescript
// 测试深色/浅色主题
test('主题对比测试', async ({ page }) => {
  // 在不同主题下截图对比
});
```

### 组件级测试

测试特定组件的渲染：

```typescript
// 测试侧边栏组件
test('侧边栏组件测试', async ({ page }) => {
  await screenshotTester.screenshotElement(
    '[data-testid="sidebar"]',
    'sidebar',
    'desktop',
    'chromium'
  );
});
```

## 高级功能

### 自定义截图区域

```typescript
// 截图特定区域
const customRegion = {
  clip: { x: 0, y: 0, width: 800, height: 600 }
};

await screenshotTester.compareScreenshot(
  'custom-region',
  'desktop',
  'chromium',
  customRegion
);
```

### 截图对比阈值

```typescript
// 设置更严格的对比阈值
const strictOptions = {
  threshold: 0.1,        // 10% 差异阈值
  maxDiffPixels: 50,     // 最大50像素差异
};
```

### 批量图片处理

```typescript
// 批量对比多张图片
const comparator = new ImageComparator();
const results = await comparator.batchCompareImages(
  'tests/screenshots/reference',
  'tests/screenshots/actual',
  'tests/screenshots/diff'
);
```

## 性能优化

### 并发执行

测试支持并发执行以提高效率：

```typescript
// 并发测试多个视口
const viewports = ['desktop', 'tablet', 'mobile'];
await Promise.all(viewports.map(async (viewport) => {
  // 并发执行截图测试
}));
```

### 智能缓存

- 图片指纹识别，避免重复处理
- 增量对比，只检测变化部分
- 自动清理过期文件

### 内存管理

- 流式处理大图片
- 自动释放图片内存
- 优化的PNG处理算法

## 报告和分析

### HTML报告

生成详细的HTML报告，包含：

- 📊 测试统计信息
- 🖼️ 截图对比结果
- 📈 性能指标
- 🎯 差异高亮显示

### 差异分析

- 像素级差异检测
- 差异区域高亮
- 差异百分比统计
- 视觉差异热图

### 性能报告

- 截图耗时分析
- 对比性能指标
- 内存使用情况
- 优化建议

## 最佳实践

### 1. 测试数据准备

```typescript
// 在测试前准备一致的测试数据
await page.evaluate(() => {
  // 设置固定的测试数据
  window.testData = {
    notes: [...],
    user: {...},
  };
});
```

### 2. 等待页面稳定

```typescript
// 确保页面完全加载
await page.waitForLoadState('networkidle');
await page.waitForFunction(() => document.fonts.ready);
```

### 3. 禁用动画

```typescript
// 禁用CSS动画和过渡效果
await page.addStyleTag({
  content: `
    *, *::before, *::after {
      animation-duration: 0s !important;
      transition-duration: 0s !important;
    }
  `
});
```

### 4. 处理动态内容

```typescript
// 隐藏时间戳等动态内容
await page.addStyleTag({
  content: `
    .timestamp, .current-time {
      visibility: hidden !important;
    }
  `
});
```

## 故障排除

### 常见问题

1. **截图差异过大**
   - 检查是否有动态内容
   - 调整对比阈值
   - 确保测试数据一致

2. **测试超时**
   - 检查网络连接
   - 增加超时时间
   - 优化页面加载速度

3. **浏览器兼容性**
   - 检查浏览器版本
   - 更新Playwright依赖
   - 查看浏览器控制台错误

### 调试技巧

```bash
# 头部模式运行，查看实际操作
npm run test:screenshot:headed

# 调试模式，逐步执行
npm run test:screenshot:debug

# 查看详细日志
DEBUG=pw:* npm run test:screenshot
```

## 环境配置

### 开发环境

```bash
# 宽松的对比阈值，快速反馈
NODE_ENV=development npm run test:screenshot
```

### 生产环境

```bash
# 严格的对比阈值，确保质量
NODE_ENV=production npm run test:screenshot
```

### CI/CD环境

```bash
# 针对CI优化的配置
NODE_ENV=ci npm run test:screenshot
```

## 扩展功能

### 自定义测试套件

```typescript
// 创建自定义测试套件
const customSuite = {
  name: 'Custom Test',
  viewports: ['desktop'],
  browsers: ['chromium'],
  pages: ['homepage'],
  regions: ['header', 'sidebar'],
  themes: ['light'],
};
```

### 集成其他工具

- 与Jest测试框架集成
- 与Storybook组件库集成
- 与设计系统工具集成

## 更新日志

### v1.0.0 (当前版本)

- ✅ 基础截图测试功能
- ✅ 多视口响应式测试
- ✅ 跨浏览器兼容性测试
- ✅ 主题对比测试
- ✅ 图片差异检测
- ✅ HTML报告生成
- ✅ 性能优化

### 计划功能

- 🔄 自动化回归测试
- 📱 移动端专项测试
- 🎨 设计系统集成
- 📊 趋势分析报告
- 🤖 AI驱动的异常检测

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交代码
4. 运行测试
5. 提交PR

## 许可证

MIT License

---

**需要帮助？** 请查看[Playwright文档](https://playwright.dev/)或提交Issue。