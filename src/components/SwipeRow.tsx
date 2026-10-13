'use client'

import { FolderInput, Pin, PinOff, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn, createOverlayStore } from './ui'

/** Only one row shows its actions at a time, as on iOS. */
const openRow = createOverlayStore<string | null>(null)

const ACTION = 76
const SLOP = 8

interface SwipeRowProps {
  id: string
  children: ReactNode
  pinned: boolean
  /** Swipe right; hidden for notes in Recently Deleted. */
  onPin?: () => void
  onMove: (button: HTMLElement) => void
  onDelete: () => void
}

/**
 * iPhone list row with swipe actions: swipe right to pin, swipe left for
 * Move and Delete. A long swipe runs the outermost action directly.
 */
export function SwipeRow({ id, children, pinned, onPin, onMove, onDelete }: SwipeRowProps) {
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const gesture = useRef<{ x: number; y: number; base: number; axis: 'x' | 'y' | null } | null>(
    null
  )
  const suppressClick = useRef(false)
  const rowRef = useRef<HTMLDivElement>(null)
  const openId = openRow.useValue()
  const rightWidth = ACTION * 2
  const leftWidth = onPin ? ACTION : 0

  // Another row opened: close this one.
  useEffect(() => {
    if (openId !== id && !dragging) setOffset(0)
  }, [openId, id, dragging])

  const settle = (value: number) => {
    setOffset(value)
    openRow.set(value ? id : openRow.get() === id ? null : openRow.get())
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    if (openRow.get() && openRow.get() !== id) openRow.set(null)
    gesture.current = { x: e.clientX, y: e.clientY, base: offset, axis: null }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current
    if (!g) return
    const dx = e.clientX - g.x
    const dy = e.clientY - g.y
    if (!g.axis) {
      if (Math.abs(dx) > SLOP && Math.abs(dx) > Math.abs(dy)) {
        g.axis = 'x'
        setDragging(true)
        e.currentTarget.setPointerCapture(e.pointerId)
      } else if (Math.abs(dy) > SLOP) {
        g.axis = 'y' // a scroll: leave it to the list
        return
      } else return
    }
    if (g.axis !== 'x') return
    const width = rowRef.current?.offsetWidth ?? 320
    const max = onPin ? width * 0.75 : 0
    setOffset(Math.max(-width * 0.9, Math.min(max, g.base + dx)))
  }

  const onPointerUp = () => {
    const g = gesture.current
    gesture.current = null
    if (!g || g.axis !== 'x') {
      // A tap on an open row closes it instead of opening the note.
      if (offset !== 0 && g) {
        suppressClick.current = true
        settle(0)
      }
      return
    }
    setDragging(false)
    suppressClick.current = true
    const width = rowRef.current?.offsetWidth ?? 320
    if (offset < -width * 0.6) {
      settle(0)
      onDelete()
    } else if (offset < -ACTION * 0.6) settle(-rightWidth)
    else if (onPin && offset > width * 0.45) {
      settle(0)
      onPin()
    } else if (onPin && offset > ACTION * 0.6) settle(leftWidth)
    else settle(0)
  }

  const reveal = (side: 'left' | 'right') => Math.max(0, side === 'left' ? offset : -offset)

  return (
    <div ref={rowRef} className="relative overflow-hidden">
      {/* Actions exist only while revealed, so closed rows add no hidden buttons. */}
      {onPin && reveal('left') > 0 && (
        <div className="absolute inset-y-0 left-0 flex" style={{ width: reveal('left') }}>
          <ActionButton
            label={pinned ? '取消置顶' : '置顶'}
            className="bg-[#ff9f0a]"
            onClick={() => {
              settle(0)
              onPin()
            }}
          >
            {pinned ? <PinOff size={20} /> : <Pin size={20} />}
          </ActionButton>
        </div>
      )}
      {reveal('right') > 0 && (
        <div className="absolute inset-y-0 right-0 flex" style={{ width: reveal('right') }}>
          <ActionButton
            label="移动"
            className="bg-[#af52de]"
            onClick={e => onMove(e.currentTarget)}
          >
            <FolderInput size={20} />
          </ActionButton>
          <ActionButton
            label="删除"
            className="bg-[#ff3b30]"
            onClick={() => {
              settle(0)
              onDelete()
            }}
          >
            <Trash2 size={20} />
          </ActionButton>
        </div>
      )}
      <div
        className={cn(
          'relative bg-n-cell',
          !dragging && 'transition-transform duration-200 ease-out'
        )}
        style={{ transform: `translateX(${offset}px)`, touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          gesture.current = null
          setDragging(false)
          settle(0)
        }}
        onClickCapture={e => {
          if (!suppressClick.current) return
          suppressClick.current = false
          e.stopPropagation()
          e.preventDefault()
        }}
      >
        {children}
      </div>
    </div>
  )
}

function ActionButton({
  label,
  className,
  children,
  onClick,
}: {
  label: string
  className: string
  children: ReactNode
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-0.5 overflow-hidden text-[12px] text-white',
        className
      )}
      onClick={onClick}
    >
      {children}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  )
}
