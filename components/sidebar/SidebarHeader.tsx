'use client'

import React from 'react'
import { Plus, Menu, Settings } from 'lucide-react'
import { AppleButton } from '../ui/AppleButton'
import { cn } from '@/lib/utils'

interface SidebarHeaderProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  onCreateNote: () => void
  onCreateFolder: () => void
  onSettings: () => void
  className?: string
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  isCollapsed,
  onToggleCollapse,
  onCreateNote,
  onCreateFolder,
  onSettings,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 border-b border-system-separator dark:border-apple-gray-700',
        className
      )}
    >
      {/* 左侧：Logo和标题 */}
      <div className="flex items-center space-x-3">
        <AppleButton
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="p-1.5 hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800"
          aria-label={isCollapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          <Menu className="w-4 h-4" />
        </AppleButton>

        {!isCollapsed && (
          <h1 className="text-apple-headline font-semibold text-system-label dark:text-white">
            笔记
          </h1>
        )}
      </div>

      {/* 右侧：操作按钮 */}
      <div className="flex items-center space-x-2">
        {!isCollapsed && (
          <>
            <AppleButton
              variant="ghost"
              size="sm"
              onClick={onCreateNote}
              className="p-1.5 hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800"
              aria-label="新建笔记"
            >
              <Plus className="w-4 h-4" />
            </AppleButton>

            <AppleButton
              variant="ghost"
              size="sm"
              onClick={onSettings}
              className="p-1.5 hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800"
              aria-label="设置"
            >
              <Settings className="w-4 h-4" />
            </AppleButton>
          </>
        )}
      </div>
    </div>
  )
}
