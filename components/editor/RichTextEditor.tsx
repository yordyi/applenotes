'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = '开始输入...',
  className,
  autoFocus = false
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isComposing, setIsComposing] = useState(false)
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null)

  // 初始化编辑器内容
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content || ''
    }
  }, [content])

  // 处理输入变化
  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    if (isComposing) return
    
    const target = e.target as HTMLDivElement
    const newContent = target.innerHTML
    onChange(newContent)
  }, [isComposing, onChange])

  // 处理按键事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    // 处理Tab键
    if (e.key === 'Tab') {
      e.preventDefault()
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;')
      return
    }

    // 处理Enter键 - 自动识别标题
    if (e.key === 'Enter') {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const currentElement = range.startContainer.parentElement
        
        // 如果当前在标题中，按Enter创建新的段落
        if (currentElement?.tagName?.match(/^H[1-6]$/)) {
          e.preventDefault()
          document.execCommand('insertHTML', false, '<br><p><br></p>')
          return
        }
      }
    }

    // 处理格式化快捷键
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          document.execCommand('bold')
          break
        case 'i':
          e.preventDefault()
          document.execCommand('italic')
          break
        case 'u':
          e.preventDefault()
          document.execCommand('underline')
          break
        case 'k':
          e.preventDefault()
          const url = prompt('输入链接URL:')
          if (url) {
            document.execCommand('createLink', false, url)
          }
          break
      }
    }
  }, [])

  // 处理粘贴事件
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }, [])

  // 处理中文输入
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true)
  }, [])

  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLDivElement>) => {
    setIsComposing(false)
    const target = e.target as HTMLDivElement
    onChange(target.innerHTML)
  }, [onChange])

  // 处理焦点事件
  const handleFocus = useCallback(() => {
    // 编辑器获得焦点时的处理
  }, [])

  const handleBlur = useCallback(() => {
    // 编辑器失去焦点时的处理
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  // 自动聚焦
  useEffect(() => {
    if (autoFocus && editorRef.current) {
      editorRef.current.focus()
    }
  }, [autoFocus])

  return (
    <div className={cn('relative w-full', className)}>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          'min-h-[500px] w-full px-6 py-4',
          'text-base leading-relaxed',
          'focus:outline-none',
          'prose prose-apple max-w-none',
          '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4',
          '[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3',
          '[&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2',
          '[&_p]:mb-3 [&_p]:leading-relaxed',
          '[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-3',
          '[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-3',
          '[&_li]:mb-1',
          '[&_a]:text-blue-600 [&_a]:underline',
          '[&_strong]:font-semibold',
          '[&_em]:italic',
          '[&_blockquote]:border-l-4 [&_blockquote]:border-apple-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic',
          'dark:text-white'
        )}
        style={{
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}
        data-placeholder={placeholder}
      />
      
      {/* 占位符 */}
      {!content && (
        <div className={cn(
          'absolute top-4 left-6 pointer-events-none',
          'text-apple-gray-400 text-base',
          'select-none'
        )}>
          {placeholder}
        </div>
      )}
    </div>
  )
}

// 导出一些有用的工具函数
export const editorUtils = {
  // 获取纯文本内容
  getPlainText: (html: string): string => {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
  },

  // 获取字数
  getWordCount: (html: string): number => {
    const text = editorUtils.getPlainText(html)
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  },

  // 获取字符数
  getCharCount: (html: string): number => {
    const text = editorUtils.getPlainText(html)
    return text.length
  },

  // 检查是否为空
  isEmpty: (html: string): boolean => {
    const text = editorUtils.getPlainText(html)
    return text.trim().length === 0
  },

  // 自动识别标题
  detectTitle: (html: string): string => {
    const div = document.createElement('div')
    div.innerHTML = html
    const firstLine = div.textContent?.split('\n')[0] || ''
    return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine
  }
}