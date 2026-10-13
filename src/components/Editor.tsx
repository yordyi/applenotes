'use client'

import { ChevronLeft, ImageIcon, ListChecks, Search, SquarePen, Table, X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { formatEditorDate } from '@/src/lib/dates'
import {
  activeStyles,
  emitChange,
  imageFileToDataUrl,
  insertImage,
  insertTable,
  placeCaret,
  setActiveEditor,
  setBlockStyle,
  toggleChecked,
  toggleInline,
  toggleList,
  type BlockStyle,
  type ListKind,
} from '@/src/lib/editorCommands'
import { NEW_NOTE_HTML } from '@/src/lib/note'
import type { Note } from '@/src/lib/types'
import { newNote, restoreNote, runSearch } from '@/src/store/actions'
import { useAppDispatch, useAppSelector, useAppStore } from '@/src/store/hooks'
import { editNote } from '@/src/store/notesSlice'
import { selectSelectedNote } from '@/src/store/selectors'
import { setFocus, setGalleryOpen } from '@/src/store/uiSlice'
import { showToast } from './Dialog'
import { closeMenu, openMenuAt, type MenuItem } from './Menu'
import { cn, shortcut, ToolbarButton } from './ui'

export const SEARCH_INPUT_ID = 'note-search'

/** Keeps the editor's selection when a toolbar button is pressed. */
const keepSelection = (e: React.MouseEvent) => e.preventDefault()

export function pickImage() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = () => {
    const file = input.files?.[0]
    if (file) addImage(file)
  }
  input.click()
}

async function addImage(file: File) {
  try {
    insertImage(await imageFileToDataUrl(file))
  } catch {
    showToast('无法插入此图像')
  }
}

const BLOCK_STYLES: { style: BlockStyle; label: string; className: string; keys?: string }[] = [
  { style: 'h1', label: '标题', className: 'text-[20px] font-bold', keys: '⇧⌘T' },
  { style: 'h2', label: '小标题', className: 'text-[16px] font-bold', keys: '⇧⌘H' },
  { style: 'h3', label: '副标题', className: 'text-[14px] font-semibold', keys: '⇧⌘J' },
  { style: 'p', label: '正文', className: '', keys: '⇧⌘B' },
  { style: 'pre', label: '等宽字体', className: 'font-mono text-[12px]', keys: '⇧⌘M' },
]

const LISTS: { kind: Exclude<ListKind, 'checklist'>; label: string }[] = [
  { kind: 'bullet', label: '•  项目符号列表' },
  { kind: 'dashed', label: '–  短划线列表' },
  { kind: 'numbered', label: '1.  编号列表' },
]

export function formatMenu(): MenuItem[] {
  const active = activeStyles()
  const inline = (
    [
      ['bold', 'B', 'font-bold', '粗体'],
      ['italic', 'I', 'italic font-serif', '斜体'],
      ['underline', 'U', 'underline', '下划线'],
      ['strikeThrough', 'S', 'line-through', '删除线'],
    ] as const
  ).map(([cmd, glyph, cls, label]) => (
    <button
      key={cmd}
      type="button"
      aria-label={label}
      aria-pressed={active[cmd]}
      className={cn(
        'h-7 flex-1 rounded-[5px] text-[15px]',
        cls,
        active[cmd] ? 'bg-n-row text-n-rowLabel' : 'hover:bg-n-hover'
      )}
      onClick={() => {
        toggleInline(cmd)
        closeMenu()
      }}
    >
      {glyph}
    </button>
  ))

  return [
    { custom: <div className="flex gap-1 px-1 pb-1 pt-0.5">{inline}</div> },
    'separator',
    ...BLOCK_STYLES.map(b => ({
      label: <span className={b.className}>{b.label}</span>,
      checked: !active.list && active.block === b.style,
      shortcut: b.keys && shortcut(b.keys),
      onSelect: () => setBlockStyle(b.style),
    })),
    'separator',
    ...LISTS.map(l => ({
      label: l.label,
      checked: active.list === l.kind,
      onSelect: () => toggleList(l.kind),
    })),
    'separator',
    {
      label: '块引用',
      checked: active.block === 'blockquote',
      onSelect: () => setBlockStyle(active.block === 'blockquote' ? 'p' : 'blockquote'),
    },
  ]
}

