// 基础类型定义
export type ID = string

// 特殊文件夹ID类型
export type SpecialFolderId = 'all' | 'recent' | 'pinned' | 'starred' | 'tagged' | 'archive' | 'trash'

// 组合文件夹ID类型
export type FolderId = ID | null | SpecialFolderId

// UI视图类型
export type ViewMode = 'grid' | 'list'
export type SortBy = 'date' | 'title'

// 保存状态类型
export type SaveStatus = 'saved' | 'saving' | 'error'

// 笔记相关类型
export interface BaseNote {
  id: ID
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface Note extends BaseNote {
  folderId: ID | null
  isPinned: boolean
  tags: string[]
}

export interface NoteCreationData {
  title: string
  content: string
  folderId: ID | null
  isPinned: boolean
  tags: string[]
}

// 文件夹相关类型
export interface BaseFolder {
  id: ID
  name: string
  createdAt: string
}

export interface Folder extends BaseFolder {
  icon?: string
  parentId: ID | null
  order: number
  color?: string
  isExpanded?: boolean
}

export interface FolderCreationData {
  name: string
  parentId: ID | null
  icon?: string
}

// Redux状态类型
export interface NotesState {
  notes: Note[]
  selectedNoteId: ID | null
  searchQuery: string
}

export interface FoldersState {
  folders: Folder[]
  selectedFolderId: FolderId
  expandedFolders: ID[]
  recentFolderIds: ID[]
  searchQuery: string
}

export interface UIState {
  sidebarCollapsed: boolean
  view: ViewMode
  sortBy: SortBy
  showPinnedOnly: boolean
}

// 编辑器相关类型
export interface EditorCommand {
  command: string
  value?: string
}

export interface SearchReplaceState {
  searchQuery: string
  replaceQuery: string
  currentMatch: number
  totalMatches: number
}

// 组件Props类型
export interface ComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface SidebarProps extends ComponentProps {
  isCollapsed: boolean
}

export interface NoteCardProps extends ComponentProps {
  note: Note
  isSelected: boolean
  onSelect: (id: ID) => void
}

export interface FolderItemProps extends ComponentProps {
  folder: Folder
  level: number
  isCollapsed: boolean
  noteCount: number
}

// 事件处理类型
export interface NoteEventHandlers {
  onSelect: (id: ID) => void
  onUpdate: (id: ID, updates: Partial<Note>) => void
  onDelete: (id: ID) => void
  onPin: (id: ID) => void
}

export interface FolderEventHandlers {
  onSelect: (id: FolderId) => void
  onCreate: (data: FolderCreationData) => void
  onUpdate: (id: ID, updates: Partial<Folder>) => void
  onDelete: (id: ID) => void
  onExpand: (id: ID) => void
}

// 工具函数类型
export interface EditorUtils {
  getPlainText: (html: string) => string
  getWordCount: (html: string) => number
  getCharCount: (html: string) => number
  isEmpty: (html: string) => boolean
  detectTitle: (html: string) => string
}

// 自定义Hook类型
export interface UseAutoSaveOptions {
  noteId: ID
  content: string
  delay?: number
  onSave?: () => void
  onSaveError?: (error: Error) => void
}

export interface UseAutoSaveReturn {
  forceSave: () => void
  isSaving: boolean
}

// 性能相关类型
export interface PerformanceMetrics {
  bundleSize: number
  firstLoadJS: number
  renderTime: number
  interactionTime: number
}

// 错误处理类型
export interface AppError {
  message: string
  code?: string
  stack?: string
}

// 导出类型守卫
export function isNote(obj: any): obj is Note {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.content === 'string' &&
    typeof obj.isPinned === 'boolean' &&
    Array.isArray(obj.tags)
  )
}

export function isFolder(obj: any): obj is Folder {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.order === 'number'
  )
}

export function isSpecialFolderId(id: string): id is SpecialFolderId {
  return ['all', 'recent', 'pinned', 'starred', 'tagged', 'archive', 'trash'].includes(id)
}