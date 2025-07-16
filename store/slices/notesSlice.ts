import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialNotes } from '../initialData'

export interface Note {
  id: string
  title: string
  content: string
  folderId: string | null
  createdAt: string
  updatedAt: string
  isPinned: boolean
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
      }
    },
  },
})

export const { addNote, updateNote, deleteNote, selectNote, setSearchQuery, togglePinNote } = notesSlice.actions
export default notesSlice.reducer