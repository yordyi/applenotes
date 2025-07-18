'use client'

import React from 'react'
import { Star, Clock, Archive, Trash2, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickAccessItem {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  count: number
  color?: string
}

interface QuickAccessPanelProps {
  selectedItemId?: string
  onItemSelect: (itemId: string) => void
  className?: string
  isCollapsed?: boolean
}

const quickAccessItems: QuickAccessItem[] = [
  {
    id: 'all',
    name: '所有笔记',
    icon: ({ className }) => (
      <div className={cn('w-4 h-4 rounded-full bg-apple-blue', className)} />
    ),
    count: 42,
  },
  {
    id: 'starred',
    name: '已收藏',
    icon: Star,
    count: 8,
    color: 'text-apple-yellow',
  },
  {
    id: 'recent',
    name: '最近使用',
    icon: Clock,
    count: 15,
    color: 'text-apple-green',
  },
  {
    id: 'tags',
    name: '标签',
    icon: Hash,
    count: 23,
    color: 'text-apple-purple',
  },
  {
    id: 'archived',
    name: '已归档',
    icon: Archive,
    count: 6,
    color: 'text-apple-gray-500',
  },
  {
    id: 'trash',
    name: '废纸篓',
    icon: Trash2,
    count: 3,
    color: 'text-apple-red',
  },
]

export const QuickAccessPanel: React.FC<QuickAccessPanelProps> = ({
  selectedItemId,
  onItemSelect,
  className,
  isCollapsed = false,
}) => {
  if (isCollapsed) {
    return (
      <div className={cn('space-y-2 p-2', className)}>
        {quickAccessItems.map(item => {
          const Icon = item.icon
          const isSelected = selectedItemId === item.id

          return (
            <button
              key={item.id}
              onClick={() => onItemSelect(item.id)}
              className={cn(
                'w-full p-2 rounded-apple-md transition-all duration-apple-fast',
                'flex items-center justify-center',
                'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800',
                isSelected && 'bg-apple-blue/10 text-apple-blue dark:bg-apple-blue/20'
              )}
              aria-label={`${item.name} (${item.count})`}
            >
              <Icon className={cn('w-4 h-4', item.color)} />
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('space-y-1 p-3', className)}>
      <h3 className="text-apple-caption1 font-medium text-system-tertiary-label dark:text-apple-gray-500 uppercase tracking-wider mb-2">
        快速访问
      </h3>

      {quickAccessItems.map(item => {
        const Icon = item.icon
        const isSelected = selectedItemId === item.id

        return (
          <button
            key={item.id}
            onClick={() => onItemSelect(item.id)}
            className={cn(
              'w-full p-2 rounded-apple-md transition-all duration-apple-fast',
              'flex items-center justify-between text-left',
              'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800',
              isSelected && 'bg-apple-blue/10 text-apple-blue dark:bg-apple-blue/20'
            )}
            aria-pressed={isSelected}
          >
            <div className="flex items-center space-x-3">
              <Icon className={cn('w-4 h-4', item.color)} />
              <span className="text-apple-footnote font-medium">{item.name}</span>
            </div>

            <span className="text-apple-caption1 text-system-tertiary-label dark:text-apple-gray-500">
              {item.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
