'use client'

import {
  ChevronLeft,
  FolderPlus,
  ImageIcon,
  ListChecks,
  MoreHorizontal,
  SquarePen,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Provider } from 'react-redux'
import { toggleList } from '@/src/lib/editorCommands'
import { newFolder, newNote } from '@/src/store/actions'
import { startApp, type Running } from '@/src/store/boot'
import { useAppDispatch, useAppSelector, useAppStore } from '@/src/store/hooks'
import { selectListNotes, selectListTitle, selectSelectedNote } from '@/src/store/selectors'
import {
  setListWidth,
  setMobilePane,
  setSidebarWidth,
  setViewMode,
  toggleSidebar,
} from '@/src/store/uiSlice'
import { DialogHost, showToast } from './Dialog'
import {
  EditorPane,
  EditorToolbar,
  flushEditor,
  formatMenu,
  pickImage,
  SEARCH_INPUT_ID,
  SearchField,
} from './Editor'
import { MenuHost, openMenu, openMenuAt } from './Menu'
import { noteMenu } from './menus'
import { NoteListBody, NoteListHeader } from './NoteList'
import { Sidebar, SidebarContent } from './Sidebar'
import { useIsMobile } from './ui'

export default function NotesApp() {
  const [running, setRunning] = useState<Running | null>(null)

  useEffect(() => {
    let app: Running | null = null
    let cancelled = false
    startApp(() => showToast('无法存储，最近的更改可能未保存。')).then(started => {
      if (cancelled) return started.stop()
      app = started
      setRunning(started)
      if (!started.persistent) showToast('此浏览器无法存储备忘录，关闭页面后更改会丢失。')
    })
    // Hidden pages may be closed without warning: save edits still being typed.
    const save = () => {
      flushEditor()
      app?.flush()
    }
    const onVisibility = () => document.visibilityState === 'hidden' && save()
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', save)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', save)
      flushEditor()
      app?.stop()
    }
  }, [])

  if (!running) return null
  return (
    <Provider store={running.store}>
      <Shortcuts />
      <Layout />
      <MenuHost />
      <DialogHost />
    </Provider>
  )
}

function Layout() {
  return useIsMobile() ? <MobileLayout /> : <DesktopLayout />
}

/** Global keyboard shortcuts, matching Notes on macOS. Ctrl stands in for ⌘ elsewhere. */
function Shortcuts() {
  const dispatch = useAppDispatch()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return
      const handle = (fn: () => void) => {
        e.preventDefault()
        fn()
      }
      if (e.code === 'KeyN') handle(() => dispatch(e.shiftKey ? newFolder() : newNote()))
      else if (e.code === 'KeyF' && !e.shiftKey) {
        handle(() => {
          const input = document.getElementById(SEARCH_INPUT_ID) as HTMLInputElement | null
          input?.focus()
          input?.select()
        })
      } else if (e.code === 'KeyS' && e.altKey) handle(() => dispatch(toggleSidebar()))
      else if (e.code === 'Digit1' && !e.shiftKey) handle(() => dispatch(setViewMode('list')))
      else if (e.code === 'Digit2' && !e.shiftKey) handle(() => dispatch(setViewMode('gallery')))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dispatch])
  return null
}

function Resizer({ width, onResize }: { width: number; onResize: (w: number) => void }) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      className="relative w-px shrink-0 bg-n-separator"
    >
      <div
        className="absolute inset-y-0 -left-[3px] z-10 w-[7px] cursor-col-resize"
        onPointerDown={e => {
          e.preventDefault()
          const startX = e.clientX
          const target = e.currentTarget
          target.setPointerCapture(e.pointerId)
          const move = (ev: PointerEvent) => onResize(width + ev.clientX - startX)
          const up = () => {
            target.removeEventListener('pointermove', move)
            target.removeEventListener('pointerup', up)
          }
          target.addEventListener('pointermove', move)
          target.addEventListener('pointerup', up)
        }}
      />
    </div>
  )
}

function DesktopLayout() {
  const dispatch = useAppDispatch()
  const ui = useAppSelector(s => s.ui)
  const gallery = ui.viewMode === 'gallery'

  return (
    <div className="flex h-full">
      {ui.sidebarVisible && (
        <>
          <div className="h-full shrink-0" style={{ width: ui.sidebarWidth }}>
            <Sidebar />
          </div>
          <Resizer width={ui.sidebarWidth} onResize={w => dispatch(setSidebarWidth(w))} />
        </>
      )}
      {gallery ? (
        ui.galleryOpen ? (
          <EditorColumn />
        ) : (
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex">
              <div className="min-w-0 flex-1">
                <NoteListHeader />
              </div>
              <EditorToolbar compact />
            </div>
            <NoteListBody />
          </div>
        )
      ) : (
        <>
          <div className="flex h-full shrink-0 flex-col" style={{ width: ui.listWidth }}>
            <NoteListHeader />
            <NoteListBody />
          </div>
          <Resizer width={ui.listWidth} onResize={w => dispatch(setListWidth(w))} />
          <EditorColumn />
        </>
      )}
    </div>
  )
}

