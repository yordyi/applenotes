'use client'

import React, { useState, memo, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { 
  ChevronRight, 
  Folder, 
  FolderOpen,
  MoreHorizontal,
  Edit2,
  Trash2,
  FolderPlus
} from 'lucide-react'
import { 
  selectFolder, 
  toggleFolderExpanded,
  deleteFolder,
  renameFolder,
  addFolder,
  Folder as FolderType
} from '@/store/slices/foldersSlice'
import { selectFolderNoteCounts } from '@/store/slices/notesSlice'
import { cn } from '@/lib/utils'

interface FolderTreeProps {
  isCollapsed: boolean
}

interface FolderItemProps {
  folder: FolderType
  level: number
  isCollapsed: boolean
  noteCount: number
}

const FolderItem = memo(function FolderItem({ folder, level, isCollapsed, noteCount }: FolderItemProps) {
  const dispatch = useAppDispatch()
  const { selectedFolderId, expandedFolders, folders } = useAppSelector(state => state.folders)
  const folderNoteCounts = useAppSelector(selectFolderNoteCounts)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(folder.name)
  const [showMenu, setShowMenu] = useState(false)
  
  const isExpanded = expandedFolders.includes(folder.id)
  const isSelected = selectedFolderId === folder.id
  const hasChildren = folders.some(f => f.parentId === folder.id)

  const handleRename = useCallback(() => {
    if (editName.trim() && editName !== folder.name) {
      dispatch(renameFolder({ id: folder.id, newName: editName.trim() }))
    }
    setIsEditing(false)
    setEditName(folder.name)
  }, [editName, folder.name, folder.id, dispatch])

  const handleDelete = useCallback(() => {
    if (window.confirm(`确定要删除文件夹 "${folder.name}" 吗？这将同时删除所有子文件夹。`)) {
      dispatch(deleteFolder(folder.id))
    }
    setShowMenu(false)
  }, [folder.name, folder.id, dispatch])

  const handleAddSubfolder = useCallback(() => {
    const name = prompt('新建子文件夹名称:')
    if (name?.trim()) {
      dispatch(addFolder({
        name: name.trim(),
        parentId: folder.id,
        icon: 'folder'
      }))
      // 展开父文件夹
      if (!isExpanded) {
        dispatch(toggleFolderExpanded(folder.id))
      }
    }
    setShowMenu(false)
  }, [folder.id, isExpanded, dispatch])

  const handleFolderClick = useCallback(() => {
    dispatch(selectFolder(folder.id))
    if (hasChildren) {
      dispatch(toggleFolderExpanded(folder.id))
    }
  }, [folder.id, hasChildren, dispatch])

  if (isCollapsed) {
    return (
      <div
        className={cn(
          'p-2 rounded cursor-pointer mb-1',
          'transition-all duration-200',
          'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800',
          isSelected && 'bg-apple-yellow text-black'
        )}
        onClick={handleFolderClick}
        title={folder.name}
      >
        <Folder className="w-4 h-4 mx-auto" />
      </div>
    )
  }

  return (
    <div>
      <div
        className={cn(
          'flex items-center space-x-1 px-2 py-1.5 rounded cursor-pointer',
          'transition-all duration-200',
          'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800',
          isSelected && 'bg-apple-yellow text-black',
          'group relative'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleFolderClick}
      >
        {hasChildren && (
          <ChevronRight
            className={cn(
              'w-3 h-3 transition-transform flex-shrink-0',
              isExpanded && 'rotate-90'
            )}
          />
        )}
        
        {isExpanded && hasChildren ? (
          <FolderOpen className="w-4 h-4 flex-shrink-0" />
        ) : (
          <Folder className="w-4 h-4 flex-shrink-0" />
        )}
        
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') {
                setIsEditing(false)
                setEditName(folder.name)
              }
            }}
            className={cn(
              'flex-1 bg-transparent outline-none text-sm',
              'border-b border-apple-gray-400'
            )}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <>
            <span className="text-sm flex-1 truncate">{folder.name}</span>
            {noteCount > 0 && (
              <span className="text-xs text-apple-gray-400">{noteCount}</span>
            )}
          </>
        )}
        
        {/* 更多操作按钮 */}
        <div className="relative">
          <button
            className={cn(
              'p-1 rounded opacity-0 group-hover:opacity-100',
              'hover:bg-apple-gray-200 dark:hover:bg-apple-gray-700',
              'transition-all duration-200',
              showMenu && 'opacity-100'
            )}
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
          >
            <MoreHorizontal className="w-3 h-3" />
          </button>
          
          {showMenu && (
            <div className={cn(
              'absolute right-0 top-6 z-50',
              'bg-white dark:bg-apple-gray-800',
              'border border-apple-gray-200 dark:border-apple-gray-700',
              'rounded-lg shadow-lg',
              'py-1 w-40'
            )}>
              <button
                className={cn(
                  'w-full px-3 py-1.5 text-left text-sm',
                  'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-700',
                  'flex items-center space-x-2'
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditing(true)
                  setShowMenu(false)
                }}
              >
                <Edit2 className="w-3 h-3" />
                <span>重命名</span>
              </button>
              
              <button
                className={cn(
                  'w-full px-3 py-1.5 text-left text-sm',
                  'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-700',
                  'flex items-center space-x-2'
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddSubfolder()
                }}
              >
                <FolderPlus className="w-3 h-3" />
                <span>新建子文件夹</span>
              </button>
              
              <div className="border-t border-apple-gray-200 dark:border-apple-gray-700 my-1" />
              
              <button
                className={cn(
                  'w-full px-3 py-1.5 text-left text-sm',
                  'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-700',
                  'flex items-center space-x-2',
                  'text-red-500'
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete()
                }}
              >
                <Trash2 className="w-3 h-3" />
                <span>删除</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* 子文件夹 */}
      {isExpanded && hasChildren && (
        <div>
          {folders
            .filter(f => f.parentId === folder.id)
            .sort((a, b) => a.order - b.order)
            .map(childFolder => (
              <FolderItem
                key={childFolder.id}
                folder={childFolder}
                level={level + 1}
                isCollapsed={isCollapsed}
                noteCount={folderNoteCounts.get(childFolder.id) || 0}
              />
            ))}
        </div>
      )}
    </div>
  )
})

export function FolderTree({ isCollapsed }: FolderTreeProps) {
  const { folders } = useAppSelector(state => state.folders)
  const folderNoteCounts = useAppSelector(selectFolderNoteCounts)
  
  // 获取根文件夹（没有父文件夹的）
  const rootFolders = folders
    .filter(folder => !folder.parentId)
    .sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-1">
      {rootFolders.map(folder => (
        <FolderItem
          key={folder.id}
          folder={folder}
          level={0}
          isCollapsed={isCollapsed}
          noteCount={folderNoteCounts.get(folder.id) || 0}
        />
      ))}
    </div>
  )
}