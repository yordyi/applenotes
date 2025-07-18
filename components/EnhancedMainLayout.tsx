'use client'

import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import NotesList from './NotesList'
import { NoteEditor } from './NoteEditor'
import { Toolbar } from './Toolbar'
import { ResizablePanel, ResizablePanelsContainer } from './ResizablePanel'
import { addNote, selectNote } from '@/store/slices/notesSlice'
import { toggleSidebar } from '@/store/slices/uiSlice'

export default function EnhancedMainLayout() {
  const dispatch = useAppDispatch()
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

  // 处理创建新笔记
  const handleCreateNote = () => {
    dispatch(
      addNote({
        title: '新建备忘录',
        content: '',
        folderId: null,
        isPinned: false,
        tags: [],
      })
    )
  }

  // 处理返回笔记列表
  const handleBackToList = () => {
    dispatch(selectNote(null))
  }

  // 处理关闭侧边栏
  const handleCloseSidebar = () => {
    dispatch(toggleSidebar())
  }

  return (
    <div className="flex h-screen bg-white dark:bg-apple-gray-900 overflow-hidden">
      {/* 移动端处理 */}
      {isMobile ? (
        <>
          {/* 移动端侧边栏 */}
          {!sidebarCollapsed && (
            <>
              <div className="fixed inset-0 bg-black/50 z-40" onClick={handleCloseSidebar} />
              <div className="fixed left-0 top-0 w-[280px] h-full z-50 bg-apple-gray-50 dark:bg-apple-gray-900 shadow-apple-xl">
                <Sidebar />
              </div>
            </>
          )}

          {/* 移动端笔记列表 */}
          {!selectedNoteId && (
            <div className="w-full h-full bg-apple-gray-100 dark:bg-apple-gray-800">
              <div className="h-full flex flex-col">
                <Toolbar />
                <div className="flex-1 overflow-y-auto">
                  <NotesList />
                </div>
              </div>
            </div>
          )}

          {/* 移动端编辑器 */}
          {selectedNoteId && (
            <div className="w-full h-full bg-white dark:bg-apple-gray-900 relative">
              {/* 返回按钮 */}
              <div className="absolute top-4 left-4 z-10">
                <button
                  onClick={handleBackToList}
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
              <NoteEditor />
            </div>
          )}
        </>
      ) : (
        /* 桌面端三栏布局 */
        <ResizablePanelsContainer>
          {/* 左侧边栏 */}
          {!sidebarCollapsed && (
            <ResizablePanel
              defaultWidth={280}
              minWidth={200}
              maxWidth={400}
              className="bg-apple-gray-50 dark:bg-apple-gray-900 border-r border-apple-gray-200 dark:border-apple-gray-800"
              storageKey="sidebar-width"
            >
              <Sidebar />
            </ResizablePanel>
          )}

          {/* 中间笔记列表 */}
          <ResizablePanel
            defaultWidth={350}
            minWidth={280}
            maxWidth={500}
            className="bg-apple-gray-100 dark:bg-apple-gray-800 border-r border-apple-gray-200 dark:border-apple-gray-800"
            storageKey="notes-list-width"
          >
            <div className="h-full flex flex-col">
              <Toolbar />
              <div className="flex-1 overflow-y-auto">
                <NotesList />
              </div>
            </div>
          </ResizablePanel>

          {/* 右侧编辑器 */}
          <div className="flex-1 bg-white dark:bg-apple-gray-900 min-w-0">
            {selectedNoteId ? (
              <NoteEditor />
            ) : (
              <div className="flex-1 h-full flex items-center justify-center text-apple-gray-500 dark:text-apple-gray-400">
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
                  <p className="text-apple-subhead font-apple-system text-apple-gray-600 dark:text-apple-gray-400 mb-6">
                    你的想法很重要，随时记录灵感
                  </p>
                  <div className="space-y-3">
                    <button
                      className={cn(
                        'inline-flex items-center justify-center w-full px-4 py-3 rounded-apple-md',
                        'bg-apple-blue hover:bg-apple-blue/90',
                        'text-white font-apple-system font-medium',
                        'transition-all duration-apple-fast',
                        'shadow-apple-sm hover:shadow-apple-md',
                        'focus:outline-none focus:ring-2 focus:ring-apple-blue/20'
                      )}
                      onClick={handleCreateNote}
                    >
                      <svg
                        className="w-5 h-5 mr-2"
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

                    <div className="flex items-center space-x-4 text-apple-caption1 text-apple-gray-400">
                      <div className="flex items-center">
                        <kbd className="px-2 py-1 bg-apple-gray-100 dark:bg-apple-gray-800 rounded text-xs">
                          ⌘
                        </kbd>
                        <span className="ml-1">+</span>
                        <kbd className="px-2 py-1 bg-apple-gray-100 dark:bg-apple-gray-800 rounded text-xs ml-1">
                          N
                        </kbd>
                      </div>
                      <span>快速创建</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ResizablePanelsContainer>
      )}
    </div>
  )
}
