import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '时间线',
  description: '从工业设计本科到人机交互硕士：学过的专业课、做过的作品与关键节点。',
}

export default function TimelineLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
