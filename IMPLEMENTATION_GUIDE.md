# 🛠️ 阶段 1 实现指南：完善现有功能

## 📋 任务清单

### ✅ 已完成
- [x] 项目分析和路线图制定

### 🔧 待实现 (按优先级排序)

#### 1. 搜索高亮功能 (1-2 天) 🔴
**文件**: `components/NoteEditor.tsx:66`
**描述**: 在编辑器中高亮显示搜索关键词

#### 2. 文件夹笔记计数 (1 天) 🔴
**文件**: `components/sidebar/FolderTree.tsx:248`
**描述**: 显示每个文件夹包含的笔记数量

#### 3. 收藏功能实现 (2-3 天) 🟡
**文件**: `components/sidebar/QuickAccess.tsx:106`
**描述**: 实现笔记收藏和取消收藏功能

#### 4. 搜索替换功能 (2-3 天) 🟡
**文件**: `components/NoteEditor.tsx:71,76`
**描述**: 实现单个和批量替换操作

#### 5. 搜索导航功能 (1-2 天) 🟡
**文件**: `components/editor/SearchReplace.tsx:59,64`
**描述**: 实现搜索结果的上一个/下一个导航

---

## 🚀 实现指南

### 任务 1: 搜索高亮功能

#### 目标
在笔记编辑器中高亮显示搜索关键词，提升搜索体验。

#### 技术方案
1. **高亮实现方式**
   - 使用 `mark` 标签包装匹配文本
   - CSS 样式定义高亮效果
   - 支持多个匹配项同时高亮

2. **核心实现逻辑**
   ```typescript
   // 高亮搜索关键词的工具函数
   function highlightSearchTerm(content: string, searchTerm: string): string {
     if (!searchTerm.trim()) return content
     
     const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi')
     return content.replace(regex, '<mark class="search-highlight">$1</mark>')
   }
   
   function escapeRegExp(string: string): string {
     return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
   }
   ```

3. **CSS 样式**
   ```css
   .search-highlight {
     background-color: #ffeb3b;
     color: #000;
     padding: 0 2px;
     border-radius: 2px;
   }
   
   .dark .search-highlight {
     background-color: #ff9800;
     color: #fff;
   }
   ```

#### 实现步骤
1. **在 NoteEditor 组件中添加高亮逻辑**
   ```typescript
   // components/NoteEditor.tsx
   const { searchQuery } = useAppSelector(state => state.notes)
   
   const highlightedContent = useMemo(() => {
     if (!searchQuery) return content
     return highlightSearchTerm(content, searchQuery)
   }, [content, searchQuery])
   ```

2. **更新编辑器显示**
   - 在只读模式下显示高亮内容
   - 编辑模式下保持原始内容

3. **测试用例**
   - 搜索单个关键词
   - 搜索多个匹配项
   - 特殊字符搜索
   - 大小写不敏感搜索

#### 预期结果
- 搜索时关键词被黄色高亮显示
- 支持多个匹配项同时高亮
- 深色模式下使用橙色高亮

---

### 任务 2: 文件夹笔记计数

#### 目标
在文件夹列表中显示每个文件夹包含的笔记数量，包括子文件夹中的笔记。

#### 技术方案
1. **计数逻辑**
   ```typescript
   // 计算文件夹笔记数量的选择器
   const createFolderNotesCountSelector = () => createSelector(
     [(state: RootState) => state.notes.notes, (state: RootState) => state.folders.folders],
     (notes, folders) => {
       const countMap = new Map<string, number>()
       
       // 获取文件夹及其所有子文件夹的 ID
       const getDescendantFolderIds = (folderId: string): string[] => {
         const childFolders = folders.filter(f => f.parentId === folderId)
         return [folderId, ...childFolders.flatMap(f => getDescendantFolderIds(f.id))]
       }
       
       folders.forEach(folder => {
         const descendantIds = getDescendantFolderIds(folder.id)
         const count = notes.filter(note => 
           descendantIds.includes(note.folderId || '')
         ).length
         countMap.set(folder.id, count)
       })
       
       return countMap
     }
   )
   ```

