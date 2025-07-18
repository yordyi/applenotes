'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { updateNote, addNote, selectNote } from '@/store/slices/notesSlice'

export default function BasicNoteEditor() {
  const dispatch = useAppDispatch()
  const { notes, selectedNoteId } = useAppSelector(state => state.notes)
  const selectedNote = notes.find(note => note.id === selectedNoteId)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  const titleRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  // 加载笔记数据
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title)
      setContent(selectedNote.content)
    } else {
      setTitle('')
      setContent('')
    }
  }, [selectedNote])

  // 防抖保存函数
  const debouncedSave = useCallback(
    (noteId: string, newTitle: string, newContent: string) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }

      const timer = setTimeout(() => {
        dispatch(
          updateNote({
            id: noteId,
            updates: {
              title: newTitle,
              content: newContent,
            },
          })
        )
      }, 300)

      setDebounceTimer(timer)
    },
    [debounceTimer, dispatch]
  )

  // 处理标题变化
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)

    if (selectedNote) {
      debouncedSave(selectedNote.id, newTitle, content)
    }
  }

  // 处理内容变化
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)

    if (selectedNote) {
      debouncedSave(selectedNote.id, title, newContent)
    }
  }

  // 字数统计
  const getWordCount = (text: string) => {
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length
  }

  // 时间格式化
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } else if (diffDays === 1) {
      return '昨天'
    } else if (diffDays < 7) {
      return `${diffDays}天前`
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
      })
    }
  }

  // 快捷键处理
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        dispatch(
          addNote({
            title: '新建备忘录',
            content: '',
            folderId: null,
            isPinned: false,
            tags: [],
          })
        )
      }
    },
    [dispatch]
  )

  // 注册快捷键
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  // 新建笔记时自动聚焦标题
  useEffect(() => {
    if (selectedNote && selectedNote.title === '新建备忘录' && titleRef.current) {
      titleRef.current.focus()
      titleRef.current.select()
    }
  }, [selectedNote])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

  // 空状态页面
  if (!selectedNote) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ backgroundColor: '#f9fafb' }}
      >
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <svg
              className="w-16 h-16"
              style={{ color: '#9ca3af' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-medium mb-2" style={{ color: '#374151' }}>
            选择一个备忘录或创建新的备忘录
          </h2>
          <p className="text-sm mb-6" style={{ color: '#9ca3af' }}>
            你的想法很重要
          </p>
          <button
            onClick={() => {
              dispatch(
                addNote({
                  title: '新建备忘录',
                  content: '',
                  folderId: null,
                  isPinned: false,
                  tags: [],
                })
              )
            }}
            className="inline-flex items-center px-6 py-3 rounded-lg text-white font-medium text-base transition-colors"
            style={{ backgroundColor: '#3b82f6' }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#2563eb'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#3b82f6'
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            新建备忘录
          </button>
        </div>
      </div>
    )
  }

  const wordCount = getWordCount(content)

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* 工具栏区域 */}
      <div
        className="flex items-center justify-between px-6 border-b"
        style={{
          height: '48px',
          backgroundColor: '#f8f9fa',
          borderBottomColor: '#e5e7eb',
        }}
      >
        <div className="flex items-center space-x-4">
          <button
            className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
            style={{ fontSize: '12px' }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#e5e7eb'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            格式
          </button>
          <button
            className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
            style={{ fontSize: '12px' }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#e5e7eb'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            排序
          </button>
          <button
            className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
            style={{ fontSize: '12px' }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#e5e7eb'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            分享
          </button>
        </div>

        <div
          className="flex items-center space-x-4 text-xs"
          style={{ color: '#6b7280', fontSize: '11px' }}
        >
          <span>{wordCount} 字</span>
          <span>{formatDate(selectedNote.updatedAt)}</span>
        </div>
      </div>

      {/* 编辑区域 */}
      <div className="flex-1 flex flex-col">
        {/* 标题输入区域 */}
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="w-full border-none outline-none bg-transparent resize-none"
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: title ? '#111827' : '#9ca3af',
            padding: '24px 24px 16px 24px',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
          }}
          placeholder="标题"
          onInput={e => {
            const target = e.target as HTMLInputElement
            target.style.color = target.value ? '#111827' : '#9ca3af'
          }}
        />

        {/* 内容编辑区域 */}
        <textarea
          ref={contentRef}
          value={content}
          onChange={handleContentChange}
          className="flex-1 w-full border-none outline-none bg-transparent resize-none"
          style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: content ? '#374151' : '#9ca3af',
            padding: '0 24px 24px 24px',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
          }}
          placeholder="开始写作..."
          onInput={e => {
            const target = e.target as HTMLTextAreaElement
            target.style.color = target.value ? '#374151' : '#9ca3af'
          }}
        />
      </div>
    </div>
  )
}
