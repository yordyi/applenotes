'use client'

import dynamic from 'next/dynamic'

// 备忘录数据保存在 localStorage，只在浏览器中渲染，避免服务端与客户端内容不一致
const NotesApp = dynamic(() => import('@/src/components/NotesApp'), { ssr: false })

export default function Home() {
  return <NotesApp />
}
