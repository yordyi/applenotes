import { cn } from './utils'

// 按钮样式组合
export const buttonStyles = {
  base: 'px-3 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-apple-yellow',
  primary: 'bg-apple-yellow text-black hover:bg-yellow-500 active:bg-yellow-600',
  secondary: 'bg-apple-gray-100 dark:bg-apple-gray-800 hover:bg-apple-gray-200 dark:hover:bg-apple-gray-700',
  ghost: 'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
  disabled: 'opacity-50 cursor-not-allowed',
  small: 'px-2 py-1 text-sm',
  large: 'px-4 py-3 text-lg',
}

// 输入框样式组合
export const inputStyles = {
  base: 'w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-apple-yellow',
  default: 'bg-white dark:bg-apple-gray-800 border-apple-gray-200 dark:border-apple-gray-700',
  error: 'border-red-500 focus:ring-red-500',
  success: 'border-green-500 focus:ring-green-500',
  small: 'px-2 py-1 text-sm',
  large: 'px-4 py-3 text-lg',
}

// 卡片样式组合
export const cardStyles = {
  base: 'bg-white dark:bg-apple-gray-800 rounded-lg border border-apple-gray-200 dark:border-apple-gray-700 transition-all duration-200',
  hoverable: 'hover:shadow-lg hover:border-apple-gray-300 dark:hover:border-apple-gray-600',
  selected: 'ring-2 ring-apple-yellow border-apple-yellow',
  elevated: 'shadow-sm',
  flat: 'border-0 shadow-none',
}

// 布局样式组合
export const layoutStyles = {
  sidebar: 'bg-apple-gray-50 dark:bg-apple-gray-900 border-r border-apple-gray-200 dark:border-apple-gray-800',
  main: 'bg-white dark:bg-apple-gray-900',
  panel: 'bg-apple-gray-100 dark:bg-apple-gray-800',
  toolbar: 'bg-apple-gray-50/50 dark:bg-apple-gray-900/50 border-b border-apple-gray-200 dark:border-apple-gray-800',
}

// 文本样式组合
export const textStyles = {
  title: 'text-2xl font-bold text-apple-gray-900 dark:text-white',
  subtitle: 'text-lg font-semibold text-apple-gray-800 dark:text-apple-gray-200',
  body: 'text-base text-apple-gray-700 dark:text-apple-gray-300',
  caption: 'text-sm text-apple-gray-500 dark:text-apple-gray-400',
  muted: 'text-xs text-apple-gray-400 dark:text-apple-gray-500',
}

// 状态样式组合
export const statusStyles = {
  success: 'text-green-500 bg-green-50 dark:bg-green-900/20',
  warning: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  error: 'text-red-500 bg-red-50 dark:bg-red-900/20',
  info: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
}

// 工具函数：组合样式
export function combineStyles(...styleKeys: string[]) {
  return cn(...styleKeys)
}

// 预定义的样式组合
export const presetStyles = {
  // 侧边栏项目
  sidebarItem: cn(
    'flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200',
    'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800'
  ),
  sidebarItemActive: 'bg-apple-yellow text-black',
  
  // 工具栏按钮
  toolbarButton: cn(
    'p-2 rounded-lg transition-all duration-200',
    'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800'
  ),
  toolbarButtonActive: 'bg-apple-yellow text-black',
  
  // 笔记卡片
  noteCard: cn(
    'bg-white dark:bg-apple-gray-800 rounded-lg p-4 cursor-pointer transition-all duration-200',
    'hover:shadow-lg border border-apple-gray-200 dark:border-apple-gray-700'
  ),
  noteCardSelected: 'ring-2 ring-apple-yellow',
  
  // 搜索框
  searchInput: cn(
    'w-full pl-10 pr-4 py-2 bg-white dark:bg-apple-gray-800',
    'border border-apple-gray-200 dark:border-apple-gray-700 rounded-lg text-sm',
    'placeholder-apple-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-yellow'
  ),
  
  // 滚动条隐藏
  scrollHidden: 'scrollbar-hide overflow-y-auto',
}

// 动画类
export const animations = {
  fadeIn: 'animate-in fade-in duration-200',
  fadeOut: 'animate-out fade-out duration-200',
  slideIn: 'animate-in slide-in-from-top-2 duration-200',
  slideOut: 'animate-out slide-out-to-top-2 duration-200',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  scaleOut: 'animate-out zoom-out-95 duration-200',
}