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
    // Capture phase: keys go to the menu, not the editor or list underneath.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      e.stopPropagation()
      closeMenu()
    }
    const onBlur = () => closeMenu()
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('blur', onBlur)
    window.addEventListener('resize', onBlur)
    return () => {
      window.removeEventListener('keydown', onKey, true)
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

type ActionItem = Exclude<MenuItem, 'separator' | { custom: ReactNode }>

function actionItem(item: MenuItem | undefined): ActionItem | null {
  return item && item !== 'separator' && !('custom' in item) ? item : null
}

interface PanelProps {
  items: MenuItem[]
  x: number
  y: number
  alignRight?: number
  /** Opened from the keyboard: highlight the first item. */
  keyboard?: boolean
  /** ← in a submenu goes back to its parent. */
  onBack?: () => void
}

/**
 * A menu panel. Keyboard: ↑ ↓ move, → opens a submenu, ← closes it, Return or
 * Space chooses, Esc closes everything. Focus stays where it was (e.g. the
 * editor, so formatting applies to the selection).
 */
function MenuPanel({ items, x, y, alignRight, keyboard, onBack }: PanelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const [pos, setPos] = useState({ left: x, top: y })
  const enabled = (i: number) => Boolean(actionItem(items[i]) && !actionItem(items[i])!.disabled)
  const [active, setActive] = useState<number | null>(() => {
    const first = items.findIndex((_, i) => enabled(i))
    return keyboard && first >= 0 ? first : null
  })
  const [sub, setSub] = useState<{
    index: number
    x: number
    y: number
    alignRight: number
    keyboard: boolean
  } | null>(null)

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

  const openSub = (i: number, fromKeyboard: boolean) => {
    const r = itemRefs.current[i]?.getBoundingClientRect()
    if (r)
      setSub({
        index: i,
        x: r.right + 2,
        y: r.top - 5,
        alignRight: r.left - 2,
        keyboard: fromKeyboard,
      })
  }

  const choose = (i: number, fromKeyboard: boolean) => {
    const item = actionItem(items[i])
    if (!item || item.disabled) return
    if (item.submenu?.length) return openSub(i, fromKeyboard)
    closeMenu()
    item.onSelect?.()
  }

  useEffect(() => {
    if (sub) return // the submenu has the keyboard
    const onKey = (e: KeyboardEvent) => {
      const step = (from: number, dir: 1 | -1) => {
        for (let n = 1; n <= items.length; n++) {
          const i = (from + dir * n + items.length * 2) % items.length
          if (enabled(i)) return i
        }
        return null
      }
      let handled = true
      if (e.key === 'ArrowDown') setActive(step(active ?? -1, 1))
      else if (e.key === 'ArrowUp') setActive(step(active ?? items.length, -1))
      else if (e.key === 'Home') setActive(step(-1, 1))
      else if (e.key === 'End') setActive(step(items.length, -1))
      else if (e.key === 'ArrowRight' && active !== null && actionItem(items[active])?.submenu) {
        openSub(active, true)
      } else if (e.key === 'ArrowLeft' && onBack) onBack()
      else if ((e.key === 'Enter' || e.key === ' ') && active !== null) choose(active, true)
      else handled = false
      if (handled) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  })

  const subItems = sub ? actionItem(items[sub.index])?.submenu : undefined

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
        {items.map((entry, i) => {
          if (entry === 'separator') {
            return <div key={i} role="separator" className="mx-2.5 my-[5px] h-px bg-n-separator" />
          }
          if ('custom' in entry) return <div key={i}>{entry.custom}</div>
          const item = entry
          const hasSub = Boolean(item.submenu?.length)
          const lit = !item.disabled && (active === i || sub?.index === i)
          return (
            <div
              key={i}
              ref={el => {
                itemRefs.current[i] = el
              }}
              role={item.checked !== undefined ? 'menuitemcheckbox' : 'menuitem'}
              aria-checked={item.checked !== undefined ? item.checked : undefined}
              aria-disabled={item.disabled || undefined}
              aria-haspopup={hasSub ? 'menu' : undefined}
              aria-expanded={hasSub ? sub?.index === i : undefined}
              className={cn(
                'relative flex min-h-[22px] cursor-default items-center gap-1 rounded-[4px] py-px pl-[22px] pr-2.5',
                item.disabled && 'text-n-label3',
                lit && 'bg-n-highlight text-white',
                item.destructive && !item.disabled && !lit && 'text-[#ff3b30]'
              )}
              onMouseEnter={() => {
                setActive(enabled(i) ? i : null)
                if (hasSub && !item.disabled) openSub(i, false)
                else setSub(null)
              }}
              onClick={() => choose(i, false)}
            >
              {item.checked && (
                <Check size={13} strokeWidth={2.5} className="absolute left-[6px]" />
              )}
              <span className="flex-1 whitespace-nowrap">{item.label}</span>
              {item.shortcut && (
                <span className={cn('ml-6', lit ? 'text-white/80' : 'text-n-label2')}>
                  {item.shortcut}
                </span>
              )}
              {hasSub && <ChevronRight size={13} className="ml-4 opacity-70" />}
            </div>
          )
        })}
      </div>
      {sub && subItems && (
        <MenuPanel
          key={sub.index}
          items={subItems}
          x={sub.x}
          y={sub.y}
          alignRight={sub.alignRight}
          keyboard={sub.keyboard}
          onBack={() => setSub(null)}
        />
      )}
    </>
  )
}
