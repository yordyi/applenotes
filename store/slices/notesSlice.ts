import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'
import { initialNotes } from '../initialData'
import type { RootState } from '../store'

export interface Note {
  id: string
  title: string
  content: string
  folderId: string | null
  createdAt: string
  updatedAt: string
  isPinned: boolean
  isFavorited?: boolean
  tags: string[]
}

interface NotesState {
  notes: Note[]
  selectedNoteId: string | null
  searchQuery: string
}

const initialState: NotesState = {
  notes: initialNotes,
  selectedNoteId: null,
  searchQuery: '',
}

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    addNote: (state, action: PayloadAction<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newNote: Note = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      state.notes.push(newNote)
      state.selectedNoteId = newNote.id
    },
    updateNote: (state, action: PayloadAction<{ id: string; updates: Partial<Note> }>) => {
      const index = state.notes.findIndex(note => note.id === action.payload.id)
      if (index !== -1) {
        state.notes[index] = {
          ...state.notes[index],
          ...action.payload.updates,
          updatedAt: new Date().toISOString(),
        }
      }
    },
    deleteNote: (state, action: PayloadAction<string>) => {
      state.notes = state.notes.filter(note => note.id !== action.payload)
      if (state.selectedNoteId === action.payload) {
        state.selectedNoteId = state.notes.length > 0 ? state.notes[0].id : null
      }
    },
    selectNote: (state, action: PayloadAction<string | null>) => {
      state.selectedNoteId = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    togglePinNote: (state, action: PayloadAction<string>) => {
      const note = state.notes.find(n => n.id === action.payload)
      if (note) {
        note.isPinned = !note.isPinned
        note.updatedAt = new Date().toISOString()
      }
    },
    toggleFavoriteNote: (state, action: PayloadAction<string>) => {
      const note = state.notes.find(n => n.id === action.payload)
      if (note) {
        note.isFavorited = !note.isFavorited
        note.updatedAt = new Date().toISOString()
      }
    },
  },
})

export const { addNote, updateNote, deleteNote, selectNote, setSearchQuery, togglePinNote, toggleFavoriteNote } = notesSlice.actions

// 选择器：计算每个文件夹的笔记数量（包括子文件夹）
export const selectFolderNoteCounts = createSelector(
  [(state: RootState) => state.notes.notes, (state: RootState) => state.folders.folders],
  (notes, folders) => {
    const countMap = new Map<string, number>()
    
    // 获取文件夹及其所有子文件夹的 ID
    const getDescendantFolderIds = (folderId: string): string[] => {
      const childFolders = folders.filter(f => f.parentId === folderId)
      return [folderId, ...childFolders.flatMap(f => getDescendantFolderIds(f.id))]
    }
    
    // 为每个文件夹计算笔记数量
    folders.forEach(folder => {
      const descendantIds = getDescendantFolderIds(folder.id)
      const count = notes.filter(note => 
        note.folderId && descendantIds.includes(note.folderId)
      ).length
      countMap.set(folder.id, count)
    })
    
    return countMap
  }
)

export default notesSlice.reducer