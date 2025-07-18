'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { updateNote, deleteNote, togglePinNote, toggleFavoriteNote } from '@/store/slices/notesSlice'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useAutoSave } from '@/hooks/useAutoSave'
import { 
  Pin, 
  Trash2, 
  Share, 
  MoreHorizontal, 
  Save, 
  Clock,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Search,
  RotateCcw,
  RotateCw,
  Star
} from 'lucide-react'

export default function BasicNoteEditor() {
  const dispatch = useAppDispatch()
  const { notes, selectedNoteId } = useAppSelector(state => state.notes)
  const selectedNote = notes.find(note => note.id === selectedNoteId)
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [showWordCount, setShowWordCount] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  const [isEditing, setIsEditing] = useState(false)
  
  // 引用
  const titleRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  
  // 自动保存Hook
  const { forceSave } = useAutoSave({
    noteId: selectedNoteId || '',
    content: title + '\n' + content,
    delay: 1000,
    onSave: () => setSaveStatus('saved'),
    onSaveError: () => setSaveStatus('error')
  })
  
  // 加载笔记数据
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title)
      setContent(selectedNote.content)
      setSaveStatus('saved')
    } else {
      setTitle('')
      setContent('')
      setSaveStatus('saved')
    }
  }, [selectedNote])
  
  // 处理标题变化
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    setIsEditing(true)
    setSaveStatus('saving')
  }
  
  // 处理内容变化
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    setIsEditing(true)
    setSaveStatus('saving')
  }
  
  // 处理删除
  const handleDelete = () => {
    if (selectedNote && window.confirm('确定要删除这个备忘录吗？')) {
      dispatch(deleteNote(selectedNote.id))
    }
  }
  
  // 处理置顶
  const handlePin = () => {
    if (selectedNote) {
      dispatch(togglePinNote(selectedNote.id))
    }
  }

  // 处理收藏
  const handleFavorite = () => {
    if (selectedNote) {
      dispatch(toggleFavoriteNote(selectedNote.id))
    }
  }
  
  // 处理分享
  const handleShare = async () => {
    if (selectedNote && navigator.share) {
      try {
        await navigator.share({
          title: selectedNote.title,
          text: selectedNote.content,
        })
      } catch (error) {
        console.error('分享失败:', error)
      }
    } else {
      // 复制到剪贴板
      const text = `${selectedNote?.title}\n\n${selectedNote?.content}`
      navigator.clipboard.writeText(text)
    }
  }
  
  // 字数统计
  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }
  
  const getCharCount = (text: string) => {
    return text.length
  }
  
  // 键盘快捷键
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 's':
          e.preventDefault()
          forceSave()
          break
        case 'Enter':
          e.preventDefault()
          if (titleRef.current) {
            titleRef.current.focus()
          }
          break
      }
    }
  }
  
  if (!selectedNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-apple-gray-900">
        <div className="text-center max-w-md px-6">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-apple-gray-100 dark:bg-apple-gray-800 flex items-center justify-center">
            <svg className="w-10 h-10 text-apple-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <p className="text-apple-gray-400 mb-2">选择一个备忘录或创建新的备忘录</p>
          <p className="text-apple-footnote text-apple-gray-300">
            使用左侧面板选择笔记，或点击新建按钮创建新笔记
          </p>
        </div>
      </div>
    )
  }
  
  const wordCount = getWordCount(content)
  const charCount = getCharCount(content)
  
  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-apple-gray-900" onKeyDown={handleKeyDown}>
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between p-4 border-b border-apple-gray-200 dark:border-apple-gray-800 bg-apple-gray-50/50 dark:bg-apple-gray-900/50">
        <div className="flex items-center space-x-4">
          <div className="text-apple-footnote text-apple-gray-500 dark:text-apple-gray-400">
            {format(new Date(selectedNote.updatedAt), 'yyyy年M月d日 HH:mm', { locale: zhCN })}
          </div>
          
          {/* 保存状态指示器 */}
          <div className="flex items-center space-x-1">
            {saveStatus === 'saving' && (
              <div className="flex items-center space-x-1 text-apple-gray-400">
                <Clock className="w-3 h-3 animate-spin" />
                <span className="text-apple-caption1">保存中...</span>
              </div>
            )}
            {saveStatus === 'saved' && (
              <div className="flex items-center space-x-1 text-apple-green">
                <Save className="w-3 h-3" />
                <span className="text-apple-caption1">已保存</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center space-x-1 text-apple-red">
                <span className="text-apple-caption1">保存失败</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* 字数统计 */}
          <button
            onClick={() => setShowWordCount(!showWordCount)}
            className={cn(
              'px-2 py-1 rounded-apple-sm text-apple-caption1',
              'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800',
              'transition-colors duration-apple-fast',
              showWordCount && 'bg-apple-gray-100 dark:bg-apple-gray-800'
            )}
            title="字数统计"
          >
            {wordCount} 字
          </button>
          
          {/* 置顶按钮 */}
          <button
            onClick={handlePin}
            className={cn(
              'p-2 rounded-apple-sm hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800',
              'transition-colors duration-apple-fast',
              selectedNote.isPinned ? 'text-apple-yellow' : 'text-apple-gray-500 dark:text-apple-gray-400'
            )}
            title={selectedNote.isPinned ? '取消置顶' : '置顶'}
          >
            <Pin className="w-4 h-4" />
          </button>

          {/* 收藏按钮 */}
          <button
            onClick={handleFavorite}
            className={cn(
              'p-2 rounded-apple-sm hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800',
              'transition-colors duration-apple-fast',
              selectedNote.isFavorited ? 'text-purple-500' : 'text-apple-gray-500 dark:text-apple-gray-400'
            )}
            title={selectedNote.isFavorited ? '取消收藏' : '收藏'}
          >
            <Star className={cn('w-4 h-4', selectedNote.isFavorited && 'fill-current')} />
          </button>
          
          {/* 分享按钮 */}
          <button
            onClick={handleShare}
            className="p-2 rounded-apple-sm hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 text-apple-gray-500 dark:text-apple-gray-400 transition-colors duration-apple-fast"
            title="分享"
          >
            <Share className="w-4 h-4" />
          </button>
          
          {/* 删除按钮 */}
          <button
            onClick={handleDelete}
            className="p-2 rounded-apple-sm hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 text-apple-gray-500 dark:text-apple-gray-400 hover:text-apple-red transition-colors duration-apple-fast"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          {/* 更多选项 */}
          <button
            className="p-2 rounded-apple-sm hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 text-apple-gray-500 dark:text-apple-gray-400 transition-colors duration-apple-fast"
            title="更多选项"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* 基础格式化工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-apple-gray-200 dark:border-apple-gray-800 bg-apple-gray-50/30 dark:bg-apple-gray-900/30">
        <div className="flex items-center space-x-1">
          <button className="p-2 rounded-apple-sm hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 text-apple-gray-500 dark:text-apple-gray-400 transition-colors duration-apple-fast" title="粗体">
            <Bold className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-apple-sm hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 text-apple-gray-500 dark:text-apple-gray-400 transition-colors duration-apple-fast" title="斜体">
            <Italic className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-apple-sm hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 text-apple-gray-500 dark:text-apple-gray-400 transition-colors duration-apple-fast" title="下划线">
            <Underline className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-apple-gray-200 dark:bg-apple-gray-700 mx-2" />
          
          <button className="p-2 rounded-apple-sm hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 text-apple-gray-500 dark:text-apple-gray-400 transition-colors duration-apple-fast" title="项目符号">
            <List className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-apple-sm hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 text-apple-gray-500 dark:text-apple-gray-400 transition-colors duration-apple-fast" title="编号列表">
            <ListOrdered className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-apple-gray-200 dark:bg-apple-gray-700 mx-2" />
          
          <button className="p-2 rounded-apple-sm hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 text-apple-gray-500 dark:text-apple-gray-400 transition-colors duration-apple-fast" title="左对齐">
            <AlignLeft className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-apple-sm hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 text-apple-gray-500 dark:text-apple-gray-400 transition-colors duration-apple-fast" title="居中">
            <AlignCenter className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-apple-sm hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 text-apple-gray-500 dark:text-apple-gray-400 transition-colors duration-apple-fast" title="右对齐">
            <AlignRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center space-x-1">
          <button className="p-2 rounded-apple-sm hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 text-apple-gray-500 dark:text-apple-gray-400 transition-colors duration-apple-fast" title="搜索">
            <Search className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-apple-sm hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 text-apple-gray-500 dark:text-apple-gray-400 transition-colors duration-apple-fast" title="撤销">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-apple-sm hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 text-apple-gray-500 dark:text-apple-gray-400 transition-colors duration-apple-fast" title="重做">
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* 编辑区域 */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* 标题输入框 */}
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={handleTitleChange}
            className={cn(
              'w-full text-apple-title1 font-apple-system font-bold',
              'border-none outline-none bg-transparent resize-none',
              'text-apple-gray-900 dark:text-white',
              'placeholder-apple-gray-400 dark:placeholder-apple-gray-500',
              'mb-4 py-2',
              'transition-colors duration-apple-fast'
            )}
            placeholder="标题"
            autoComplete="off"
          />
          
          {/* 内容输入框 */}
          <textarea
            ref={contentRef}
            value={content}
            onChange={handleContentChange}
            className={cn(
              'w-full flex-1 border-none outline-none bg-transparent resize-none',
              'text-apple-body font-apple-system leading-relaxed',
              'text-apple-gray-900 dark:text-white',
              'placeholder-apple-gray-400 dark:placeholder-apple-gray-500',
              'transition-colors duration-apple-fast'
            )}
            placeholder="开始写作..."
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </div>
      
      {/* 底部状态栏 */}
      {showWordCount && (
        <div className="px-6 py-2 border-t border-apple-gray-200 dark:border-apple-gray-800 bg-apple-gray-50/50 dark:bg-apple-gray-900/50">
          <div className="flex justify-between items-center text-apple-caption1 text-apple-gray-500 dark:text-apple-gray-400">
            <span>字数: {wordCount} | 字符数: {charCount}</span>
            <span>最后修改: {format(new Date(selectedNote.updatedAt), 'HH:mm', { locale: zhCN })}</span>
          </div>
        </div>
      )}
    </div>
  )
}