/** `compact`: gallery grid, where there is no open note to format. */
export function EditorToolbar({ compact = false }: { compact?: boolean }) {
  const dispatch = useAppDispatch()
  const note = useAppSelector(selectSelectedNote)
  const galleryOpen = useAppSelector(s => s.ui.viewMode === 'gallery' && s.ui.galleryOpen)
  const editable = Boolean(note && !note.deletedAt)

  return (
    <header className="flex h-[52px] shrink-0 items-center gap-0.5 px-3">
      {galleryOpen && (
        <ToolbarButton
          aria-label="返回画廊"
          title="返回画廊"
          onClick={() => dispatch(setGalleryOpen(false))}
        >
          <ChevronLeft size={20} strokeWidth={1.8} />
        </ToolbarButton>
      )}
      <ToolbarButton
        aria-label="新建备忘录"
        title={`新建备忘录（${shortcut('⌘N')}）`}
        onClick={() => dispatch(newNote())}
      >
        <SquarePen size={18} strokeWidth={1.6} />
      </ToolbarButton>
      {!compact && (
        <>
          <div className="mx-1.5 h-5 w-px bg-n-separator" />
          <ToolbarButton
            aria-label="格式"
            title="格式"
            disabled={!editable}
            onMouseDown={keepSelection}
            onClick={e => openMenuAt(e.currentTarget, formatMenu())}
          >
            <span className="text-[15px] font-medium tracking-tight">Aa</span>
          </ToolbarButton>
          <ToolbarButton
            aria-label="核对清单"
            title={`核对清单（${shortcut('⇧⌘L')}）`}
            disabled={!editable}
            onMouseDown={keepSelection}
            onClick={() => toggleList('checklist')}
          >
            <ListChecks size={18} strokeWidth={1.6} />
          </ToolbarButton>
          <ToolbarButton
            aria-label="表格"
            title="表格"
            disabled={!editable}
            onMouseDown={keepSelection}
            onClick={() => insertTable()}
          >
            <Table size={17} strokeWidth={1.6} />
          </ToolbarButton>
          <ToolbarButton
            aria-label="添加图像"
            title="添加图像"
            disabled={!editable}
            onMouseDown={keepSelection}
            onClick={pickImage}
          >
            <ImageIcon size={17} strokeWidth={1.6} />
          </ToolbarButton>
        </>
      )}
      <div className="flex-1" />
      <SearchField />
    </header>
  )
}

export function SearchField({ mobile = false }: { mobile?: boolean }) {
  const dispatch = useAppDispatch()
  const search = useAppSelector(s => s.ui.search)
  return (
    <label
      className={cn(
        'flex items-center gap-1 rounded-md bg-n-field px-2 text-n-label2 focus-within:outline focus-within:outline-[3px] focus-within:outline-[color:var(--n-row-selected)]',
        mobile ? 'h-9 rounded-[10px] text-[17px]' : 'h-7 w-[180px] text-[13px] lg:w-[220px]'
      )}
    >
      <Search size={mobile ? 17 : 14} strokeWidth={2} className="shrink-0" />
      <input
        id={mobile ? undefined : SEARCH_INPUT_ID}
        type="text"
        value={search}
        placeholder="搜索"
        aria-label="搜索"
        className="min-w-0 flex-1 bg-transparent text-n-label outline-none placeholder:text-n-label2"
        onChange={e => dispatch(runSearch(e.target.value))}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            dispatch(runSearch(''))
            e.currentTarget.blur()
          }
          if (e.key === 'Enter' || e.key === 'ArrowDown') dispatch(setFocus('list'))
        }}
      />
      {search && (
        <button
          type="button"
          aria-label="清除搜索"
          className="flex h-4 w-4 items-center justify-center rounded-full bg-n-label3 text-n-window"
          onClick={() => dispatch(runSearch(''))}
        >
          <X size={10} strokeWidth={3} />
        </button>
      )}
    </label>
  )
}

export function EditorPane({ mobile = false }: { mobile?: boolean }) {
  const note = useAppSelector(selectSelectedNote)
  if (!note) return <div className="flex-1" />
  return <NoteEditor key={note.id} note={note} mobile={mobile} />
}

