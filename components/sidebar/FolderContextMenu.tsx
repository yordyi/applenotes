'use client'

import React, { useEffect, useRef } from 'react'
import { Edit3, Trash2, Plus, Copy, Move, Star, Archive } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FolderContextMenuProps {
  position: { x: number; y: number }
  folderId: string
  onClose: () => void
  onRename: (folderId: string) => void
  onDelete: (folderId: string) => void
  onCreateFolder: (parentId: string) => void
  onCreateNote: (folderId: string) => void
  onDuplicate: (folderId: string) => void
  onMove: (folderId: string) => void
  onFavorite: (folderId: string) => void
  onArchive: (folderId: string) => void
  className?: string
}

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  action: () => void
  separator?: boolean
  destructive?: boolean
}

export const FolderContextMenu: React.FC<FolderContextMenuProps> = ({
  position,
  folderId,
  onClose,
  onRename,
  onDelete,
  onCreateFolder,
  onCreateNote,
  onDuplicate,
  onMove,
  onFavorite,
  onArchive,
  className,
}) => {
  const menuRef = useRef<HTMLDivElement>(null)

  const menuItems: MenuItem[] = [
    {
      id: 'create-note',
      label: '新建笔记',
      icon: Plus,
      action: () => {
        onCreateNote(folderId)
        onClose()
      },
    },
    {
      id: 'create-folder',
      label: '新建文件夹',
      icon: Plus,
      action: () => {
        onCreateFolder(folderId)
        onClose()
      },
      separator: true,
    },
    {
      id: 'rename',
      label: '重命名',
      icon: Edit3,
      action: () => {
        onRename(folderId)
        onClose()
      },
    },
    {
      id: 'duplicate',
      label: '复制',
      icon: Copy,
      action: () => {
        onDuplicate(folderId)
        onClose()
      },
    },
    {
      id: 'move',
      label: '移动',
      icon: Move,
      action: () => {
        onMove(folderId)
        onClose()
      },
    },
    {
      id: 'favorite',
      label: '收藏',
      icon: Star,
      action: () => {
        onFavorite(folderId)
        onClose()
      },
      separator: true,
    },
    {
      id: 'archive',
      label: '归档',
      icon: Archive,
      action: () => {
        onArchive(folderId)
        onClose()
      },
    },
    {
      id: 'delete',
      label: '删除',
      icon: Trash2,
      action: () => {
        onDelete(folderId)
        onClose()
      },
      destructive: true,
    },
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  // 确保菜单不会超出视口
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 220),
    y: Math.min(position.y, window.innerHeight - 300),
  }

  return (
    <div
      ref={menuRef}
      className={cn(
        'fixed z-50 min-w-[200px] overflow-hidden',
        'bg-white dark:bg-apple-gray-800',
        'rounded-apple-lg shadow-apple-xl border border-system-separator dark:border-apple-gray-700',
        'animate-apple-scale-in',
        className
      )}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      <div className="py-2">
        {menuItems.map((item, index) => (
          <React.Fragment key={item.id}>
            {item.separator && index > 0 && (
              <div className="mx-2 my-1 h-px bg-system-separator dark:bg-apple-gray-700" />
            )}
            <button
              onClick={item.action}
              className={cn(
                'w-full flex items-center px-4 py-2 text-left',
                'text-apple-footnote font-medium transition-colors duration-apple-fast',
                'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-700',
                item.destructive
                  ? 'text-apple-red hover:text-apple-red'
                  : 'text-system-label dark:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'w-4 h-4 mr-3',
                  item.destructive
                    ? 'text-apple-red'
                    : 'text-system-tertiary-label dark:text-apple-gray-400'
                )}
              />
              {item.label}
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
