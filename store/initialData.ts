import { Note } from './slices/notesSlice'
import { Folder } from './slices/foldersSlice'

export const initialFolders: Folder[] = [
  {
    id: '1',
    name: '工作',
    parentId: null,
    createdAt: new Date().toISOString(),
    order: 0,
    isExpanded: true,
  },
  {
    id: '2',
    name: '个人',
    parentId: null,
    createdAt: new Date().toISOString(),
    order: 1,
    isExpanded: true,
  },
]

export const initialNotes: Note[] = [
  {
    id: '1',
    title: '购物清单',
    content: '牛奶\n面包\n鸡蛋\n水果\n蔬菜',
    folderId: '2',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    isPinned: true,
    isFavorited: false,
    tags: ['购物', '生活'],
  },
  {
    id: '2',
    title: '制定计划',
    content: '1. 完成项目提案\n2. 准备会议资料\n3. 更新周报\n4. 代码审查',
    folderId: '1',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    isPinned: false,
    isFavorited: false,
    tags: ['工作', '计划'],
  },
  {
    id: '3',
    title: '会议笔记',
    content: '## 产品会议要点\n\n- 新功能讨论\n- 用户反馈整理\n- 下周任务分配\n- 技术方案评审',
    folderId: '1',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
    isPinned: false,
    isFavorited: false,
    tags: ['会议', '工作'],
  },
]