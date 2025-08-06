'use client'

import React, { useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { setSearchQuery, addNote } from '@/store/slices/notesSlice'
import { selectFolder } from '@/store/slices/foldersSlice'

interface SidebarContentProps {
  isCollapsed: boolean
}

export function SidebarContent({ isCollapsed }: SidebarContentProps) {
  const dispatch = useAppDispatch()
  const { searchQuery, notes } = useAppSelector(state => state.notes)
  const { selectedFolderId } = useAppSelector(state => state.folders)

  // 统计数据
  const totalNotes = notes.length
  const recentNotes = notes.filter(note => {
    const dayAgo = new Date()
    dayAgo.setDate(dayAgo.getDate() - 1)
    return new Date(note.updatedAt) > dayAgo
  }).length
  const pinnedNotes = notes.filter(note => note.isPinned).length
  const taggedNotes = notes.filter(note => note.tags && note.tags.length > 0).length

  // 快速访问项目
  const quickAccessItems = [
    {
      id: 'all',
      label: '全部备忘录',
      icon: '📁',
      color: '#007AFF',
      count: totalNotes,
    },
    {
      id: 'recent',
      label: '最近使用',
      icon: '🕐',
      color: '#FF9500',
      count: recentNotes,
    },
    {
      id: 'pinned',
      label: '置顶备忘录',
      icon: '📌',
      color: '#FFCC00',
      count: pinnedNotes,
    },
    {
      id: 'starred',
      label: '收藏',
      icon: '⭐',
      color: '#AF52DE',
      count: 0,
    },
    {
      id: 'tagged',
      label: '标签',
      icon: '🏷️',
      color: '#34C759',
      count: taggedNotes,
    },
  ]

  // iCloud项目
  const iCloudItems = [
    {
      id: 'icloud-all',
      label: 'iCloud全部备忘录',
      icon: '☁️',
      count: totalNotes,
    },
    {
      id: 'notes',
      label: '备忘录',
      icon: '📄',
      count: totalNotes,
    },
  ]

  if (isCollapsed) {
    return (
      <div className="h-full flex flex-col" style={{ backgroundColor: '#f5f5f7' }}>
        {/* 搜索图标 */}
        <div className="p-2 border-b border-gray-200">
          <button className="w-full p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg
              className="w-4 h-4 text-gray-400 mx-auto"
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
          </button>
        </div>

        {/* 折叠状态的快速访问 */}
        <div className="flex-1 p-2 space-y-1">
          {quickAccessItems.map(item => (
            <button
              key={item.id}
              onClick={() => dispatch(selectFolder(item.id))}
              className={`w-full p-2 rounded-lg transition-colors flex items-center justify-center ${
                selectedFolderId === item.id ? 'bg-yellow-200' : 'hover:bg-gray-100'
              }`}
              title={item.label}
            >
              <span className="text-base">{item.icon}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#f5f5f7' }}>
      {/* 搜索框 */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
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
          <input
            type="text"
            placeholder="搜索"
            value={searchQuery}
            onChange={e => dispatch(setSearchQuery(e.target.value))}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto">
        {/* 快速访问区域 */}
        <div className="p-4 space-y-1">
          {quickAccessItems.map(item => (
            <button
              key={item.id}
              onClick={() => dispatch(selectFolder(item.id))}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                selectedFolderId === item.id ? 'bg-yellow-200' : 'hover:bg-gray-100'
              }`}
              style={{ height: '36px' }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-base" style={{ color: item.color }}>
                  {item.icon}
                </span>
                <span className="text-sm font-medium text-gray-800">{item.label}</span>
              </div>
              <span className="text-xs text-gray-500 font-medium">{item.count}</span>
            </button>
          ))}
        </div>

        {/* iCloud分组 */}
        <div className="px-4 pb-4">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-4">
            iCloud
          </h2>
          <div className="space-y-1">
            {iCloudItems.map(item => (
              <button
                key={item.id}
                onClick={() => dispatch(selectFolder(item.id))}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                  selectedFolderId === item.id ? 'bg-yellow-200' : 'hover:bg-gray-100'
                }`}
                style={{ height: '36px' }}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-base text-gray-600">{item.icon}</span>
                  <span className="text-sm font-medium text-gray-800">{item.label}</span>
                </div>
                <span className="text-xs text-gray-500 font-medium">{item.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 文件夹区域 */}
        <div className="px-4 pb-4">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-4">
            文件夹
          </h2>
          <div className="space-y-1">
            {/* 示例文件夹 */}
            <button
              onClick={() => dispatch(selectFolder('work'))}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                selectedFolderId === 'work' ? 'bg-yellow-200' : 'hover:bg-gray-100'
              }`}
              style={{ height: '36px' }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-base text-gray-600">📁</span>
                <span className="text-sm font-medium text-gray-800">工作</span>
              </div>
              <span className="text-xs text-gray-500 font-medium">0</span>
            </button>

            <button
              onClick={() => dispatch(selectFolder('personal'))}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                selectedFolderId === 'personal' ? 'bg-yellow-200' : 'hover:bg-gray-100'
              }`}
              style={{ height: '36px' }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-base text-gray-600">📁</span>
                <span className="text-sm font-medium text-gray-800">个人</span>
              </div>
              <span className="text-xs text-gray-500 font-medium">0</span>
            </button>
          </div>
        </div>
      </div>

      {/* 底部新建按钮 */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => {
            dispatch(
              addNote({
                title: '新建备忘录',
                content: '',
                folderId:
                  selectedFolderId === 'all' ||
                  selectedFolderId === 'recent' ||
                  selectedFolderId === 'pinned' ||
                  selectedFolderId === 'starred' ||
                  selectedFolderId === 'tagged'
                    ? null
                    : selectedFolderId,
                isPinned: false,
                tags: [],
              })
            )
          }}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm font-medium">新建备忘录</span>
        </button>
      </div>
    </div>
  )
}
