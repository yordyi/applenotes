'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import {
  selectFolder,
  toggleFolderExpanded,
  addFolder,
  renameFolder,
  deleteFolder,
  setSortBy,
  setGroupBy,
  convertToSmartFolder,
} from '@/store/slices/foldersSlice'
import { setSearchQuery, deleteNotesByFolder } from '@/store/slices/notesSlice'

interface Folder {
  id: string
  name: string
  count: number
  parentId: string | null
  expanded: boolean
  icon?: string
}

interface FolderItemProps {
  folder: Folder
  level: number
  onToggle: (folderId: string) => void
  onSelect: (folderId: string) => void
  onContextMenu: (e: React.MouseEvent, folderId: string) => void
  isSelected: boolean
  isExpanded: boolean
  hasChildren: boolean
  isContextMenuTarget: boolean
  isRenaming: boolean
  onRename: (folderId: string, newName: string) => void
  onCancelRename: () => void
  renamingValue: string
  onRenamingValueChange: (value: string) => void
}

function FolderItem({
  folder,
  level,
  onToggle,
  onSelect,
  onContextMenu,
  isSelected,
  isExpanded,
  hasChildren,
  isContextMenuTarget,
  isRenaming,
  onRename,
  onCancelRename,
  renamingValue,
  onRenamingValueChange,
}: FolderItemProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onRename(folder.id, renamingValue)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancelRename()
    }
  }

  return (
    <div
      className={`flex items-center justify-between py-2 px-4 hover:bg-gray-800 cursor-pointer transition-colors duration-150 ${
        isSelected ? 'bg-gray-700' : ''
      } ${isContextMenuTarget ? 'border-2 border-yellow-400' : ''}`}
      style={{ paddingLeft: `${level * 20 + 16}px` }}
      onContextMenu={e => onContextMenu(e, folder.id)}
    >
      <div className="flex items-center flex-1">
        <div
          className="text-gray-400 text-xs w-4 h-4 flex items-center justify-center mr-2"
          onClick={e => {
            e.stopPropagation()
            if (hasChildren) {
              onToggle(folder.id)
            }
          }}
        >
          {hasChildren ? (isExpanded ? '▼' : '▶') : ''}
        </div>

        <span className="text-yellow-400 mr-2">{folder.icon || '📁'}</span>

        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={renamingValue}
            onChange={e => onRenamingValueChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => onRename(folder.id, renamingValue)}
            className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 text-sm flex-1 mr-2"
          />
        ) : (
          <span className="text-sm text-gray-200 flex-1" onClick={() => onSelect(folder.id)}>
            {folder.name}
          </span>
        )}
      </div>

      {!isRenaming && <span className="text-xs text-gray-400">{folder.count}</span>}
    </div>
  )
}

// 右键菜单组件
const ContextMenu = ({
  x,
  y,
  folderId,
  onClose,
  onAction,
}: {
  x: number
  y: number
  folderId: string
  onClose: () => void
  onAction: (action: string) => void
}) => {
  const menuItems = [
    { icon: '✏️', label: '重新命名文件夹', action: 'rename' },
    { icon: '🗑️', label: '删除文件夹', action: 'delete' },
    { icon: '📁', label: '新建文件夹', action: 'create' },
    { icon: '📤', label: '共享文件夹', action: 'share' },
    { icon: '↕️', label: '排序方式', action: 'sort', hasArrow: true },
    { icon: '📅', label: '按日期分组', action: 'group', hasArrow: true },
    { icon: '⚙️', label: '转换为智能文件夹', action: 'convert' },
  ]

  // 边界检测
  const adjustPosition = (x: number, y: number) => {
    const menuWidth = 256 // w-64 = 256px
    const menuHeight = menuItems.length * 40 // 估算高度
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    let adjustedX = x
    let adjustedY = y

    if (x + menuWidth > screenWidth) {
      adjustedX = screenWidth - menuWidth - 10
    }

    if (y + menuHeight > screenHeight) {
      adjustedY = screenHeight - menuHeight - 10
    }

    return { x: adjustedX, y: adjustedY }
  }

  const { x: adjustedX, y: adjustedY } = adjustPosition(x, y)

  return (
    <div
      className="fixed bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-xl w-64 py-2 z-50"
      style={{ left: adjustedX, top: adjustedY }}
      onClick={e => e.stopPropagation()}
    >
      {menuItems.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between px-4 py-2 hover:bg-gray-700 cursor-pointer text-white text-sm"
          onClick={() => onAction(item.action)}
        >
          <div className="flex items-center">
            <span className="mr-3 text-base">{item.icon}</span>
            <span className="text-gray-200">{item.label}</span>
          </div>
          {item.hasArrow && <span className="text-gray-400 text-xs">▶</span>}
        </div>
      ))}
    </div>
  )
}

