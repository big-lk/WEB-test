import '../styles/globals.css'
import type { Metadata } from 'next'
import SiteChrome from '../components/site-chrome'

export const metadata: Metadata = {
  title: {
    default: '孔维鹏｜人机交互与产品体验设计',
    template: '%s ｜ LKD',
  },
  description: '孔维鹏的产品体验作品集：AI 共创、智能硬件、智能汽车 HMI、个人饮食周期与 MR 摄影引导。',
  openGraph: {
    title: '孔维鹏｜产品设计作品集',
    description: '人机交互、AI 产品体验、智能硬件、智能汽车 HMI 与感性工学产品设计。',
    images: ['/og-generated.png'],
    type: 'website',
    url: '/',
  },
  metadataBase: new URL('https://lkdesigner.top'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.png',
  },
  robots: {
    index: true,
    follow: true,
  },
  twitter: {
    card: 'summary_large_image',
    title: '孔维鹏｜产品设计作品集',
    description: '人机交互、AI 产品体验、智能硬件、智能汽车 HMI 与感性工学产品设计。',
    images: ['/og-generated.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased bg-[#fffaf0] text-neutral-950 dark:bg-neutral-950 dark:text-neutral-100">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}
