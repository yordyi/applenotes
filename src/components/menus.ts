import { displayTitle } from '@/src/lib/note'
import { DEFAULT_FOLDER_ID, type Folder, type Note, type SortBy } from '@/src/lib/types'
import {
  copyNote,
  deleteFolder,
  deleteNote,
  moveNoteTo,
  newFolder,
  restoreNote,
} from '@/src/store/actions'
import { togglePin } from '@/src/store/notesSlice'
import { selectFolderTree } from '@/src/store/selectors'
import type { AppDispatch, RootState } from '@/src/store/store'
import { setGroupByDate, setRenamingFolder, setSortBy } from '@/src/store/uiSlice'
import { confirmDialog } from './Dialog'
import type { MenuItem } from './Menu'

/** Erasing from Recently Deleted cannot be undone, so Notes asks first. */
export async function requestDelete(dispatch: AppDispatch, note: Note) {
  if (note.deletedAt) {
    const ok = await confirmDialog({
      title: `确定要删除“${displayTitle(note)}”吗？`,
      message: '此操作无法撤销。',
      confirmLabel: '删除',
      destructive: true,
    })
    if (!ok) return
  }
  dispatch(deleteNote(note.id))
}

export async function requestDeleteFolder(dispatch: AppDispatch, state: RootState, folder: Folder) {
  const count = state.notes.notes.filter(n => !n.deletedAt && n.folderId === folder.id).length
  const ok = await confirmDialog({
    title: `确定要删除文件夹“${folder.name}”吗？`,
    message: count
      ? '文件夹中的所有备忘录和子文件夹都将被删除，备忘录会移到“最近删除”。'
      : '此文件夹及其子文件夹将被删除。',
    confirmLabel: '删除',
    destructive: true,
  })
  if (ok) dispatch(deleteFolder(folder.id))
}

function folderTargets(
  state: RootState,
  onPick: (id: string) => void,
  exclude?: string
): MenuItem[] {
  return selectFolderTree(state).map(({ folder, depth }) => ({
    label: `${'　'.repeat(depth)}${folder.name}`,
    disabled: folder.id === exclude,
    onSelect: () => onPick(folder.id),
  }))
}

export function noteMenu(dispatch: AppDispatch, state: RootState, note: Note): MenuItem[] {
  if (note.deletedAt) {
    return [
      { label: '恢复', onSelect: () => dispatch(restoreNote(note.id)) },
      { label: '移到', submenu: folderTargets(state, id => dispatch(moveNoteTo(note.id, id))) },
      'separator',
      { label: '删除', onSelect: () => requestDelete(dispatch, note) },
    ]
  }
  return [
    {
      label: note.isPinned ? '取消置顶备忘录' : '置顶备忘录',
      onSelect: () => dispatch(togglePin(note.id)),
    },
    'separator',
    {
      label: '移到',
      submenu: folderTargets(state, id => dispatch(moveNoteTo(note.id, id)), note.folderId),
    },
    { label: '复制', onSelect: () => dispatch(copyNote(note.id)) },
    'separator',
    { label: '删除', onSelect: () => requestDelete(dispatch, note) },
  ]
}

export function sortMenu(dispatch: AppDispatch, state: RootState): MenuItem[] {
  const { sortBy, groupByDate } = state.ui
  const option = (value: SortBy, label: string): MenuItem => ({
    label,
    checked: sortBy === value,
    onSelect: () => dispatch(setSortBy(value)),
  })
  return [
    option('edited', '编辑日期'),
    option('created', '创建日期'),
    option('title', '标题'),
    'separator',
    {
      label: '按日期分组',
      checked: groupByDate && sortBy !== 'title',
      disabled: sortBy === 'title',
      onSelect: () => dispatch(setGroupByDate(!groupByDate)),
    },
  ]
}

export function folderMenu(dispatch: AppDispatch, state: RootState, folder: Folder): MenuItem[] {
  const builtIn = folder.id === DEFAULT_FOLDER_ID
  return [
    { label: '新建文件夹', onSelect: () => dispatch(newFolder(builtIn ? null : folder.id)) },
    'separator',
    { label: '排序方式', submenu: sortMenu(dispatch, state) },
    'separator',
    {
      label: '重新命名',
      disabled: builtIn,
      onSelect: () => dispatch(setRenamingFolder(folder.id)),
    },
    {
      label: '删除文件夹',
      disabled: builtIn,
      onSelect: () => requestDeleteFolder(dispatch, state, folder),
    },
  ]
}
