# 🔧 Apple Notes 开发快速参考

## 📁 项目结构速览

```
applenotes/
├── app/                     # Next.js 13+ App Router
│   ├── layout.tsx          # 根布局组件
│   ├── page.tsx            # 主页面
│   └── globals.css         # 全局样式
├── components/             # React 组件
│   ├── editor/            # 编辑器相关
│   │   ├── RichTextEditor.tsx
│   │   ├── EditorToolbar.tsx
│   │   └── SearchReplace.tsx
│   ├── sidebar/           # 侧边栏相关
│   │   ├── FolderTree.tsx
│   │   └── QuickAccess.tsx
│   ├── layout/            # 布局组件
│   ├── providers/         # Context 提供者
│   ├── NoteEditor.tsx     # 主编辑器
│   ├── NotesList.tsx      # 笔记列表
│   ├── Sidebar.tsx        # 侧边栏
│   └── Toolbar.tsx        # 工具栏
├── store/                 # Redux 状态管理
│   ├── slices/           # Redux Toolkit 切片
│   │   ├── notesSlice.ts    # 笔记状态
│   │   ├── foldersSlice.ts  # 文件夹状态
│   │   └── uiSlice.ts       # UI 状态
│   ├── hooks.ts          # 类型化 hooks
│   ├── store.ts          # Store 配置
│   └── initialData.ts    # 初始数据
├── hooks/                # 自定义 Hooks
├── lib/                  # 工具函数
├── types/                # TypeScript 类型
└── 配置文件
    ├── tailwind.config.js   # Tailwind 配置
    ├── tsconfig.json       # TypeScript 配置
    └── package.json        # 项目依赖
```

## 🎯 核心概念

### Redux 状态结构
```typescript
interface RootState {
  notes: {
    notes: Note[]                    // 所有笔记
    selectedNoteId: string | null    // 当前选中笔记
    searchQuery: string              // 搜索关键词
  }
  folders: {
    folders: Folder[]                // 所有文件夹
    selectedFolderId: string | null  // 当前选中文件夹
    expandedFolders: string[]        // 展开的文件夹
  }
  ui: {
    sidebarCollapsed: boolean        // 侧边栏折叠状态
    view: 'grid' | 'list'           // 视图模式
    sortBy: string                   // 排序方式
    showPinnedOnly: boolean          // 仅显示置顶
  }
}
```

### 数据模型
```typescript
interface Note {
  id: string                 // 唯一标识
  title: string             // 标题
  content: string           // 内容 (HTML)
  folderId: string | null   // 所属文件夹
  createdAt: string         // 创建时间
  updatedAt: string         // 更新时间
  isPinned: boolean         // 是否置顶
  tags: string[]            // 标签数组
}

interface Folder {
  id: string                // 唯一标识
  name: string             // 文件夹名称
  icon?: string            // 图标
  parentId: string | null  // 父文件夹 ID
  createdAt: string        // 创建时间
}
```

## 🛠️ 常用工具函数

### Redux Hooks
```typescript
import { useAppSelector, useAppDispatch } from '@/store/hooks'

// 获取状态
const notes = useAppSelector(state => state.notes.notes)
const selectedNote = useAppSelector(state => 
  state.notes.notes.find(note => note.id === state.notes.selectedNoteId)
)

// 派发 action
const dispatch = useAppDispatch()
dispatch(addNote({ title: '新笔记', content: '', folderId: null }))
```

### 样式工具
```typescript
import { cn } from '@/lib/utils'

// 条件样式组合
const className = cn(
  'base-class',
  isActive && 'active-class',
  'additional-class'
)
```

### 日期格式化
```typescript
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// 格式化日期
const formattedDate = format(new Date(), 'yyyy年MM月dd日', { locale: zhCN })
```

## 🎨 样式系统

### Apple 主题色彩
```css
/* 灰度色彩 */
.bg-apple-gray-50    /* 最浅灰 */
.bg-apple-gray-100   /* 浅灰 */
.bg-apple-gray-800   /* 深灰 */
.bg-apple-gray-900   /* 最深灰 */

/* 主题色 */
.bg-apple-yellow     /* Apple 黄色 */
.text-apple-yellow   /* 黄色文字 */

/* 深色模式 */
.dark:bg-apple-gray-800
```

### 常用样式组合
```typescript
// 侧边栏项目
const sidebarItemStyle = cn(
  'flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer',
  'transition-all duration-200',
  'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800',
  isSelected && 'bg-apple-yellow text-black'
)

// 笔记卡片
const noteCardStyle = cn(
  'bg-white dark:bg-apple-gray-800 rounded-lg p-4 cursor-pointer',
  'border border-apple-gray-200 dark:border-apple-gray-700',
  'hover:shadow-lg transition-all duration-200',
  isSelected && 'ring-2 ring-apple-yellow'
)
```

## ⚡ 常用代码片段

