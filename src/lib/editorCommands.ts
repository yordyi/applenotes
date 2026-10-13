/**
 * Formatting commands for the note editor (a contentEditable element).
 * Uses document.execCommand where browsers implement the behavior well
 * (inline styles, lists, undo), and direct DOM edits for checklists.
 */

export type BlockStyle = 'h1' | 'h2' | 'h3' | 'p' | 'pre' | 'blockquote'
export type ListKind = 'bullet' | 'dashed' | 'numbered' | 'checklist'

let activeEditor: HTMLElement | null = null

export function setActiveEditor(el: HTMLElement | null) {
  activeEditor = el
}

export function getActiveEditor(): HTMLElement | null {
  return activeEditor?.isConnected ? activeEditor : null
}

/** Tells React the editor changed after a DOM edit that fires no input event. */
export function emitChange(root: HTMLElement) {
  root.dispatchEvent(new Event('input', { bubbles: true }))
}

const BLOCK_CHILD = 'ul,ol,h1,h2,h3,pre,blockquote,table,p,div'

/**
 * execCommand sometimes nests a list or heading inside the <p> it started
 * from. Unwraps those paragraphs, keeping the caret where it was.
 */
function unwrapNestedBlocks(root: HTMLElement) {
  const sel = window.getSelection()
  const saved = sel?.rangeCount ? sel.getRangeAt(0).cloneRange() : null
  let changed = false
  root.querySelectorAll('p').forEach(p => {
    if (!p.querySelector(`:scope > :is(${BLOCK_CHILD})`)) return
    p.replaceWith(...Array.from(p.childNodes).filter(n => n.nodeName !== 'BR'))
    changed = true
  })
  if (changed && saved && root.contains(saved.startContainer)) {
    sel?.removeAllRanges()
    sel?.addRange(saved)
  }
}

/** Cleans up after a formatting command and saves. */
function finish(root: HTMLElement) {
  unwrapNestedBlocks(root)
  emitChange(root)
}

function selectionNode(root: HTMLElement): Node | null {
  const sel = window.getSelection()
  const node = sel?.anchorNode ?? null
  return node && root.contains(node) ? node : null
}

function closest(root: HTMLElement, node: Node | null, selector: string): HTMLElement | null {
  const el = node instanceof HTMLElement ? node : (node?.parentElement ?? null)
  const found = el?.closest(selector) as HTMLElement | null
  return found && root.contains(found) && found !== root ? found : null
}

function ensureFocus(root: HTMLElement) {
  if (document.activeElement !== root) {
    root.focus()
    if (!selectionNode(root)) placeCaret(root, false)
  }
}

export function placeCaret(root: HTMLElement, atEnd: boolean) {
  const range = document.createRange()
  const target = atEnd ? root : (root.firstElementChild ?? root)
  range.selectNodeContents(target)
  range.collapse(!atEnd)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)
}

function exec(command: string, value?: string) {
  document.execCommand(command, false, value)
}

export function toggleInline(kind: 'bold' | 'italic' | 'underline' | 'strikeThrough') {
  const root = getActiveEditor()
  if (!root) return
  ensureFocus(root)
  exec(kind)
}

export function setBlockStyle(style: BlockStyle) {
  const root = getActiveEditor()
  if (!root) return
  ensureFocus(root)
  const list = closest(root, selectionNode(root), 'ul,ol')
  // Applying a paragraph style to a list item turns it back into a paragraph first.
  if (list) exec(list.tagName === 'OL' ? 'insertOrderedList' : 'insertUnorderedList')
  exec('formatBlock', `<${style}>`)
  finish(root)
}

const LIST_CLASS: Record<Exclude<ListKind, 'numbered'>, string> = {
  bullet: '',
  dashed: 'dashed',
  checklist: 'checklist',
}

function listKindOf(list: HTMLElement): ListKind {
  if (list.tagName === 'OL') return 'numbered'
  if (list.classList.contains('checklist')) return 'checklist'
  if (list.classList.contains('dashed')) return 'dashed'
  return 'bullet'
}

