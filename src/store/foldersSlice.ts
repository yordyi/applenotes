import { createSlice, isAnyOf, type PayloadAction } from '@reduxjs/toolkit'
import { newId } from '@/src/lib/note'
import { DEFAULT_FOLDER_ID, type Folder } from '@/src/lib/types'
import { applyPatch, applyRemote } from './sync'

export interface FoldersState {
  folders: Folder[]
}

const initialState: FoldersState = { folders: [] }

/** The folder and all of its descendants. */
export function folderSubtree(folders: Folder[], id: string): string[] {
  const ids = [id]
  for (let i = 0; i < ids.length; i++) {
    for (const f of folders) if (f.parentId === ids[i]) ids.push(f.id)
  }
  return ids
}

/** "新建文件夹", "新建文件夹 2", ... like Finder and Notes. */
export function nextFolderName(folders: Folder[], base = '新建文件夹'): string {
  const names = new Set(folders.map(f => f.name))
  if (!names.has(base)) return base
  let i = 2
  while (names.has(`${base} ${i}`)) i++
  return `${base} ${i}`
}

const foldersSlice = createSlice({
  name: 'folders',
  initialState,
  reducers: {
    createFolder: {
      reducer(state, action: PayloadAction<Folder>) {
        state.folders.push(action.payload)
      },
      prepare(input: { name: string; parentId: string | null; id?: string }) {
        return {
          payload: {
            id: input.id ?? newId(),
            name: input.name,
            parentId: input.parentId,
            createdAt: new Date().toISOString(),
          },
        }
      },
    },
    renameFolder(state, action: PayloadAction<{ id: string; name: string }>) {
      const folder = state.folders.find(f => f.id === action.payload.id)
      const name = action.payload.name.trim()
      if (folder && name && folder.id !== DEFAULT_FOLDER_ID) folder.name = name
    },
    /** Removes the folder and its subfolders. Their notes are trashed by the caller. */
    removeFolder(state, action: PayloadAction<string>) {
      if (action.payload === DEFAULT_FOLDER_ID) return
      const ids = new Set(folderSubtree(state.folders, action.payload))
      state.folders = state.folders.filter(f => !ids.has(f.id))
    },
  },
  extraReducers: builder => {
    builder.addMatcher(isAnyOf(applyRemote, applyPatch), (state, { payload }) => {
      for (const folder of payload.putFolders) {
        const i = state.folders.findIndex(f => f.id === folder.id)
        if (i < 0) state.folders.push(folder)
        else state.folders[i] = folder
      }
      if (payload.deleteFolderIds.length) {
        const gone = new Set(payload.deleteFolderIds)
        state.folders = state.folders.filter(f => !gone.has(f.id))
      }
    })
  },
})

export const { createFolder, renameFolder, removeFolder } = foldersSlice.actions
export default foldersSlice.reducer
