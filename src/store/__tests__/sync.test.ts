import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { startApp, type Running } from '../boot'
import { loadAll, getDB } from '../db'
import { editNote } from '../notesSlice'

const wait = (ms = 50) => new Promise(r => setTimeout(r, ms))
const note = (app: Running, id: string) => app.store.getState().notes.notes.find(n => n.id === id)!

describe('two tabs', () => {
  const apps: Running[] = []
  afterEach(() => apps.splice(0).forEach(a => a.stop()))

  it('share one database and see each other’s changes', async () => {
    const a = await startApp(() => {})
    const b = await startApp(() => {})
    apps.push(a, b)

    a.store.dispatch(editNote({ id: 'groceries', html: '<h1>来自 A</h1>' }))
    a.flush()
    await wait()
    expect(note(b, 'groceries').title).toBe('来自 A')

    // B received it as already saved: it does not echo the change back.
    const before = note(a, 'groceries')
    b.flush()
    await wait()
    expect(note(a, 'groceries')).toBe(before)

    b.store.dispatch(editNote({ id: 'weekly', html: '<h1>来自 B</h1>' }))
    b.flush()
    await wait()
    expect(note(a, 'weekly').title).toBe('来自 B')
    const stored = await loadAll(await getDB())
    expect(stored.notes.find(n => n.id === 'weekly')!.title).toBe('来自 B')
    expect(stored.notes.find(n => n.id === 'groceries')!.title).toBe('来自 A')
  })

  it('keeps a newer local edit over an older one from another tab', async () => {
    const a = await startApp(() => {})
    const b = await startApp(() => {})
    apps.push(a, b)

    a.store.dispatch(editNote({ id: 'books', html: '<h1>旧</h1>' }))
    await wait(5)
    b.store.dispatch(editNote({ id: 'books', html: '<h1>新</h1>' }))
    a.flush()
    await wait()
    expect(note(b, 'books').title).toBe('新')
    b.flush()
    await wait()
    expect(note(a, 'books').title).toBe('新')
  })
})
