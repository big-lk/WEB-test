import '../styles/globals.css'
import type { Metadata } from 'next'
import SiteChrome from '../components/site-chrome'

const portfolioDescription = '孔维鹏的产品体验作品集：饮食记录小程序、AI 共创、AI 预测图像烤箱、冰箱产品系统、MR 摄影与驾驶 HMI。'

export const metadata: Metadata = {
  title: {
    default: '孔维鹏｜人机交互与产品体验设计',
    template: '%s ｜ LKD',
  },
  description: portfolioDescription,
  openGraph: {
    title: '孔维鹏｜产品设计作品集',
    description: portfolioDescription,
    images: ['/og-kansei.png'],
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
    description: portfolioDescription,
    images: ['/og-kansei.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased text-[#14161B] dark:text-neutral-100">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}
