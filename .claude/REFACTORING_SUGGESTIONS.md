# Apple Notes Clone - 重构建议

## 当前项目结构分析

### 优点
1. ✅ 使用了现代化技术栈 (Next.js 14 + Redux Toolkit)
2. ✅ TypeScript 提供类型安全
3. ✅ 组件化设计，功能分离清晰
4. ✅ 使用 Tailwind CSS 实现响应式设计

### 需要改进的地方

## 1. 组件结构重构

### 当前问题
- 所有组件都在 `components/` 根目录下，缺乏层次结构
- 没有区分通用组件和业务组件

### 建议的新结构
```
components/
├── common/           # 通用组件
│   ├── Button/
│   ├── Input/
│   ├── Modal/
│   └── Card/
├── layout/          # 布局组件
│   ├── Sidebar/
│   ├── Header/
│   └── Container/
└── features/        # 功能模块
    ├── notes/
    │   ├── NoteEditor/
    │   ├── NotesList/
    │   └── NoteCard/
    └── folders/
        ├── FolderTree/
        └── FolderItem/
```

## 2. Redux Store 优化

### 建议添加
```typescript
// store/selectors/notesSelectors.ts
export const selectFilteredNotes = createSelector(...)
export const selectNotesByFolder = createSelector(...)

// store/middleware/persistMiddleware.ts
// 添加本地存储持久化
```

## 3. 性能优化

### 实施建议
1. **React.memo 优化**
   ```typescript
   export const NoteCard = React.memo(({ note }: NoteCardProps) => {
     // 组件逻辑
   })
   ```

2. **虚拟滚动**
   - 对于大量笔记列表，实现虚拟滚动
   - 推荐使用 `react-window` 或 `@tanstack/react-virtual`

3. **懒加载**
   ```typescript
   const NoteEditor = dynamic(() => import('@/components/features/notes/NoteEditor'), {
     loading: () => <EditorSkeleton />
   })
   ```

## 4. 功能增强

### 优先级高
1. **自动保存功能**
   ```typescript
   // hooks/useAutoSave.ts
   export function useAutoSave(content: string, noteId: string) {
     // 防抖自动保存逻辑
   }
   ```

2. **富文本编辑器**
   - 集成 Lexical 或 Tiptap
   - 支持 Markdown 快捷键

3. **搜索优化**
   - 添加模糊搜索
   - 搜索历史记录
   - 搜索建议

### 优先级中
1. **协作功能**
   - WebSocket 实时同步
   - 冲突解决机制

2. **标签系统**
   - 标签管理界面
   - 标签过滤器

3. **导出功能**
   - PDF 导出
   - Markdown 导出
   - 批量导出

## 5. 测试策略

### 单元测试
```typescript
// __tests__/store/slices/notesSlice.test.ts
describe('notesSlice', () => {
  it('should handle addNote', () => {
    // 测试逻辑
  })
})
```

### 集成测试
```typescript
// __tests__/components/NoteEditor.test.tsx
describe('NoteEditor', () => {
  it('should save note on content change', () => {
    // 测试逻辑
  })
})
```

## 6. 开发体验优化

### Storybook 集成
```bash
npm install --save-dev @storybook/react
```

创建组件故事：
```typescript
// components/common/Button/Button.stories.tsx
export default {
  title: 'Common/Button',
  component: Button,
}
```

### VSCode 配置
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 7. 安全性增强

1. **输入验证**
   ```typescript
   import { z } from 'zod'
   
   const NoteSchema = z.object({
     title: z.string().max(100),
     content: z.string().max(10000),
   })
   ```

2. **XSS 防护**
   - 使用 DOMPurify 清理用户输入
   - 避免 dangerouslySetInnerHTML

## 8. 部署优化

### 环境变量管理
```env
# .env.local
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_WEBSOCKET_URL=
```

### Docker 化
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 执行计划

### 第一阶段（1-2周）
- [ ] 重构组件目录结构
- [ ] 添加 React.memo 优化
- [ ] 实现自动保存功能

### 第二阶段（2-3周）
- [ ] 集成富文本编辑器
- [ ] 优化搜索功能
- [ ] 添加单元测试

### 第三阶段（3-4周）
- [ ] 实现标签系统
- [ ] 添加导出功能
- [ ] 性能监控集成

## 技术债务清单

1. 缺少错误边界处理
2. 没有加载状态指示器
3. 缺少键盘快捷键支持
4. 移动端适配不完整
5. 缺少国际化支持

## 推荐的新依赖

```json
{
  "dependencies": {
    "@tanstack/react-virtual": "^3.0.0",
    "lexical": "^0.12.0",
    "dompurify": "^3.0.0",
    "zod": "^3.22.0",
    "react-intersection-observer": "^9.5.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@storybook/react": "^7.0.0",
    "vitest": "^1.0.0"
  }
}
```