// 排序子菜单
const SortSubmenu = ({
  x,
  y,
  onClose,
  onSelect,
  currentSort,
}: {
  x: number
  y: number
  onClose: () => void
  onSelect: (sort: string) => void
  currentSort: string
}) => {
  const sortOptions = [
    { value: 'name', label: '按名称' },
    { value: 'modified', label: '按修改日期' },
    { value: 'created', label: '按创建日期' },
    { value: 'size', label: '按大小' },
    { value: 'manual', label: '手动排序' },
  ]

  return (
    <div
      className="absolute left-full top-0 ml-2 bg-gray-800 rounded-lg shadow-xl w-48 py-2 z-50"
      style={{ left: x, top: y }}
    >
      {sortOptions.map(option => (
        <div
          key={option.value}
          className="flex items-center justify-between px-4 py-2 hover:bg-gray-700 cursor-pointer text-white text-sm"
          onClick={() => onSelect(option.value)}
        >
          <span>{option.label}</span>
          {currentSort === option.value && <span className="text-yellow-400">✓</span>}
        </div>
      ))}
    </div>
  )
}

// 分组子菜单
const GroupSubmenu = ({
  x,
  y,
  onClose,
  onSelect,
  currentGroup,
}: {
  x: number
  y: number
  onClose: () => void
  onSelect: (group: string) => void
  currentGroup: string
}) => {
  const groupOptions = [
    { value: 'none', label: '不分组' },
    { value: 'date', label: '按日期' },
    { value: 'week', label: '按周' },
    { value: 'month', label: '按月' },
    { value: 'year', label: '按年' },
  ]

  return (
    <div
      className="absolute left-full top-0 ml-2 bg-gray-800 rounded-lg shadow-xl w-48 py-2 z-50"
      style={{ left: x, top: y }}
    >
      {groupOptions.map(option => (
        <div
          key={option.value}
          className="flex items-center justify-between px-4 py-2 hover:bg-gray-700 cursor-pointer text-white text-sm"
          onClick={() => onSelect(option.value)}
        >
          <span>{option.label}</span>
          {currentGroup === option.value && <span className="text-yellow-400">✓</span>}
        </div>
      ))}
    </div>
  )
}

// 删除确认对话框
const DeleteConfirmDialog = ({
  folderId,
  folderName,
  onCancel,
  onConfirm,
}: {
  folderId: string
  folderName: string
  onCancel: () => void
  onConfirm: () => void
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">删除文件夹</h3>
        <p className="text-red-600 mb-4">
          此操作将永久删除文件夹 &quot;{folderName}&quot;
          及其所有内容，包括子文件夹和笔记。此操作无法撤销。
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  )
}

