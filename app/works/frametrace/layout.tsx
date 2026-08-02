import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FrameTrace｜MR 跨时间摄影案例',
  description: '把“这张经典照片怎么拍的”变成可行走、可对齐、可共同完成的跨时间摄影体验。',
  openGraph: {
    title: 'FrameTrace｜MR 跨时间摄影案例',
    description: '和另一个时间的人，在同一个机位完成一次共拍。',
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
