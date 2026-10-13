import { imageIds } from '@/src/lib/note'
import { ensureSelectedNote } from './actions'
import { deleteUnusedImages, getDB, type Changes } from './db'
import { purgeExpired } from './notesSlice'
import { CHANNEL_NAME, loadState, persist } from './persistence'
import { makeStore, type AppStore } from './store'
import { applyRemote } from './sync'

export interface Running {
  store: AppStore
  /** False when IndexedDB is unavailable and nothing will be saved. */
  persistent: boolean
  /** Saves pending changes now, e.g. when the page is being hidden. */
  flush: () => void
  stop: () => void
}

function getStorage(): Storage | undefined {
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

/** Loads saved notes, then keeps them saved and in sync with other open tabs. */
export async function startApp(onSaveError: () => void): Promise<Running> {
  let db = await getDB().catch(() => null)
  const storage = getStorage()
  // If the database opens but can't be read or written (e.g. storage is full),
  // still start, with nothing saved, rather than show a blank page.
  const initial = await loadState(db, storage).catch(() => {
    db = null
    return loadState(null, storage)
  })
  const store = makeStore(initial)
  const saver = persist(store, {
    db,
    storage,
    channel: null,
    onError: onSaveError,
  })
  // Housekeeping after the initial load is recorded as saved, so it gets written.
  store.dispatch(purgeExpired(new Date().toISOString()))
  store.dispatch(ensureSelectedNote())

  let channel: BroadcastChannel | null = null
  if (typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel(CHANNEL_NAME)
    saver.setChannel(channel)
    channel.onmessage = (e: MessageEvent<Changes>) => {
      store.dispatch(applyRemote(e.data))
      saver.markApplied(e.data)
      store.dispatch(ensureSelectedNote())
    }
  }

  if (db) {
    const used = new Set(store.getState().notes.notes.flatMap(n => imageIds(n.html)))
    deleteUnusedImages(db, used, new Date(Date.now() - 86_400_000)).catch(() => {})
  }

  return {
    store,
    persistent: Boolean(db),
    flush: saver.flush,
    stop() {
      saver.stop()
      channel?.close()
    },
  }
}
