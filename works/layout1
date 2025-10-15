import '../styles/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LKD｜工业设计・人机交互（HCI）作品集',
  description: '感性设计・UI/UX・研究与作品展示',
  openGraph: {
    title: 'LKD｜作品集',
    description: '工业设计 / 人机交互（HCI）的研究与代表作品。',
    images: ['/og.png'],
    type: 'website',
    url: 'https://example.com', // 上线后改成你的 vercel 地址或自定义域名
  },
  metadataBase: new URL('https://example.com'), // 同上
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <nav className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-neutral-950/70 border-b border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto max-w-5xl px-6 py-3 flex items-center justify-between">
            <a href="/" className="no-underline font-semibold">LKD · 作品集</a>
            <div className="space-x-6 text-sm">
              <a href="/works" className="no-underline">作品</a>
              <a href="/research" className="no-underline">研究</a>
              <a href="/#contact" className="no-underline">联系</a>
            </div>
          </div>
        </nav>
        {children}
        <footer className="mt-24 border-t border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-neutral-500">
            © {new Date().getFullYear()} LKD · 构建于 Next.js & Vercel
          </div>
        </footer>
      </body>
    </html>
  )
}