2. **组件集成**
   ```typescript
   // components/sidebar/FolderTree.tsx
   const folderNotesCount = useAppSelector(createFolderNotesCountSelector())
   
   // 在 FolderItem 组件中使用
   const noteCount = folderNotesCount.get(folder.id) || 0
   ```

#### 实现步骤
1. **创建选择器**
   - 在 `store/slices/notesSlice.ts` 中添加选择器
   - 优化性能，避免不必要的重新计算

2. **更新 FolderItem 组件**
   - 移除硬编码的 `noteCount={0}`
   - 使用选择器获取真实计数

3. **样式调整**
   - 确保计数显示在合适的位置
   - 添加计数为 0 时的处理逻辑

#### 预期结果
- 每个文件夹显示包含的笔记数量
- 计数包括子文件夹中的笔记
- 实时更新计数

---

### 任务 3: 收藏功能实现

#### 目标
实现笔记收藏功能，允许用户收藏重要笔记并在快速访问区域查看。

#### 技术方案
1. **数据模型扩展**
   ```typescript
   // store/slices/notesSlice.ts
   export interface Note {
     // ... 现有字段
     isFavorited?: boolean // 新增收藏状态
   }
   
   // 新增 action
   toggleFavoriteNote: (state, action: PayloadAction<string>) => {
     const note = state.notes.find(n => n.id === action.payload)
     if (note) {
       note.isFavorited = !note.isFavorited
       note.updatedAt = new Date().toISOString()
     }
   }
   ```

2. **UI 组件**
   ```typescript
   // 收藏按钮组件
   function FavoriteButton({ noteId, isFavorited }: FavoriteButtonProps) {
     const dispatch = useAppDispatch()
     
     const handleToggle = () => {
       dispatch(toggleFavoriteNote(noteId))
     }
     
     return (
       <button onClick={handleToggle} title={isFavorited ? "取消收藏" : "收藏"}>
         <Star className={cn("w-4 h-4", isFavorited && "fill-yellow-400 text-yellow-400")} />
       </button>
     )
   }
   ```

#### 实现步骤
1. **扩展数据模型**
   - 在 Note 接口中添加 `isFavorited` 字段
   - 添加 `toggleFavoriteNote` action

2. **更新快速访问组件**
   - 计算收藏笔记数量
   - 实现收藏笔记筛选

3. **添加收藏按钮**
   - 在笔记编辑器工具栏添加收藏按钮
   - 在笔记列表中添加收藏状态显示

#### 预期结果
- 用户可以收藏/取消收藏笔记
- 快速访问区域显示收藏笔记数量
- 可以筛选查看所有收藏笔记

---

### 任务 4: 搜索替换功能

#### 目标
实现编辑器中的搜索替换功能，支持单个替换和全部替换。

#### 技术方案
1. **替换逻辑**
   ```typescript
   // 单个替换
   function replaceNext(
     content: string, 
     searchTerm: string, 
     replaceWith: string, 
     currentIndex: number = 0
   ): { newContent: string; nextIndex: number } {
     const regex = new RegExp(escapeRegExp(searchTerm), 'gi')
     const matches = Array.from(content.matchAll(regex))
     
     if (matches.length === 0 || currentIndex >= matches.length) {
       return { newContent: content, nextIndex: 0 }
     }
     
     const match = matches[currentIndex]
     const newContent = 
       content.slice(0, match.index) + 
       replaceWith + 
       content.slice(match.index + match[0].length)
     
     return { newContent, nextIndex: currentIndex + 1 }
   }
   
   // 全部替换
   function replaceAll(
     content: string, 
     searchTerm: string, 
     replaceWith: string
   ): string {
     const regex = new RegExp(escapeRegExp(searchTerm), 'gi')
     return content.replace(regex, replaceWith)
   }
   ```

2. **状态管理**
   ```typescript
   // SearchReplace 组件状态
   const [replaceText, setReplaceText] = useState('')
   const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
   ```

#### 实现步骤
1. **扩展 SearchReplace 组件**
   - 添加替换输入框
   - 添加"替换"和"全部替换"按钮

