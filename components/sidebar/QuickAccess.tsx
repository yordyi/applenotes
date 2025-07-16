'use client'

import React from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { 
  Clock, 
  Pin, 
  FileText,
  Star,
  Tag,
  Archive,
  Trash2
} from 'lucide-react'
import { selectFolder } from '@/store/slices/foldersSlice'
import { cn } from '@/lib/utils'

interface QuickAccessProps {
  isCollapsed: boolean
}

interface QuickAccessItemProps {
  icon: React.ReactNode
  label: string
  count?: number
  isSelected: boolean
  onClick: () => void
  isCollapsed: boolean
  color?: string
}

function QuickAccessItem({ 
  icon, 
  label, 
  count, 
  isSelected, 
  onClick, 
  isCollapsed,
  color 
}: QuickAccessItemProps) {
  return (
    <div
      className={cn(
        'flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer',
        'transition-all duration-200',
        'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800',
        isSelected && 'bg-apple-yellow text-black',
        isCollapsed && 'justify-center px-2'
      )}
      onClick={onClick}
      title={isCollapsed ? label : undefined}
    >
      <div className={cn('flex-shrink-0', color)}>{icon}</div>
      {!isCollapsed && (
        <>
          <span className="text-sm font-medium flex-1">{label}</span>
          {count !== undefined && count > 0 && (
            <span className="text-xs text-apple-gray-400">{count}</span>
          )}
        </>
      )}
    </div>
  )
}

export function QuickAccess({ isCollapsed }: QuickAccessProps) {
  const dispatch = useAppDispatch()
  const { selectedFolderId } = useAppSelector(state => state.folders)
  const { notes } = useAppSelector(state => state.notes)
  
  // 计算各种笔记数量
  const allNotesCount = notes.length
  const pinnedCount = notes.filter(n => n.isPinned).length
  const recentCount = notes.filter(n => {
    const dayAgo = new Date()
    dayAgo.setDate(dayAgo.getDate() - 1)
    return new Date(n.updatedAt) > dayAgo
  }).length
  const taggedCount = notes.filter(n => n.tags && n.tags.length > 0).length

  const quickAccessItems = [
    {
      id: 'all',
      icon: <FileText className="w-4 h-4" />,
      label: '全部备忘录',
      count: allNotesCount,
      color: 'text-blue-500'
    },
    {
      id: 'recent',
      icon: <Clock className="w-4 h-4" />,
      label: '最近使用',
      count: recentCount,
      color: 'text-orange-500'
    },
    {
      id: 'pinned',
      icon: <Pin className="w-4 h-4" />,
      label: '置顶备忘录',
      count: pinnedCount,
      color: 'text-yellow-500'
    },
    {
      id: 'starred',
      icon: <Star className="w-4 h-4" />,
      label: '收藏',
      count: 0, // TODO: 实现收藏功能
      color: 'text-purple-500'
    },
    {
      id: 'tagged',
      icon: <Tag className="w-4 h-4" />,
      label: '标签',
      count: taggedCount,
      color: 'text-green-500'
    }
  ]

  return (
    <div className={cn('px-4 pt-4', isCollapsed && 'px-2')}>
      {!isCollapsed && (
        <h2 className="text-xs font-semibold text-apple-gray-500 uppercase tracking-wider mb-3">
          快速访问
        </h2>
      )}
      
      <div className="space-y-1">
        {quickAccessItems.map(item => (
          <QuickAccessItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            count={item.count}
            color={item.color}
            isSelected={selectedFolderId === item.id}
            onClick={() => dispatch(selectFolder(item.id))}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>
      
      {!isCollapsed && (
        <div className="border-t border-apple-gray-200 dark:border-apple-gray-800 mt-4 pt-4">
          <div className="space-y-1">
            <QuickAccessItem
              icon={<Archive className="w-4 h-4" />}
              label="归档"
              isSelected={selectedFolderId === 'archive'}
              onClick={() => dispatch(selectFolder('archive'))}
              isCollapsed={isCollapsed}
              color="text-apple-gray-400"
            />
            <QuickAccessItem
              icon={<Trash2 className="w-4 h-4" />}
              label="最近删除"
              isSelected={selectedFolderId === 'trash'}
              onClick={() => dispatch(selectFolder('trash'))}
              isCollapsed={isCollapsed}
              color="text-red-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}