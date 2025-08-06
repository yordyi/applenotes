'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchBoxProps {
  placeholder?: string
  value?: string
  onSearch: (query: string) => void
  onClear?: () => void
  className?: string
  autoFocus?: boolean
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  placeholder = '搜索笔记...',
  value: controlledValue,
  onSearch,
  onClear,
  className,
  autoFocus = false,
}) => {
  const [internalValue, setInternalValue] = useState(controlledValue || '')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 使用防抖优化搜索性能
  const debouncedValue = useDebounce(internalValue, 300)

  // 受控组件支持
  const value = controlledValue !== undefined ? controlledValue : internalValue

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue)
    }
  }, [controlledValue])

  useEffect(() => {
    if (debouncedValue !== value) {
      onSearch(debouncedValue)
    }
  }, [debouncedValue, onSearch, value])

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)

    // 如果是受控组件，立即调用onSearch
    if (controlledValue !== undefined) {
      onSearch(newValue)
    }
  }

  const handleClear = () => {
    setInternalValue('')
    onSearch('')
    onClear?.()
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear()
    } else if (e.key === 'Enter') {
      // 立即触发搜索，不等待防抖
      onSearch(internalValue)
    }
  }

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'relative flex items-center transition-all duration-apple-fast',
          'bg-apple-gray-100 dark:bg-apple-gray-800',
          'rounded-apple-md border border-transparent',
          'hover:bg-apple-gray-200 dark:hover:bg-apple-gray-700',
          isFocused && 'ring-2 ring-apple-blue/20 border-apple-blue bg-white dark:bg-apple-gray-900'
        )}
      >
        {/* 搜索图标 */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Search className="w-4 h-4 text-system-tertiary-label dark:text-apple-gray-500" />
        </div>

        {/* 搜索输入框 */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            'w-full bg-transparent border-0 outline-none',
            'pl-10 pr-10 py-2',
            'text-apple-footnote placeholder-system-tertiary-label dark:placeholder-apple-gray-500',
            'text-system-label dark:text-white'
          )}
          spellCheck={false}
          autoComplete="off"
        />

        {/* 清除按钮 */}
        {value && (
          <button
            onClick={handleClear}
            className={cn(
              'absolute right-3 top-1/2 transform -translate-y-1/2',
              'w-4 h-4 flex items-center justify-center',
              'text-system-tertiary-label dark:text-apple-gray-500',
              'hover:text-system-label dark:hover:text-white',
              'transition-colors duration-apple-fast',
              'rounded-full hover:bg-apple-gray-200 dark:hover:bg-apple-gray-600'
            )}
            aria-label="清除搜索"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 搜索结果计数 */}
      {value && (
        <div className="absolute top-full left-0 right-0 mt-1 text-apple-caption1 text-system-tertiary-label dark:text-apple-gray-500 px-3">
          正在搜索 &quot;{value}&quot;...
        </div>
      )}
    </div>
  )
}
