import '../styles/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '孔维鹏 – 工业设计 / 人机交互 HCI',
  description: '感性·UI/UX·作品与研究',
  openGraph: {
    title: '孔维鹏 · 作品集',
    description: '工业设计 / 人机交互（HCI）作品与研究。',
    images: ['/og.png'],
    type: 'website',
    // 替换为你真实的网址（先用 vercel 的地址也可）
    url: 'https://你的项目名.vercel.app',
  },
  // 同上：上线后把 example.com 改成你的实际域名或 vercel 地址
  metadataBase: new URL('https://你的项目名.vercel.app'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <nav className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-neutral-950/70 border-b border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto max-w-5xl px-6 py-3 flex items-center justify-between">
            <a href="/" className="no-underline font-semibold">孔维鹏 · 作品集</a>
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
            © {new Date().getFullYear()} 孔维鹏 · 构建于 Next.js & Vercel
          </div>
        </footer>
      </body>
    </html>
  )
}
