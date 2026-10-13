/**
 * Undo / redo for the note editor.
 *
 * The browser's built-in contentEditable undo only knows about edits made
 * through execCommand, so checklist ticks, inserted tables and list cleanup
 * would be skipped or corrupt it. Instead the editor keeps snapshots of its
 * HTML and caret: typing is grouped into one step per pause, and every other
 * change (formatting, Enter, paste, a checklist tick) is a step of its own.
 */

interface Caret {
  start: number[]
  startOffset: number
  end: number[]
  endOffset: number
}

interface Snapshot {
  html: string
  caret: Caret | null
}

const TYPING_PAUSE = 500
const MAX_STEPS = 200

/** Input types that continue a run of typing rather than start a new step. */
const TYPING = new Set([
  'insertText',
  'insertCompositionText',
  'insertReplacementText',
  'deleteContentBackward',
  'deleteContentForward',
  'deleteWordBackward',
  'deleteWordForward',
])

export function isTyping(inputType: string | undefined): boolean {
  return Boolean(inputType && TYPING.has(inputType))
}

function pathTo(root: Node, node: Node): number[] | null {
  const path: number[] = []
  for (let n: Node | null = node; n && n !== root; n = n.parentNode) {
    const parent: Node | null = n.parentNode
    if (!parent) return null
    path.unshift(Array.prototype.indexOf.call(parent.childNodes, n))
  }
  return path
}

function nodeAt(root: Node, path: number[]): Node | null {
  let n: Node | null = root
  for (const i of path) n = n?.childNodes[i] ?? null
  return n
}

function readCaret(root: HTMLElement): Caret | null {
  const sel = window.getSelection()
  if (!sel?.rangeCount) return null
  const r = sel.getRangeAt(0)
  if (!root.contains(r.startContainer) || !root.contains(r.endContainer)) return null
  const start = pathTo(root, r.startContainer)
  const end = pathTo(root, r.endContainer)
  return start && end ? { start, startOffset: r.startOffset, end, endOffset: r.endOffset } : null
}

function writeCaret(root: HTMLElement, caret: Caret | null) {
  const range = document.createRange()
  try {
    const start = caret && nodeAt(root, caret.start)
    const end = caret && nodeAt(root, caret.end)
    if (!caret || !start || !end) throw new Error('caret gone')
    range.setStart(start, caret.startOffset)
    range.setEnd(end, caret.endOffset)
  } catch {
    range.selectNodeContents(root)
    range.collapse(false)
  }
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)
}

export class EditorHistory {
  private steps: Snapshot[] = []
  private index = -1
  private typingTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * @param root the contentEditable element
   * @param onRestore called after undo / redo replaced the HTML, to save it
   */
  constructor(
    private root: HTMLElement,
    private onRestore: () => void
  ) {
    this.capture()
  }

  /** Records the current state as a step (no-op if the HTML is unchanged). */
  capture() {
    this.cancelTypingTimer()
    const snap = { html: this.root.innerHTML, caret: readCaret(this.root) }
    const current = this.steps[this.index]
    if (current && current.html === snap.html) {
      current.caret = snap.caret
      return
    }
    this.steps.splice(this.index + 1)
    this.steps.push(snap)
    if (this.steps.length > MAX_STEPS) this.steps.shift()
    this.index = this.steps.length - 1
  }

  /** Call before a change that should be its own step, so pending typing is kept apart. */
  checkpoint() {
    if (this.typingTimer) this.capture()
  }

  /** Call after any input. Typing waits for a pause; anything else is recorded now. */
  changed(inputType: string | undefined) {
    if (isTyping(inputType)) {
      this.cancelTypingTimer()
      this.typingTimer = setTimeout(() => this.capture(), TYPING_PAUSE)
    } else {
      this.capture()
    }
  }

  get canUndo() {
    return this.index > 0 || this.typingTimer !== null
  }

  get canRedo() {
    return this.index < this.steps.length - 1
  }

  undo() {
    this.checkpoint()
    if (this.index <= 0) return false
    this.index--
    this.restore()
    return true
  }

  redo() {
    if (!this.canRedo) return false
    this.index++
    this.restore()
    return true
  }

  dispose() {
    this.cancelTypingTimer()
  }

  private restore() {
    const snap = this.steps[this.index]
    this.root.innerHTML = snap.html
    writeCaret(this.root, snap.caret)
    this.onRestore()
  }

  private cancelTypingTimer() {
    if (this.typingTimer) clearTimeout(this.typingTimer)
    this.typingTimer = null
  }
}
