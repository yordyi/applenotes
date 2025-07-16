'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setView, setSortBy } from '@/store/slices/uiSlice'
import { addNote } from '@/store/slices/notesSlice'
import { Grid3X3, List, SortDesc, Plus } from 'lucide-react'

export function Toolbar() {
  const dispatch = useAppDispatch()
  const { view, sortBy } = useAppSelector(state => state.ui)
  const { selectedFolderId } = useAppSelector(state => state.folders)

  const handleAddNote = () => {
    dispatch(addNote({
      title: '新建备忘录',
      content: '',
      folderId: selectedFolderId === 'all' || selectedFolderId === 'recent' || selectedFolderId === 'pinned' || selectedFolderId === 'starred' || selectedFolderId === 'tagged' ? null : selectedFolderId,
      isPinned: false,
      tags: []
    }))
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-apple-gray-200 dark:border-apple-gray-800">
      <h1 className="text-2xl font-bold">备忘录</h1>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={handleAddNote}
          className="p-2 rounded hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800"
        >
          <Plus className="w-5 h-5" />
        </button>
        
        <div className="flex items-center bg-apple-gray-100 dark:bg-apple-gray-800 rounded">
          <button
            onClick={() => dispatch(setView('grid'))}
            className={`p-2 rounded ${view === 'grid' ? 'bg-white dark:bg-apple-gray-700' : ''}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => dispatch(setView('list'))}
            className={`p-2 rounded ${view === 'list' ? 'bg-white dark:bg-apple-gray-700' : ''}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
        
        <button
          onClick={() => dispatch(setSortBy(sortBy === 'date' ? 'title' : 'date'))}
          className="p-2 rounded hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800"
        >
          <SortDesc className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}