import type { Changes } from './db'
import { recorded, redone, undone, type HistoryEntry } from './historySlice'
import { selectOrderedIds } from './selectors'
import type { AppThunk, RootState } from './store'
import { applyPatch } from './sync'
import { selectNote } from './uiSlice'

/**
 * The patch that turns `after` back into `before`: changed or removed
 * records are put back, added ones deleted. Untouched records are the same
 * objects in both states, so only what the action changed is included.
 */
export function inversePatch(before: RootState, after: RootState): Changes {
  const patch: Changes = { putNotes: [], deleteNoteIds: [], putFolders: [], deleteFolderIds: [] }
  const notesAfter = new Map(after.notes.notes.map(n => [n.id, n]))
  for (const n of before.notes.notes) if (notesAfter.get(n.id) !== n) patch.putNotes.push(n)
  const notesBefore = new Set(before.notes.notes.map(n => n.id))
  for (const id of Array.from(notesAfter.keys()))
    if (!notesBefore.has(id)) patch.deleteNoteIds.push(id)

  const foldersAfter = new Map(after.folders.folders.map(f => [f.id, f]))
  for (const f of before.folders.folders) if (foldersAfter.get(f.id) !== f) patch.putFolders.push(f)
  const foldersBefore = new Set(before.folders.folders.map(f => f.id))
  for (const id of Array.from(foldersAfter.keys())) {
    if (!foldersBefore.has(id)) patch.deleteFolderIds.push(id)
  }
  return patch
}

function isEmpty(p: Changes) {
  return (
    !p.putNotes.length &&
    !p.deleteNoteIds.length &&
    !p.putFolders.length &&
    !p.deleteFolderIds.length
  )
}

/** Runs `thunk` and records how to undo what it changed. */
export const undoable =
  (label: string, thunk: AppThunk): AppThunk =>
  (dispatch, getState) => {
    const before = getState()
    dispatch(thunk)
    const patch = inversePatch(before, getState())
    if (!isEmpty(patch)) dispatch(recorded({ label, patch }))
  }

/** Applies a history entry and returns the entry that reverses it. */
const apply =
  (entry: HistoryEntry, done: typeof undone | typeof redone): AppThunk =>
  (dispatch, getState) => {
    const before = getState()
    dispatch(applyPatch(entry.patch))
    dispatch(done({ label: entry.label, patch: inversePatch(before, getState()) }))
    // Show the note that came back, if it is in the current list.
    const ids = selectOrderedIds(getState())
    const shown = entry.patch.putNotes.find(n => ids.includes(n.id))
    if (shown) dispatch(selectNote(shown.id))
    else if (!ids.includes(getState().ui.selectedNoteId ?? '')) dispatch(selectNote(ids[0] ?? null))
  }

export const undo = (): AppThunk => (dispatch, getState) => {
  const entry = getState().history.undo.at(-1)
  if (entry) dispatch(apply(entry, undone))
}

export const redo = (): AppThunk => (dispatch, getState) => {
  const entry = getState().history.redo.at(-1)
  if (entry) dispatch(apply(entry, redone))
}
