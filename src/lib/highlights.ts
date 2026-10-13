import { TAG_RE } from './note'

/**
 * Colors #tags and search matches in the editor with the CSS Custom Highlight
 * API, which styles text ranges without changing the note's HTML (so nothing
 * extra is saved and undo is unaffected). Browsers without it just skip this.
 */

const supported = typeof CSS !== 'undefined' && 'highlights' in CSS

function textNodes(root: HTMLElement): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n as Text)
  return nodes
}

function range(node: Text, start: number, end: number): Range {
  const r = document.createRange()
  r.setStart(node, start)
  r.setEnd(node, end)
  return r
}

/** Highlights tags and `query` under `root`. Returns the first search match, if any. */
export function highlightEditor(root: HTMLElement, query: string): Range | null {
  if (!supported) return null
  const tags: Range[] = []
  const hits: Range[] = []
  const needle = query.trim().toLocaleLowerCase()
  for (const node of textNodes(root)) {
    const text = node.data
    for (const m of Array.from(text.matchAll(TAG_RE))) {
      const start = m.index! + m[0].length - m[1].length - 1
      tags.push(range(node, start, start + m[1].length + 1))
    }
    if (needle) {
      const lower = text.toLocaleLowerCase()
      for (let i = lower.indexOf(needle); i >= 0; i = lower.indexOf(needle, i + needle.length)) {
        hits.push(range(node, i, i + needle.length))
      }
    }
  }
  CSS.highlights.set('note-tag', new Highlight(...tags))
  if (hits.length) CSS.highlights.set('note-search', new Highlight(...hits))
  else CSS.highlights.delete('note-search')
  return hits[0] ?? null
}

export function clearEditorHighlights() {
  if (!supported) return
  CSS.highlights.delete('note-tag')
  CSS.highlights.delete('note-search')
}
