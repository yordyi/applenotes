import { useEffect, useRef, useCallback } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { updateNote } from '@/store/slices/notesSlice'

interface UseAutoSaveOptions {
  noteId: string
  content: string
  delay?: number
  onSave?: () => void
  onSaveError?: (error: Error) => void
}

export function useAutoSave({ 
  noteId, 
  content, 
  delay = 1000,
  onSave,
  onSaveError
}: UseAutoSaveOptions) {
  const dispatch = useAppDispatch()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastSavedContentRef = useRef<string>('')
  const isSavingRef = useRef(false)

  const saveNote = useCallback(async () => {
    if (isSavingRef.current || content === lastSavedContentRef.current) {
      return
    }

    try {
      isSavingRef.current = true
      
      // 提取标题 (取第一行作为标题)
      const lines = content.replace(/<[^>]*>/g, '').split('\n')
      const title = lines[0]?.trim() || '无标题'
      
      // 更新Redux状态
      dispatch(updateNote({
        id: noteId,
        updates: {
          title,
          content,
          updatedAt: new Date().toISOString()
        }
      }))
      
      lastSavedContentRef.current = content
      onSave?.()
    } catch (error) {
      onSaveError?.(error as Error)
    } finally {
      isSavingRef.current = false
    }
  }, [dispatch, noteId, content, onSave, onSaveError])

  // 防抖保存
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(saveNote, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [content, delay, saveNote])

  // 组件卸载时立即保存
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (content !== lastSavedContentRef.current) {
        saveNote()
      }
    }
  }, [saveNote, content])

  // 手动保存
  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    saveNote()
  }, [saveNote])

  return {
    forceSave,
    isSaving: isSavingRef.current
  }
}