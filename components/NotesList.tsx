'use client'

import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectNote } from '@/store/slices/notesSlice'

export default function NotesList() {
  const dispatch = useAppDispatch()
  const { notes, selectedNoteId, searchQuery } = useAppSelector(state => state.notes)
  const { selectedFolderId } = useAppSelector(state => state.folders)
  const { view } = useAppSelector(state => state.ui)

  // 获取过滤后的笔记
  const getFilteredNotes = () => {
    let filtered = notes

    // 根据选中的文件夹过滤
    if (selectedFolderId === 'all') {
      filtered = notes
    } else if (selectedFolderId === 'recent') {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      filtered = notes.filter(note => new Date(note.updatedAt) > thirtyDaysAgo)
    } else if (selectedFolderId === 'pinned') {
      filtered = notes.filter(note => note.isPinned)
    } else if (selectedFolderId === 'favorites') {
      filtered = notes.filter(note => (note as any).isFavorited)
    } else if (selectedFolderId === 'tags') {
      filtered = notes.filter(note => note.tags && note.tags.length > 0)
    } else {
      filtered = notes.filter(note => note.folderId === selectedFolderId)
    }

    // 根据搜索查询过滤
    if (searchQuery) {
      filtered = filtered.filter(
        note =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  // 排序逻辑
  const sortedNotes = getFilteredNotes().sort((a, b) => {
    // 第一优先级：置顶笔记
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1

    // 第二优先级：按更新时间倒序
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  // 日期格式化函数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } else if (diffDays === 1) {
      return '昨天'
    } else if (diffDays < 7) {
      return `${diffDays}天前`
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
      })
    }
  }

  // 获取内容预览
  const getPreviewText = (content: string) => {
    return content.replace(/\n/g, ' ').substring(0, 120) || '没有附加文本'
  }

  // 高亮搜索关键词
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm || !text) return text

    const regex = new RegExp(`(${searchTerm})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-800">$1</mark>')
  }

  // 获取搜索结果
  const getSearchResults = () => {
    if (!searchQuery.trim()) return []

    return notes
      .filter(note => {
        const titleMatch = note.title.toLowerCase().includes(searchQuery.toLowerCase())
        const contentMatch = note.content.toLowerCase().includes(searchQuery.toLowerCase())
        const tagMatch = note.tags.some(tag =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )

        return titleMatch || contentMatch || tagMatch
      })
      .sort((a, b) => {
        // 按相关性排序：标题匹配优先，然后按更新时间
        const aTitle = a.title.toLowerCase().includes(searchQuery.toLowerCase())
        const bTitle = b.title.toLowerCase().includes(searchQuery.toLowerCase())

        if (aTitle && !bTitle) return -1
        if (!aTitle && bTitle) return 1

        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })
  }

  // 搜索结果视图组件
  const SearchResultsView = () => {
    const searchResults = getSearchResults()

    return (
      <div className="flex-1 overflow-y-auto">
        {searchResults.map(note => (
          <div
            key={note.id}
            onClick={() => dispatch(selectNote(note.id))}
            className={`
              px-4 py-3 border-b border-gray-100 cursor-pointer 
              transition-all duration-150 hover:bg-gray-50
              ${
                selectedNoteId === note.id
                  ? 'bg-blue-50 border-l-4 border-l-blue-500'
                  : 'border-l-4 border-l-transparent'
              }
            `}
          >
            {/* 搜索结果图标和标题 */}
            <div className="flex items-center mb-2">
              <svg
                className="w-4 h-4 mr-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <div className="flex items-center flex-1 min-w-0">
                {note.isPinned && <span className="text-yellow-500 mr-2 text-sm">📌</span>}
                <h3
                  className="font-semibold text-base text-gray-900 truncate"
                  dangerouslySetInnerHTML={{
                    __html: highlightSearchTerm(note.title || '新备忘录', searchQuery),
                  }}
                />
              </div>
              <span className="text-xs text-gray-500 ml-3 flex-shrink-0">
                {formatDate(note.updatedAt)}
              </span>
            </div>

            {/* 内容预览 */}
            <p
              className="text-sm text-gray-600 line-clamp-2 leading-relaxed pl-6"
              dangerouslySetInnerHTML={{
                __html: highlightSearchTerm(getPreviewText(note.content), searchQuery),
              }}
            />

            {/* 标签 */}
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2 pl-6">
                {note.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                    dangerouslySetInnerHTML={{
                      __html: '#' + highlightSearchTerm(tag, searchQuery),
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  // 网格视图组件
  const GridView = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 p-4">
      {sortedNotes.map(note => (
        <div
          key={note.id}
          onClick={() => dispatch(selectNote(note.id))}
          className={`
            relative bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer 
            transition-all duration-200 hover:shadow-md hover:border-gray-300 aspect-square
            ${selectedNoteId === note.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
          `}
        >
          <div className="p-3 h-full flex flex-col">
            {/* 置顶图标 */}
            {note.isPinned && (
              <div className="absolute top-2 right-2">
                <span className="text-yellow-500 text-sm">📌</span>
              </div>
            )}

            {/* 标题 */}
            <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2">
              {note.title || '新备忘录'}
            </h3>

            {/* 内容预览 */}
            <p className="text-xs text-gray-600 line-clamp-4 flex-1">
              {getPreviewText(note.content)}
            </p>

            {/* 日期 */}
            <div className="mt-auto pt-2">
              <span className="text-xs text-gray-400">{formatDate(note.updatedAt)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // 列表视图组件
  const ListView = () => (
    <div className="flex-1 overflow-y-auto">
      {sortedNotes.map(note => (
        <div
          key={note.id}
          onClick={() => dispatch(selectNote(note.id))}
          className={`
            px-4 py-3 border-b border-gray-100 cursor-pointer 
            transition-all duration-150 hover:bg-gray-50
            ${
              selectedNoteId === note.id
                ? 'bg-blue-50 border-l-4 border-l-blue-500'
                : 'border-l-4 border-l-transparent'
            }
          `}
        >
          {/* 第一行：标题和日期 */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center flex-1 min-w-0">
              {note.isPinned && <span className="text-yellow-500 mr-2 text-sm">📌</span>}
              <h3 className="font-semibold text-base text-gray-900 truncate">
                {note.title || '新备忘录'}
              </h3>
            </div>
            <span className="text-xs text-gray-500 ml-3 flex-shrink-0">
              {formatDate(note.updatedAt)}
            </span>
          </div>

          {/* 内容预览 */}
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {getPreviewText(note.content)}
          </p>
        </div>
      ))}
    </div>
  )

  // 主组件渲染
  return (
    <div className="flex-1 flex flex-col">
      {searchQuery ? (
        // 搜索模式
        <SearchResultsView />
      ) : (
        // 正常模式
        <>
          {sortedNotes.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center text-gray-500">
                <p className="text-lg mb-2 font-medium">没有备忘录</p>
                <p className="text-sm opacity-75">点击下方按钮创建第一个备忘录</p>
              </div>
            </div>
          ) : view === 'grid' ? (
            <GridView />
          ) : (
            <ListView />
          )}
        </>
      )}
    </div>
  )
}
