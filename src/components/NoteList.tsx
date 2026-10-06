'use client'

import { ChevronDown, Folder as FolderIcon, LayoutGrid, List, Trash2 } from 'lucide-react'
import { Fragment, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { formatListDate, sortDate } from '@/src/lib/dates'
import { displayTitle, NO_ADDITIONAL_TEXT } from '@/src/lib/note'
import type { Note } from '@/src/lib/types'
import { stepSelection } from '@/src/store/actions'
import { useAppDispatch, useAppSelector, useAppStore } from '@/src/store/hooks'
import {
  selectFolders,
  selectListNotes,
  selectListTitle,
  selectSections,
  selectSelectedNote,
  selectShowFolderInRows,
} from '@/src/store/selectors'
import {
  selectNote,
  setFocus,
  setGalleryOpen,
  setMobilePane,
  setViewMode,
} from '@/src/store/uiSlice'
import { openMenu, openMenuAt } from './Menu'
import { noteMenu, requestDelete, sortMenu } from './menus'
import { NOTE_DRAG_TYPE, SidebarToggle } from './Sidebar'
import { cn, shortcut, ToolbarButton } from './ui'

const TRASH_NOTICE = '备忘录在删除后会保留 30 天。之后，它们将被永久删除。'

export function NoteListHeader() {
  const dispatch = useAppDispatch()
  const store = useAppStore()
  const title = useAppSelector(selectListTitle)
  const count = useAppSelector(s => selectListNotes(s).length)
  const sidebarVisible = useAppSelector(s => s.ui.sidebarVisible)
  const viewMode = useAppSelector(s => s.ui.viewMode)
  const selected = useAppSelector(selectSelectedNote)

  return (
    <header className="flex h-[52px] shrink-0 items-center gap-1 px-3">
      {!sidebarVisible && <SidebarToggle />}
      <button
        type="button"
        className="group mr-auto min-w-0 rounded-md px-1.5 py-0.5 text-left hover:bg-n-hover"
        title="排序方式"
        onClick={e => openMenuAt(e.currentTarget, sortMenu(dispatch, store.getState()))}
      >
        <div className="flex items-center gap-1 truncate text-[13px] font-bold">
          <span className="truncate">{title}</span>
          <ChevronDown
            size={12}
            strokeWidth={2.4}
            className="shrink-0 text-n-label2 opacity-0 group-hover:opacity-100"
          />
        </div>
        <div className="text-[11px] text-n-label2">{count} 个备忘录</div>
      </button>
      <div className="flex rounded-md" role="group" aria-label="显示方式">
        <ToolbarButton
          aria-label="以列表显示"
          title={`列表（${shortcut('⌘1')}）`}
          active={viewMode === 'list'}
          onClick={() => dispatch(setViewMode('list'))}
        >
          <List size={17} strokeWidth={1.7} />
        </ToolbarButton>
        <ToolbarButton
          aria-label="以画廊显示"
          title={`画廊（${shortcut('⌘2')}）`}
          active={viewMode === 'gallery'}
          onClick={() => dispatch(setViewMode('gallery'))}
        >
          <LayoutGrid size={16} strokeWidth={1.7} />
        </ToolbarButton>
      </div>
      <ToolbarButton
        aria-label="删除"
        title="删除"
        disabled={!selected}
        onClick={() => selected && requestDelete(dispatch, selected)}
      >
        <Trash2 size={17} strokeWidth={1.6} />
      </ToolbarButton>
    </header>
  )
}

/** Keyboard handling shared by list and gallery. */
function useListKeys() {
  const dispatch = useAppDispatch()
  const store = useAppStore()
  return (e: React.KeyboardEvent) => {
    const { viewMode } = store.getState().ui
    const back = viewMode === 'gallery' ? 'ArrowLeft' : 'ArrowUp'
    const fwd = viewMode === 'gallery' ? 'ArrowRight' : 'ArrowDown'
    if (e.key === back || e.key === 'ArrowUp') {
      e.preventDefault()
      dispatch(stepSelection(-1))
    } else if (e.key === fwd || e.key === 'ArrowDown') {
      e.preventDefault()
      dispatch(stepSelection(1))
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      const note = selectSelectedNote(store.getState())
      if (note) {
        e.preventDefault()
        requestDelete(dispatch, note)
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (viewMode === 'gallery') dispatch(setGalleryOpen(true))
      dispatch(setFocus('editor'))
    }
  }
}

export function NoteListBody({ mobile = false }: { mobile?: boolean }) {
  const dispatch = useAppDispatch()
  const store = useAppStore()
  const sections = useAppSelector(selectSections)
  const selectedId = useAppSelector(s => s.ui.selectedNoteId)
  const focused = useAppSelector(s => s.ui.focus === 'list')
  const viewMode = useAppSelector(s => s.ui.viewMode)
  const search = useAppSelector(s => s.ui.search)
  const inTrash = useAppSelector(s => s.ui.selection.kind === 'trash' && !s.ui.search.trim())
  const showFolder = useAppSelector(selectShowFolderInRows)
  const folders = useAppSelector(selectFolders)
  const folderNames = useMemo(() => new Map(folders.map(f => [f.id, f.name])), [folders])
  const onKeyDown = useListKeys()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (focused && !ref.current?.contains(document.activeElement)) ref.current?.focus()
  }, [focused])

  const open = (note: Note) => {
    dispatch(selectNote(note.id))
    if (mobile) dispatch(setMobilePane('editor'))
  }
  const menu = (e: React.MouseEvent, note: Note) => {
    e.preventDefault()
    openMenu({ x: e.clientX, y: e.clientY, items: noteMenu(dispatch, store.getState(), note) })
  }
  const empty = sections.length === 0
  const gallery = viewMode === 'gallery' && !mobile

  return (
    <div
      ref={ref}
      tabIndex={0}
      aria-label="备忘录列表"
      className="flex-1 overflow-y-auto outline-none scrollbar-thin"
      onKeyDown={onKeyDown}
      onMouseDown={() => dispatch(setFocus('list'))}
    >
      {inTrash && (
        <p className="px-6 pb-2 pt-1 text-center text-[11px] leading-4 text-n-label2">
          {TRASH_NOTICE}
        </p>
      )}
      {empty && (
        <p className="mt-24 text-center text-[13px] text-n-label3">
          {search.trim() ? '无结果' : '无备忘录'}
        </p>
      )}
      {sections.map(section => (
        <section
          key={section.key}
          className={cn(gallery ? 'px-5 pb-4' : mobile ? 'px-4 pb-2' : 'px-2.5 pb-2')}
        >
          {section.title && (
            <h3
              className={cn(
                'font-bold',
                mobile ? 'px-1 pb-1.5 pt-4 text-[20px]' : 'px-2.5 pb-1 pt-3 text-[13px]'
              )}
            >
              {section.title}
            </h3>
          )}
          {gallery ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-5 gap-y-4 pt-1">
              {section.notes.map(note => (
                <GalleryCard
                  key={note.id}
                  note={note}
                  selected={note.id === selectedId}
                  focused={focused}
                  onSelect={() => open(note)}
                  onOpen={() => {
                    dispatch(setGalleryOpen(true))
                    dispatch(setFocus('editor'))
                  }}
                  onContextMenu={e => menu(e, note)}
                />
              ))}
            </div>
          ) : (
            <div className={cn(mobile && 'overflow-hidden rounded-[10px] bg-n-cell')}>
              {section.notes.map((note, i) => {
                const next = section.notes[i + 1]
                const selected = note.id === selectedId
                return (
                  <NoteRow
                    key={note.id}
                    note={note}
                    mobile={mobile}
                    selected={selected && !mobile}
                    focused={focused}
                    query={search}
                    folderName={showFolder ? folderNames.get(note.folderId) : undefined}
                    separator={Boolean(next) && (mobile || (!selected && next.id !== selectedId))}
                    onSelect={() => open(note)}
                    onContextMenu={e => menu(e, note)}
                  />
                )
              })}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}

function firstImage(html: string): string | null {
  const m = /<img[^>]+src="([^"]+)"/i.exec(html)
  return m ? m[1] : null
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim()
  if (!q) return <>{text}</>
  const lower = text.toLocaleLowerCase()
  const needle = q.toLocaleLowerCase()
  const parts: ReactNode[] = []
  let from = 0
  for (let i = lower.indexOf(needle); i >= 0; i = lower.indexOf(needle, from)) {
    parts.push(
      text.slice(from, i),
      <mark key={i} className="search-hit">
        {text.slice(i, i + q.length)}
      </mark>
    )
    from = i + q.length
  }
  parts.push(text.slice(from))
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>{p}</Fragment>
      ))}
    </>
  )
}

