import { describe, expect, it } from 'vitest'
import { formatListDate, sectionNotes } from '../dates'
import type { Note } from '../types'

const now = new Date(2026, 9, 6, 15, 0)
const at = (y: number, m: number, d: number, h = 9) => new Date(y, m, d, h).toISOString()

function note(id: string, updatedAt: string, extra: Partial<Note> = {}): Note {
  return {
    id,
    folderId: 'notes',
    html: '',
    title: id,
    snippet: '',
    tags: [],
    isPinned: false,
    createdAt: updatedAt,
    updatedAt,
    deletedAt: null,
    ...extra,
  }
}

describe('formatListDate', () => {
  it('formats like Apple Notes', () => {
    expect(formatListDate(at(2026, 9, 6, 8), now)).toBe('08:00')
    expect(formatListDate(at(2026, 9, 5), now)).toBe('昨天')
    expect(formatListDate(at(2026, 9, 2), now)).toBe('星期五')
    expect(formatListDate(at(2026, 8, 1), now)).toBe('2026/9/1')
  })
})

describe('sectionNotes', () => {
  const notes = [
    note('old', at(2024, 1, 1)),
    note('today', at(2026, 9, 6)),
    note('pin', at(2026, 0, 1), { isPinned: true }),
    note('yday', at(2026, 9, 5)),
    note('week', at(2026, 9, 1)),
    note('month', at(2026, 8, 20)),
    note('sep', at(2026, 8, 1)),
  ]

  it('groups pinned first, then by date', () => {
    const s = sectionNotes(notes, {
      sortBy: 'edited',
      groupByDate: true,
      separatePinned: true,
      now,
    })
    expect(s.map(x => [x.title, x.notes.map(n => n.id)])).toEqual([
      ['置顶', ['pin']],
      ['今天', ['today']],
      ['昨天', ['yday']],
      ['过去 7 天', ['week']],
      ['过去 30 天', ['month']],
      ['9月', ['sep']],
      ['2024年', ['old']],
    ])
  })

  it('does not group when sorting by title', () => {
    const s = sectionNotes(notes, {
      sortBy: 'title',
      groupByDate: true,
      separatePinned: false,
      now,
    })
    expect(s).toHaveLength(1)
    expect(s[0].title).toBe('')
  })
})
