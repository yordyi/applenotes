import { configureStore } from '@reduxjs/toolkit'
import notesReducer, {
  addNote,
  updateNote,
  deleteNote,
  setSearchQuery,
  selectNote,
  type NotesState,
} from '@/store/slices/notesSlice'

interface RootState {
  notes: NotesState
}

describe('notesSlice', () => {
  let store: ReturnType<typeof configureStore>

  beforeEach(() => {
    store = configureStore({
      reducer: {
        notes: notesReducer,
      },
      preloadedState: {
        notes: {
          notes: [],
          selectedNoteId: null,
          searchQuery: '',
        },
      },
    })
  })

  it('should handle initial state with empty notes', () => {
    const emptyInitialState = {
      notes: [],
      selectedNoteId: null,
      searchQuery: '',
    }
    const state = store.getState() as RootState
    expect(state.notes).toEqual(emptyInitialState)
  })

  it('should handle addNote', () => {
    const newNoteData = {
      title: 'Test Note',
      content: 'Test content',
      folderId: null,
      isPinned: false,
      tags: [],
    }

    store.dispatch(addNote(newNoteData))
    const state = (store.getState() as RootState).notes

    expect(state.notes).toHaveLength(1)
    expect(state.notes[0]).toEqual(
      expect.objectContaining({
        title: 'Test Note',
        content: 'Test content',
        folderId: null,
        isPinned: false,
        tags: [],
      })
    )
    expect(state.notes[0].id).toBeTruthy()
    expect(state.notes[0].createdAt).toBeTruthy()
    expect(state.notes[0].updatedAt).toBeTruthy()
  })

  it('should handle updateNote', () => {
    const newNoteData = {
      title: 'Test Note',
      content: 'Test content',
      folderId: null,
      isPinned: false,
      tags: [],
    }

    store.dispatch(addNote(newNoteData))
    const state1 = (store.getState() as RootState).notes
    const noteId = state1.notes[0].id

    store.dispatch(
      updateNote({
        id: noteId,
        updates: {
          title: 'Updated Note',
          content: 'Updated content',
        },
      })
    )

    const state2 = (store.getState() as RootState).notes
    expect(state2.notes[0]?.title).toBe('Updated Note')
    expect(state2.notes[0]?.content).toBe('Updated content')
  })

  it('should handle deleteNote', () => {
    const newNoteData = {
      title: 'Test Note',
      content: 'Test content',
      folderId: null,
      isPinned: false,
      tags: [],
    }

    store.dispatch(addNote(newNoteData))
    const state1 = (store.getState() as RootState).notes
    const noteId = state1.notes[0].id

    store.dispatch(deleteNote(noteId))

    const state2 = (store.getState() as RootState).notes
    expect(state2.notes).toHaveLength(0)
  })

  it('should handle setSearchQuery', () => {
    store.dispatch(setSearchQuery('test search'))
    const state = (store.getState() as RootState).notes
    expect(state.searchQuery).toBe('test search')
  })

  it('should handle selectNote', () => {
    store.dispatch(selectNote('1'))
    const state = (store.getState() as RootState).notes
    expect(state.selectedNoteId).toBe('1')
  })
})
