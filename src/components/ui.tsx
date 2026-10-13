'use client'

import { forwardRef, useSyncExternalStore, type ButtonHTMLAttributes } from 'react'

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

export const isMac =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

/** Formats a shortcut like "⇧⌘N", using Ctrl on non-Apple platforms. */
export function shortcut(keys: string): string {
  return isMac ? keys : keys.replace('⌘', 'Ctrl+').replace('⇧', 'Shift+').replace('⌥', 'Alt+')
}

interface ToolbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

/** Borderless toolbar button in the style of macOS Sonoma's unified toolbar. */
export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  function ToolbarButton({ active, className, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'flex h-7 min-w-[32px] items-center justify-center rounded-md px-1.5 text-n-label2',
          'hover:bg-n-hover active:bg-n-selected disabled:pointer-events-none disabled:opacity-35',
          active && 'bg-n-selected text-n-label',
          className
        )}
        {...props}
      />
    )
  }
)

const mobileQuery = '(max-width: 767px)'

export function useIsMobile(): boolean {
  return useSyncExternalStore(
    cb => {
      const mq = window.matchMedia(mobileQuery)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => window.matchMedia(mobileQuery).matches,
    () => false
  )
}

/** Minimal external store for imperatively opened overlays (menus, dialogs, toasts). */
export function createOverlayStore<T>(initial: T) {
  let value = initial
  const listeners = new Set<() => void>()
  return {
    get: () => value,
    set(next: T) {
      value = next
      listeners.forEach(l => l())
    },
    useValue(): T {
      return useSyncExternalStore(
        cb => {
          listeners.add(cb)
          return () => listeners.delete(cb)
        },
        () => value,
        () => value
      )
    },
  }
}
