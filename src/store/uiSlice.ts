import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  DEFAULT_FOLDER_ID,
  type FocusArea,
  type MobilePane,
  type Selection,
  type SortBy,
  type ViewMode,
} from '@/src/lib/types'

export interface UIState {
  selection: Selection
  selectedNoteId: string | null
  search: string
  viewMode: ViewMode
  sortBy: SortBy
  groupByDate: boolean
  sidebarVisible: boolean
  sidebarWidth: number
  listWidth: number
  collapsedFolders: string[]
  focus: FocusArea
  mobilePane: MobilePane
  /** Folder whose name is being edited inline in the sidebar. */
  renamingFolderId: string | null
  /** Gallery view: whether the selected note is open full-size. */
  galleryOpen: boolean
}

export const initialUIState: UIState = {
  selection: { kind: 'folder', id: DEFAULT_FOLDER_ID },
  selectedNoteId: null,
  search: '',
  viewMode: 'list',
  sortBy: 'edited',
  groupByDate: true,
  sidebarVisible: true,
  sidebarWidth: 220,
  listWidth: 300,
  collapsedFolders: [],
  focus: 'list',
  mobilePane: 'folders',
  renamingFolderId: null,
  galleryOpen: false,
}

export const SIDEBAR_WIDTH = { min: 160, max: 360 }
export const LIST_WIDTH = { min: 220, max: 480 }

const clamp = (v: number, r: { min: number; max: number }) => Math.min(r.max, Math.max(r.min, v))

const uiSlice = createSlice({
  name: 'ui',
  initialState: initialUIState,
  reducers: {
    select(state, action: PayloadAction<Selection>) {
      state.selection = action.payload
      state.search = ''
      state.galleryOpen = false
    },
    selectNote(state, action: PayloadAction<string | null>) {
      state.selectedNoteId = action.payload
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload
    },
    setViewMode(state, action: PayloadAction<ViewMode>) {
      state.viewMode = action.payload
      state.galleryOpen = false
    },
    setGalleryOpen(state, action: PayloadAction<boolean>) {
      state.galleryOpen = action.payload
    },
    setSortBy(state, action: PayloadAction<SortBy>) {
      state.sortBy = action.payload
    },
    setGroupByDate(state, action: PayloadAction<boolean>) {
      state.groupByDate = action.payload
    },
    toggleSidebar(state) {
      state.sidebarVisible = !state.sidebarVisible
    },
    setSidebarWidth(state, action: PayloadAction<number>) {
      state.sidebarWidth = clamp(action.payload, SIDEBAR_WIDTH)
    },
    setListWidth(state, action: PayloadAction<number>) {
      state.listWidth = clamp(action.payload, LIST_WIDTH)
    },
    toggleFolderCollapsed(state, action: PayloadAction<string>) {
      const i = state.collapsedFolders.indexOf(action.payload)
      if (i >= 0) state.collapsedFolders.splice(i, 1)
      else state.collapsedFolders.push(action.payload)
    },
    setFocus(state, action: PayloadAction<FocusArea>) {
      state.focus = action.payload
    },
    setMobilePane(state, action: PayloadAction<MobilePane>) {
      state.mobilePane = action.payload
    },
    setRenamingFolder(state, action: PayloadAction<string | null>) {
      state.renamingFolderId = action.payload
    },
  },
})

export const {
  select,
  selectNote,
  setSearch,
  setViewMode,
  setSortBy,
  setGroupByDate,
  toggleSidebar,
  setSidebarWidth,
  setListWidth,
  toggleFolderCollapsed,
  setFocus,
  setMobilePane,
  setRenamingFolder,
  setGalleryOpen,
} = uiSlice.actions
export default uiSlice.reducer
