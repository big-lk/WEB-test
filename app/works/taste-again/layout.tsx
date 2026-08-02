import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '好久没吃｜饮食记忆 UX 案例',
  description: '从个人饮食周期和味道线索出发，让“好久没吃了”的时刻重新进入选择。',
  openGraph: {
    title: '好久没吃｜饮食记忆 UX 案例',
    description: '吃可以是周期的，也可以是感觉的。用个人饮食记忆替代更大的推荐列表。',
    images: ['/works/portfolio/haojiu-meichi-cover.png'],
  },
}

export default function TasteAgainCaseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
