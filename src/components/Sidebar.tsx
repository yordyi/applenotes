'use client'

import { ChevronRight, Folder as FolderIcon, PanelLeft, PlusCircle, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { moveNoteTo, newFolder, openSelection, renameFolderTo } from '@/src/store/actions'
import { useAppDispatch, useAppSelector, useAppStore } from '@/src/store/hooks'
import {
  selectAllTags,
  selectFolderCounts,
  selectFolderTree,
  selectTrashCount,
} from '@/src/store/selectors'
import {
  setFocus,
  setRenamingFolder,
  toggleFolderCollapsed,
  toggleSidebar,
} from '@/src/store/uiSlice'
import { openMenu } from './Menu'
import { folderMenu } from './menus'
import { cn, shortcut, ToolbarButton } from './ui'

export const NOTE_DRAG_TYPE = 'application/x-note-id'

export function SidebarToggle() {
  const dispatch = useAppDispatch()
  return (
    <ToolbarButton
      aria-label="显示或隐藏边栏"
      title={`显示或隐藏边栏（${shortcut('⌥⌘S')}）`}
      onClick={() => dispatch(toggleSidebar())}
    >
      <PanelLeft size={18} strokeWidth={1.6} />
    </ToolbarButton>
  )
}

export function Sidebar() {
  const dispatch = useAppDispatch()
  return (
    <aside
      className="flex h-full flex-col bg-n-sidebar"
      onMouseDown={() => dispatch(setFocus('sidebar'))}
    >
      <header className="flex h-[52px] shrink-0 items-center px-3">
        <SidebarToggle />
      </header>
      <SidebarContent />
      <footer className="flex h-11 shrink-0 items-center px-3">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-n-label2 hover:text-n-label"
          title={`新建文件夹（${shortcut('⇧⌘N')}）`}
          onClick={() => dispatch(newFolder())}
        >
          <PlusCircle size={16} strokeWidth={1.6} />
          新建文件夹
        </button>
      </footer>
    </aside>
  )
}

/** Folder list, Recently Deleted and tags. Shared by the desktop sidebar and the iOS folder page. */
export function SidebarContent({ mobile = false }: { mobile?: boolean }) {
  const dispatch = useAppDispatch()
  const store = useAppStore()
  const tree = useAppSelector(selectFolderTree)
  const counts = useAppSelector(selectFolderCounts)
  const trashCount = useAppSelector(selectTrashCount)
  const tags = useAppSelector(selectAllTags)
  const selection = useAppSelector(s => s.ui.selection)
  const search = useAppSelector(s => s.ui.search)
  const collapsed = useAppSelector(s => s.ui.collapsedFolders)
  const renamingId = useAppSelector(s => s.ui.renamingFolderId)

  const hidden = new Set<string>()
  const visible = tree.filter(({ folder }) => {
    if (folder.parentId && (hidden.has(folder.parentId) || collapsed.includes(folder.parentId))) {
      hidden.add(folder.id)
      return false
    }
    return true
  })
  const active = !search.trim()

  return (
    <nav
      className={cn('flex-1 overflow-y-auto scrollbar-thin', mobile ? 'px-4 pb-6' : 'px-2.5 pb-3')}
    >
      <SectionHeader mobile={mobile}>iCloud</SectionHeader>
      <Group mobile={mobile}>
        {visible.map(({ folder, depth, hasChildren }) => (
          <SidebarRow
            key={folder.id}
            mobile={mobile}
            depth={depth}
            icon={<FolderIcon size={mobile ? 20 : 16} strokeWidth={1.7} />}
            label={folder.name}
            count={counts[folder.id] ?? 0}
            selected={active && selection.kind === 'folder' && selection.id === folder.id}
            disclosure={
              hasChildren ? (collapsed.includes(folder.id) ? 'closed' : 'open') : undefined
            }
            onToggle={() => dispatch(toggleFolderCollapsed(folder.id))}
            onSelect={() => dispatch(openSelection({ kind: 'folder', id: folder.id }))}
            onMenu={(x, y) =>
              openMenu({ x, y, items: folderMenu(dispatch, store.getState(), folder) })
            }
            onDropNote={id => dispatch(moveNoteTo(id, folder.id))}
            renaming={renamingId === folder.id}
            onRename={name => {
              dispatch(renameFolderTo(folder.id, name))
              dispatch(setRenamingFolder(null))
            }}
            onStartRename={
              folder.id === 'notes' ? undefined : () => dispatch(setRenamingFolder(folder.id))
            }
          />
        ))}
        {trashCount > 0 && (
          <SidebarRow
            mobile={mobile}
            depth={0}
            icon={<Trash2 size={mobile ? 20 : 16} strokeWidth={1.7} />}
            label="最近删除"
            count={trashCount}
            selected={active && selection.kind === 'trash'}
            onSelect={() => dispatch(openSelection({ kind: 'trash' }))}
          />
        )}
      </Group>

      {tags.length > 0 && (
        <>
          <SectionHeader mobile={mobile}>标签</SectionHeader>
          <div className={cn('flex flex-wrap gap-1.5', mobile ? 'px-1' : 'px-1.5')}>
            <TagChip
              label="所有标签"
              selected={active && selection.kind === 'tag' && selection.tag === null}
              onClick={() => dispatch(openSelection({ kind: 'tag', tag: null }))}
            />
            {tags.map(tag => (
              <TagChip
                key={tag}
                label={`#${tag}`}
                selected={active && selection.kind === 'tag' && selection.tag === tag}
                onClick={() => dispatch(openSelection({ kind: 'tag', tag }))}
              />
            ))}
          </div>
        </>
      )}
    </nav>
  )
}

function SectionHeader({ children, mobile }: { children: ReactNode; mobile: boolean }) {
  return (
    <h2
      className={cn(
        'font-bold',
        mobile ? 'mb-1.5 mt-5 px-1 text-[20px]' : 'mb-1 mt-3 px-2 text-[11px] text-n-label2'
      )}
    >
      {children}
    </h2>
  )
}

function Group({ children, mobile }: { children: ReactNode; mobile: boolean }) {
  if (!mobile) return <div className="space-y-px">{children}</div>
  return <div className="overflow-hidden rounded-[10px] bg-n-cell">{children}</div>
}

function TagChip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-6 rounded-full px-2.5 text-[12px]',
        selected ? 'bg-n-row text-n-rowLabel' : 'bg-n-chip text-n-label hover:bg-n-selected'
      )}
    >
      {label}
    </button>
  )
}

