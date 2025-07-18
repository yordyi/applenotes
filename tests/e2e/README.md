# E2E Testing with Playwright

这个目录包含了Apple Notes应用的端到端测试配置和测试文件。

## 目录结构

```
tests/e2e/
├── fixtures/
│   └── test-helpers.ts      # 测试工具类
├── screenshots/             # 截图存放目录
├── example.spec.ts          # 基础功能测试
├── visual-comparison.spec.ts # 视觉回归测试
└── README.md               # 本文件
```

## 配置文件

- `playwright.config.ts` - 主要的Playwright配置文件
- 支持多个浏览器：Chrome、Firefox、Safari、Edge
- 支持移动端视口测试
- 自动启动开发服务器
- 配置了视觉比较参数

## 测试脚本

### 运行所有测试
```bash
npm run test:e2e
```

### 以UI模式运行测试
```bash
npm run test:e2e:ui
```

### 以可视化模式运行测试
```bash
npm run test:e2e:headed
```

### 调试模式
```bash
npm run test:e2e:debug
```

### 查看测试报告
```bash
npm run test:e2e:report
```

## 浏览器安装

首次运行测试前需要安装浏览器：

```bash
npm run playwright:install
```

## 测试类型

### 1. 基础功能测试 (example.spec.ts)
- 页面加载测试
- 创建笔记功能
- 文件夹导航
- 搜索功能

### 2. 视觉回归测试 (visual-comparison.spec.ts)
- 主页面截图对比
- 侧边栏截图对比
- 笔记编辑器截图对比
- 移动端视图对比
- 深色模式对比

## 测试工具类

`fixtures/test-helpers.ts` 提供了以下功能：

- `waitForPageLoad()` - 等待页面完全加载
- `takeScreenshot(name)` - 截图保存
- `compareVisual(selector, name)` - 视觉元素对比
- `createNote(title, content)` - 创建笔记
- `navigateToFolder(folderName)` - 导航到文件夹
- `searchNotes(query)` - 搜索笔记

## 视觉比较配置

- **阈值**: 0.2 (允许20%的差异)
- **模式**: strict (严格模式)
- **截图**: 失败时自动截图
- **视频**: 失败时录制视频

## 测试数据属性

测试文件使用以下数据属性：

- `data-testid="sidebar"` - 侧边栏
- `data-testid="main-content"` - 主要内容区域
- `data-testid="new-note-button"` - 新建笔记按钮
- `data-testid="note-editor"` - 笔记编辑器
- `data-testid="note-title-input"` - 笔记标题输入
- `data-testid="note-content-input"` - 笔记内容输入
- `data-testid="folders-list"` - 文件夹列表
- `data-testid="folder-item"` - 文件夹项目
- `data-testid="search-input"` - 搜索输入框
- `data-testid="notes-list"` - 笔记列表
- `data-testid="dark-mode-toggle"` - 深色模式切换

## 注意事项

1. 测试需要应用在 `http://localhost:3000` 上运行
2. 首次运行可能需要一些时间来生成基准截图
3. 视觉测试对主题和字体敏感，确保测试环境一致性
4. 移动端测试使用Pixel 5和iPhone 12视口