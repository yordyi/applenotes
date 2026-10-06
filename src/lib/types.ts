export const DEFAULT_FOLDER_ID = 'notes'

export interface Note {
  id: string
  folderId: string
  /** Rich text body. The first line is the note's title, as in Apple Notes. */
  html: string
  /** Derived from `html`. */
  title: string
  /** Derived from `html`: plain text after the first line. */
  snippet: string
  /** Derived from `#tags` in the text. */
  tags: string[]
  isPinned: boolean
  createdAt: string
  updatedAt: string
  /** Set when the note is in Recently Deleted. */
  deletedAt: string | null
}

export interface Folder {
  id: string
  name: string
  parentId: string | null
  createdAt: string
}

/** What the sidebar has selected; decides which notes the list shows. */
export type Selection =
  | { kind: 'folder'; id: string }
  | { kind: 'trash' }
  | { kind: 'tag'; tag: string | null }

export type ViewMode = 'list' | 'gallery'
export type SortBy = 'edited' | 'created' | 'title'
export type FocusArea = 'sidebar' | 'list' | 'editor'
export type MobilePane = 'folders' | 'list' | 'editor'
