import { deriveFields } from './note'
import { DEFAULT_FOLDER_ID, type Folder, type Note } from './types'

const HOUR = 3_600_000
const DAY = 24 * HOUR

function note(
  id: string,
  folderId: string,
  html: string,
  ageMs: number,
  now: number,
  extra: Partial<Note> = {}
): Note {
  const time = new Date(now - ageMs).toISOString()
  return {
    id,
    folderId,
    html,
    ...deriveFields(html),
    isPinned: false,
    createdAt: time,
    updatedAt: time,
    deletedAt: null,
    ...extra,
  }
}

export function seedFolders(now = Date.now()): Folder[] {
  const createdAt = new Date(now - 60 * DAY).toISOString()
  return [
    { id: DEFAULT_FOLDER_ID, name: '备忘录', parentId: null, createdAt },
    { id: 'work', name: '工作', parentId: null, createdAt },
    { id: 'work-meetings', name: '会议', parentId: 'work', createdAt },
    { id: 'life', name: '生活', parentId: null, createdAt },
  ]
}

export function seedNotes(now = Date.now()): Note[] {
  return [
    note(
      'welcome',
      DEFAULT_FOLDER_ID,
      '<h1>欢迎使用备忘录</h1>' +
        '<p>首行会自动成为备忘录的标题。点按工具栏中的 <b>Aa</b> 可以设置标题、列表、块引用等格式。</p>' +
        '<ul class="checklist"><li data-checked="true">创建一条备忘录</li><li data-checked="false">试试核对清单</li><li data-checked="false">用标签（如 #灵感）整理备忘录</li></ul>' +
        '<p>按 ⌘N 新建备忘录，⇧⌘N 新建文件夹，⌘F 搜索。</p>',
      20 * 60_000,
      now,
      { isPinned: true }
    ),
    note(
      'groceries',
      'life',
      '<h1>购物清单</h1><ul class="checklist"><li data-checked="true">牛奶</li><li data-checked="false">面包</li><li data-checked="false">鸡蛋</li><li data-checked="false">时令水果</li></ul><p>#生活</p>',
      2 * HOUR,
      now
    ),
    note(
      'weekly',
      'work',
      '<h1>本周计划</h1><ol><li>完成项目提案</li><li>准备评审会议资料</li><li>更新周报</li><li>代码审查</li></ol><p>#工作</p>',
      DAY + 3 * HOUR,
      now
    ),
    note(
      'meeting',
      'work-meetings',
      '<h1>产品会议纪要</h1><h2>议题</h2><ul class="dashed"><li>新功能讨论</li><li>用户反馈整理</li><li>下周任务分配</li></ul><h3>结论</h3><blockquote>先发布搜索改进，再做协作功能。</blockquote><p>#工作 #会议</p>',
      3 * DAY,
      now
    ),
    note(
      'books',
      'life',
      '<h1>想读的书</h1><ul><li>《人类简史》</li><li>《设计心理学》</li><li>《黑客与画家》</li></ul>',
      12 * DAY,
      now
    ),
    note(
      'wifi',
      DEFAULT_FOLDER_ID,
      '<h1>家里的 Wi-Fi</h1><p>网络名称：Home-5G</p><pre>密码请看路由器背面</pre>',
      45 * DAY,
      now
    ),
  ]
}
