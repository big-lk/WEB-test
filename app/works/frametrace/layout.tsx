import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FrameTrace 跨时间摄影引导｜MR 案例',
  description: '从 106 份概念印象问卷到 Quest 3 原型计划：探索公共摄影机位、私人照片记忆与跨时间共同摄影体验。',
  openGraph: {
    title: 'FrameTrace 跨时间摄影引导｜MR 案例',
    description: '概念研究、数据清洗、设计转向、空间共创、隐私与行走安全。',
    images: ['/works/frametrace/hero.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/works/frametrace/hero.jpg'],
  },
}

export default function FrameTraceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