// 共享对话框
const ShareDialog = ({
  folderId,
  folderName,
  onClose,
}: {
  folderId: string
  folderName: string
  onClose: () => void
}) => {
  const [shareLink, setShareLink] = useState(`https://notes.app/shared/${folderId}`)
  const [permission, setPermission] = useState<'read' | 'edit'>('read')
  const [copySuccess, setCopySuccess] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">共享文件夹 &quot;{folderName}&quot;</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">共享权限</label>
          <select
            value={permission}
            onChange={e => setPermission(e.target.value as 'read' | 'edit')}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="read">只读</option>
            <option value="edit">可编辑</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">共享链接</label>
          <div className="flex">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="flex-1 p-2 border border-gray-300 rounded-l bg-gray-50"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 transition-colors"
            >
              复制
            </button>
          </div>
          {copySuccess && (
            <div className="mt-2 bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
              链接已复制到剪贴板
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

// 转换为智能文件夹对话框
const ConvertDialog = ({
  folderId,
  folderName,
  onClose,
  onConvert,
}: {
  folderId: string
  folderName: string
  onClose: () => void
  onConvert: (type: string, conditions: any) => void
}) => {
  const [smartType, setSmartType] = useState('recent')
  const [conditions, setConditions] = useState({})

  const smartTypes = [
    { value: 'recent', label: '最近修改' },
    { value: 'tagged', label: '包含标签' },
    { value: 'date_range', label: '特定日期范围' },
    { value: 'file_type', label: '文件类型' },
  ]

  const handleConvert = () => {
    onConvert(smartType, conditions)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">转换为智能文件夹</h3>
        <p className="text-gray-600 mb-4">
          将 &quot;{folderName}&quot; 转换为智能文件夹，会根据设定的条件自动收集符合条件的笔记。
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">智能文件夹类型</label>
          <select
            value={smartType}
            onChange={e => setSmartType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            {smartTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConvert}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            转换
          </button>
        </div>
      </div>
    </div>
  )
}

// Toast 通知组件
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      {message}
    </div>
  )
}

export function Sidebar() {
  const dispatch = useAppDispatch()
  const { selectedFolderId, sortBy, groupBy } = useAppSelector(state => state.folders)
  const { searchQuery, notes } = useAppSelector(state => state.notes)

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['4', '5', '5-2']))
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    folderId: string | null
  }>({
    visible: false,
    x: 0,
    y: 0,
    folderId: null,
  })

  // 搜索相关状态
  const [localSearchQuery, setLocalSearchQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // 重命名相关状态
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState('')

  // 删除相关状态
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // 共享相关状态
  const [sharingFolderId, setSharingFolderId] = useState<string | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)

  // 转换相关状态
  const [convertingFolderId, setConvertingFolderId] = useState<string | null>(null)
  const [showConvertDialog, setShowConvertDialog] = useState(false)

  // 子菜单相关状态
  const [showSortSubmenu, setShowSortSubmenu] = useState(false)
  const [showGroupSubmenu, setShowGroupSubmenu] = useState(false)
  const [sortSubmenuPosition, setSortSubmenuPosition] = useState({ x: 0, y: 0 })
  const [groupSubmenuPosition, setGroupSubmenuPosition] = useState({ x: 0, y: 0 })

  // Toast 状态
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const folderData: Folder[] = [
    { id: '1', name: '代代做项目', count: 4, parentId: null, expanded: false },
    { id: '2', name: '导入的备忘录', count: 1, parentId: null, expanded: false },
    { id: '3', name: '搞钱项目', count: 1, parentId: null, expanded: false },
    { id: '4', name: '公司级开卡平台', count: 19, parentId: null, expanded: true },
    { id: '4-1', name: '开户信息', count: 6, parentId: '4', expanded: false },
    { id: '5', name: '美国银行', count: 15, parentId: null, expanded: true },
    { id: '5-1', name: '美国地址和手机号', count: 2, parentId: '5', expanded: false },
    { id: '5-2', name: '美国公司', count: 0, parentId: '5', expanded: true },
    { id: '5-2-1', name: '公司报税', count: 0, parentId: '5-2', expanded: false },
    { id: '6', name: '个人项目', count: 8, parentId: null, expanded: false },
    { id: '6-1', name: '前端开发', count: 3, parentId: '6', expanded: false },
    { id: '6-2', name: '后端开发', count: 2, parentId: '6', expanded: false },
    { id: '6-3', name: '数据库设计', count: 1, parentId: '6', expanded: false },
    { id: '7', name: '学习资料', count: 12, parentId: null, expanded: false },
    { id: '7-1', name: 'JavaScript', count: 4, parentId: '7', expanded: false },
    { id: '7-2', name: 'React', count: 3, parentId: '7', expanded: false },
    { id: '7-3', name: 'Node.js', count: 2, parentId: '7', expanded: false },
    { id: '8', name: '工作笔记', count: 20, parentId: null, expanded: false },
    { id: '8-1', name: '会议记录', count: 8, parentId: '8', expanded: false },
    { id: '8-2', name: '项目规划', count: 5, parentId: '8', expanded: false },
    { id: '8-3', name: '代码片段', count: 4, parentId: '8', expanded: false },
  ]

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const selectFolderHandler = (folderId: string) => {
    dispatch(selectFolder(folderId))
  }

  const getFolderName = (folderId: string) => {
    return folderData.find(f => f.id === folderId)?.name || ''
  }

  const generateId = () => {
    return Date.now().toString()
  }

  // 搜索相关函数
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearchQuery(value)
  }

  const handleClearSearch = () => {
    setLocalSearchQuery('')
    dispatch(setSearchQuery(''))
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClearSearch()
    }
  }

  const getSearchSuggestions = () => {
    if (!localSearchQuery.trim()) return []

    const suggestions = new Set<string>()

    // 从笔记标题和内容中提取建议
    notes.forEach(note => {
      const words = [...note.title.split(/\s+/), ...note.content.split(/\s+/)]
      words.forEach(word => {
        if (word.length > 2 && word.toLowerCase().includes(localSearchQuery.toLowerCase())) {
          suggestions.add(word)
        }
      })

      // 添加标签建议
      note.tags.forEach(tag => {
        if (tag.toLowerCase().includes(localSearchQuery.toLowerCase())) {
          suggestions.add(`#${tag}`)
        }
      })
    })

    return Array.from(suggestions).slice(0, 5)
  }

  const getSearchResultsCount = () => {
    if (!searchQuery.trim()) return 0

    return notes.filter(
      note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ).length
  }

  // 防抖函数
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // 防抖处理搜索
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(setSearchQuery(localSearchQuery))
      if (localSearchQuery.trim() && !searchHistory.includes(localSearchQuery.trim())) {
        setSearchHistory(prev => [localSearchQuery.trim(), ...prev.slice(0, 4)])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [localSearchQuery, dispatch, searchHistory])

  // 同步 Redux 状态到本地状态
  useEffect(() => {
    if (searchQuery !== localSearchQuery) {
      setLocalSearchQuery(searchQuery)
    }
  }, [searchQuery, localSearchQuery])

  const handleCreateFolder = (parentId: string) => {
    const newFolder = {
      name: '新建文件夹',
      parentId: parentId === 'root' ? null : parentId,
      icon: '📁',
    }

    dispatch(addFolder(newFolder))

    // 自动进入重命名状态
    setTimeout(() => {
      setRenamingFolderId(newFolder.name) // 这里应该是新创建的ID
      setNewFolderName(newFolder.name)
    }, 100)

    setToast({ message: '新建文件夹成功', type: 'success' })
  }

  const handleRename = (folderId: string, newName: string) => {
    if (!newName.trim()) {
      setToast({ message: '文件夹名称不能为空', type: 'error' })
      return
    }

    // 检查是否有重名
    const existingFolder = folderData.find(f => f.name === newName && f.id !== folderId)
    if (existingFolder) {
      setToast({ message: '文件夹名称已存在', type: 'error' })
      return
    }

    dispatch(renameFolder({ id: folderId, newName }))
    setRenamingFolderId(null)
    setNewFolderName('')
    setToast({ message: '重命名成功', type: 'success' })
  }

  const handleCancelRename = () => {
    setRenamingFolderId(null)
    setNewFolderName('')
  }

  const handleDelete = (folderId: string) => {
    const folderName = getFolderName(folderId)
    setDeletingFolderId(folderId)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    if (deletingFolderId) {
      dispatch(deleteFolder(deletingFolderId))
      dispatch(deleteNotesByFolder(deletingFolderId))
      setShowDeleteConfirm(false)
      setDeletingFolderId(null)
      setToast({ message: '文件夹已删除', type: 'success' })
    }
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setDeletingFolderId(null)
  }

  const handleShare = (folderId: string) => {
    setSharingFolderId(folderId)
    setShowShareDialog(true)
  }

  const handleConvert = (folderId: string, type: string, conditions: any) => {
    dispatch(convertToSmartFolder({ id: folderId, type, conditions }))
    setToast({ message: '转换为智能文件夹成功', type: 'success' })
  }

  const handleSortSelect = (sortType: string) => {
    dispatch(setSortBy(sortType as any))
    setShowSortSubmenu(false)
    setToast({ message: `排序方式已设置为${sortType}`, type: 'success' })
  }

  const handleGroupSelect = (groupType: string) => {
    dispatch(setGroupBy(groupType as any))
    setShowGroupSubmenu(false)
    setToast({ message: `分组方式已设置为${groupType}`, type: 'success' })
  }

  const handleMenuAction = (action: string) => {
    const folderId = contextMenu.folderId
    if (!folderId) return

    switch (action) {
      case 'rename':
        setRenamingFolderId(folderId)
        setNewFolderName(getFolderName(folderId))
        break
      case 'delete':
        handleDelete(folderId)
        break
      case 'create':
        handleCreateFolder(folderId)
        break
      case 'share':
        handleShare(folderId)
        break
      case 'sort':
        setShowSortSubmenu(true)
        setSortSubmenuPosition({ x: contextMenu.x + 256, y: contextMenu.y })
        break
      case 'group':
        setShowGroupSubmenu(true)
        setGroupSubmenuPosition({ x: contextMenu.x + 256, y: contextMenu.y })
        break
      case 'convert':
        setConvertingFolderId(folderId)
        setShowConvertDialog(true)
        break
    }
    setContextMenu({ visible: false, x: 0, y: 0, folderId: null })
  }

  // 右键菜单处理
  const handleContextMenu = (e: React.MouseEvent, folderId: string) => {
    e.preventDefault()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      folderId,
    })
  }

  const handleCloseContextMenu = () => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      folderId: null,
    })
    setShowSortSubmenu(false)
    setShowGroupSubmenu(false)
  }

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu.visible) {
        handleCloseContextMenu()
      }

      // 关闭搜索建议
      if (
        showSearchSuggestions &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchSuggestions(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseContextMenu()
        setShowSearchSuggestions(false)
        if (showDeleteConfirm) {
          cancelDelete()
        }
        if (showShareDialog) {
          setShowShareDialog(false)
          setSharingFolderId(null)
        }
        if (showConvertDialog) {
          setShowConvertDialog(false)
          setConvertingFolderId(null)
        }
        if (renamingFolderId) {
          handleCancelRename()
        }
      }
    }

    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    contextMenu.visible,
    showDeleteConfirm,
    showShareDialog,
    showConvertDialog,
    renamingFolderId,
    showSearchSuggestions,
  ])

  const hasChildren = (folderId: string) => {
    return folderData.some(folder => folder.parentId === folderId)
  }

  const renderFolder = (folder: Folder, level: number): JSX.Element[] => {
    const isExpanded = expandedFolders.has(folder.id)
    const isSelected = selectedFolderId === folder.id
    const isContextMenuTarget = contextMenu.folderId === folder.id
    const isRenaming = renamingFolderId === folder.id
    const children = folderData.filter(f => f.parentId === folder.id)

    const result: JSX.Element[] = [
      <FolderItem
        key={folder.id}
        folder={folder}
        level={level}
        onToggle={toggleFolder}
        onSelect={selectFolderHandler}
        onContextMenu={handleContextMenu}
        isSelected={isSelected}
        isExpanded={isExpanded}
        hasChildren={hasChildren(folder.id)}
        isContextMenuTarget={isContextMenuTarget}
        isRenaming={isRenaming}
        onRename={handleRename}
        onCancelRename={handleCancelRename}
        renamingValue={newFolderName}
        onRenamingValueChange={setNewFolderName}
      />,
    ]

    if (isExpanded && children.length > 0) {
      children.forEach(child => {
        result.push(...renderFolder(child, level + 1))
      })
    }

    return result
  }

  const rootFolders = folderData.filter(folder => folder.parentId === null)

  return (
    <div className="flex h-full flex-col">
      {/* 搜索框 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="搜索"
            value={localSearchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => setShowSearchSuggestions(true)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border-none outline-none text-sm placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
          />
          {/* 清空按钮 */}
          {localSearchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 w-4 h-4 flex items-center justify-center"
            >
              ×
            </button>
          )}
        </div>

        {/* 搜索建议 */}
        {showSearchSuggestions && localSearchQuery && (
          <div className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
            {getSearchSuggestions().map((suggestion, index) => (
              <div
                key={index}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                onClick={() => {
                  setLocalSearchQuery(suggestion)
                  dispatch(setSearchQuery(suggestion))
                  setShowSearchSuggestions(false)
                }}
              >
                {suggestion}
              </div>
            ))}
            {searchHistory.length > 0 && (
              <>
                <div className="px-3 py-1 text-xs text-gray-500 border-t border-gray-200 dark:border-gray-700">
                  搜索历史
                </div>
                {searchHistory.map((query, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm flex items-center"
                    onClick={() => {
                      setLocalSearchQuery(query)
                      dispatch(setSearchQuery(query))
                      setShowSearchSuggestions(false)
                    }}
                  >
                    <svg
                      className="w-3 h-3 mr-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {query}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* 搜索结果统计 */}
      {searchQuery && (
        <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
          找到 {getSearchResultsCount()} 个结果
        </div>
      )}

      {/* 文件夹树 */}
      {!searchQuery && (
        <div className="flex-1 overflow-y-auto bg-gray-900 text-white">
          <div className="py-2">{rootFolders.map(folder => renderFolder(folder, 0)).flat()}</div>
        </div>
      )}

      {/* 搜索结果为空时的提示 */}
      {searchQuery && getSearchResultsCount() === 0 && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-lg mb-2 font-medium">没有找到相关内容</p>
            <p className="text-sm mb-4">尝试使用不同的关键词</p>
            <div className="text-xs text-gray-400">
              <p>搜索支持：</p>
              <p>• 标题和内容</p>
              <p>• 标签（使用 # 前缀）</p>
              <p>• 不区分大小写</p>
            </div>
          </div>
        </div>
      )}

      {/* 右键菜单 */}
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          folderId={contextMenu.folderId!}
          onClose={handleCloseContextMenu}
          onAction={handleMenuAction}
        />
      )}

      {/* 排序子菜单 */}
      {showSortSubmenu && (
        <SortSubmenu
          x={sortSubmenuPosition.x}
          y={sortSubmenuPosition.y}
          onClose={() => setShowSortSubmenu(false)}
          onSelect={handleSortSelect}
          currentSort={sortBy}
        />
      )}

      {/* 分组子菜单 */}
      {showGroupSubmenu && (
        <GroupSubmenu
          x={groupSubmenuPosition.x}
          y={groupSubmenuPosition.y}
          onClose={() => setShowGroupSubmenu(false)}
          onSelect={handleGroupSelect}
          currentGroup={groupBy}
        />
      )}

      {/* 删除确认对话框 */}
      {showDeleteConfirm && deletingFolderId && (
        <DeleteConfirmDialog
          folderId={deletingFolderId}
          folderName={getFolderName(deletingFolderId)}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      )}

      {/* 共享对话框 */}
      {showShareDialog && sharingFolderId && (
        <ShareDialog
          folderId={sharingFolderId}
          folderName={getFolderName(sharingFolderId)}
          onClose={() => {
            setShowShareDialog(false)
            setSharingFolderId(null)
          }}
        />
      )}

      {/* 转换对话框 */}
      {showConvertDialog && convertingFolderId && (
        <ConvertDialog
          folderId={convertingFolderId}
          folderName={getFolderName(convertingFolderId)}
          onClose={() => {
            setShowConvertDialog(false)
            setConvertingFolderId(null)
          }}
          onConvert={(type, conditions) => handleConvert(convertingFolderId, type, conditions)}
        />
      )}

      {/* Toast 通知 */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
