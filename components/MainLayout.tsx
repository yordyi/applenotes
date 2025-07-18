'use client'

import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import NotesList from './NotesList'
import BasicNoteEditor from './BasicNoteEditor'
import { Toolbar } from './Toolbar'
import { addNote, selectNote } from '@/store/slices/notesSlice'
import { toggleSidebar } from '@/store/slices/uiSlice'

export default function MainLayout() {
  const dispatch = useAppDispatch()
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [notesListWidth, setNotesListWidth] = useState(350)
  const [isMobile, setIsMobile] = useState(false)

  const { selectedNoteId } = useAppSelector(state => state.notes)
  const { sidebarCollapsed } = useAppSelector(state => state.ui)

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="flex h-screen bg-white dark:bg-apple-gray-900 overflow-hidden">
      {/* 左侧边栏 */}
      <div
        className={cn(
          'flex-shrink-0 bg-apple-gray-50 dark:bg-apple-gray-900',
          'border-r border-apple-gray-200 dark:border-apple-gray-800',
          'transition-all duration-apple-normal ease-apple-ease',
          'overflow-hidden',
          // 移动端处理
          isMobile
            ? sidebarCollapsed
              ? 'w-0'
              : 'w-[280px] absolute left-0 top-0 h-full z-50 shadow-apple-lg'
            : sidebarCollapsed
              ? 'w-0 md:w-16'
              : `w-[${sidebarWidth}px]`
        )}
        style={{
          width: !isMobile && !sidebarCollapsed ? `${sidebarWidth}px` : undefined,
        }}
      >
        <div
          className={cn(
            'h-full',
            'transition-opacity duration-apple-normal',
            sidebarCollapsed ? 'opacity-0 md:opacity-100' : 'opacity-100'
          )}
        >
          <Sidebar />
        </div>
      </div>

      {/* 移动端遮罩层 */}
      {isMobile && !sidebarCollapsed && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => dispatch(toggleSidebar())} />
      )}

      {/* 中间笔记列表 */}
      <div
        className={cn(
          'flex-shrink-0 bg-apple-gray-100 dark:bg-apple-gray-800',
          'border-r border-apple-gray-200 dark:border-apple-gray-800',
          'transition-all duration-apple-normal ease-apple-ease',
          'overflow-hidden',
          // 移动端响应式
          isMobile ? (selectedNoteId ? 'w-0' : 'w-full') : `w-[${notesListWidth}px]`
        )}
        style={{
          width: !isMobile ? `${notesListWidth}px` : undefined,
        }}
      >
        <div className="h-full flex flex-col">
          <Toolbar />
          <div className="flex-1 overflow-y-auto">
            <NotesList />
          </div>
        </div>
      </div>

      {/* 右侧编辑器 */}
      <div
        className={cn(
          'flex-1 bg-white dark:bg-apple-gray-900',
          'min-w-0 relative',
          'transition-all duration-apple-normal ease-apple-ease',
          // 移动端响应式
          isMobile ? (selectedNoteId ? 'block' : 'hidden') : 'block'
        )}
      >
        {selectedNoteId ? (
          <>
            {/* 移动端返回按钮 */}
            {isMobile && (
              <div className="absolute top-4 left-4 z-10">
                <button
                  onClick={() => dispatch(selectNote(null))}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-apple-md',
                    'bg-apple-gray-100 dark:bg-apple-gray-800',
                    'hover:bg-apple-gray-200 dark:hover:bg-apple-gray-700',
                    'transition-colors duration-apple-fast',
                    'text-apple-gray-700 dark:text-apple-gray-300',
                    'shadow-apple-sm'
                  )}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  返回
                </button>
              </div>
            )}
            <BasicNoteEditor />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-apple-gray-500 dark:text-apple-gray-400">
            <div className="text-center max-w-md px-6">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-apple-gray-100 dark:bg-apple-gray-800 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-apple-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h2 className="text-apple-title3 font-apple-system font-semibold text-apple-gray-900 dark:text-white mb-2">
                选择一个备忘录或创建新的备忘录
              </h2>
              <p className="text-apple-subhead font-apple-system text-apple-gray-600 dark:text-apple-gray-400">
                你的想法很重要，随时记录灵感
              </p>
              <div className="mt-6">
                <button
                  className={cn(
                    'inline-flex items-center px-4 py-2 rounded-apple-md',
                    'bg-apple-blue hover:bg-apple-blue/90',
                    'text-white font-apple-system font-medium',
                    'transition-all duration-apple-fast',
                    'shadow-apple-sm hover:shadow-apple-md'
                  )}
                  onClick={() => {
                    dispatch(
                      addNote({
                        title: '新建备忘录',
                        content: '',
                        folderId: null,
                        isPinned: false,
                        tags: [],
                      })
                    )
                  }}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  新建备忘录
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
