import '../styles/globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'

// 提前计算年份（构建/服务端），避免跨年水合边界
const YEAR = new Date().getFullYear()

export const metadata: Metadata = {
  title: {
    default: 'LKD｜工业设计・人机交互（HCI）作品集',
    template: '%s ｜ LKD'
  },
  description: '感性设计・UI/UX・研究与作品展示',
  openGraph: {
    title: 'LKD｜作品集',
    description: '工业设计 / 人机交互（HCI）的研究与代表作品。',
    images: ['/og.png'],
    type: 'website',
    // 有 metadataBase 时可用相对路径
    url: '/'
  },
  // 上线后改为你的实际域名
  metadataBase: new URL('https://example.com'),
  alternates: {
    canonical: '/'
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  },
  robots: {
    index: true,
    follow: true
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LKD｜作品集',
    description: '工业设计 / HCI 研究与代表作',
    images: ['/og.png']
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <nav
          role="navigation"
          aria-label="主导航"
          className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-neutral-950/70 border-b border-neutral-200 dark:border-neutral-800"
        >
          <div className="mx-auto max-w-5xl px-6 py-3 flex items-center justify-between">
            <Link href="/" className="no-underline font-semibold">
              LKD · 作品集
            </Link>
            <div className="space-x-6 text-sm">
              <Link href="/works" className="no-underline">
                作品
              </Link>
              <Link href="/research" className="no-underline">
                研究
              </Link>
              <Link href="/#contact" className="no-underline">
                联系
              </Link>
            </div>
          </div>
        </nav>

        {children}

        <footer className="mt-24 border-t border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-neutral-500">
            © {YEAR} LKD · 构建于 Next.js & Vercel
          </div>
        </footer>
      </body>
    </html>
  )
}
