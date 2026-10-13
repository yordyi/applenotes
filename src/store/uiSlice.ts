import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  DEFAULT_FOLDER_ID,
  type FocusArea,
  type MobilePane,
  type Selection,
  type SortBy,
  type ViewMode,
} from '@/src/lib/types'
import { applyRemote } from './sync'

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
  /** Bumped when another tab changes the open note, so the editor reloads it. */
  editorRevision: number
  /** Local date (YYYY-MM-DD); changes at midnight so 今天 / 昨天 groups are redone. */
  today: string
}

export function localDay(d = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
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
  editorRevision: 0,
  today: localDay(),
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
    setToday(state, action: PayloadAction<string>) {
      state.today = action.payload
    },
    setRenamingFolder(state, action: PayloadAction<string | null>) {
      state.renamingFolderId = action.payload
    },
  },
  extraReducers: builder => {
    builder.addCase(applyRemote, (state, { payload }) => {
      const sel = state.selection
      if (sel.kind === 'folder' && payload.deleteFolderIds.includes(sel.id)) {
        state.selection = { kind: 'folder', id: DEFAULT_FOLDER_ID }
      }
      // Don't reload under the caret: while typing here, this tab's text wins.
      if (state.focus !== 'editor' && payload.putNotes.some(n => n.id === state.selectedNoteId)) {
        state.editorRevision++
      }
    })
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
  setToday,
} = uiSlice.actions
export default uiSlice.reducer
