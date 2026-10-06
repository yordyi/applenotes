import { createSelector } from '@reduxjs/toolkit'
import { sectionNotes } from '@/src/lib/dates'
import { matchesQuery } from '@/src/lib/note'
import type { Folder, Note } from '@/src/lib/types'
import type { RootState } from './store'

export const selectNotes = (s: RootState) => s.notes.notes
export const selectFolders = (s: RootState) => s.folders.folders
export const selectUI = (s: RootState) => s.ui
const selectSelection = (s: RootState) => s.ui.selection
const selectSearch = (s: RootState) => s.ui.search

export const selectLiveNotes = createSelector([selectNotes], notes =>
  notes.filter(n => !n.deletedAt)
)

export const selectTrashCount = createSelector(
  [selectNotes],
  notes => notes.filter(n => n.deletedAt).length
)

export const selectFolderCounts = createSelector([selectLiveNotes], notes => {
  const counts: Record<string, number> = {}
  for (const n of notes) counts[n.folderId] = (counts[n.folderId] ?? 0) + 1
  return counts
})

export const selectAllTags = createSelector([selectLiveNotes], notes => {
  const tags = new Set<string>()
  for (const n of notes) n.tags.forEach(t => tags.add(t))
  return Array.from(tags).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
})

export interface FolderNode {
  folder: Folder
  depth: number
  hasChildren: boolean
}

/** Folders flattened in display order; the built-in folder first, then by name. */
export const selectFolderTree = createSelector([selectFolders], folders => {
  const byParent = new Map<string | null, Folder[]>()
  for (const f of folders) {
    const list = byParent.get(f.parentId) ?? []
    list.push(f)
    byParent.set(f.parentId, list)
  }
  const out: FolderNode[] = []
  const walk = (parentId: string | null, depth: number) => {
    const children = (byParent.get(parentId) ?? []).slice().sort((a, b) => {
      if (a.parentId === null && a.id === 'notes') return -1
      if (b.parentId === null && b.id === 'notes') return 1
      return a.name.localeCompare(b.name, 'zh-Hans-CN', { numeric: true })
    })
    for (const f of children) {
      out.push({ folder: f, depth, hasChildren: byParent.has(f.id) })
      walk(f.id, depth + 1)
    }
  }
  walk(null, 0)
  return out
})

/** Notes the middle column shows for the current selection or search. */
export const selectListNotes = createSelector(
  [selectNotes, selectSelection, selectSearch],
  (notes, selection, search): Note[] => {
    if (search.trim()) return notes.filter(n => !n.deletedAt && matchesQuery(n, search))
    switch (selection.kind) {
      case 'trash':
        return notes.filter(n => n.deletedAt)
      case 'tag':
        return notes.filter(
          n => !n.deletedAt && (selection.tag ? n.tags.includes(selection.tag) : n.tags.length)
        )
      case 'folder':
        return notes.filter(n => !n.deletedAt && n.folderId === selection.id)
    }
  }
)

export const selectSections = createSelector(
  [
    selectListNotes,
    selectSelection,
    selectSearch,
    (s: RootState) => s.ui.sortBy,
    (s: RootState) => s.ui.groupByDate,
  ],
  (notes, selection, search, sortBy, groupByDate) =>
    sectionNotes(notes, {
      sortBy,
      groupByDate,
      separatePinned: selection.kind !== 'trash' && !search.trim(),
      now: new Date(),
    })
)

/** Note ids in on-screen order, for keyboard navigation and picking a neighbor. */
export const selectOrderedIds = createSelector([selectSections], sections =>
  sections.flatMap(s => s.notes.map(n => n.id))
)

export const selectSelectedNote = createSelector(
  [selectNotes, (s: RootState) => s.ui.selectedNoteId],
  (notes, id) => notes.find(n => n.id === id) ?? null
)

export const selectListTitle = createSelector(
  [selectFolders, selectSelection, selectSearch],
  (folders, selection, search) => {
    if (search.trim()) return '搜索结果'
    switch (selection.kind) {
      case 'trash':
        return '最近删除'
      case 'tag':
        return selection.tag ? `#${selection.tag}` : '所有标签'
      case 'folder':
        return folders.find(f => f.id === selection.id)?.name ?? '备忘录'
    }
  }
)

/** Whether list rows should show which folder a note is in. */
export const selectShowFolderInRows = (s: RootState) =>
  Boolean(s.ui.search.trim()) || s.ui.selection.kind === 'tag' || s.ui.selection.kind === 'trash'
