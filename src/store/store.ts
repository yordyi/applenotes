import { combineReducers, configureStore } from '@reduxjs/toolkit'
import notes from './notesSlice'
import folders from './foldersSlice'
import ui from './uiSlice'

const rootReducer = combineReducers({ notes, folders, ui })

export type RootState = ReturnType<typeof rootReducer>

export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({ reducer: rootReducer, preloadedState })
}

export type AppStore = ReturnType<typeof makeStore>
export type AppDispatch = AppStore['dispatch']
export type AppThunk = (dispatch: AppDispatch, getState: () => RootState) => void
