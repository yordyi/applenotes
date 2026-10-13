'use client'

import { useEffect, useRef } from 'react'
import { cn, createOverlayStore } from './ui'

interface ConfirmOptions {
  title: string
  message?: string
  confirmLabel: string
  destructive?: boolean
}

interface OpenDialog extends ConfirmOptions {
  resolve: (ok: boolean) => void
}

const dialogStore = createOverlayStore<OpenDialog | null>(null)
const toastStore = createOverlayStore<{ id: number; text: string } | null>(null)

/** macOS-style alert. Resolves true when the user confirms. */
export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  dialogStore.get()?.resolve(false)
  return new Promise(resolve => dialogStore.set({ ...options, resolve }))
}

export function showToast(text: string) {
  const id = Date.now()
  toastStore.set({ id, text })
  setTimeout(() => toastStore.get()?.id === id && toastStore.set(null), 4000)
}

export function DialogHost() {
  const dialog = dialogStore.useValue()
  const toast = toastStore.useValue()
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!dialog) return
    confirmRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  })

  function close(ok: boolean) {
    dialog?.resolve(ok)
    dialogStore.set(null)
  }

  return (
    <>
      {dialog && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/10 pt-[18vh]">
          <div
            role="alertdialog"
            aria-labelledby="dialog-title"
            className="w-[260px] rounded-xl bg-n-menu p-4 text-center backdrop-blur-xl"
            style={{ boxShadow: 'var(--n-shadow)' }}
          >
            <div className="mx-auto mb-2.5 flex h-14 w-14 items-center justify-center rounded-[13px] bg-gradient-to-b from-[#fde27a] to-[#f7c325] shadow-sm">
              <div className="h-8 w-7 rounded-[3px] bg-white/95 shadow-[inset_0_6px_0_#f5c02a]" />
            </div>
            <h2 id="dialog-title" className="text-[13px] font-bold">
              {dialog.title}
            </h2>
            {dialog.message && <p className="mt-1.5 text-[11px] leading-4">{dialog.message}</p>}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="h-7 flex-1 rounded-md bg-n-chip text-[13px] active:bg-n-selected"
                onClick={() => close(false)}
              >
                取消
              </button>
              <button
                ref={confirmRef}
                type="button"
                className={cn(
                  'h-7 flex-1 rounded-md text-[13px] text-white outline-none',
                  dialog.destructive ? 'bg-[#ff3b30]' : 'bg-n-highlight'
                )}
                onClick={() => close(true)}
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-lg bg-n-menu px-4 py-2 text-[13px] backdrop-blur-xl"
          style={{ boxShadow: 'var(--n-shadow)' }}
        >
          {toast.text}
        </div>
      )}
    </>
  )
}
