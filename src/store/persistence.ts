import { newId } from '@/src/lib/note'
import { seedFolders, seedNotes } from '@/src/lib/seed'
import { DEFAULT_FOLDER_ID, type Folder, type Note } from '@/src/lib/types'
import { loadAll, putImage, writeChanges, type Changes } from './db'
import { initialUIState, type UIState } from './uiSlice'
import type { AppStore, RootState } from './store'

/** localStorage keys: view preferences, and the pre-IndexedDB format (migrated once). */
const UI_KEY = 'applenotes:ui'
const LEGACY_KEY = 'applenotes:v2'
export const CHANNEL_NAME = 'applenotes'

const PERSISTED_UI_KEYS = [
  'selection',
  'selectedNoteId',
  'viewMode',
  'sortBy',
  'groupByDate',
  'sidebarVisible',
  'sidebarWidth',
  'listWidth',
  'collapsedFolders',
] as const satisfies readonly (keyof UIState)[]

type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function pickUI(ui: Partial<UIState>): Partial<UIState> {
  const out: Partial<UIState> = {}
  for (const key of PERSISTED_UI_KEYS) {
    if (ui[key] !== undefined) (out as Record<string, unknown>)[key] = ui[key]
  }
  return out
}

function readJSON<T>(storage: KeyValueStorage | undefined, key: string): T | null {
  try {
    const raw = storage?.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    // Storage can be unavailable (private mode, blocked site data) or hold bad JSON.
    return null
  }
}

interface LegacySnapshot {
  version: number
  notes: Note[]
  folders: Folder[]
  ui?: Partial<UIState>
}

function readLegacy(storage: KeyValueStorage | undefined): LegacySnapshot | null {
  const snap = readJSON<LegacySnapshot>(storage, LEGACY_KEY)
  return snap && snap.version === 2 && Array.isArray(snap.notes) && Array.isArray(snap.folders)
    ? snap
    : null
}

function dataUrlToBlob(url: string): Blob {
  const comma = url.indexOf(',')
  const head = url.slice(0, comma)
  const body = url.slice(comma + 1)
  const type = /^data:([^;,]+)/.exec(head)?.[1] ?? 'application/octet-stream'
  if (!head.includes(';base64')) return new Blob([decodeURIComponent(body)], { type })
  const binary = atob(body)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type })
}

