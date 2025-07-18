'use client'

import React, { useMemo, memo, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectNote, Note } from '@/store/slices/notesSlice'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Pin } from 'lucide-react'
import { cn } from '@/lib/utils'

// 优化的 NoteCard 组件
const NoteCard = memo(function NoteCard({ note, isSelected, onSelect }: {
  note: Note;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const preview = note.content.substring(0, 100).replace(/\n/g, ' ')
  const date = format(new Date(note.updatedAt), 'M/d/yy', { locale: zhCN })

  const handleClick = useCallback(() => {
    onSelect(note.id)
  }, [note.id, onSelect])

  return (
    <div
      onClick={handleClick}
      className={cn(
        'bg-white dark:bg-apple-gray-800 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg',
        isSelected && 'ring-2 ring-apple-yellow'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-sm line-clamp-1">{note.title || '无标题'}</h3>
        {note.isPinned && <Pin className="w-3 h-3 text-apple-gray-400" />}
      </div>
      <p className="text-xs text-apple-gray-500 mb-2">{date}</p>
      <p className="text-xs text-apple-gray-600 line-clamp-2">{preview || '没有其他文字'}</p>
    </div>
  )
})

// 优化的 NoteListItem 组件
const NoteListItem = memo(function NoteListItem({ note, isSelected, onSelect }: {
  note: Note;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const handleClick = useCallback(() => {
    onSelect(note.id)
  }, [note.id, onSelect])

  return (
    <div
      onClick={handleClick}
      className={cn(
        'p-3 cursor-pointer rounded-lg transition-all',
        'hover:bg-apple-gray-50 dark:hover:bg-apple-gray-700',
        isSelected 
          ? 'bg-apple-yellow text-black' 
          : 'bg-white dark:bg-apple-gray-800'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-sm truncate">{note.title || '无标题'}</h3>
            {note.isPinned && <Pin className="w-3 h-3 flex-shrink-0" />}
          </div>
          <p className="text-xs text-apple-gray-500 mt-1">
            {format(new Date(note.updatedAt), 'M/d/yy', { locale: zhCN })}
          </p>
          <p className="text-xs text-apple-gray-600 mt-1 line-clamp-2">
            {note.content || '没有其他文字'}
          </p>
        </div>
      </div>
    </div>
  )
})

export function NotesList() {
  const dispatch = useAppDispatch()
  const { notes, selectedNoteId, searchQuery } = useAppSelector(state => state.notes)
  const { selectedFolderId } = useAppSelector(state => state.folders)
  const { view, sortBy, showPinnedOnly } = useAppSelector(state => state.ui)

  // 使用 useMemo 优化过滤逻辑
  const filteredNotes = useMemo(() => {
    let filtered = notes

    // 根据选中的文件夹或快速访问项过滤笔记
    if (selectedFolderId === 'all') {
      filtered = notes
    } else if (selectedFolderId === 'pinned' || showPinnedOnly) {
      filtered = filtered.filter(note => note.isPinned)
    } else if (selectedFolderId === 'recent') {
      const dayAgo = new Date()
      dayAgo.setDate(dayAgo.getDate() - 1)
      filtered = filtered.filter(note => new Date(note.updatedAt) > dayAgo)
    } else if (selectedFolderId === 'starred') {
      filtered = filtered.filter(note => note.isFavorited)
    } else if (selectedFolderId === 'tagged') {
      filtered = filtered.filter(note => note.tags && note.tags.length > 0)
    } else if (selectedFolderId === 'archive') {
      filtered = []
    } else if (selectedFolderId === 'trash') {
      filtered = []
    } else if (selectedFolderId) {
      filtered = filtered.filter(note => note.folderId === selectedFolderId)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        note =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [notes, selectedFolderId, showPinnedOnly, searchQuery])

  // 使用 useMemo 优化排序逻辑
  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
      return a.title.localeCompare(b.title)
    })
  }, [filteredNotes, sortBy])

  // 优化的选择处理函数
  const handleSelectNote = useCallback((noteId: string) => {
    dispatch(selectNote(noteId))
  }, [dispatch])

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4 overflow-y-auto">
        {sortedNotes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-apple-gray-400">
            <p>没有找到备忘录</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 gap-4">
            {sortedNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                isSelected={selectedNoteId === note.id}
                onSelect={handleSelectNote}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {sortedNotes.map(note => (
              <NoteListItem
                key={note.id}
                note={note}
                isSelected={selectedNoteId === note.id}
                onSelect={handleSelectNote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}