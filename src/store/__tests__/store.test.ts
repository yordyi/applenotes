import { describe, expect, it } from 'vitest'
import { deleteFolder, deleteNote, newNote, openSelection, restoreNote } from '../actions'
import { editNote, purgeExpired } from '../notesSlice'
import { loadState } from '../persistence'
import { selectListNotes, selectOrderedIds } from '../selectors'
import { makeStore } from '../store'

const fresh = async () => makeStore(await loadState(null, undefined))

describe('notes flow', () => {
  it('creates a note in the selected folder and selects it', async () => {
    const store = await fresh()
    store.dispatch(openSelection({ kind: 'folder', id: 'work' }))
    store.dispatch(newNote())
    const { ui, notes } = store.getState()
    const created = notes.notes.find(n => n.id === ui.selectedNoteId)!
    expect(created.folderId).toBe('work')
    expect(created.title).toBe('')
  })

  it('derives title on edit', async () => {
    const store = await fresh()
    store.dispatch(editNote({ id: 'welcome', html: '<h1>新的</h1><p>正文</p>' }))
    const n = store.getState().notes.notes.find(x => x.id === 'welcome')!
    expect([n.title, n.snippet]).toEqual(['新的', '正文'])
  })

  it('moves deleted notes to trash, selects neighbor, restores and erases', async () => {
    const store = await fresh()
    store.dispatch(openSelection({ kind: 'folder', id: 'life' }))
    const [first, second] = selectOrderedIds(store.getState())
    store.dispatch({ type: 'ui/selectNote', payload: first })
    store.dispatch(deleteNote(first))
    expect(store.getState().ui.selectedNoteId).toBe(second)

    store.dispatch(openSelection({ kind: 'trash' }))
    expect(selectListNotes(store.getState()).map(n => n.id)).toEqual([first])

    store.dispatch(restoreNote(first))
    expect(selectListNotes(store.getState())).toHaveLength(0)

    store.dispatch(deleteNote(second))
    store.dispatch(deleteNote(second))
    expect(store.getState().notes.notes.some(n => n.id === second)).toBe(false)
  })

  it('deleting a folder trashes notes in it and its subfolders', async () => {
    const store = await fresh()
    store.dispatch(openSelection({ kind: 'folder', id: 'work' }))
    store.dispatch(deleteFolder('work'))
    const s = store.getState()
    expect(s.folders.folders.map(f => f.id)).not.toContain('work-meetings')
    expect(s.notes.notes.find(n => n.id === 'meeting')!.deletedAt).not.toBeNull()
    expect(s.ui.selection).toEqual({ kind: 'folder', id: 'notes' })
  })

  it('purges notes deleted more than 30 days ago', async () => {
    const store = await fresh()
    store.dispatch(deleteNote('wifi'))
    store.dispatch(purgeExpired(new Date(Date.now() + 31 * 86_400_000).toISOString()))
    expect(store.getState().notes.notes.some(n => n.id === 'wifi')).toBe(false)
  })
})

describe('undo / redo', () => {
  it('undoes and redoes deleting a note', async () => {
    const { undo, redo } = await import('../history')
    const store = await fresh()
    store.dispatch(deleteNote('wifi'))
    expect(store.getState().notes.notes.find(n => n.id === 'wifi')!.deletedAt).not.toBeNull()
    store.dispatch(undo())
    expect(store.getState().notes.notes.find(n => n.id === 'wifi')!.deletedAt).toBeNull()
    expect(store.getState().ui.selectedNoteId).toBe('wifi')
    store.dispatch(redo())
    expect(store.getState().notes.notes.find(n => n.id === 'wifi')!.deletedAt).not.toBeNull()
  })

  it('undoes deleting a folder: folders and their notes come back', async () => {
    const { undo } = await import('../history')
    const store = await fresh()
    const before = store.getState()
    store.dispatch(deleteFolder('work'))
    store.dispatch(undo())
    const after = store.getState()
    const byId = (fs: { id: string }[]) => [...fs].sort((a, b) => a.id.localeCompare(b.id))
    expect(byId(after.folders.folders)).toEqual(byId(before.folders.folders))
    expect(after.notes.notes.filter(n => n.deletedAt)).toHaveLength(0)
  })

  it('only reverts what the action changed', async () => {
    const { undo } = await import('../history')
    const store = await fresh()
    store.dispatch(deleteNote('wifi'))
    store.dispatch(editNote({ id: 'books', html: '<h1>之后的编辑</h1>' }))
    store.dispatch(undo())
    expect(store.getState().notes.notes.find(n => n.id === 'books')!.title).toBe('之后的编辑')
  })

  it('a new action clears redo; empty actions are not recorded', async () => {
    const { undo } = await import('../history')
    const { renameFolderTo } = await import('../actions')
    const store = await fresh()
    store.dispatch(renameFolderTo('work', '工作'))
    expect(store.getState().history.undo).toHaveLength(0)
    store.dispatch(deleteNote('wifi'))
    store.dispatch(undo())
    expect(store.getState().history.redo).toHaveLength(1)
    store.dispatch(deleteNote('books'))
    expect(store.getState().history.redo).toHaveLength(0)
  })
})

describe('day change', () => {
  it('recomputes date groups when the day changes', async () => {
    const { selectSections } = await import('../selectors')
    const { setToday } = await import('../uiSlice')
    const store = await fresh()
    const first = selectSections(store.getState())
    expect(selectSections(store.getState())).toBe(first)
    store.dispatch(setToday('2099-1-1'))
    expect(selectSections(store.getState())).not.toBe(first)
  })
})
