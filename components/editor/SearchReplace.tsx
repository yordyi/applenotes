'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, X, ChevronUp, ChevronDown, Replace } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchReplaceProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (query: string) => void
  onReplace: (searchQuery: string, replaceQuery: string) => void
  onReplaceAll: (searchQuery: string, replaceQuery: string) => void
}

export function SearchReplace({ 
  isOpen, 
  onClose, 
  onSearch, 
  onReplace, 
  onReplaceAll 
}: SearchReplaceProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [replaceQuery, setReplaceQuery] = useState('')
  const [showReplace, setShowReplace] = useState(false)
  const [currentMatch, setCurrentMatch] = useState(0)
  const [totalMatches, setTotalMatches] = useState(0)
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (searchQuery) {
      onSearch(searchQuery)
      // TODO: 实现搜索结果计数
    }
  }, [searchQuery, onSearch])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter 向上搜索
        handlePrevious()
      } else {
        // Enter 向下搜索
        handleNext()
      }
    }
  }

  const handleNext = () => {
    // TODO: 实现下一个匹配
    setCurrentMatch(prev => Math.min(prev + 1, totalMatches))
  }

  const handlePrevious = () => {
    // TODO: 实现上一个匹配
    setCurrentMatch(prev => Math.max(prev - 1, 1))
  }

  const handleReplace = () => {
    onReplace(searchQuery, replaceQuery)
  }

  const handleReplaceAll = () => {
    onReplaceAll(searchQuery, replaceQuery)
  }

  if (!isOpen) return null

  return (
    <div className={cn(
      'absolute top-0 right-0 z-50',
      'bg-white dark:bg-apple-gray-800',
      'border border-apple-gray-200 dark:border-apple-gray-700',
      'rounded-lg shadow-lg',
      'p-4 w-80',
      'animate-in slide-in-from-top-2'
    )}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">搜索</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-apple-gray-100 dark:hover:bg-apple-gray-700 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 搜索输入 */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-apple-gray-400 w-4 h-4" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="搜索..."
          className={cn(
            'w-full pl-10 pr-4 py-2',
            'bg-apple-gray-50 dark:bg-apple-gray-900',
            'border border-apple-gray-200 dark:border-apple-gray-700',
            'rounded text-sm',
            'focus:outline-none focus:ring-2 focus:ring-apple-yellow'
          )}
        />
        
        {/* 搜索结果计数 */}
        {totalMatches > 0 && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-apple-gray-400">
            {currentMatch}/{totalMatches}
          </div>
        )}
      </div>

      {/* 搜索导航按钮 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-1">
          <button
            onClick={handlePrevious}
            disabled={currentMatch <= 1}
            className={cn(
              'p-1 rounded',
              'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            title="上一个"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentMatch >= totalMatches}
            className={cn(
              'p-1 rounded',
              'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            title="下一个"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        
        <button
          onClick={() => setShowReplace(!showReplace)}
          className={cn(
            'px-2 py-1 text-xs rounded',
            'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-700',
            showReplace && 'bg-apple-gray-100 dark:bg-apple-gray-700'
          )}
        >
          <Replace className="w-3 h-3 inline mr-1" />
          替换
        </button>
      </div>

      {/* 替换输入 */}
      {showReplace && (
        <div className="space-y-3">
          <input
            ref={replaceInputRef}
            type="text"
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="替换为..."
            className={cn(
              'w-full px-3 py-2',
              'bg-apple-gray-50 dark:bg-apple-gray-900',
              'border border-apple-gray-200 dark:border-apple-gray-700',
              'rounded text-sm',
              'focus:outline-none focus:ring-2 focus:ring-apple-yellow'
            )}
          />
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReplace}
              disabled={!searchQuery}
              className={cn(
                'px-3 py-1 text-xs rounded',
                'bg-apple-yellow text-black',
                'hover:bg-yellow-500',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              替换
            </button>
            <button
              onClick={handleReplaceAll}
              disabled={!searchQuery}
              className={cn(
                'px-3 py-1 text-xs rounded',
                'bg-apple-gray-200 dark:bg-apple-gray-700',
                'hover:bg-apple-gray-300 dark:hover:bg-apple-gray-600',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              全部替换
            </button>
          </div>
        </div>
      )}
    </div>
  )
}