'use client'

import React, { useState } from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  List, 
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Undo,
  Redo,
  Search,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditorToolbarProps {
  onCommand: (command: string, value?: string) => void
  className?: string
}

interface ToolbarButtonProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
}

function ToolbarButton({ icon, label, onClick, isActive = false, disabled = false }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={cn(
        'p-2 rounded-lg transition-all duration-200',
        'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'flex items-center justify-center',
        isActive && 'bg-apple-yellow text-black',
        'group'
      )}
    >
      {icon}
    </button>
  )
}

function ToolbarDivider() {
  return (
    <div className="w-px h-6 bg-apple-gray-300 dark:bg-apple-gray-600 mx-1" />
  )
}

export function EditorToolbar({ onCommand, className }: EditorToolbarProps) {
  const [showMore, setShowMore] = useState(false)
  
  // 检查当前选择的格式状态
  const isFormatActive = (command: string): boolean => {
    try {
      return document.queryCommandState(command)
    } catch {
      return false
    }
  }

  // 执行格式化命令
  const executeCommand = (command: string, value?: string) => {
    try {
      document.execCommand(command, false, value)
      onCommand(command, value)
    } catch (error) {
      console.error('Command execution failed:', error)
    }
  }

  // 处理标题格式化
  const handleHeading = (level: number) => {
    executeCommand('formatBlock', `h${level}`)
  }

  // 处理链接插入
  const handleLink = () => {
    const url = prompt('输入链接URL:')
    if (url) {
      executeCommand('createLink', url)
    }
  }

  // 处理列表
  const handleList = (ordered: boolean) => {
    executeCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList')
  }

  return (
    <div className={cn(
      'flex items-center space-x-1 p-3',
      'border-b border-apple-gray-200 dark:border-apple-gray-800',
      'bg-apple-gray-50/50 dark:bg-apple-gray-900/50',
      'sticky top-0 z-10',
      className
    )}>
      {/* 撤销/重做 */}
      <ToolbarButton
        icon={<Undo className="w-4 h-4" />}
        label="撤销 (Cmd+Z)"
        onClick={() => executeCommand('undo')}
      />
      <ToolbarButton
        icon={<Redo className="w-4 h-4" />}
        label="重做 (Cmd+Shift+Z)"
        onClick={() => executeCommand('redo')}
      />
      
      <ToolbarDivider />

      {/* 标题 */}
      <ToolbarButton
        icon={<Heading1 className="w-4 h-4" />}
        label="标题 1"
        onClick={() => handleHeading(1)}
        isActive={document.queryCommandValue('formatBlock') === 'h1'}
      />
      <ToolbarButton
        icon={<Heading2 className="w-4 h-4" />}
        label="标题 2"
        onClick={() => handleHeading(2)}
        isActive={document.queryCommandValue('formatBlock') === 'h2'}
      />
      <ToolbarButton
        icon={<Heading3 className="w-4 h-4" />}
        label="标题 3"
        onClick={() => handleHeading(3)}
        isActive={document.queryCommandValue('formatBlock') === 'h3'}
      />

      <ToolbarDivider />

      {/* 文本格式化 */}
      <ToolbarButton
        icon={<Bold className="w-4 h-4" />}
        label="粗体 (Cmd+B)"
        onClick={() => executeCommand('bold')}
        isActive={isFormatActive('bold')}
      />
      <ToolbarButton
        icon={<Italic className="w-4 h-4" />}
        label="斜体 (Cmd+I)"
        onClick={() => executeCommand('italic')}
        isActive={isFormatActive('italic')}
      />
      <ToolbarButton
        icon={<Underline className="w-4 h-4" />}
        label="下划线 (Cmd+U)"
        onClick={() => executeCommand('underline')}
        isActive={isFormatActive('underline')}
      />

      <ToolbarDivider />

      {/* 列表 */}
      <ToolbarButton
        icon={<List className="w-4 h-4" />}
        label="无序列表"
        onClick={() => handleList(false)}
        isActive={isFormatActive('insertUnorderedList')}
      />
      <ToolbarButton
        icon={<ListOrdered className="w-4 h-4" />}
        label="有序列表"
        onClick={() => handleList(true)}
        isActive={isFormatActive('insertOrderedList')}
      />

      <ToolbarDivider />

      {/* 链接和引用 */}
      <ToolbarButton
        icon={<Link className="w-4 h-4" />}
        label="插入链接 (Cmd+K)"
        onClick={handleLink}
      />
      <ToolbarButton
        icon={<Quote className="w-4 h-4" />}
        label="引用"
        onClick={() => executeCommand('formatBlock', 'blockquote')}
        isActive={document.queryCommandValue('formatBlock') === 'blockquote'}
      />

      <ToolbarDivider />

      {/* 更多选项 */}
      <div className="relative">
        <ToolbarButton
          icon={<MoreHorizontal className="w-4 h-4" />}
          label="更多选项"
          onClick={() => setShowMore(!showMore)}
          isActive={showMore}
        />
        
        {showMore && (
          <div className={cn(
            'absolute top-full right-0 mt-2 z-20',
            'bg-white dark:bg-apple-gray-800',
            'border border-apple-gray-200 dark:border-apple-gray-700',
            'rounded-lg shadow-lg',
            'p-2 w-48'
          )}>
            <button
              onClick={() => {
                executeCommand('formatBlock', 'p')
                setShowMore(false)
              }}
              className={cn(
                'w-full px-3 py-2 text-left text-sm',
                'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-700',
                'rounded flex items-center space-x-2'
              )}
            >
              <Type className="w-4 h-4" />
              <span>正文</span>
            </button>
            
            <button
              onClick={() => {
                executeCommand('removeFormat')
                setShowMore(false)
              }}
              className={cn(
                'w-full px-3 py-2 text-left text-sm',
                'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-700',
                'rounded flex items-center space-x-2'
              )}
            >
              <span>清除格式</span>
            </button>
          </div>
        )}
      </div>

      {/* 搜索按钮 */}
      <div className="ml-auto">
        <ToolbarButton
          icon={<Search className="w-4 h-4" />}
          label="搜索 (Cmd+F)"
          onClick={() => onCommand('search')}
        />
      </div>
    </div>
  )
}