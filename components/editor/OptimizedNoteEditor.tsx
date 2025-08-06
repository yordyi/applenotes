'use client'

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { updateNote, selectNote } from '@/store/slices/notesSlice'
import { useDebounce } from '@/hooks/useDebounce'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { cn } from '@/lib/utils'
import { formatAppleDate } from '@/lib/utils'

interface OptimizedNoteEditorProps {
  className?: string
  autoFocus?: boolean
  onSave?: (noteId: string, title: string, content: string) => void
}

export const OptimizedNoteEditor: React.FC<OptimizedNoteEditorProps> = ({
  className,
  autoFocus = false,
  onSave,
}) => {
  const dispatch = useAppDispatch()
  const { selectedNoteId, notes } = useAppSelector(state => state.notes)

  // 查找当前选中的笔记
  const selectedNote = useMemo(
    () => notes.find(note => note.id === selectedNoteId),
    [notes, selectedNoteId]
  )

  // 本地状态管理
  const [title, setTitle] = useState(selectedNote?.title || '')
  const [content, setContent] = useState(selectedNote?.content || '')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // 防抖优化：减少自动保存频率
  const debouncedTitle = useDebounce(title, 500)
  const debouncedContent = useDebounce(content, 300)

  // Refs
  const titleRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  // 当选中笔记变化时更新本地状态
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title)
      setContent(selectedNote.content)
    } else {
      setTitle('')
      setContent('')
    }
  }, [selectedNote])

  // 自动保存逻辑
  const saveNote = useCallback(
    async (noteId: string, newTitle: string, newContent: string) => {
      if (!noteId || (newTitle === selectedNote?.title && newContent === selectedNote?.content)) {
        return
      }

      setIsSaving(true)

      try {
        // 清除之前的保存定时器
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current)
        }

        // 延迟保存以避免频繁更新
        saveTimeoutRef.current = setTimeout(() => {
          dispatch(
            updateNote({
              id: noteId,
              updates: {
                title: newTitle,
                content: newContent,
                updatedAt: new Date().toISOString(),
              },
            })
          )

          setLastSaved(new Date())
          setIsSaving(false)

          // 调用外部保存回调
          onSave?.(noteId, newTitle, newContent)
        }, 100)
      } catch (error) {
        console.error('保存笔记时出错:', error)
        setIsSaving(false)
      }
    },
    [dispatch, selectedNote, onSave]
  )

  // 防抖后的自动保存
  useEffect(() => {
    if (selectedNoteId && (debouncedTitle || debouncedContent)) {
      saveNote(selectedNoteId, debouncedTitle, debouncedContent)
    }
  }, [debouncedTitle, debouncedContent, selectedNoteId, saveNote])

  // 清理函数
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // 标题变化处理
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }, [])

  // 内容变化处理
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)

    // 自动调整文本区域高度
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [])

  // 键盘快捷键处理
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 's':
            e.preventDefault()
            if (selectedNoteId) {
              saveNote(selectedNoteId, title, content)
            }
            break
          case 'n':
            e.preventDefault()
            // 创建新笔记的逻辑
            break
        }
      }
    },
    [selectedNoteId, title, content, saveNote]
  )

  // 如果没有选中笔记，显示空状态
  if (!selectedNote) {
    return (
      <div
        className={cn(
          'flex-1 flex items-center justify-center',
          'bg-system-background dark:bg-apple-gray-900',
          className
        )}
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-apple-gray-100 dark:bg-apple-gray-800 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-apple-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <h3 className="text-apple-title3 font-medium text-system-label dark:text-white mb-2">
            选择一个笔记开始编辑
          </h3>
          <p className="text-apple-body text-system-secondary-label dark:text-apple-gray-400">
            在左侧选择一个笔记，或创建一个新的笔记
          </p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div
        className={cn(
          'flex-1 flex flex-col',
          'bg-system-background dark:bg-apple-gray-900',
          className
        )}
      >
        {/* 编辑器头部 */}
        <div className="flex-shrink-0 p-6 border-b border-system-separator dark:border-apple-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-apple-footnote text-system-secondary-label dark:text-apple-gray-400">
                {selectedNote.createdAt && formatAppleDate(selectedNote.createdAt)}
              </div>
              {isSaving && (
                <div className="flex items-center space-x-2 text-apple-caption1 text-apple-blue">
                  <div className="w-2 h-2 bg-apple-blue rounded-full animate-pulse" />
                  <span>正在保存...</span>
                </div>
              )}
              {lastSaved && !isSaving && (
                <div className="text-apple-caption1 text-system-tertiary-label dark:text-apple-gray-500">
                  已保存于 {formatAppleDate(lastSaved)}
                </div>
              )}
            </div>
          </div>

          {/* 标题输入 */}
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={handleTitleChange}
            onKeyDown={handleKeyDown}
            placeholder="笔记标题"
            className="w-full bg-transparent border-none outline-none text-apple-title1 font-bold text-system-label dark:text-white placeholder-system-tertiary-label dark:placeholder-apple-gray-500 resize-none"
            autoFocus={autoFocus}
          />
        </div>

        {/* 编辑器内容 */}
        <div className="flex-1 p-6">
          <textarea
            ref={contentRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="开始写作..."
            className="w-full h-full min-h-[400px] bg-transparent border-none outline-none text-apple-body text-system-label dark:text-white placeholder-system-tertiary-label dark:placeholder-apple-gray-500 resize-none leading-relaxed"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              lineHeight: '1.6',
            }}
          />
        </div>
      </div>
    </ErrorBoundary>
  )
}
