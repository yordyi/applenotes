import { createAction } from '@reduxjs/toolkit'
import type { Changes } from './db'

/** Changes saved by another tab, applied to this tab's store. */
export const applyRemote = createAction<Changes>('sync/applyRemote')

/** Puts records back exactly as given, for undo / redo. */
export const applyPatch = createAction<Changes>('history/applyPatch')
