import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { getImage, loadAll, openDB } from '../db'
import { editNote, trashNotes } from '../notesSlice'
import { diff, loadState, persist } from '../persistence'
import { makeStore } from '../store'

let dbCount = 0
const freshDB = () => openDB(`test-${++dbCount}`)
const tick = () => new Promise(r => setTimeout(r, 20))

function memoryStorage(init: Record<string, string> = {}) {
  const data = new Map(Object.entries(init))
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
    data,
  }
}

describe('loadState', () => {
  it('seeds an empty database once, then loads what was saved', async () => {
    const db = await freshDB()
    const first = await loadState(db, undefined)
    expect(first.notes!.notes.length).toBeGreaterThan(0)
    const second = await loadState(db, undefined)
    expect(second.notes!.notes.map(n => n.id).sort()).toEqual(
      first.notes!.notes.map(n => n.id).sort()
    )
  })

  it('migrates the old localStorage format, moving inline images to the image store', async () => {
    const db = await freshDB()
    const png = 'data:image/png;base64,iVBORw0KGgo='
    const legacy = {
      version: 2,
      notes: [
        {
          id: 'a',
          folderId: 'notes',
          html: `<h1>Old</h1><img src="${png}" alt="">`,
          title: 'Old',
          snippet: '',
          tags: [],
          isPinned: false,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          deletedAt: null,
        },
      ],
      folders: [
        { id: 'notes', name: '备忘录', parentId: null, createdAt: '2026-01-01T00:00:00.000Z' },
      ],
      ui: { viewMode: 'gallery' },
    }
    const storage = memoryStorage({ 'applenotes:v2': JSON.stringify(legacy) })
    const state = await loadState(db, storage)

    const html = state.notes!.notes[0].html
    const id = /data-image-id="([^"]+)"/.exec(html)?.[1]
    expect(html).not.toContain('data:image')
    expect(id).toBeTruthy()
    const blob = await getImage(db, id!)
    expect(blob?.type).toBe('image/png')
    expect(blob?.size).toBe(8)
    expect(state.ui!.viewMode).toBe('gallery')
    expect(storage.data.has('applenotes:v2')).toBe(false)
    expect((await loadAll(db)).notes[0].html).toBe(html)
  })

  it('works without a database', async () => {
    const state = await loadState(null, undefined)
    expect(state.notes!.notes.length).toBeGreaterThan(0)
  })
})

describe('persist', () => {
  it('diffs by record: only edited and removed notes', async () => {
    const store = makeStore(await loadState(null, undefined))
    const before = store.getState()
    const saved = {
      notes: new Map(before.notes.notes.map(n => [n.id, n])),
      folders: new Map(before.folders.folders.map(f => [f.id, f])),
    }
    store.dispatch(editNote({ id: 'welcome', html: '<h1>Changed</h1>' }))
    const c = diff(saved, store.getState())
    expect(c.putNotes.map(n => n.id)).toEqual(['welcome'])
    expect(c.putFolders).toEqual([])
    expect(c.deleteNoteIds).toEqual([])
  })

  it('writes changes to IndexedDB and broadcasts them', async () => {
    const db = await freshDB()
    const store = makeStore(await loadState(db, undefined))
    const sent: unknown[] = []
    const saver = persist(store, {
      db,
      storage: undefined,
      channel: { postMessage: m => sent.push(m) },
      onError: e => {
        throw e
      },
    })
    store.dispatch(editNote({ id: 'welcome', html: '<h1>Saved</h1>' }))
    store.dispatch(trashNotes(['wifi']))
    saver.flush()
    await tick()

    const stored = await loadAll(db)
    expect(stored.notes.find(n => n.id === 'welcome')!.title).toBe('Saved')
    expect(stored.notes.find(n => n.id === 'wifi')!.deletedAt).not.toBeNull()
    expect(sent).toHaveLength(1)
    expect((sent[0] as { putNotes: unknown[] }).putNotes).toHaveLength(2)

    saver.flush()
    expect(sent).toHaveLength(1) // nothing new to save
    saver.stop()
  })

  it('saves view preferences to localStorage', async () => {
    const storage = memoryStorage()
    const store = makeStore(await loadState(null, storage))
    const saver = persist(store, { db: null, storage, channel: null, onError: () => {} })
    store.dispatch({ type: 'ui/setViewMode', payload: 'gallery' })
    saver.flush()
    expect(JSON.parse(storage.data.get('applenotes:ui')!).viewMode).toBe('gallery')
    const reloaded = await loadState(null, storage)
    expect(reloaded.ui!.viewMode).toBe('gallery')
  })
})
