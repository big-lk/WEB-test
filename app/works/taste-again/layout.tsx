import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '好久没吃｜微信小程序 UX 案例',
  description: '从 57 人形成性调研到微信小程序 MVP：记录私人味道记忆，并在合适的时候再次遇见。',
  openGraph: {
    title: '好久没吃｜微信小程序 UX 案例',
    description: '问题定义、调研数据、产品取舍、核心流程、小程序实现与上线准备。',
    images: ['/works/portfolio/haojiu-meichi-cover.png'],
  },
}

export default function TasteAgainCaseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