/** Moves inline base64 images out of note HTML and into the image store. */
async function extractInlineImages(db: IDBDatabase, notes: Note[]): Promise<Note[]> {
  const out: Note[] = []
  for (const note of notes) {
    let html = note.html
    for (const match of Array.from(note.html.matchAll(/<img\b[^>]*\bsrc="(data:[^"]+)"[^>]*>/gi))) {
      const id = newId()
      const blob = dataUrlToBlob(match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'))
      await putImage(db, { id, blob, createdAt: new Date().toISOString() })
      html = html.replace(match[0], `<img data-image-id="${id}" alt="">`)
    }
    out.push(html === note.html ? note : { ...note, html })
  }
  return out
}

function withDefaultFolder(folders: Folder[]): Folder[] {
  return folders.some(f => f.id === DEFAULT_FOLDER_ID)
    ? folders
    : [...seedFolders().slice(0, 1), ...folders]
}

/**
 * Loads notes and folders from IndexedDB. On first run, imports the old
 * localStorage data if present, otherwise the sample notes. With no database
 * (IndexedDB blocked), returns the sample notes for an unsaved session.
 */
export async function loadState(
  db: IDBDatabase | null,
  storage: KeyValueStorage | undefined
): Promise<Partial<RootState>> {
  const legacy = readLegacy(storage)
  const ui = { ...initialUIState, ...pickUI(readJSON(storage, UI_KEY) ?? legacy?.ui ?? {}) }
  const state = (notes: Note[], folders: Folder[]): Partial<RootState> => ({
    notes: { notes },
    folders: { folders: withDefaultFolder(folders) },
    ui,
  })

  if (db) {
    const stored = await loadAll(db)
    if (stored.notes.length || stored.folders.length) return state(stored.notes, stored.folders)
  }

  const now = Date.now()
  let notes = legacy?.notes ?? seedNotes(now)
  const folders = withDefaultFolder(legacy?.folders ?? seedFolders(now))
  if (!legacy) ui.selectedNoteId = 'welcome'
  if (db) {
    if (legacy) notes = await extractInlineImages(db, notes)
    await writeChanges(db, {
      putNotes: notes,
      deleteNoteIds: [],
      putFolders: folders,
      deleteFolderIds: [],
    })
    if (legacy) {
      try {
        storage?.removeItem(LEGACY_KEY)
      } catch {
        // Harmless: the IndexedDB copy is now the one that loads.
      }
    }
  }
  return state(notes, folders)
}

interface Saved {
  notes: Map<string, Note>
  folders: Map<string, Folder>
}

function snapshotOf(state: RootState): Saved {
  return {
    notes: new Map(state.notes.notes.map(n => [n.id, n])),
    folders: new Map(state.folders.folders.map(f => [f.id, f])),
  }
}

/**
 * What changed since `saved`. Redux keeps unchanged records as the same
 * objects, so comparing references finds exactly the edited notes.
 */
export function diff(saved: Saved, state: RootState): Changes {
  const changes: Changes = { putNotes: [], deleteNoteIds: [], putFolders: [], deleteFolderIds: [] }
  const noteIds = new Set<string>()
  for (const n of state.notes.notes) {
    noteIds.add(n.id)
    if (saved.notes.get(n.id) !== n) changes.putNotes.push(n)
  }
  saved.notes.forEach((_, id) => noteIds.has(id) || changes.deleteNoteIds.push(id))
  const folderIds = new Set<string>()
  for (const f of state.folders.folders) {
    folderIds.add(f.id)
    if (saved.folders.get(f.id) !== f) changes.putFolders.push(f)
  }
  saved.folders.forEach((_, id) => folderIds.has(id) || changes.deleteFolderIds.push(id))
  return changes
}

export function isEmpty(c: Changes): boolean {
  return (
    !c.putNotes.length &&
    !c.deleteNoteIds.length &&
    !c.putFolders.length &&
    !c.deleteFolderIds.length
  )
}

interface PersistOptions {
  db: IDBDatabase | null
  storage: KeyValueStorage | undefined
  /** Tells other tabs what this tab saved; null where BroadcastChannel is unavailable. */
  channel: Pick<BroadcastChannel, 'postMessage'> | null
  onError: (e: unknown) => void
}

/**
 * Saves changed notes and folders to IndexedDB (throttled), tells other tabs,
 * and keeps view preferences in localStorage. Returns `stop`, and
 * `markApplied`, which records changes received from another tab as already
 * saved so they aren't written and broadcast back.
 */
export function persist(store: AppStore, opts: PersistOptions) {
  const saved = snapshotOf(store.getState())
  let savedUI = store.getState().ui
  let timer: ReturnType<typeof setTimeout> | null = null

  const flush = () => {
    if (timer) clearTimeout(timer)
    timer = null
    const state = store.getState()
    const changes = diff(saved, state)
    if (!isEmpty(changes)) {
      changes.putNotes.forEach(n => saved.notes.set(n.id, n))
      changes.deleteNoteIds.forEach(id => saved.notes.delete(id))
      changes.putFolders.forEach(f => saved.folders.set(f.id, f))
      changes.deleteFolderIds.forEach(id => saved.folders.delete(id))
      if (opts.db) writeChanges(opts.db, changes).catch(opts.onError)
      channel?.postMessage(changes)
    }
    if (state.ui !== savedUI) {
      savedUI = state.ui
      try {
        opts.storage?.setItem(UI_KEY, JSON.stringify(pickUI(state.ui)))
      } catch {
        // View preferences are a convenience; losing them is fine.
      }
    }
  }

  let channel = opts.channel
  const setChannel = (c: PersistOptions['channel']) => {
    channel = c
  }

  const unsubscribe = store.subscribe(() => {
    if (!timer) timer = setTimeout(flush, 300)
  })

  const markApplied = (changes: Changes) => {
    const state = store.getState()
    const notes = new Map(state.notes.notes.map(n => [n.id, n]))
    // Only records the remote version won; a newer local edit still needs saving.
    changes.putNotes.forEach(n => notes.get(n.id) === n && saved.notes.set(n.id, n))
    changes.deleteNoteIds.forEach(id => saved.notes.delete(id))
    changes.putFolders.forEach(f => saved.folders.set(f.id, f))
    changes.deleteFolderIds.forEach(id => saved.folders.delete(id))
  }

  const stop = () => {
    unsubscribe()
    flush()
  }
  return { flush, stop, markApplied, setChannel }
}
