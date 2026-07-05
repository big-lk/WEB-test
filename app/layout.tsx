import '../styles/globals.css'
import type { Metadata } from 'next'
import SiteChrome from '../components/site-chrome'

export const metadata: Metadata = {
  title: {
    default: 'LKD｜工业设计・人机交互（HCI）作品集',
    template: '%s ｜ LKD',
  },
  description: '感性设计・UI/UX・研究与作品展示',
  openGraph: {
    title: 'LKD｜作品集',
    description: '工业设计 / 人机交互（HCI）的研究与代表作品。',
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
    title: 'LKD｜作品集',
    description: '工业设计 / HCI 研究与代表作',
    images: ['/og-generated.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-[#fffaf0] text-neutral-950 dark:bg-neutral-950 dark:text-neutral-100">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}
