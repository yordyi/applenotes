import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { deriveFields, NEW_NOTE_HTML, newId } from '@/src/lib/note'
import type { Note } from '@/src/lib/types'
import type { Changes } from './db'
import { applyPatch, applyRemote } from './sync'

export const TRASH_RETENTION_DAYS = 30

export interface NotesState {
  notes: Note[]
}

const initialState: NotesState = { notes: [] }

function find(state: NotesState, id: string): Note | undefined {
  return state.notes.find(n => n.id === id)
}

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    createNote: {
      reducer(state, action: PayloadAction<Note>) {
        state.notes.push(action.payload)
      },
      prepare(input: { folderId: string; html?: string }) {
        const now = new Date().toISOString()
        const html = input.html ?? NEW_NOTE_HTML
        const note: Note = {
          id: newId(),
          folderId: input.folderId,
          html,
          ...deriveFields(html),
          isPinned: false,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        }
        return { payload: note }
      },
    },
    editNote: {
      reducer(state, action: PayloadAction<{ id: string; html: string; now: string }>) {
        const note = find(state, action.payload.id)
        if (!note || note.deletedAt || note.html === action.payload.html) return
        note.html = action.payload.html
        Object.assign(note, deriveFields(action.payload.html))
        note.updatedAt = action.payload.now
      },
      prepare(input: { id: string; html: string }) {
        return { payload: { ...input, now: new Date().toISOString() } }
      },
    },
    trashNotes: {
      reducer(state, action: PayloadAction<{ ids: string[]; now: string }>) {
        for (const id of action.payload.ids) {
          const note = find(state, id)
          if (note && !note.deletedAt) {
            note.deletedAt = action.payload.now
            note.isPinned = false
          }
        }
      },
      prepare(ids: string[]) {
        return { payload: { ids, now: new Date().toISOString() } }
      },
    },
    destroyNote(state, action: PayloadAction<string>) {
      state.notes = state.notes.filter(n => n.id !== action.payload)
    },
    /** Moves a note to a folder; moving a deleted note restores it. */
    moveNote(state, action: PayloadAction<{ id: string; folderId: string }>) {
      const note = find(state, action.payload.id)
      if (!note) return
      note.folderId = action.payload.folderId
      note.deletedAt = null
    },
    togglePin(state, action: PayloadAction<string>) {
      const note = find(state, action.payload)
      if (note && !note.deletedAt) note.isPinned = !note.isPinned
    },
    duplicateNote: {
      reducer(state, action: PayloadAction<{ id: string; copyId: string; now: string }>) {
        const source = find(state, action.payload.id)
        if (!source) return
        state.notes.push({
          ...source,
          id: action.payload.copyId,
          isPinned: false,
          deletedAt: null,
          createdAt: action.payload.now,
          updatedAt: action.payload.now,
        })
      },
      prepare(id: string) {
        return { payload: { id, copyId: newId(), now: new Date().toISOString() } }
      },
    },
    /** Permanently removes notes that have been in Recently Deleted for 30 days. */
    purgeExpired(state, action: PayloadAction<string>) {
      const cutoff = new Date(action.payload).getTime() - TRASH_RETENTION_DAYS * 86_400_000
      state.notes = state.notes.filter(
        n => !n.deletedAt || new Date(n.deletedAt).getTime() > cutoff
      )
    },
  },
  extraReducers: builder => {
    builder
      .addCase(applyRemote, (state, { payload }) => applyChanges(state, payload, true))
      .addCase(applyPatch, (state, { payload }) => applyChanges(state, payload, false))
  },
})

function applyChanges(state: NotesState, changes: Changes, keepNewerLocal: boolean) {
  const index = new Map(state.notes.map((n, i) => [n.id, i]))
  for (const note of changes.putNotes) {
    const i = index.get(note.id)
    if (i === undefined) state.notes.push(note)
    // From another tab: keep a local edit that is newer than what it saved.
    else if (!keepNewerLocal || state.notes[i].updatedAt <= note.updatedAt) state.notes[i] = note
  }
  if (changes.deleteNoteIds.length) {
    const gone = new Set(changes.deleteNoteIds)
    state.notes = state.notes.filter(n => !gone.has(n.id))
  }
}

export const {
  createNote,
  editNote,
  trashNotes,
  destroyNote,
  moveNote,
  togglePin,
  duplicateNote,
  purgeExpired,
} = notesSlice.actions
export default notesSlice.reducer