interface RowProps {
  note: Note
  mobile: boolean
  selected: boolean
  focused: boolean
  query: string
  folderName?: string
  separator: boolean
  onSelect: () => void
  onContextMenu: (e: React.MouseEvent) => void
}

function NoteRow({
  note,
  mobile,
  selected,
  focused,
  query,
  folderName,
  separator,
  onSelect,
  onContextMenu,
}: RowProps) {
  const ref = useRef<HTMLDivElement>(null)
  const sortBy = useAppSelector(s => s.ui.sortBy)
  const now = new Date()
  const image = firstImage(note.html)
  const snippet = query.trim() ? snippetAround(note.snippet, query) : note.snippet

  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  return (
    <div
      ref={ref}
      role="option"
      aria-selected={selected}
      draggable={!note.deletedAt}
      onDragStart={e => {
        e.dataTransfer.setData(NOTE_DRAG_TYPE, note.id)
        e.dataTransfer.effectAllowed = 'move'
      }}
      onClick={onSelect}
      onContextMenu={onContextMenu}
      className={cn(
        'relative flex cursor-default items-center gap-2',
        mobile ? 'px-4 py-2.5 active:bg-n-hover' : 'rounded-md px-2.5 py-[9px]',
        selected && (focused ? 'bg-n-row text-n-rowLabel' : 'bg-n-rowInactive')
      )}
    >
      <div className="min-w-0 flex-1">
        <div
          className={cn('truncate font-bold', mobile ? 'text-[17px] font-semibold' : 'text-[13px]')}
        >
          <Highlight text={displayTitle(note)} query={query} />
        </div>
        <div className={cn('flex gap-1.5 truncate', mobile ? 'text-[15px]' : 'text-[12px]')}>
          <span className="shrink-0">{formatListDate(sortDate(note, sortBy), now)}</span>
          <span className={cn('truncate', selected && focused ? 'opacity-70' : 'text-n-label2')}>
            {snippet ? <Highlight text={snippet} query={query} /> : NO_ADDITIONAL_TEXT}
          </span>
        </div>
        {folderName && (
          <div
            className={cn(
              'mt-0.5 flex items-center gap-1 truncate text-[12px]',
              selected && focused ? 'opacity-70' : 'text-n-label2'
            )}
          >
            <FolderIcon size={12} strokeWidth={1.8} className="shrink-0" />
            {folderName}
          </div>
        )}
      </div>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="h-10 w-10 shrink-0 rounded-[5px] object-cover" />
      )}
      {separator && (
        <div
          className={cn(
            'absolute bottom-0 right-2.5 h-px bg-n-separator',
            mobile ? 'left-4' : 'left-2.5'
          )}
        />
      )}
    </div>
  )
}

