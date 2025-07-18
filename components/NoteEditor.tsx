'use client'

import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { updateNote, deleteNote, togglePinNote, toggleFavoriteNote } from '@/store/slices/notesSlice'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Pin, Trash2, Share, MoreHorizontal, Save, Clock, Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { RichTextEditor, editorUtils } from './editor/RichTextEditor'
import { EditorToolbar } from './editor/EditorToolbar'
import { SearchReplace } from './editor/SearchReplace'
import { useAutoSave } from '@/hooks/useAutoSave'

export function NoteEditor() {
  const dispatch = useAppDispatch()
  const { notes, selectedNoteId } = useAppSelector(state => state.notes)
  const selectedNote = notes.find(note => note.id === selectedNoteId)

  const [content, setContent] = useState('')
  const [showWordCount, setShowWordCount] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  const [showSearchReplace, setShowSearchReplace] = useState(false)

  // 实时保存
  const { forceSave } = useAutoSave({
    noteId: selectedNoteId || '',
    content,
    delay: 1000,
    onSave: () => setSaveStatus('saved'),
    onSaveError: () => setSaveStatus('error')
  })

  useEffect(() => {
    if (selectedNote) {
      setContent(selectedNote.content)
    } else {
      setContent('')
    }
  }, [selectedNote])

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    setSaveStatus('saving')
  }

  const handleDelete = () => {
    if (selectedNote && window.confirm('确定要删除这个备忘录吗？')) {
      dispatch(deleteNote(selectedNote.id))
    }
  }

  const handlePin = () => {
    if (selectedNote) {
      dispatch(togglePinNote(selectedNote.id))
    }
  }

  const handleFavorite = () => {
    if (selectedNote) {
      dispatch(toggleFavoriteNote(selectedNote.id))
    }
  }

  const handleToolbarCommand = (command: string, value?: string) => {
    if (command === 'search') {
      setShowSearchReplace(true)
    }
  }

  const handleSearch = (query: string) => {
    // TODO: 实现搜索高亮
    console.log('Searching for:', query)
  }

  const handleReplace = (searchQuery: string, replaceQuery: string) => {
    // TODO: 实现单个替换
    console.log('Replace:', searchQuery, 'with:', replaceQuery)
  }

  const handleReplaceAll = (searchQuery: string, replaceQuery: string) => {
    // TODO: 实现全部替换
    console.log('Replace all:', searchQuery, 'with:', replaceQuery)
  }

  if (!selectedNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-apple-gray-900">
        <div className="text-center">
          <p className="text-apple-gray-400 mb-4">选择一个备忘录或创建新的备忘录</p>
          <p className="text-sm text-apple-gray-300">
            使用左侧面板选择笔记，或点击新建按钮创建新笔记
          </p>
        </div>
      </div>
    )
  }

  const wordCount = editorUtils.getWordCount(content)
  const charCount = editorUtils.getCharCount(content)

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-apple-gray-900">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between p-4 border-b border-apple-gray-200 dark:border-apple-gray-800">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-apple-gray-500">
            {format(new Date(selectedNote.updatedAt), 'yyyy年M月d日 HH:mm', { locale: zhCN })}
          </div>
          
          {/* 保存状态指示器 */}
          <div className="flex items-center space-x-1">
            {saveStatus === 'saving' && (
              <>
                <Clock className="w-3 h-3 text-apple-gray-400 animate-spin" />
                <span className="text-xs text-apple-gray-400">保存中...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Save className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500">已保存</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <span className="text-xs text-red-500">保存失败</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* 字数统计 */}
          <button
            onClick={() => setShowWordCount(!showWordCount)}
            className={cn(
              'px-2 py-1 rounded text-xs',
              'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800',
              'transition-colors duration-200',
              showWordCount && 'bg-apple-gray-100 dark:bg-apple-gray-800'
            )}
          >
            {wordCount} 字
          </button>
          
          <button
            onClick={handlePin}
            className={cn(
              'p-2 rounded hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800',
              'transition-colors duration-200',
              selectedNote.isPinned ? 'text-apple-yellow' : 'text-apple-gray-500'
            )}
            title={selectedNote.isPinned ? '取消置顶' : '置顶'}
          >
            <Pin className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleFavorite}
            className={cn(
              'p-2 rounded hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800',
              'transition-colors duration-200',
              selectedNote.isFavorited ? 'text-purple-500' : 'text-apple-gray-500'
            )}
            title={selectedNote.isFavorited ? '取消收藏' : '收藏'}
          >
            <Star className={cn('w-4 h-4', selectedNote.isFavorited && 'fill-current')} />
          </button>
          
          <button 
            className="p-2 rounded hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 text-apple-gray-500 transition-colors duration-200"
            title="分享"
          >
            <Share className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleDelete}
            className="p-2 rounded hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 text-apple-gray-500 transition-colors duration-200"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <button 
            className="p-2 rounded hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 text-apple-gray-500 transition-colors duration-200"
            title="更多选项"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 格式化工具栏 */}
      <EditorToolbar onCommand={handleToolbarCommand} />

      {/* 富文本编辑器 */}
      <div className="flex-1 overflow-y-auto relative">
        <RichTextEditor
          content={content}
          onChange={handleContentChange}
          placeholder="开始输入..."
          autoFocus
        />
        
        {/* 搜索和替换面板 */}
        <SearchReplace
          isOpen={showSearchReplace}
          onClose={() => setShowSearchReplace(false)}
          onSearch={handleSearch}
          onReplace={handleReplace}
          onReplaceAll={handleReplaceAll}
        />
      </div>

      {/* 底部状态栏 */}
      {showWordCount && (
        <div className="px-6 py-2 border-t border-apple-gray-200 dark:border-apple-gray-800 bg-apple-gray-50 dark:bg-apple-gray-900">
          <div className="flex justify-between items-center text-xs text-apple-gray-500">
            <span>字数: {wordCount} | 字符数: {charCount}</span>
            <span>最后修改: {format(new Date(selectedNote.updatedAt), 'HH:mm', { locale: zhCN })}</span>
          </div>
        </div>
      )}
    </div>
  )
}