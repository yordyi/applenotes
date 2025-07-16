'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface ResizablePanelProps {
  children: React.ReactNode
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  direction?: 'left' | 'right'
  className?: string
  resizable?: boolean
  onResize?: (width: number) => void
  storageKey?: string // 用于本地存储用户设置
}

export function ResizablePanel({
  children,
  defaultWidth = 280,
  minWidth = 200,
  maxWidth = 500,
  direction = 'right',
  className = '',
  resizable = true,
  onResize,
  storageKey
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartWidth, setDragStartWidth] = useState(0)
  
  const panelRef = useRef<HTMLDivElement>(null)
  const resizerRef = useRef<HTMLDivElement>(null)
  
  // 从本地存储加载宽度
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      const savedWidth = localStorage.getItem(storageKey)
      if (savedWidth) {
        const parsedWidth = parseInt(savedWidth, 10)
        if (parsedWidth >= minWidth && parsedWidth <= maxWidth) {
          setWidth(parsedWidth)
        }
      }
    }
  }, [storageKey, minWidth, maxWidth])
  
  // 保存宽度到本地存储
  const saveWidth = useCallback((newWidth: number) => {
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newWidth.toString())
    }
  }, [storageKey])
  
  // 处理拖拽开始
  const handleDragStart = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    setIsDragging(true)
    setDragStartX(event.clientX)
    setDragStartWidth(width)
    
    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('mouseup', handleDragEnd)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
  }, [width, handleDragMove, handleDragEnd])
  
  // 处理拖拽移动
  const handleDragMove = useCallback((event: MouseEvent) => {
    if (!isDragging) return
    
    const deltaX = event.clientX - dragStartX
    const newWidth = direction === 'right' 
      ? dragStartWidth + deltaX 
      : dragStartWidth - deltaX
    
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
    setWidth(clampedWidth)
    onResize?.(clampedWidth)
  }, [isDragging, dragStartX, dragStartWidth, direction, minWidth, maxWidth, onResize])
  
  // 处理拖拽结束
  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
    
    saveWidth(width)
  }, [width, saveWidth, handleDragMove])
  
  // 处理双击重置
  const handleDoubleClick = useCallback(() => {
    setWidth(defaultWidth)
    onResize?.(defaultWidth)
    saveWidth(defaultWidth)
  }, [defaultWidth, onResize, saveWidth])
  
  // 清理事件监听器
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragMove)
      document.removeEventListener('mouseup', handleDragEnd)
    }
  }, [handleDragMove, handleDragEnd])
  
  return (
    <div
      ref={panelRef}
      className={cn(
        'relative flex-shrink-0 overflow-hidden',
        'transition-all duration-apple-normal ease-apple-ease',
        className
      )}
      style={{ width: `${width}px` }}
    >
      {/* 面板内容 */}
      <div className="h-full w-full">
        {children}
      </div>
      
      {/* 调整大小的拖拽条 */}
      {resizable && (
        <div
          ref={resizerRef}
          className={cn(
            'absolute top-0 h-full w-1 cursor-col-resize',
            'hover:bg-apple-blue/20 active:bg-apple-blue/40',
            'transition-colors duration-apple-fast',
            'group',
            direction === 'right' ? 'right-0' : 'left-0',
            isDragging && 'bg-apple-blue/40'
          )}
          onMouseDown={handleDragStart}
          onDoubleClick={handleDoubleClick}
        >
          {/* 拖拽指示器 */}
          <div className={cn(
            'absolute top-1/2 transform -translate-y-1/2',
            'w-1 h-12 bg-apple-gray-300 dark:bg-apple-gray-600',
            'rounded-full opacity-0 group-hover:opacity-100',
            'transition-opacity duration-apple-fast',
            direction === 'right' ? 'right-0' : 'left-0',
            isDragging && 'opacity-100 bg-apple-blue'
          )} />
        </div>
      )}
      
      {/* 拖拽时的遮罩 */}
      {isDragging && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 bg-apple-blue/5" />
        </div>
      )}
    </div>
  )
}

// 带有拖拽条的容器组件
interface ResizablePanelsContainerProps {
  children: React.ReactNode
  className?: string
}

export function ResizablePanelsContainer({ children, className = '' }: ResizablePanelsContainerProps) {
  return (
    <div className={cn('flex h-full overflow-hidden', className)}>
      {children}
    </div>
  )
}

// 拖拽条组件
interface ResizeHandleProps {
  direction?: 'horizontal' | 'vertical'
  className?: string
  onDrag?: (delta: number) => void
}

export function ResizeHandle({ 
  direction = 'horizontal', 
  className = '',
  onDrag
}: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    setIsDragging(true)
    setDragStart(direction === 'horizontal' ? event.clientX : event.clientY)
    
    const handleMouseMove = (e: MouseEvent) => {
      const current = direction === 'horizontal' ? e.clientX : e.clientY
      const delta = current - dragStart
      onDrag?.(delta)
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize'
  }, [direction, dragStart, onDrag])
  
  return (
    <div
      className={cn(
        'group relative',
        direction === 'horizontal' ? 'w-1 h-full cursor-col-resize' : 'h-1 w-full cursor-row-resize',
        'hover:bg-apple-blue/20 active:bg-apple-blue/40',
        'transition-colors duration-apple-fast',
        isDragging && 'bg-apple-blue/40',
        className
      )}
      onMouseDown={handleMouseDown}
    >
      {/* 拖拽指示器 */}
      <div className={cn(
        'absolute bg-apple-gray-300 dark:bg-apple-gray-600 rounded-full',
        'opacity-0 group-hover:opacity-100 transition-opacity duration-apple-fast',
        isDragging && 'opacity-100 bg-apple-blue',
        direction === 'horizontal' 
          ? 'top-1/2 left-0 transform -translate-y-1/2 w-1 h-12'
          : 'left-1/2 top-0 transform -translate-x-1/2 h-1 w-12'
      )} />
    </div>
  )
}

// 自定义Hook用于面板尺寸管理
interface UsePanelSizeOptions {
  defaultWidth: number
  minWidth: number
  maxWidth: number
  storageKey?: string
}

export function usePanelSize({
  defaultWidth,
  minWidth,
  maxWidth,
  storageKey
}: UsePanelSizeOptions) {
  const [width, setWidth] = useState(defaultWidth)
  
  // 从本地存储加载
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsedWidth = parseInt(saved, 10)
        if (parsedWidth >= minWidth && parsedWidth <= maxWidth) {
          setWidth(parsedWidth)
        }
      }
    }
  }, [storageKey, minWidth, maxWidth])
  
  // 更新宽度
  const updateWidth = useCallback((newWidth: number) => {
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
    setWidth(clampedWidth)
    
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, clampedWidth.toString())
    }
  }, [minWidth, maxWidth, storageKey])
  
  // 重置宽度
  const resetWidth = useCallback(() => {
    updateWidth(defaultWidth)
  }, [defaultWidth, updateWidth])
  
  return {
    width,
    setWidth: updateWidth,
    resetWidth
  }
}