import type { Note } from './types'

const ENTITIES: Record<string, string> = {
  nbsp: ' ',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  '#39': "'",
}

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+|#39);/gi, (match, name: string) => {
    const lower = name.toLowerCase()
    if (lower in ENTITIES) return ENTITIES[lower]
    if (lower.startsWith('#x')) return String.fromCodePoint(parseInt(lower.slice(2), 16))
    if (lower.startsWith('#')) return String.fromCodePoint(parseInt(lower.slice(1), 10))
    return match
  })
}

/** Converts note HTML to trimmed, non-empty plain-text lines. Works without a DOM. */
export function htmlToLines(html: string): string[] {
  const text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|pre|blockquote|tr|table|ul|ol)>/gi, '\n')
    .replace(/<(td|th)\b[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
  return decodeEntities(text)
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

const TAG_RE = /(?:^|\s)#([\p{L}\p{N}_-]+)/gu

export function extractTags(lines: string[]): string[] {
  const tags = new Set<string>()
  for (const line of lines) {
    for (const match of Array.from(line.matchAll(TAG_RE))) tags.add(match[1])
  }
  return Array.from(tags)
}

export function deriveFields(html: string): Pick<Note, 'title' | 'snippet' | 'tags'> {
  const lines = htmlToLines(html)
  return {
    title: (lines[0] ?? '').slice(0, 200),
    snippet: lines.slice(1).join(' ').slice(0, 300),
    tags: extractTags(lines),
  }
}

export const UNTITLED = '新建备忘录'
export const NO_ADDITIONAL_TEXT = '无附加文本'

export function displayTitle(note: Pick<Note, 'title'>): string {
  return note.title || UNTITLED
}

export function matchesQuery(note: Pick<Note, 'title' | 'snippet'>, query: string): boolean {
  const q = query.trim().toLocaleLowerCase()
  if (!q) return true
  return `${note.title}\n${note.snippet}`.toLocaleLowerCase().includes(q)
}

/** HTML for a brand-new note: an empty first line in Title style. */
export const NEW_NOTE_HTML = '<h1><br></h1>'

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Images live in IndexedDB. Note HTML refers to them as
 * `<img data-image-id="…">`; the `src` is a blob: URL filled in when shown.
 */
export const IMAGE_ID_ATTR = 'data-image-id'
const IMAGE_ID_RE = /<img\b[^>]*\bdata-image-id="([^"]+)"/gi

export function imageIds(html: string): string[] {
  return Array.from(html.matchAll(IMAGE_ID_RE), m => m[1])
}
