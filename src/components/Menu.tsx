'use client'

import { Check, ChevronRight } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { cn, createOverlayStore } from './ui'

export type MenuItem =
  | 'separator'
  /** Arbitrary content, e.g. the row of B / I / U / S buttons in the Aa menu. */
  | { custom: ReactNode }
  | {
      label: ReactNode
      onSelect?: () => void
      disabled?: boolean
      checked?: boolean
      destructive?: boolean
      shortcut?: string
      submenu?: MenuItem[]
    }

interface OpenMenu {
  x: number
  y: number
  items: MenuItem[]
  /** Element to return focus to; also lets the same button toggle the menu closed. */
  anchor?: HTMLElement | null
}

const menuStore = createOverlayStore<OpenMenu | null>(null)

export function openMenu(menu: OpenMenu) {
  menuStore.set(menu)
}

export function closeMenu() {
  menuStore.set(null)
}

/** Opens a menu below an element, e.g. a toolbar button. */
export function openMenuAt(el: HTMLElement, items: MenuItem[]) {
  const current = menuStore.get()
  if (current?.anchor === el) return closeMenu()
  const r = el.getBoundingClientRect()
  openMenu({ x: r.left, y: r.bottom + 4, items, anchor: el })
}

export function MenuHost() {
  const menu = menuStore.useValue()
  useEffect(() => {
    if (!menu) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeMenu()
    const onBlur = () => closeMenu()
    window.addEventListener('keydown', onKey)
    window.addEventListener('blur', onBlur)
    window.addEventListener('resize', onBlur)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('resize', onBlur)
    }
  }, [menu])
  if (!menu) return null
  return (
    <div
      className="fixed inset-0 z-50"
      // The overlay covers the anchor too, so clicking it again just closes the menu.
      onMouseDown={e => e.target === e.currentTarget && closeMenu()}
      onContextMenu={e => {
        e.preventDefault()
        closeMenu()
      }}
    >
      <MenuPanel items={menu.items} x={menu.x} y={menu.y} />
    </div>
  )
}

function MenuPanel({
  items,
  x,
  y,
  alignRight,
}: {
  items: MenuItem[]
  x: number
  y: number
  alignRight?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ left: x, top: y })
  const [openSub, setOpenSub] = useState<number | null>(null)
  const [subPos, setSubPos] = useState({ x: 0, y: 0, alignRight: 0 })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    let left = x
    if (left + width > window.innerWidth - 6) {
      left = alignRight !== undefined ? alignRight - width : window.innerWidth - width - 6
    }
    const top = Math.min(y, window.innerHeight - height - 6)
    setPos({ left: Math.max(6, left), top: Math.max(6, top) })
  }, [x, y, alignRight])

  // The submenu is a sibling, not a child: backdrop-filter would make it position
  // relative to this panel instead of the viewport.
  return (
    <>
      <div
        ref={ref}
        role="menu"
        className="fixed min-w-[200px] rounded-[7px] bg-n-menu p-[5px] text-[13px] text-n-label backdrop-blur-xl"
        style={{ left: pos.left, top: pos.top, boxShadow: 'var(--n-shadow)' }}
        onMouseDown={e => e.preventDefault()}
      >
        {items.map((item, i) => {
          if (item === 'separator') {
            return <div key={i} className="mx-2.5 my-[5px] h-px bg-n-separator" />
          }
          if ('custom' in item) return <div key={i}>{item.custom}</div>
          const hasSub = Boolean(item.submenu?.length)
          return (
            <div
              key={i}
              role="menuitem"
              aria-disabled={item.disabled}
              className={cn(
                'group flex min-h-[22px] py-px cursor-default items-center gap-1 rounded-[4px] pl-[22px] pr-2.5 relative',
                item.disabled ? 'text-n-label3' : 'hover:bg-n-highlight hover:text-white',
                openSub === i && 'bg-n-highlight text-white',
                item.destructive && !item.disabled && 'text-[#ff3b30]'
              )}
              onMouseEnter={e => {
                if (hasSub && !item.disabled) {
                  const r = e.currentTarget.getBoundingClientRect()
                  setSubPos({ x: r.right + 2, y: r.top - 5, alignRight: r.left - 2 })
                  setOpenSub(i)
                } else setOpenSub(null)
              }}
              onClick={() => {
                if (item.disabled || hasSub) return
                closeMenu()
                item.onSelect?.()
              }}
            >
              {item.checked && (
                <Check size={13} strokeWidth={2.5} className="absolute left-[6px]" />
              )}
              <span className="flex-1 whitespace-nowrap">{item.label}</span>
              {item.shortcut && (
                <span className="ml-6 text-n-label2 group-hover:text-white/80">
                  {item.shortcut}
                </span>
              )}
              {hasSub && <ChevronRight size={13} className="ml-4 opacity-70" />}
            </div>
          )
        })}
      </div>
      {openSub !== null && (
        <MenuPanel
          items={(items[openSub] as { submenu: MenuItem[] }).submenu}
          x={subPos.x}
          y={subPos.y}
          alignRight={subPos.alignRight}
        />
      )}
    </>
  )
}
