import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  sidebarCollapsed: boolean
  view: 'grid' | 'list'
  sortBy: 'date' | 'title'
  showPinnedOnly: boolean
}

const initialState: UIState = {
  sidebarCollapsed: false,
  view: 'grid',
  sortBy: 'date',
  showPinnedOnly: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setView: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.view = action.payload
    },
    setSortBy: (state, action: PayloadAction<'date' | 'title'>) => {
      state.sortBy = action.payload
    },
    toggleShowPinnedOnly: (state) => {
      state.showPinnedOnly = !state.showPinnedOnly
    },
  },
})

export const { toggleSidebar, setView, setSortBy, toggleShowPinnedOnly } = uiSlice.actions
export default uiSlice.reducer