2. **实现替换逻辑**
   - 单个替换功能
   - 全部替换功能
   - 替换后更新编辑器内容

3. **用户交互优化**
   - 替换确认提示
   - 撤销替换功能
   - 键盘快捷键支持

#### 预期结果
- 支持单个内容替换
- 支持全部内容替换
- 提供替换预览和确认

---

### 任务 5: 搜索导航功能

#### 目标
实现搜索结果的导航功能，允许用户在多个匹配项之间跳转。

#### 技术方案
1. **匹配项管理**
   ```typescript
   // 获取所有匹配项位置
   function findAllMatches(content: string, searchTerm: string): MatchInfo[] {
     const regex = new RegExp(escapeRegExp(searchTerm), 'gi')
     const matches: MatchInfo[] = []
     let match
     
     while ((match = regex.exec(content)) !== null) {
       matches.push({
         index: match.index,
         length: match[0].length,
         text: match[0]
       })
     }
     
     return matches
   }
   
   interface MatchInfo {
     index: number
     length: number
     text: string
   }
   ```

2. **导航逻辑**
   ```typescript
   const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
   const [matches, setMatches] = useState<MatchInfo[]>([])
   
   const goToNextMatch = () => {
     setCurrentMatchIndex((prev) => 
       prev < matches.length - 1 ? prev + 1 : 0
     )
   }
   
   const goToPrevMatch = () => {
     setCurrentMatchIndex((prev) => 
       prev > 0 ? prev - 1 : matches.length - 1
     )
   }
   ```

#### 实现步骤
1. **匹配项检测**
   - 实现匹配项查找逻辑
   - 维护当前匹配项索引

2. **导航按钮**
   - 添加上一个/下一个按钮
   - 显示当前位置信息 (如: 3/15)

3. **键盘支持**
   - F3: 下一个匹配
   - Shift+F3: 上一个匹配

#### 预期结果
- 显示匹配项总数和当前位置
- 支持上一个/下一个导航
- 键盘快捷键支持

---

## 🧪 测试策略

### 单元测试
每个功能都应包含对应的测试用例：

```typescript
// 示例: 搜索高亮功能测试
describe('highlightSearchTerm', () => {
  it('should highlight single match', () => {
    const result = highlightSearchTerm('Hello world', 'world')
    expect(result).toBe('Hello <mark class="search-highlight">world</mark>')
  })
  
  it('should highlight multiple matches', () => {
    const result = highlightSearchTerm('Hello world, world!', 'world')
    expect(result).toContain('<mark class="search-highlight">world</mark>')
  })
})
```

### 集成测试
- 测试组件间的交互
- 测试状态更新的正确性
- 测试用户操作流程

### 手动测试清单
- [ ] 搜索高亮在各种内容中正常工作
- [ ] 文件夹计数准确显示
- [ ] 收藏功能状态正确切换
- [ ] 替换功能不破坏原有格式
- [ ] 搜索导航流畅无误

---

## 🚀 开发流程

### 1. 准备工作
```bash
# 确保依赖是最新的
npm install

# 启动开发服务器
npm run dev

# 在新终端运行类型检查
npm run typecheck -- --watch
```

### 2. 开发循环
1. **选择任务** - 从优先级最高的任务开始
2. **创建分支** - `git checkout -b feature/search-highlight`
3. **实现功能** - 按照实现指南进行开发
4. **测试验证** - 确保功能正常工作
5. **代码检查** - `npm run lint` 和 `npm run typecheck`
6. **提交代码** - 使用清晰的提交信息

### 3. 质量保证
- 每个功能完成后进行完整测试
- 确保不破坏现有功能
- 验证响应式设计
- 测试深色模式兼容性

---

## 📝 提交信息规范

```
type(scope): description

Types:
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

Examples:
feat(search): implement search highlighting in editor
fix(folders): calculate accurate note count for folders
feat(favorites): add note favoriting functionality
```

---

**预计完成时间**: 1-2 周
**负责人**: 开发团队
**审查者**: 项目负责人

开始第一个任务时，建议先通读整个实现指南，理解各个功能之间的关联，这样可以更好地设计可复用的组件和工具函数。