import { NEW_NOTE_HTML } from '@/src/lib/note'
import { DEFAULT_FOLDER_ID, type Selection } from '@/src/lib/types'
import {
  createFolder,
  folderSubtree,
  nextFolderName,
  removeFolder,
  renameFolder,
} from './foldersSlice'
import { undoable } from './history'
import {
  createNote,
  destroyNote,
  duplicateNote,
  moveNote,
  togglePin,
  trashNotes,
} from './notesSlice'
import { selectOrderedIds } from './selectors'
import type { AppThunk } from './store'
import {
  select,
  selectNote,
  setFocus,
  setGalleryOpen,
  setMobilePane,
  setRenamingFolder,
  setSearch,
} from './uiSlice'

/** After the list changes, keep a visible note selected (Apple Notes always shows one). */
export const ensureSelectedNote = (): AppThunk => (dispatch, getState) => {
  const state = getState()
  const ids = selectOrderedIds(state)
  if (!state.ui.selectedNoteId || !ids.includes(state.ui.selectedNoteId)) {
    dispatch(selectNote(ids[0] ?? null))
  }
}

export const openSelection =
  (selection: Selection): AppThunk =>
  dispatch => {
    dispatch(select(selection))
    dispatch(ensureSelectedNote())
    dispatch(setMobilePane('list'))
  }

export const newNote = (): AppThunk => (dispatch, getState) => {
  const { selection } = getState().ui
  let folderId = DEFAULT_FOLDER_ID
  let html = NEW_NOTE_HTML
  if (selection.kind === 'folder') folderId = selection.id
  else if (selection.kind === 'trash') dispatch(select({ kind: 'folder', id: DEFAULT_FOLDER_ID }))
  else if (selection.tag) html = `${NEW_NOTE_HTML}<p>#${selection.tag}</p>`
  dispatch(setSearch(''))
  const action = dispatch(createNote({ folderId, html }))
  dispatch(selectNote(action.payload.id))
  dispatch(setGalleryOpen(true))
  dispatch(setFocus('editor'))
  dispatch(setMobilePane('editor'))
}

/**
 * Deletes a note: moves it to Recently Deleted, or erases it if it is already
 * there. Selects the next note in the list, like Apple Notes.
 */
export const deleteNote =
  (id: string): AppThunk =>
  (dispatch, getState) => {
    const note = getState().notes.notes.find(n => n.id === id)
    if (note) dispatch(undoable('删除备忘录', removeNote(id)))
  }

const removeNote =
  (id: string): AppThunk =>
  (dispatch, getState) => {
    const state = getState()
    const note = state.notes.notes.find(n => n.id === id)
    if (!note) return
    const ids = selectOrderedIds(state)
    const index = ids.indexOf(id)
    const neighbor = ids[index + 1] ?? ids[index - 1] ?? null
    if (note.deletedAt) dispatch(destroyNote(id))
    else dispatch(trashNotes([id]))
    if (state.ui.selectedNoteId === id) dispatch(selectNote(neighbor))
    dispatch(ensureSelectedNote())
  }

export const restoreNote = (id: string): AppThunk =>
  undoable('恢复备忘录', (dispatch, getState) => {
    const state = getState()
    const note = state.notes.notes.find(n => n.id === id)
    if (!note) return
    const folderExists = state.folders.folders.some(f => f.id === note.folderId)
    dispatch(moveNote({ id, folderId: folderExists ? note.folderId : DEFAULT_FOLDER_ID }))
    dispatch(ensureSelectedNote())
  })

export const moveNoteTo = (id: string, folderId: string): AppThunk =>
  undoable('移动备忘录', dispatch => {
    dispatch(moveNote({ id, folderId }))
    dispatch(ensureSelectedNote())
  })

export const copyNote = (id: string): AppThunk =>
  undoable('复制备忘录', dispatch => {
    const action = dispatch(duplicateNote(id))
    dispatch(selectNote(action.payload.copyId))
  })

export const pinNote = (id: string): AppThunk =>
  undoable('置顶备忘录', dispatch => {
    dispatch(togglePin(id))
  })

export const newFolder = (parentId: string | null = null): AppThunk =>
  undoable('新建文件夹', (dispatch, getState) => {
    const name = nextFolderName(getState().folders.folders)
    const action = dispatch(createFolder({ name, parentId }))
    dispatch(openSelection({ kind: 'folder', id: action.payload.id }))
    dispatch(setRenamingFolder(action.payload.id))
  })

export const renameFolderTo = (id: string, name: string): AppThunk =>
  undoable('重新命名文件夹', dispatch => {
    dispatch(renameFolder({ id, name }))
  })

/** Deletes a folder and its subfolders; their notes go to Recently Deleted. */
export const deleteFolder = (id: string): AppThunk =>
  undoable('删除文件夹', (dispatch, getState) => {
    if (id === DEFAULT_FOLDER_ID) return
    const state = getState()
    const ids = new Set(folderSubtree(state.folders.folders, id))
    const noteIds = state.notes.notes
      .filter(n => !n.deletedAt && ids.has(n.folderId))
      .map(n => n.id)
    dispatch(trashNotes(noteIds))
    dispatch(removeFolder(id))
    const sel = state.ui.selection
    if (sel.kind === 'folder' && ids.has(sel.id)) {
      dispatch(select({ kind: 'folder', id: DEFAULT_FOLDER_ID }))
    }
    dispatch(ensureSelectedNote())
  })

/** Moves the note selection up or down the list. */
export const stepSelection =
  (delta: 1 | -1): AppThunk =>
  (dispatch, getState) => {
    const state = getState()
    const ids = selectOrderedIds(state)
    if (!ids.length) return
    const i = state.ui.selectedNoteId ? ids.indexOf(state.ui.selectedNoteId) : -1
    const next = ids[Math.min(ids.length - 1, Math.max(0, i + delta))]
    dispatch(selectNote(next))
  }

export const runSearch =
  (query: string): AppThunk =>
  dispatch => {
    dispatch(setSearch(query))
    dispatch(ensureSelectedNote())
  }