### 创建新组件
```typescript
'use client'

import React from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { cn } from '@/lib/utils'

interface MyComponentProps {
  // 定义 props 类型
}

export function MyComponent({ }: MyComponentProps) {
  const dispatch = useAppDispatch()
  const someState = useAppSelector(state => state.someSlice.someValue)

  return (
    <div className={cn('base-styles')}>
      {/* 组件内容 */}
    </div>
  )
}
```

### 添加 Redux Action
```typescript
// 在对应的 slice 文件中
const someSlice = createSlice({
  name: 'someName',
  initialState,
  reducers: {
    newAction: (state, action: PayloadAction<PayloadType>) => {
      // 修改状态逻辑
    }
  }
})

export const { newAction } = someSlice.actions
```

### 自定义 Hook
```typescript
import { useState, useEffect } from 'react'

export function useCustomHook(dependency: any) {
  const [state, setState] = useState(initialValue)

  useEffect(() => {
    // 副作用逻辑
  }, [dependency])

  return { state, setState }
}
```

## 🔍 调试技巧

### Redux DevTools
1. 安装 Redux DevTools 扩展
2. 在开发环境中自动启用
3. 可以查看 action 历史和状态变化

### Console 调试
```typescript
// 在组件中临时调试
useEffect(() => {
  console.log('当前状态:', someState)
}, [someState])

// 条件断点
if (process.env.NODE_ENV === 'development') {
  console.log('调试信息:', debugData)
}
```

### React DevTools
- 使用 React DevTools 查看组件树
- 检查 props 和 state
- 分析组件重新渲染

## 🧪 测试模式

### 快速功能测试
```typescript
// 在组件中添加临时测试按钮
{process.env.NODE_ENV === 'development' && (
  <button onClick={() => dispatch(testAction())}>
    测试功能
  </button>
)}
```

### 数据填充
```typescript
// 快速生成测试数据
const generateTestNote = (index: number) => ({
  id: `test-${index}`,
  title: `测试笔记 ${index}`,
  content: `这是测试内容 ${index}`,
  folderId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isPinned: false,
  tags: []
})
```

## 📱 响应式设计

### 断点参考
```css
/* Tailwind 断点 */
sm: 640px    /* 小型设备 */
md: 768px    /* 中型设备 */
lg: 1024px   /* 大型设备 */
xl: 1280px   /* 超大设备 */
```

### 响应式组件
```typescript
const ResponsiveComponent = () => {
  return (
    <div className={cn(
      'p-4',                    // 默认样式
      'sm:p-6',                // 小屏幕
      'md:p-8',                // 中屏幕
      'lg:flex lg:space-x-4'   // 大屏幕布局
    )}>
      {/* 内容 */}
    </div>
  )
}
```

## 🚀 性能优化技巧

### 组件优化
```typescript
import { memo, useMemo, useCallback } from 'react'

// 使用 memo 防止不必要的重新渲染
const OptimizedComponent = memo(function OptimizedComponent({ data }) {
  // 缓存计算结果
  const processedData = useMemo(() => {
    return expensiveOperation(data)
  }, [data])

  // 缓存回调函数
  const handleClick = useCallback(() => {
    // 处理点击
  }, [/* 依赖项 */])

  return <div onClick={handleClick}>{processedData}</div>
})
```

### 状态选择器优化
```typescript
import { createSelector } from '@reduxjs/toolkit'

// 使用 createSelector 缓存计算结果
const selectFilteredNotes = createSelector(
  [state => state.notes.notes, state => state.notes.searchQuery],
  (notes, searchQuery) => {
    return notes.filter(note => 
      note.title.includes(searchQuery) || 
      note.content.includes(searchQuery)
    )
  }
)
```

## 🔧 开发工具配置

### VS Code 设置
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "typescript": "html"
  }
}
```

### 推荐扩展
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens

## 📋 常见问题解决

### TypeScript 错误
```typescript
// 类型断言
const element = document.getElementById('my-id') as HTMLInputElement

// 可选链
const value = note?.content?.substring(0, 100)

// 类型守卫
function isString(value: any): value is string {
  return typeof value === 'string'
}
```

### 样式问题
```typescript
// 确保 Tailwind 类正确加载
// 检查 tailwind.config.js 中的 content 路径

// 动态类名
const dynamicClass = 'bg-red-500' // ✅
const dynamicClass = `bg-${color}-500` // ❌ 不会生成
```

### 状态管理问题
```typescript
// 确保使用 Immer 语法
// 在 Redux Toolkit 中可以直接修改状态
state.notes.push(newNote) // ✅

// 避免直接修改原始状态
state.notes = [...state.notes, newNote] // 也可以，但不必要
```

---

**提示**: 这份参考指南涵盖了日常开发中最常用的模式和工具。建议收藏并在开发过程中随时查阅。

*最后更新: 2025年7月*