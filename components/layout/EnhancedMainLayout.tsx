'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { toggleSidebar } from '@/store/slices/uiSlice'
import { cn } from '@/lib/utils'

interface EnhancedMainLayoutProps {
  sidebar: React.ReactNode
  notesList: React.ReactNode
  noteEditor: React.ReactNode
}

interface PanelSizes {
  sidebar: number
  notesList: number
  noteEditor: number
}

export function EnhancedMainLayout({ sidebar, notesList, noteEditor }: EnhancedMainLayoutProps) {
  const dispatch = useAppDispatch()
  const { sidebarCollapsed } = useAppSelector(state => state.ui)
  const { selectedNoteId } = useAppSelector(state => state.notes)
  
  // 面板尺寸状态
  const [panelSizes, setPanelSizes] = useState<PanelSizes>({
    sidebar: 280,
    notesList: 350,
    noteEditor: 0 // 自动填充剩余空间
  })
  
  // 拖拽状态
  const [isDragging, setIsDragging] = useState<'sidebar' | 'notesList' | null>(null)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartSizes, setDragStartSizes] = useState<PanelSizes>(panelSizes)
  
  // 引用
  const containerRef = useRef<HTMLDivElement>(null)
  const sidebarResizerRef = useRef<HTMLDivElement>(null)
  const notesListResizerRef = useRef<HTMLDivElement>(null)
  
  // 最小和最大宽度
  const MIN_SIDEBAR_WIDTH = 200
  const MAX_SIDEBAR_WIDTH = 400
  const MIN_NOTES_LIST_WIDTH = 280
  const MAX_NOTES_LIST_WIDTH = 500
  const MIN_EDITOR_WIDTH = 400
  
  // 处理拖拽开始
  const handleDragStart = (panel: 'sidebar' | 'notesList', event: React.MouseEvent) => {
    event.preventDefault()
    setIsDragging(panel)
    setDragStartX(event.clientX)
    setDragStartSizes({ ...panelSizes })
    
    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('mouseup', handleDragEnd)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
  }
  
  // 处理拖拽移动
  const handleDragMove = (event: MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    
    const containerWidth = containerRef.current.clientWidth
    const deltaX = event.clientX - dragStartX
    
    if (isDragging === 'sidebar') {
      const newSidebarWidth = Math.max(
        MIN_SIDEBAR_WIDTH,
        Math.min(MAX_SIDEBAR_WIDTH, dragStartSizes.sidebar + deltaX)
      )
      
      setPanelSizes(prev => ({
        ...prev,
        sidebar: newSidebarWidth
      }))
    } else if (isDragging === 'notesList') {
      const newNotesListWidth = Math.max(
        MIN_NOTES_LIST_WIDTH,
        Math.min(MAX_NOTES_LIST_WIDTH, dragStartSizes.notesList + deltaX)
      )
      
      // 确保编辑器有足够空间
      const usedWidth = (sidebarCollapsed ? 0 : panelSizes.sidebar) + newNotesListWidth
      const availableWidth = containerWidth - usedWidth
      
      if (availableWidth >= MIN_EDITOR_WIDTH) {
        setPanelSizes(prev => ({
          ...prev,
          notesList: newNotesListWidth
        }))
      }
    }
  }
  
  // 处理拖拽结束
  const handleDragEnd = () => {
    setIsDragging(null)
    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }
  
  // 清理事件监听器
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragMove)
      document.removeEventListener('mouseup', handleDragEnd)
    }
  }, [handleDragMove, handleDragEnd])
  
  // 响应式处理
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return (
    <div 
      ref={containerRef}
      className="flex h-screen bg-white dark:bg-black overflow-hidden"
    >
      {/* 侧边栏 */}
      <div
        className={cn(
          'flex-shrink-0 bg-apple-gray-50 dark:bg-apple-gray-900',
          'border-r border-apple-gray-200 dark:border-apple-gray-800',
          'transition-all duration-apple-normal ease-apple-ease',
          'overflow-hidden relative',
          isMobile ? (
            sidebarCollapsed ? 'w-0' : 'w-[280px] absolute left-0 top-0 h-full z-50'
          ) : (
            sidebarCollapsed ? 'w-0' : 'w-[280px]'
          )
        )}
        style={{
          width: !isMobile && !sidebarCollapsed ? `${panelSizes.sidebar}px` : undefined
        }}
      >
        <div className={cn(
          'h-full',
          'transition-opacity duration-apple-normal',
          sidebarCollapsed ? 'opacity-0' : 'opacity-100'
        )}>
          {sidebar}
        </div>
        
        {/* 侧边栏调整器 */}
        {!sidebarCollapsed && !isMobile && (
          <div
            ref={sidebarResizerRef}
            className={cn(
              'absolute right-0 top-0 w-1 h-full cursor-col-resize',
              'hover:bg-apple-blue/20 transition-colors duration-apple-fast',
              'active:bg-apple-blue/40',
              isDragging === 'sidebar' && 'bg-apple-blue/40'
            )}
            onMouseDown={(e) => handleDragStart('sidebar', e)}
          />
        )}
      </div>
      
      {/* 移动端遮罩 */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}
      
      {/* 笔记列表 */}
      <div
        className={cn(
          'flex-shrink-0 bg-apple-gray-100 dark:bg-apple-gray-800',
          'border-r border-apple-gray-200 dark:border-apple-gray-800',
          'transition-all duration-apple-normal ease-apple-ease',
          'overflow-hidden relative',
          // 移动端响应式逻辑
          isMobile ? (
            selectedNoteId ? 'w-0' : 'w-full'
          ) : (
            'w-[350px]'
          )
        )}
        style={{
          width: !isMobile ? `${panelSizes.notesList}px` : undefined
        }}
      >
        <div className="h-full overflow-y-auto">
          {notesList}
        </div>
        
        {/* 笔记列表调整器 */}
        {!isMobile && (
          <div
            ref={notesListResizerRef}
            className={cn(
              'absolute right-0 top-0 w-1 h-full cursor-col-resize',
              'hover:bg-apple-blue/20 transition-colors duration-apple-fast',
              'active:bg-apple-blue/40',
              isDragging === 'notesList' && 'bg-apple-blue/40'
            )}
            onMouseDown={(e) => handleDragStart('notesList', e)}
          />
        )}
      </div>
      
      {/* 笔记编辑器 */}
      <div className={cn(
        'flex-1 bg-white dark:bg-apple-gray-900',
        'min-w-0 relative',
        'transition-all duration-apple-normal ease-apple-ease',
        // 移动端响应式逻辑
        isMobile ? (
          selectedNoteId ? 'block' : 'hidden'
        ) : (
          'block'
        )
      )}>
        {/* 移动端返回按钮 */}
        {isMobile && selectedNoteId && (
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={() => window.history.back()}
              className={cn(
                'flex items-center px-3 py-2 rounded-apple-md',
                'bg-apple-gray-100 dark:bg-apple-gray-800',
                'hover:bg-apple-gray-200 dark:hover:bg-apple-gray-700',
                'transition-colors duration-apple-fast',
                'text-apple-gray-700 dark:text-apple-gray-300'
              )}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回
            </button>
          </div>
        )}
        
        {/* 编辑器内容 */}
        <div className="h-full">
          {noteEditor}
        </div>
      </div>
      
      {/* 拖拽时的视觉反馈 */}
      {isDragging && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-apple-blue/5" />
        </div>
      )}
    </div>
  )
}

// 自定义Hook用于获取面板尺寸
export function usePanelSizes() {
  const [sizes, setSizes] = useState<PanelSizes>({
    sidebar: 280,
    notesList: 350,
    noteEditor: 0
  })
  
  return {
    sizes,
    setSizes,
    resetSizes: () => setSizes({
      sidebar: 280,
      notesList: 350,
      noteEditor: 0
    })
  }
}