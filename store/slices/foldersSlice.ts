import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialFolders } from '../initialData'

export interface Folder {
  id: string
  name: string
  icon?: string
  parentId: string | null
  createdAt: string
  order: number
  color?: string
  isExpanded?: boolean
}

interface FoldersState {
  folders: Folder[]
  selectedFolderId: string | null
  expandedFolders: string[]
  recentFolderIds: string[]
  searchQuery: string
  sortBy: 'name' | 'modified' | 'created' | 'size' | 'manual'
  groupBy: 'none' | 'date' | 'week' | 'month' | 'year'
}

const initialState: FoldersState = {
  folders: initialFolders.map((folder, index) => ({
    ...folder,
    order: index,
    isExpanded: true,
  })),
  selectedFolderId: null,
  expandedFolders: initialFolders.map(f => f.id),
  recentFolderIds: [],
  searchQuery: '',
  sortBy: 'manual',
  groupBy: 'none',
}

const foldersSlice = createSlice({
  name: 'folders',
  initialState,
  reducers: {
    addFolder: (state, action: PayloadAction<Omit<Folder, 'id' | 'createdAt' | 'order'>>) => {
      const maxOrder = Math.max(...state.folders.map(f => f.order), -1)
      const newFolder: Folder = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        order: maxOrder + 1,
        isExpanded: true,
      }
      state.folders.push(newFolder)
      state.expandedFolders.push(newFolder.id)
    },
    updateFolder: (state, action: PayloadAction<{ id: string; updates: Partial<Folder> }>) => {
      const index = state.folders.findIndex(folder => folder.id === action.payload.id)
      if (index !== -1) {
        state.folders[index] = {
          ...state.folders[index],
          ...action.payload.updates,
        }
      }
    },
    renameFolder: (state, action: PayloadAction<{ id: string; newName: string }>) => {
      const folder = state.folders.find(f => f.id === action.payload.id)
      if (folder) {
        folder.name = action.payload.newName
      }
    },
    deleteFolder: (state, action: PayloadAction<string>) => {
      // 删除文件夹及其所有子文件夹
      const deleteFolderRecursive = (folderId: string) => {
        const childFolders = state.folders.filter(f => f.parentId === folderId)
        childFolders.forEach(child => deleteFolderRecursive(child.id))
        state.folders = state.folders.filter(f => f.id !== folderId)
        state.expandedFolders = state.expandedFolders.filter(id => id !== folderId)
        state.recentFolderIds = state.recentFolderIds.filter(id => id !== folderId)
      }

      deleteFolderRecursive(action.payload)

      if (state.selectedFolderId === action.payload) {
        state.selectedFolderId = null
      }
    },
    selectFolder: (state, action: PayloadAction<string | null>) => {
      state.selectedFolderId = action.payload
      // 添加到最近使用
      if (action.payload && !state.recentFolderIds.includes(action.payload)) {
        state.recentFolderIds = [action.payload, ...state.recentFolderIds.slice(0, 4)]
      }
    },
    toggleFolderExpanded: (state, action: PayloadAction<string>) => {
      const folderId = action.payload
      if (state.expandedFolders.includes(folderId)) {
        state.expandedFolders = state.expandedFolders.filter(id => id !== folderId)
      } else {
        state.expandedFolders.push(folderId)
      }
    },
    setFolderOrder: (state, action: PayloadAction<{ id: string; newOrder: number }>) => {
      const folder = state.folders.find(f => f.id === action.payload.id)
      if (folder) {
        folder.order = action.payload.newOrder
      }
    },
    reorderFolders: (
      state,
      action: PayloadAction<{ draggedId: string; targetId: string; position: 'before' | 'after' }>
    ) => {
      const { draggedId, targetId, position } = action.payload
      const draggedFolder = state.folders.find(f => f.id === draggedId)
      const targetFolder = state.folders.find(f => f.id === targetId)

      if (draggedFolder && targetFolder) {
        // 更新parentId如果需要
        if (draggedFolder.parentId !== targetFolder.parentId) {
          draggedFolder.parentId = targetFolder.parentId
        }

        // 重新排序
        const siblings = state.folders
          .filter(f => f.parentId === targetFolder.parentId && f.id !== draggedId)
          .sort((a, b) => a.order - b.order)

        const targetIndex = siblings.findIndex(f => f.id === targetId)
        const insertIndex = position === 'after' ? targetIndex + 1 : targetIndex

        siblings.splice(insertIndex, 0, draggedFolder)

        // 更新所有order值
        siblings.forEach((folder, index) => {
          folder.order = index
        })
      }
    },
    setFolderSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    setSortBy: (
      state,
      action: PayloadAction<'name' | 'modified' | 'created' | 'size' | 'manual'>
    ) => {
      state.sortBy = action.payload
    },
    setGroupBy: (state, action: PayloadAction<'none' | 'date' | 'week' | 'month' | 'year'>) => {
      state.groupBy = action.payload
    },
    convertToSmartFolder: (
      state,
      action: PayloadAction<{ id: string; type: string; conditions: any }>
    ) => {
      const folder = state.folders.find(f => f.id === action.payload.id)
      if (folder) {
        folder.icon = '🧠'
        // 这里可以添加更多智能文件夹的逻辑
      }
    },
  },
})

export const {
  addFolder,
  updateFolder,
  renameFolder,
  deleteFolder,
  selectFolder,
  toggleFolderExpanded,
  setFolderOrder,
  reorderFolders,
  setFolderSearchQuery,
  setSortBy,
  setGroupBy,
  convertToSmartFolder,
} = foldersSlice.actions

export default foldersSlice.reducer

// Selectors
export const selectAllFolders = (state: { folders: FoldersState }) => state.folders.folders
export const selectExpandedFolders = (state: { folders: FoldersState }) =>
  state.folders.expandedFolders
export const selectRecentFolders = (state: { folders: FoldersState }) =>
  state.folders.recentFolderIds
export const selectFolderSearchQuery = (state: { folders: FoldersState }) =>
  state.folders.searchQuery
