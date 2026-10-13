import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Changes } from './db'

/** One undoable app action (delete, move, pin…). Typing is undone by the editor. */
export interface HistoryEntry {
  /** What ⌘Z undoes, e.g. "删除备忘录". */
  label: string
  /** Records that put the notes and folders back as they were. */
  patch: Changes
}

export interface HistoryState {
  undo: HistoryEntry[]
  redo: HistoryEntry[]
}

const LIMIT = 50
const initialState: HistoryState = { undo: [], redo: [] }

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    /** A new action was done: it can be undone, and nothing can be redone. */
    recorded(state, action: PayloadAction<HistoryEntry>) {
      state.undo.push(action.payload)
      if (state.undo.length > LIMIT) state.undo.shift()
      state.redo = []
    },
    /** The last action was undone; `payload` redoes it. */
    undone(state, action: PayloadAction<HistoryEntry>) {
      state.undo.pop()
      state.redo.push(action.payload)
    },
    /** The last undo was redone; `payload` undoes it again. */
    redone(state, action: PayloadAction<HistoryEntry>) {
      state.redo.pop()
      state.undo.push(action.payload)
    },
  },
})

export const { recorded, undone, redone } = historySlice.actions
export default historySlice.reducer
