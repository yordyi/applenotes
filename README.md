# Apple Notes Clone

一个基于 Next.js 14 和 Redux Toolkit 构建的 Apple Notes 克隆应用，完美复刻了 Apple Notes 的界面和功能。

## 功能特性

- 📝 **笔记管理**：创建、编辑、删除笔记
- 📁 **文件夹组织**：创建文件夹层次结构来组织笔记
- 🔍 **搜索功能**：快速搜索笔记内容
- 📌 **置顶功能**：重要笔记可置顶显示
- 🏷️ **标签系统**：为笔记添加标签进行分类
- 🌓 **深色模式**：支持深色/浅色主题切换
- 📱 **响应式设计**：适配各种屏幕尺寸

## 技术栈

- **前端框架**：Next.js 14.1.0
- **状态管理**：Redux Toolkit
- **UI 组件**：React 18 + Lucide React Icons
- **样式**：Tailwind CSS + 自定义 Apple 风格主题
- **类型检查**：TypeScript
- **日期处理**：date-fns
- **开发工具**：ESLint, Prettier

## 快速开始

### 环境要求

- Node.js 16.x 或更高版本
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm run start
```

## 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run lint` - 运行 ESLint 检查
- `npm run typecheck` - 运行 TypeScript 类型检查
- `npm run format` - 格式化代码
- `npm run validate` - 运行所有检查（lint + typecheck + format）
- `npm run analyze` - 分析构建包大小

## 项目结构

```
applenotes/
├── src/
│   ├── app/                 # Next.js 14 App Router
│   ├── components/          # React 组件
│   │   ├── Sidebar/        # 侧边栏组件
│   │   ├── NotesList/      # 笔记列表组件
│   │   ├── NoteEditor/     # 笔记编辑器组件
│   │   └── Toolbar/        # 工具栏组件
│   ├── store/              # Redux store 配置
│   │   ├── slices/         # Redux slices
│   │   └── hooks.ts        # 类型化的 Redux hooks
│   └── types/              # TypeScript 类型定义
├── public/                 # 静态资源
└── CLAUDE.md              # 项目开发指南
```

## 状态管理

应用使用 Redux Toolkit 管理状态，包含三个主要 slice：

- **notesSlice**：管理笔记的 CRUD 操作
- **foldersSlice**：管理文件夹层次结构
- **uiSlice**：控制 UI 偏好设置

## 数据模型

### Note 笔记模型
```typescript
{
  id: string
  title: string
  content: string
  folderId: string | null
  createdAt: string
  updatedAt: string
  isPinned: boolean
  tags: string[]
}
```

### Folder 文件夹模型
```typescript
{
  id: string
  name: string
  icon?: string
  parentId: string | null
  createdAt: string
}
```

## 开发指南

### 添加新功能

1. 在相应的 slice 中添加新的 Redux 状态
2. 更新 `store/store.ts` 包含新的 reducer
3. 使用 `useAppSelector` 和 `useAppDispatch` hooks
4. 遵循现有的组件模式（客户端渲染、类型化 props、Redux 集成）

### 样式指南

- 使用 Tailwind CSS 类
- 自定义 Apple 主题色彩定义在 `tailwind.config.js`
- 支持深色模式通过 `dark:` 前缀

## 部署

项目可以部署到任何支持 Next.js 的平台：

- [Vercel](https://vercel.com/new)
- [Netlify](https://www.netlify.com/)
- [Railway](https://railway.app/)

## 贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m '添加一些新功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 致谢

- 感谢 Apple Inc. 提供的设计灵感
- 感谢 Next.js 和 Redux 团队的优秀工具
- 感谢所有贡献者的支持