function NoteEditor({ note, mobile }: { note: Note; mobile: boolean }) {
  const dispatch = useAppDispatch()
  const store = useAppStore()
  const ref = useRef<HTMLDivElement>(null)
  const readOnly = Boolean(note.deletedAt)
  const focused = useAppSelector(s => s.ui.focus === 'editor')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.innerHTML = note.html
    setActiveEditor(el)
    document.execCommand('defaultParagraphSeparator', false, 'p')
    if (store.getState().ui.focus === 'editor' && !readOnly) {
      el.focus()
      placeCaret(el, Boolean(note.title))
    }
    return () => setActiveEditor(null)
    // Only on mount: afterwards the DOM is the source of truth for this note.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const el = ref.current
    if (focused && el && !readOnly && document.activeElement !== el) {
      el.focus()
      placeCaret(el, true)
    }
  }, [focused, readOnly])

  const save = () => {
    const el = ref.current
    if (el) dispatch(editNote({ id: note.id, html: el.innerHTML }))
  }

  const onInput = (e: React.FormEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const native = e.nativeEvent as InputEvent
    // Clearing everything brings back the empty Title line, as in Notes.
    if (!el.textContent && !el.querySelector('img,table,li')) {
      el.innerHTML = NEW_NOTE_HTML
      placeCaret(el, false)
    }
    // A new checklist item starts unchecked even if the one it was split from was checked.
    if (native.inputType === 'insertParagraph') {
      const node = window.getSelection()?.anchorNode
      const li = (node instanceof HTMLElement ? node : node?.parentElement)?.closest(
        'ul.checklist > li'
      )
      if (li && el.contains(li)) li.setAttribute('data-checked', 'false')
    }
    save()
  }

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const li = (e.target as HTMLElement).closest('ul.checklist > li')
    if (!li || readOnly) return
    const x = e.clientX - li.getBoundingClientRect().left
    if (x < 24) {
      e.preventDefault()
      li.setAttribute('data-checked', li.getAttribute('data-checked') === 'true' ? 'false' : 'true')
      emitChange(e.currentTarget)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const mod = e.metaKey || e.ctrlKey
    if (mod && e.shiftKey) {
      const blocks: Record<string, BlockStyle> = {
        KeyT: 'h1',
        KeyH: 'h2',
        KeyJ: 'h3',
        KeyB: 'p',
        KeyM: 'pre',
      }
      if (blocks[e.code]) {
        e.preventDefault()
        setBlockStyle(blocks[e.code])
      } else if (e.code === 'KeyL') {
        e.preventDefault()
        toggleList('checklist')
      } else if (e.code === 'KeyU') {
        e.preventDefault()
        toggleChecked()
      } else if (e.code === 'KeyX') {
        e.preventDefault()
        toggleInline('strikeThrough')
      }
      return
    }
    if (e.key === 'Tab') {
      const sel = window.getSelection()?.anchorNode
      const el = sel instanceof HTMLElement ? sel : sel?.parentElement
      const cell = el?.closest('td,th')
      if (cell) {
        e.preventDefault()
        const cells = Array.from(cell.closest('table')!.querySelectorAll('td,th'))
        const next = cells[cells.indexOf(cell) + (e.shiftKey ? -1 : 1)]
        if (next) {
          const range = document.createRange()
          range.selectNodeContents(next)
          range.collapse(false)
          window.getSelection()?.removeAllRanges()
          window.getSelection()?.addRange(range)
        }
      } else if (el?.closest('li')) {
        e.preventDefault()
        document.execCommand(e.shiftKey ? 'outdent' : 'indent')
      }
    }
    if (e.key === 'Escape') dispatch(setFocus('list'))
  }

  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const image = Array.from(e.clipboardData.files).find(f => f.type.startsWith('image/'))
    if (image) {
      addImage(image)
      return
    }
    // Pasted content keeps its text but not foreign markup or scripts.
    document.execCommand('insertText', false, e.clipboardData.getData('text/plain'))
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const image = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'))
    if (!image) return
    e.preventDefault()
    const pos = document.caretRangeFromPoint?.(e.clientX, e.clientY)
    if (pos) {
      window.getSelection()?.removeAllRanges()
      window.getSelection()?.addRange(pos)
    }
    addImage(image)
  }

  return (
    <div
      className="flex-1 overflow-y-auto scrollbar-thin"
      onMouseDown={e => {
        // Clicking the empty space around the text puts the caret at the end.
        const el = ref.current
        if (!el || readOnly || el.contains(e.target as Node)) return
        e.preventDefault()
        el.focus()
        placeCaret(el, true)
      }}
    >
      <div className={cn('mx-auto max-w-[760px] pb-24', mobile ? 'px-4' : 'px-8 lg:px-12')}>
        <p className="pb-4 pt-1 text-center text-[12px] text-n-label2">
          {formatEditorDate(note.updatedAt)}
        </p>
        {readOnly && <TrashBanner onRestore={() => dispatch(restoreNote(note.id))} />}
        <div
          ref={ref}
          className={cn('note-body min-h-[50vh]', mobile && 'note-body-mobile')}
          contentEditable={!readOnly}
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="备忘录正文"
          spellCheck={false}
          onInput={onInput}
          onMouseDown={onMouseDown}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onDrop={onDrop}
          onFocus={() => dispatch(setFocus('editor'))}
        />
      </div>
    </div>
  )
}

function TrashBanner({ onRestore }: { onRestore: () => void }): ReactNode {
  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-n-field px-3 py-2 text-[12px] text-n-label2">
      <span>已删除的备忘录无法编辑。要编辑此备忘录，请先将其恢复。</span>
      <button
        type="button"
        className="shrink-0 rounded-md bg-n-row px-2.5 py-1 font-medium text-n-rowLabel"
        onClick={onRestore}
      >
        恢复
      </button>
    </div>
  )
}
