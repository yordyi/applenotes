'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { updateNote, addNote, selectNote } from '@/store/slices/notesSlice'

export function NoteEditor() {
  const dispatch = useAppDispatch()
  const { notes, selectedNoteId } = useAppSelector(state => state.notes)
  const selectedNote = notes.find(note => note.id === selectedNoteId)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 防抖保存函数
  const debouncedSave = useCallback(
    (noteId: string, newTitle: string, newContent: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

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
      }, 300)
    },
    [dispatch]
  )

  // 创建新笔记
  const handleCreateNote = useCallback(() => {
    const newNote = {
      id: Date.now().toString(),
      title: '新建备忘录',
      content: '',
      folderId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      tags: [],
    }

    dispatch(addNote(newNote))
    dispatch(selectNote(newNote.id))
  }, [dispatch])

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

  // 新建笔记时自动聚焦标题
  useEffect(() => {
    if (selectedNote && selectedNote.title === '新建备忘录' && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [selectedNote])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        handleCreateNote()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleCreateNote])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

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

  // 空状态显示
  if (!selectedNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <svg
              className="w-16 h-16 text-gray-400"
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
          <h2 className="text-lg font-medium mb-2 text-gray-700">选择一个备忘录或创建新的备忘录</h2>
          <p className="text-sm text-gray-500 mb-6">你的想法很重要</p>
          <button
            onClick={handleCreateNote}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
      {/* 工具栏 */}
      <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-gray-50">
        <div className="flex items-center space-x-4">
          <button className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors">
            格式
          </button>
          <button className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors">
            排序
          </button>
          <button className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors">
            分享
          </button>
        </div>

        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span>{wordCount} 字</span>
          <span>{formatDate(selectedNote.updatedAt)}</span>
        </div>
      </div>

      {/* 编辑区域 */}
      <div className="flex-1 flex flex-col p-6">
        {/* 标题输入 */}
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="w-full text-3xl font-bold border-none outline-none bg-transparent text-gray-900 placeholder-gray-400 mb-4"
          placeholder="标题"
        />

        {/* 内容输入 */}
        <textarea
          ref={contentRef}
          value={content}
          onChange={handleContentChange}
          className="w-full h-full border-none outline-none bg-transparent resize-none text-gray-900 placeholder-gray-400 text-base leading-relaxed"
          placeholder="开始写作..."
        />
      </div>
    </div>
  )
}
