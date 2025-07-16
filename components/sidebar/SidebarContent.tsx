'use client'

import React, { useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { 
  Search, 
  Plus, 
  FolderPlus, 
  Clock, 
  Pin, 
  FileText,
  Trash2,
  Star,
  Tag
} from 'lucide-react'
import { setSearchQuery, addNote } from '@/store/slices/notesSlice'
import { setFolderSearchQuery, addFolder } from '@/store/slices/foldersSlice'
import { cn } from '@/lib/utils'
import { FolderTree } from './FolderTree'
import { QuickAccess } from './QuickAccess'

interface SidebarContentProps {
  isCollapsed: boolean
}

export function SidebarContent({ isCollapsed }: SidebarContentProps) {
  const dispatch = useAppDispatch()
  const { searchQuery } = useAppSelector(state => state.notes)
  const { selectedFolderId } = useAppSelector(state => state.folders)
  const { sidebarCollapsed } = useAppSelector(state => state.ui)
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      dispatch(addFolder({
        name: newFolderName.trim(),
        parentId: null,
        icon: 'folder'
      }))
      setNewFolderName('')
      setShowNewFolderDialog(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* 搜索栏 */}
      <div className={cn(
        'p-4 border-b border-apple-gray-200 dark:border-apple-gray-800',
        'bg-apple-gray-50/50 dark:bg-apple-gray-900/50',
        isCollapsed && 'px-2'
      )}>
        <div className="relative">
          {!isCollapsed ? (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-apple-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                className={cn(
                  'w-full pl-10 pr-4 py-2',
                  'bg-white dark:bg-apple-gray-800',
                  'border border-apple-gray-200 dark:border-apple-gray-700',
                  'rounded-lg text-sm',
                  'placeholder-apple-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-apple-yellow focus:border-transparent',
                  'transition-all duration-200'
                )}
              />
            </div>
          ) : (
            <button 
              className={cn(
                'w-full p-2',
                'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800',
                'rounded-lg transition-colors'
              )}
              title="搜索"
            >
              <Search className="w-4 h-4 text-apple-gray-400 mx-auto" />
            </button>
          )}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* 快速访问区域 */}
        <QuickAccess isCollapsed={isCollapsed} />

        {/* 文件夹区域 */}
        <div className={cn('px-4 pb-4', isCollapsed && 'px-2')}>
          {!isCollapsed && (
            <div className="flex items-center justify-between mb-3 mt-4">
              <h2 className="text-xs font-semibold text-apple-gray-500 uppercase tracking-wider">
                文件夹
              </h2>
              <button
                onClick={() => setShowNewFolderDialog(true)}
                className={cn(
                  'p-1 rounded',
                  'text-apple-gray-400 hover:text-apple-gray-600',
                  'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800',
                  'transition-all duration-200'
                )}
                title="新建文件夹"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 文件夹树 */}
          <FolderTree isCollapsed={isCollapsed} />
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className={cn(
        'p-4 border-t border-apple-gray-200 dark:border-apple-gray-800',
        'bg-apple-gray-50/50 dark:bg-apple-gray-900/50',
        isCollapsed && 'px-2'
      )}>
        <button 
          onClick={() => {
            dispatch(addNote({
              title: '新建备忘录',
              content: '',
              folderId: selectedFolderId === 'all' || selectedFolderId === 'recent' || selectedFolderId === 'pinned' || selectedFolderId === 'starred' || selectedFolderId === 'tagged' ? null : selectedFolderId,
              isPinned: false,
              tags: []
            }))
          }}
          className={cn(
            'flex items-center space-x-2',
            'text-apple-gray-600 hover:text-apple-gray-800 dark:text-apple-gray-400 dark:hover:text-apple-gray-200',
            'transition-colors duration-200',
            isCollapsed && 'justify-center'
          )}
          title="新建备忘录"
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span className="text-sm font-medium">新建备忘录</span>}
        </button>
      </div>

      {/* 新建文件夹对话框 */}
      {showNewFolderDialog && !isCollapsed && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-apple-gray-800 rounded-lg shadow-xl p-4 w-64">
            <h3 className="text-sm font-semibold mb-3">新建文件夹</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              placeholder="文件夹名称"
              className={cn(
                'w-full px-3 py-2',
                'bg-apple-gray-50 dark:bg-apple-gray-900',
                'border border-apple-gray-200 dark:border-apple-gray-700',
                'rounded text-sm',
                'focus:outline-none focus:ring-2 focus:ring-apple-yellow',
                'placeholder-apple-gray-400'
              )}
              autoFocus
            />
            <div className="flex justify-end space-x-2 mt-3">
              <button
                onClick={() => {
                  setShowNewFolderDialog(false)
                  setNewFolderName('')
                }}
                className="px-3 py-1 text-sm text-apple-gray-600 hover:text-apple-gray-800"
              >
                取消
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className={cn(
                  'px-3 py-1 text-sm rounded',
                  'bg-apple-yellow text-black',
                  'hover:bg-yellow-500',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-colors'
                )}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}