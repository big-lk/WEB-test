kongweiimport '../styles/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '孔维鹏 KONG WEIPENG – 工业设计/人机交互/ HCI',
  description: '感性·UI/UX',
  openGraph: {
    title: 'KONG WEIPENG-Portfolio',
    description: 'Selected works and research.',
    images: ['/og.png'],
    type: 'website',
    url: 'https://example.com'
  },
  metadataBase: new URL('https://example.com')
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <nav className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-neutral-950/70 border-b border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto max-w-5xl px-6 py-3 flex items-center justify-between">
            <a href="/" className="no-underline font-semibold">ZZZ · Portfolio</a>
            <div className="space-x-6 text-sm">
              <a href="/works" className="no-underline">Works</a>
              <a href="/research" className="no-underline">Research</a>
              <a href="/#contact" className="no-underline">Contact</a>
            </div>
          </div>
        </nav>
        {children}
        <footer className="mt-24 border-t border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-neutral-500">
            © {new Date().getFullYear()} Zhou Zizhe · Built with Next.js & Vercel
          </div>
        </footer>
      </body>
    </html>
  )
}
