'use client'

import React, { ReactNode } from 'react'
import { useAppSelector } from '@/store/hooks'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  sidebar: ReactNode
  notesList: ReactNode
  noteEditor: ReactNode
}

export function MainLayout({ sidebar, notesList, noteEditor }: MainLayoutProps) {
  const { sidebarCollapsed } = useAppSelector(state => state.ui)
  const { selectedNoteId } = useAppSelector(state => state.notes)

  return (
    <div className="flex h-screen bg-white dark:bg-black overflow-hidden">
      {/* 侧边栏 */}
      <div
        className={cn(
          'flex-shrink-0 bg-apple-gray-50 dark:bg-apple-gray-900',
          'border-r border-apple-gray-200 dark:border-apple-gray-800',
          'transition-all duration-300 ease-in-out',
          'overflow-hidden',
          sidebarCollapsed ? 'w-0 md:w-16' : 'w-[280px]'
        )}
      >
        <div className={cn(
          'h-full',
          'transition-opacity duration-300',
          sidebarCollapsed ? 'opacity-0 md:opacity-100' : 'opacity-100'
        )}>
          {sidebar}
        </div>
      </div>

      {/* 笔记列表 */}
      <div
        className={cn(
          'flex-shrink-0 bg-apple-gray-100 dark:bg-apple-gray-800',
          'border-r border-apple-gray-200 dark:border-apple-gray-800',
          'transition-all duration-300 ease-in-out',
          'overflow-hidden',
          // 移动端响应式
          selectedNoteId 
            ? 'w-0 md:w-[350px]' // 选中笔记时在移动端隐藏列表
            : 'w-full md:w-[350px]' // 未选中时全屏显示列表
        )}
      >
        <div className="h-full overflow-y-auto">
          {notesList}
        </div>
      </div>

      {/* 笔记编辑器 */}
      <div className={cn(
        'flex-1 bg-white dark:bg-apple-gray-900',
        'min-w-0', // 防止flex子元素溢出
        'transition-all duration-300 ease-in-out',
        selectedNoteId ? 'block' : 'hidden md:block'
      )}>
        {noteEditor}
      </div>
    </div>
  )
}