/** Shows the part of the snippet around the first match, like Notes' search results. */
function snippetAround(snippet: string, query: string): string {
  const i = snippet.toLocaleLowerCase().indexOf(query.trim().toLocaleLowerCase())
  return i > 20 ? `…${snippet.slice(i - 12)}` : snippet
}

interface CardProps {
  note: Note
  selected: boolean
  focused: boolean
  onSelect: () => void
  onOpen: () => void
  onContextMenu: (e: React.MouseEvent) => void
}

function GalleryCard({ note, selected, focused, onSelect, onOpen, onContextMenu }: CardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const sortBy = useAppSelector(s => s.ui.sortBy)
  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: 'nearest' })
  }, [selected])
  return (
    <div
      ref={ref}
      role="option"
      aria-selected={selected}
      className="cursor-default"
      draggable={!note.deletedAt}
      onDragStart={e => e.dataTransfer.setData(NOTE_DRAG_TYPE, note.id)}
      onClick={onSelect}
      onDoubleClick={onOpen}
      onContextMenu={onContextMenu}
    >
      <div
        className={cn(
          'h-[150px] overflow-hidden rounded-[10px] border bg-n-window p-3',
          selected
            ? focused
              ? 'border-[3px] border-n-row p-[10px]'
              : 'border-[3px] border-n-rowInactive p-[10px]'
            : 'border-n-separator'
        )}
      >
        <div className="note-body note-thumb" dangerouslySetInnerHTML={{ __html: note.html }} />
      </div>
      <div className="mt-1.5 truncate text-center text-[12px] font-bold">{displayTitle(note)}</div>
      <div className="text-center text-[11px] text-n-label2">
        {formatListDate(sortDate(note, sortBy), new Date())}
      </div>
    </div>
  )
}