function styleList(list: HTMLElement, kind: ListKind) {
  if (kind === 'numbered') return
  list.className = LIST_CLASS[kind]
  if (!list.className) list.removeAttribute('class')
  list.querySelectorAll(':scope > li').forEach(li => {
    if (kind === 'checklist') {
      if (!li.hasAttribute('data-checked')) li.setAttribute('data-checked', 'false')
    } else li.removeAttribute('data-checked')
  })
}

/** Turns the current paragraph(s) into a list of `kind`, or back into text if already one. */
export function toggleList(kind: ListKind) {
  const root = getActiveEditor()
  if (!root) return
  ensureFocus(root)
  const list = closest(root, selectionNode(root), 'ul,ol')
  const current = list ? listKindOf(list) : null

  if (current === kind) {
    exec(kind === 'numbered' ? 'insertOrderedList' : 'insertUnorderedList')
  } else if (list && current !== 'numbered' && kind !== 'numbered') {
    styleList(list, kind)
  } else {
    // Lists can't hold headings; make the block plain text first.
    const block = closest(root, selectionNode(root), 'h1,h2,h3,pre,blockquote')
    if (block && !list) exec('formatBlock', '<p>')
    exec(kind === 'numbered' ? 'insertOrderedList' : 'insertUnorderedList')
    const created = closest(root, selectionNode(root), 'ul,ol')
    if (created) styleList(created, kind)
  }
  finish(root)
}

/** ⇧⌘U: checks or unchecks the current checklist item. */
export function toggleChecked() {
  const root = getActiveEditor()
  if (!root) return
  const li = closest(root, selectionNode(root), 'ul.checklist > li')
  if (!li) return
  li.setAttribute('data-checked', li.getAttribute('data-checked') === 'true' ? 'false' : 'true')
  emitChange(root)
}

/** Inserts a table after the current top-level block and puts the caret in its first cell. */
export function insertTable(rows = 2, cols = 3) {
  const root = getActiveEditor()
  if (!root) return
  ensureFocus(root)
  let block = selectionNode(root)
  while (block && block.parentNode !== root) block = block.parentNode
  const table = document.createElement('table')
  table.innerHTML = `<tbody>${`<tr>${'<td><br></td>'.repeat(cols)}</tr>`.repeat(rows)}</tbody>`
  root.insertBefore(table, block ? block.nextSibling : null)
  if (!table.nextElementSibling) {
    const p = document.createElement('p')
    p.innerHTML = '<br>'
    table.after(p)
  }
  const range = document.createRange()
  range.selectNodeContents(table.querySelector('td')!)
  range.collapse(true)
  window.getSelection()?.removeAllRanges()
  window.getSelection()?.addRange(range)
  emitChange(root)
}

export function insertImage(src: string) {
  const root = getActiveEditor()
  if (!root) return
  ensureFocus(root)
  exec('insertHTML', `<img src="${src.replace(/"/g, '&quot;')}" alt=""><p><br></p>`)
  emitChange(root)
}

export interface ActiveStyles {
  block: BlockStyle | null
  list: ListKind | null
  bold: boolean
  italic: boolean
  underline: boolean
  strikeThrough: boolean
}

export function activeStyles(): ActiveStyles {
  const root = getActiveEditor()
  const node = root ? selectionNode(root) : null
  const list = root && node ? closest(root, node, 'ul,ol') : null
  const block = root && node ? closest(root, node, 'h1,h2,h3,p,pre,blockquote,li,div') : null
  const tag = block?.tagName.toLowerCase()
  const state = (cmd: string) => {
    try {
      return Boolean(node) && document.queryCommandState(cmd)
    } catch {
      return false
    }
  }
  return {
    block: tag === 'li' ? null : ((tag === 'div' ? 'p' : (tag as BlockStyle)) ?? 'p'),
    list: list ? listKindOf(list) : null,
    bold: state('bold'),
    italic: state('italic'),
    underline: state('underline'),
    strikeThrough: state('strikeThrough'),
  }
}

/** Reads an image file and shrinks it so notes stay small enough for localStorage. */
export async function imageFileToDataUrl(file: File, maxSize = 1600): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = reject
      el.src = url
    })
    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas unavailable')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.85)
  } finally {
    URL.revokeObjectURL(url)
  }
}
