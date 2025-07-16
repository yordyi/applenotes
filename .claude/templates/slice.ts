import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// Define the state interface
export interface {{SliceName}}State {
  // Add state properties here
  isLoading: boolean
  error: string | null
  data: any[]
}

// Define the initial state
const initialState: {{SliceName}}State = {
  isLoading: false,
  error: null,
  data: [],
}

// Create the slice
const {{sliceName}}Slice = createSlice({
  name: '{{sliceName}}',
  initialState,
  reducers: {
    // Add synchronous actions here
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setData: (state, action: PayloadAction<any[]>) => {
      state.data = action.payload
    },
    // Add more actions as needed
    addItem: (state, action: PayloadAction<any>) => {
      state.data.push(action.payload)
    },
    updateItem: (state, action: PayloadAction<{ id: string; updates: Partial<any> }>) => {
      const index = state.data.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.data[index] = {
          ...state.data[index],
          ...action.payload.updates,
          updatedAt: new Date().toISOString(),
        }
      }
    },
    deleteItem: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter(item => item.id !== action.payload)
    },
  },
})

// Export actions
export const {
  setLoading,
  setError,
  setData,
  addItem,
  updateItem,
  deleteItem,
} = {{sliceName}}Slice.actions

// Export reducer
export default {{sliceName}}Slice.reducer

// Selectors
export const select{{SliceName}} = (state: { {{sliceName}}: {{SliceName}}State }) => state.{{sliceName}}
export const select{{SliceName}}Data = (state: { {{sliceName}}: {{SliceName}}State }) => state.{{sliceName}}.data
export const select{{SliceName}}Loading = (state: { {{sliceName}}: {{SliceName}}State }) => state.{{sliceName}}.isLoading
export const select{{SliceName}}Error = (state: { {{sliceName}}: {{SliceName}}State }) => state.{{sliceName}}.error