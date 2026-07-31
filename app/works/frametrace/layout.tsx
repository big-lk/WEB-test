import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FrameTrace｜AR 旅行摄影研究',
  description: '从 106 份概念印象问卷到 Quest 3 可测试 MVP：把公共摄影机位与私人照片记忆变成可重新进入的空间痕迹。',
  openGraph: {
    title: 'FrameTrace｜AR 旅行摄影研究',
    description: '概念研究、数据清洗、设计转向、空间交互、隐私与行走安全。',
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
