import type { Folder, Note } from '@/src/lib/types'

/**
 * IndexedDB storage. Each note, folder and image is its own record, so a save
 * only writes what changed, and images are stored as Blobs instead of base64.
 */

const DB_NAME = 'applenotes'
const DB_VERSION = 1

export interface ImageRecord {
  id: string
  blob: Blob
  createdAt: string
}

export interface Changes {
  putNotes: Note[]
  deleteNoteIds: string[]
  putFolders: Folder[]
  deleteFolderIds: string[]
}

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error ?? new Error('transaction aborted'))
  })
}

export function openDB(name = DB_NAME): Promise<IDBDatabase> {
  const req = indexedDB.open(name, DB_VERSION)
  req.onupgradeneeded = () => {
    const db = req.result
    for (const store of ['notes', 'folders', 'images']) {
      if (!db.objectStoreNames.contains(store)) db.createObjectStore(store, { keyPath: 'id' })
    }
  }
  return request(req)
}

let shared: Promise<IDBDatabase> | null = null

/** The app's database, opened once. Rejects where IndexedDB is unavailable. */
export function getDB(): Promise<IDBDatabase> {
  if (!shared) {
    shared = typeof indexedDB === 'undefined' ? Promise.reject(new Error('no IndexedDB')) : openDB()
  }
  return shared
}

export async function loadAll(db: IDBDatabase): Promise<{ notes: Note[]; folders: Folder[] }> {
  const tx = db.transaction(['notes', 'folders'], 'readonly')
  const [notes, folders] = await Promise.all([
    request(tx.objectStore('notes').getAll() as IDBRequest<Note[]>),
    request(tx.objectStore('folders').getAll() as IDBRequest<Folder[]>),
  ])
  return { notes, folders }
}

export async function writeChanges(db: IDBDatabase, changes: Changes): Promise<void> {
  const tx = db.transaction(['notes', 'folders'], 'readwrite')
  const notes = tx.objectStore('notes')
  const folders = tx.objectStore('folders')
  changes.putNotes.forEach(n => notes.put(n))
  changes.deleteNoteIds.forEach(id => notes.delete(id))
  changes.putFolders.forEach(f => folders.put(f))
  changes.deleteFolderIds.forEach(id => folders.delete(id))
  await done(tx)
}

export async function putImage(db: IDBDatabase, record: ImageRecord): Promise<void> {
  const tx = db.transaction('images', 'readwrite')
  tx.objectStore('images').put(record)
  await done(tx)
}

export async function getImage(db: IDBDatabase, id: string): Promise<Blob | null> {
  const tx = db.transaction('images', 'readonly')
  const record = (await request(tx.objectStore('images').get(id))) as ImageRecord | undefined
  return record?.blob ?? null
}

/**
 * Deletes images no note refers to. Skips recent ones: another tab may have
 * inserted an image into a note it has not saved yet.
 */
export async function deleteUnusedImages(
  db: IDBDatabase,
  usedIds: Set<string>,
  olderThan: Date
): Promise<number> {
  const tx = db.transaction('images', 'readwrite')
  const store = tx.objectStore('images')
  const all = (await request(store.getAll())) as ImageRecord[]
  const stale = all.filter(r => !usedIds.has(r.id) && new Date(r.createdAt) < olderThan)
  stale.forEach(r => store.delete(r.id))
  await done(tx)
  return stale.length
}
