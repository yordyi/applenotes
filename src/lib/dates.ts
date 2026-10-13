import type { Note, SortBy } from './types'

const DAY = 86_400_000
const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/** Whole calendar days between `iso` and `now` (0 = today). */
export function daysAgo(iso: string, now: Date): number {
  return Math.round((startOfDay(now) - startOfDay(new Date(iso))) / DAY)
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

export function formatTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Date shown in a note list row, matching Apple Notes. */
export function formatListDate(iso: string, now: Date): string {
  const d = new Date(iso)
  const days = daysAgo(iso, now)
  if (days <= 0) return formatTime(d)
  if (days === 1) return '昨天'
  if (days < 7) return WEEKDAYS[d.getDay()]
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

/** Date shown centered at the top of the editor. */
export function formatEditorDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${formatTime(d)}`
}

export interface NoteSection {
  key: string
  title: string
  notes: Note[]
}

function dateGroup(iso: string, now: Date): { key: string; title: string } {
  const days = daysAgo(iso, now)
  if (days <= 0) return { key: 'today', title: '今天' }
  if (days === 1) return { key: 'yesterday', title: '昨天' }
  if (days <= 7) return { key: 'prev7', title: '过去 7 天' }
  if (days <= 30) return { key: 'prev30', title: '过去 30 天' }
  const d = new Date(iso)
  if (d.getFullYear() === now.getFullYear()) {
    return { key: `m${d.getMonth()}`, title: `${d.getMonth() + 1}月` }
  }
  return { key: `y${d.getFullYear()}`, title: `${d.getFullYear()}年` }
}

const collator = new Intl.Collator('zh-Hans-CN', { numeric: true })

export function sortNotes(notes: Note[], sortBy: SortBy): Note[] {
  const sorted = notes.slice()
  if (sortBy === 'title') {
    sorted.sort((a, b) => collator.compare(a.title, b.title))
  } else {
    const field = sortBy === 'created' ? 'createdAt' : 'updatedAt'
    sorted.sort((a, b) => b[field].localeCompare(a[field]))
  }
  return sorted
}

export function sortDate(note: Note, sortBy: SortBy): string {
  return sortBy === 'created' ? note.createdAt : note.updatedAt
}

/**
 * Splits notes into list sections: 置顶 first, then date groups when
 * `groupByDate` is on and the list is sorted by a date.
 */
export function sectionNotes(
  notes: Note[],
  opts: { sortBy: SortBy; groupByDate: boolean; separatePinned: boolean; now: Date }
): NoteSection[] {
  const sorted = sortNotes(notes, opts.sortBy)
  const sections: NoteSection[] = []
  const pinned = opts.separatePinned ? sorted.filter(n => n.isPinned) : []
  const rest = opts.separatePinned ? sorted.filter(n => !n.isPinned) : sorted
  if (pinned.length) sections.push({ key: 'pinned', title: '置顶', notes: pinned })

  if (!opts.groupByDate || opts.sortBy === 'title') {
    if (rest.length)
      sections.push({ key: 'all', title: pinned.length ? '备忘录' : '', notes: rest })
    return sections
  }

  for (const note of rest) {
    const group = dateGroup(sortDate(note, opts.sortBy), opts.now)
    const last = sections[sections.length - 1]
    if (last && last.key === group.key) last.notes.push(note)
    else sections.push({ ...group, notes: [note] })
  }
  return sections
}
