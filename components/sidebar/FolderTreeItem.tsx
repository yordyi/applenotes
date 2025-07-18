'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppleButton } from '../ui/AppleButton'

interface FolderTreeItemProps {
  folder: {
    id: string
    name: string
    count: number
    parentId: string | null
    icon?: string
  }
  level: number
  isExpanded: boolean
  isSelected: boolean
  hasChildren: boolean
  isRenaming: boolean
  renamingValue: string
  onToggle: (folderId: string) => void
  onSelect: (folderId: string) => void
  onRename: (folderId: string, newName: string) => void
  onCancelRename: () => void
  onRenamingValueChange: (value: string) => void
  onContextMenu: (e: React.MouseEvent, folderId: string) => void
  children?: React.ReactNode
}

export const FolderTreeItem: React.FC<FolderTreeItemProps> = ({
  folder,
  level,
  isExpanded,
  isSelected,
  hasChildren,
  isRenaming,
  renamingValue,
  onToggle,
  onSelect,
  onRename,
  onCancelRename,
  onRenamingValueChange,
  onContextMenu,
  children,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onRename(folder.id, renamingValue)
    } else if (e.key === 'Escape') {
      onCancelRename()
    }
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasChildren) {
      onToggle(folder.id)
    }
  }

  const handleSelect = () => {
    if (!isRenaming) {
      onSelect(folder.id)
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    onContextMenu(e, folder.id)
  }

  return (
    <div className="select-none">
      <div
        className={cn(
          'group flex items-center py-1.5 px-2 rounded-apple cursor-pointer transition-all duration-apple-fast',
          'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800',
          isSelected && 'bg-apple-blue/10 text-apple-blue dark:bg-apple-blue/20',
          isHovered && 'bg-apple-gray-50 dark:bg-apple-gray-800',
          level > 0 && 'ml-4'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleSelect}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
        aria-level={level + 1}
      >
        {/* 展开/折叠按钮 */}
        {hasChildren ? (
          <AppleButton
            variant="ghost"
            size="sm"
            className="w-4 h-4 p-0 mr-1 hover:bg-apple-gray-200 dark:hover:bg-apple-gray-700"
            onClick={handleToggle}
            aria-label={isExpanded ? '折叠文件夹' : '展开文件夹'}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </AppleButton>
        ) : (
          <div className="w-4 h-4 mr-1" />
        )}

        {/* 文件夹图标 */}
        <div className="w-4 h-4 mr-2 flex items-center justify-center">
          {folder.icon ? (
            <span className="text-apple-footnote">{folder.icon}</span>
          ) : isExpanded ? (
            <FolderOpen className="w-4 h-4 text-apple-blue" />
          ) : (
            <Folder className="w-4 h-4 text-apple-gray-500 dark:text-apple-gray-400" />
          )}
        </div>

        {/* 文件夹名称 */}
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <input
              ref={inputRef}
              type="text"
              value={renamingValue}
              onChange={e => onRenamingValueChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => onCancelRename()}
              className="w-full bg-white dark:bg-apple-gray-900 border border-apple-blue rounded-apple-sm px-1 py-0.5 text-apple-footnote focus:outline-none focus:ring-1 focus:ring-apple-blue"
              autoFocus
            />
          ) : (
            <span className="text-apple-footnote font-medium truncate">{folder.name}</span>
          )}
        </div>

        {/* 笔记数量 */}
        <span className="text-apple-caption1 text-system-tertiary-label dark:text-apple-gray-500 ml-2">
          {folder.count}
        </span>
      </div>

      {/* 子文件夹 */}
      {hasChildren && isExpanded && (
        <div className="ml-4" role="group">
          {children}
        </div>
      )}
    </div>
  )
}