function EditorColumn() {
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <EditorToolbar />
      <EditorPane />
    </div>
  )
}

/* ---------- iPhone layout ---------- */

function MobileLayout() {
  const pane = useAppSelector(s => s.ui.mobilePane)
  if (pane === 'editor') return <MobileEditor />
  if (pane === 'list') return <MobileList />
  return <MobileFolders />
}

function NavBar({
  back,
  onBack,
  right,
}: {
  back?: string
  onBack?: () => void
  right?: ReactNode
}) {
  return (
    <div className="flex h-11 shrink-0 items-center justify-between px-2">
      {back ? (
        <button
          type="button"
          className="flex max-w-[60%] items-center text-[17px] text-n-accent"
          onClick={onBack}
        >
          <ChevronLeft size={26} strokeWidth={2.2} className="-mr-0.5 shrink-0" />
          <span className="truncate">{back}</span>
        </button>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-1 text-n-accent">{right}</div>
    </div>
  )
}

function BottomBar({
  left,
  center,
  right,
}: {
  left?: ReactNode
  center?: ReactNode
  right?: ReactNode
}) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-t border-n-separator px-4 pb-[env(safe-area-inset-bottom)] text-n-accent">
      <div className="w-10">{left}</div>
      <div className="text-[11px] text-n-label">{center}</div>
      <div className="flex w-10 justify-end">{right}</div>
    </div>
  )
}

function IconButton({
  label,
  onClick,
  children,
  onMouseDown,
}: {
  label: string
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  children: ReactNode
  onMouseDown?: (e: React.MouseEvent) => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center"
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      {children}
    </button>
  )
}

function MobileFolders() {
  const dispatch = useAppDispatch()
  return (
    <div className="flex h-full flex-col bg-n-grouped">
      <NavBar />
      <h1 className="px-4 pb-1 text-[34px] font-bold">文件夹</h1>
      <SidebarContent mobile />
      <BottomBar
        left={
          <IconButton label="新建文件夹" onClick={() => dispatch(newFolder())}>
            <FolderPlus size={24} strokeWidth={1.6} />
          </IconButton>
        }
        right={
          <IconButton label="新建备忘录" onClick={() => dispatch(newNote())}>
            <SquarePen size={23} strokeWidth={1.6} />
          </IconButton>
        }
      />
    </div>
  )
}

function MobileList() {
  const dispatch = useAppDispatch()
  const title = useAppSelector(selectListTitle)
  const count = useAppSelector(s => selectListNotes(s).length)
  return (
    <div className="flex h-full flex-col bg-n-grouped">
      <NavBar back="文件夹" onBack={() => dispatch(setMobilePane('folders'))} />
      <h1 className="truncate px-4 pb-2 text-[34px] font-bold">{title}</h1>
      <div className="px-4 pb-2">
        <SearchField mobile />
      </div>
      <NoteListBody mobile />
      <BottomBar
        center={`${count} 个备忘录`}
        right={
          <IconButton label="新建备忘录" onClick={() => dispatch(newNote())}>
            <SquarePen size={23} strokeWidth={1.6} />
          </IconButton>
        }
      />
    </div>
  )
}

function MobileEditor() {
  const dispatch = useAppDispatch()
  const store = useAppStore()
  const title = useAppSelector(selectListTitle)
  const note = useAppSelector(selectSelectedNote)
  const keep = (e: React.MouseEvent) => e.preventDefault()
  return (
    <div className="flex h-full flex-col bg-n-window">
      <NavBar
        back={title}
        onBack={() => dispatch(setMobilePane('list'))}
        right={
          note && (
            <IconButton
              label="更多"
              onClick={e => {
                const r = e.currentTarget.getBoundingClientRect()
                openMenu({
                  x: r.right,
                  y: r.bottom,
                  items: noteMenu(dispatch, store.getState(), note),
                })
              }}
            >
              <MoreHorizontal size={24} strokeWidth={1.8} />
            </IconButton>
          )
        }
      />
      <EditorPane mobile />
      <BottomBar
        left={
          <IconButton label="核对清单" onMouseDown={keep} onClick={() => toggleList('checklist')}>
            <ListChecks size={23} strokeWidth={1.6} />
          </IconButton>
        }
        center={
          <div className="flex items-center gap-6 text-n-accent">
            <IconButton
              label="格式"
              onMouseDown={keep}
              onClick={e => openMenuAt(e.currentTarget, formatMenu())}
            >
              <span className="text-[19px] font-medium">Aa</span>
            </IconButton>
            <IconButton label="添加图像" onMouseDown={keep} onClick={pickImage}>
              <ImageIcon size={22} strokeWidth={1.6} />
            </IconButton>
          </div>
        }
        right={
          <IconButton label="新建备忘录" onClick={() => dispatch(newNote())}>
            <SquarePen size={23} strokeWidth={1.6} />
          </IconButton>
        }
      />
    </div>
  )
}
