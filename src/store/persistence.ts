import { seedFolders, seedNotes } from '@/src/lib/seed'
import { DEFAULT_FOLDER_ID } from '@/src/lib/types'
import { initialUIState, type UIState } from './uiSlice'
import type { AppStore, RootState } from './store'

const STORAGE_KEY = 'applenotes:v2'
const VERSION = 2

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

interface Snapshot {
  version: number
  notes: RootState['notes']['notes']
  folders: RootState['folders']['folders']
  ui: Partial<UIState>
}

function seedState(): Partial<RootState> {
  const now = Date.now()
  return {
    notes: { notes: seedNotes(now) },
    folders: { folders: seedFolders(now) },
    ui: { ...initialUIState, selectedNoteId: 'welcome' },
  }
}

export function loadState(storage: Pick<Storage, 'getItem'> | undefined): Partial<RootState> {
  let raw: string | null = null
  try {
    raw = storage?.getItem(STORAGE_KEY) ?? null
  } catch {
    // Storage can be unavailable (private mode, blocked site data).
  }
  if (!raw) return seedState()
  try {
    const snap = JSON.parse(raw) as Snapshot
    if (snap.version !== VERSION || !Array.isArray(snap.notes) || !Array.isArray(snap.folders)) {
      return seedState()
    }
    const folders = snap.folders.some(f => f.id === DEFAULT_FOLDER_ID)
      ? snap.folders
      : [...seedFolders().slice(0, 1), ...snap.folders]
    return {
      notes: { notes: snap.notes },
      folders: { folders },
      ui: { ...initialUIState, ...pickUI(snap.ui ?? {}) },
    }
  } catch {
    return seedState()
  }
}

function pickUI(ui: Partial<UIState>): Partial<UIState> {
  const out: Partial<UIState> = {}
  for (const key of PERSISTED_UI_KEYS) {
    if (ui[key] !== undefined) (out as Record<string, unknown>)[key] = ui[key]
  }
  return out
}

export function snapshot(state: RootState): string {
  const snap: Snapshot = {
    version: VERSION,
    notes: state.notes.notes,
    folders: state.folders.folders,
    ui: pickUI(state.ui),
  }
  return JSON.stringify(snap)
}

/**
 * Saves the store to localStorage, throttled. Calls `onError` when the write
 * fails (usually the storage quota after inserting large images).
 */
export function persist(store: AppStore, storage: Storage, onError: (e: unknown) => void) {
  let timer: ReturnType<typeof setTimeout> | null = null
  let last: RootState | null = null
  const flush = () => {
    timer = null
    const state = store.getState()
    if (
      last &&
      state.notes === last.notes &&
      state.folders === last.folders &&
      state.ui === last.ui
    ) {
      return
    }
    last = state
    try {
      storage.setItem(STORAGE_KEY, snapshot(state))
    } catch (e) {
      onError(e)
    }
  }
  const unsubscribe = store.subscribe(() => {
    if (!timer) timer = setTimeout(flush, 300)
  })
  const onHide = () => flush()
  window.addEventListener('pagehide', onHide)
  return () => {
    unsubscribe()
    window.removeEventListener('pagehide', onHide)
    if (timer) clearTimeout(timer)
    flush()
  }
}
