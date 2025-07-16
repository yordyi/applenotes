'use client'

import { useAppDispatch } from '@/store/hooks'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { toggleSidebar } from '@/store/slices/uiSlice'
import { useAppSelector } from '@/store/hooks'
import { cn } from '@/lib/utils'
import { SidebarContent } from './sidebar/SidebarContent'

export function Sidebar() {
  const dispatch = useAppDispatch()
  const { sidebarCollapsed } = useAppSelector(state => state.ui)

  return (
    <div className="h-full flex flex-col relative">
      {/* 折叠/展开按钮 */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className={cn(
          'absolute top-4 -right-12 z-10',
          'p-2 rounded-lg',
          'bg-white dark:bg-apple-gray-800',
          'border border-apple-gray-200 dark:border-apple-gray-700',
          'hover:bg-apple-gray-50 dark:hover:bg-apple-gray-700',
          'transition-all duration-200',
          'shadow-sm hover:shadow-md'
        )}
      >
        {sidebarCollapsed ? (
          <PanelLeftOpen className="w-4 h-4 text-apple-gray-600 dark:text-apple-gray-400" />
        ) : (
          <PanelLeftClose className="w-4 h-4 text-apple-gray-600 dark:text-apple-gray-400" />
        )}
      </button>

      {/* 使用新的SidebarContent组件 */}
      <SidebarContent isCollapsed={sidebarCollapsed} />
    </div>
  )
}