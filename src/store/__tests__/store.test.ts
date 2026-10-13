import { describe, expect, it } from 'vitest'
import { deleteFolder, deleteNote, newNote, openSelection, restoreNote } from '../actions'
import { editNote, purgeExpired } from '../notesSlice'
import { loadState, snapshot } from '../persistence'
import { selectListNotes, selectOrderedIds } from '../selectors'
import { makeStore } from '../store'

const fresh = () => makeStore(loadState(undefined))

describe('notes flow', () => {
  it('creates a note in the selected folder and selects it', () => {
    const store = fresh()
    store.dispatch(openSelection({ kind: 'folder', id: 'work' }))
    store.dispatch(newNote())
    const { ui, notes } = store.getState()
    const created = notes.notes.find(n => n.id === ui.selectedNoteId)!
    expect(created.folderId).toBe('work')
    expect(created.title).toBe('')
  })

  it('derives title on edit', () => {
    const store = fresh()
    store.dispatch(editNote({ id: 'welcome', html: '<h1>新的</h1><p>正文</p>' }))
    const n = store.getState().notes.notes.find(x => x.id === 'welcome')!
    expect([n.title, n.snippet]).toEqual(['新的', '正文'])
  })

  it('moves deleted notes to trash, selects neighbor, restores and erases', () => {
    const store = fresh()
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

  it('deleting a folder trashes notes in it and its subfolders', () => {
    const store = fresh()
    store.dispatch(openSelection({ kind: 'folder', id: 'work' }))
    store.dispatch(deleteFolder('work'))
    const s = store.getState()
    expect(s.folders.folders.map(f => f.id)).not.toContain('work-meetings')
    expect(s.notes.notes.find(n => n.id === 'meeting')!.deletedAt).not.toBeNull()
    expect(s.ui.selection).toEqual({ kind: 'folder', id: 'notes' })
  })

  it('purges notes deleted more than 30 days ago', () => {
    const store = fresh()
    store.dispatch(deleteNote('wifi'))
    store.dispatch(purgeExpired(new Date(Date.now() + 31 * 86_400_000).toISOString()))
    expect(store.getState().notes.notes.some(n => n.id === 'wifi')).toBe(false)
  })

  it('round-trips through storage', () => {
    const store = fresh()
    store.dispatch(newNote())
    const raw = snapshot(store.getState())
    const restored = loadState({ getItem: () => raw })
    expect(restored.notes!.notes).toEqual(store.getState().notes.notes)
    expect(restored.ui!.search).toBe('')
  })
})
