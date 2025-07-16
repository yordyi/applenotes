'use client'

import React, { useState, useRef, useEffect, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ResizablePanelProps {
  children: ReactNode
  minWidth?: number
  maxWidth?: number
  defaultWidth?: number
  className?: string
  onResize?: (width: number) => void
}

export function ResizablePanel({
  children,
  minWidth = 200,
  maxWidth = 600,
  defaultWidth = 350,
  className,
  onResize
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    startXRef.current = e.clientX
    startWidthRef.current = width
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const deltaX = e.clientX - startXRef.current
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + deltaX))
      
      setWidth(newWidth)
      onResize?.(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, minWidth, maxWidth, onResize])

  return (
    <div
      ref={panelRef}
      style={{ width: `${width}px` }}
      className={cn(
        'relative flex-shrink-0',
        'transition-shadow duration-200',
        className
      )}
    >
      {children}
      
      {/* 调整大小的手柄 */}
      <div
        className={cn(
          'absolute top-0 right-0 w-1 h-full cursor-col-resize',
          'hover:bg-apple-gray-300 dark:hover:bg-apple-gray-600',
          'transition-colors duration-200',
          'group',
          isResizing && 'bg-apple-yellow'
        )}
        onMouseDown={handleMouseDown}
      >
        {/* 增加可点击区域 */}
        <div className="absolute inset-y-0 -left-2 -right-2" />
      </div>
    </div>
  )
}

interface ResizablePanelsContainerProps {
  children: ReactNode
  className?: string
}

export function ResizablePanelsContainer({ children, className }: ResizablePanelsContainerProps) {
  return (
    <div className={cn('flex h-full overflow-hidden', className)}>
      {children}
    </div>
  )
}