interface SidebarRowProps {
  mobile: boolean
  depth: number
  icon: ReactNode
  label: string
  count: number
  selected: boolean
  disclosure?: 'open' | 'closed'
  onToggle?: () => void
  onSelect: () => void
  /** Opens the row's context menu at a point (right-click, or the Menu key). */
  onMenu?: (x: number, y: number) => void
  onDropNote?: (noteId: string) => void
  renaming?: boolean
  onRename?: (name: string) => void
  onStartRename?: () => void
}

function SidebarRow(props: SidebarRowProps) {
  const { mobile, depth, icon, label, count, selected, disclosure } = props
  const [dropping, setDropping] = useState(false)

  return (
    <div
      role="button"
      tabIndex={0}
      aria-current={selected || undefined}
      aria-expanded={disclosure ? disclosure === 'open' : undefined}
      data-sidebar-row=""
      className={cn(
        'group flex cursor-default items-center outline-none focus-visible:ring-2 focus-visible:ring-n-highlight',
        mobile
          ? 'h-11 gap-3 border-b border-n-separator pr-4 last:border-b-0 active:bg-n-hover'
          : 'h-7 gap-1.5 rounded-md pr-2',
        !mobile && selected && 'bg-n-selected',
        dropping && 'bg-n-row text-n-rowLabel'
      )}
      style={{ paddingLeft: (mobile ? 12 : 4) + depth * (mobile ? 18 : 14) }}
      onClick={props.onSelect}
      onDoubleClick={props.onStartRename}
      onContextMenu={e => {
        if (!props.onMenu) return
        e.preventDefault()
        props.onMenu(e.clientX, e.clientY)
      }}
      onKeyDown={e => {
        if (props.renaming) return
        const r = e.currentTarget.getBoundingClientRect()
        if (e.key === 'Enter' || e.key === ' ') props.onSelect()
        else if (e.key === 'ArrowRight' && disclosure === 'closed') props.onToggle?.()
        else if (e.key === 'ArrowLeft' && disclosure === 'open') props.onToggle?.()
        else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          // Move between rows like a list.
          const rows = Array.from(
            e.currentTarget.closest('nav')?.querySelectorAll<HTMLElement>('[data-sidebar-row]') ??
              []
          )
          rows[rows.indexOf(e.currentTarget) + (e.key === 'ArrowDown' ? 1 : -1)]?.focus()
        } else if ((e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) && props.onMenu) {
          props.onMenu(r.left + 24, r.bottom - 4)
        } else return
        e.preventDefault()
      }}
      onDragOver={e => {
        if (!props.onDropNote || !e.dataTransfer.types.includes(NOTE_DRAG_TYPE)) return
        e.preventDefault()
        setDropping(true)
      }}
      onDragLeave={() => setDropping(false)}
      onDrop={e => {
        setDropping(false)
        const id = e.dataTransfer.getData(NOTE_DRAG_TYPE)
        if (id) props.onDropNote?.(id)
      }}
    >
      <span
        aria-hidden="true"
        className={cn('flex w-3 shrink-0 justify-center text-n-label2', !disclosure && 'invisible')}
        onClick={e => {
          e.stopPropagation()
          props.onToggle?.()
        }}
      >
        <ChevronRight
          size={12}
          strokeWidth={2.4}
          className={cn('transition-transform', disclosure === 'open' && 'rotate-90')}
        />
      </span>
      <span className="shrink-0 text-n-accent">{icon}</span>
      {props.renaming ? (
        <RenameField initial={label} onDone={name => props.onRename?.(name || label)} />
      ) : (
        <span className={cn('flex-1 truncate', mobile && 'text-[17px]')}>{label}</span>
      )}
      <span className={cn('tabular-nums text-n-label2', mobile && 'text-[17px]')}>{count}</span>
      {mobile && <ChevronRight size={16} className="text-n-label3" />}
    </div>
  )
}

function RenameField({ initial, onDone }: { initial: string; onDone: (name: string) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  const done = useRef(false)
  useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [])
  const finish = (name: string) => {
    if (done.current) return
    done.current = true
    onDone(name.trim())
  }
  return (
    <input
      ref={ref}
      defaultValue={initial}
      aria-label="文件夹名称"
      className="min-w-0 flex-1 rounded-[3px] bg-n-window px-1 text-n-label outline outline-2 outline-n-highlight"
      onClick={e => e.stopPropagation()}
      onBlur={e => finish(e.currentTarget.value)}
      onKeyDown={e => {
        e.stopPropagation()
        if (e.key === 'Enter') finish(e.currentTarget.value)
        if (e.key === 'Escape') finish(initial)
      }}
    />
  )
}
