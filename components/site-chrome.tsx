'use client'

import Link from 'next/link'
import { LanguageProvider, useLanguage } from './language-context'

const navCopy = {
  en: {
    brandAlt: 'LKD logo',
    works: 'Works',
    research: 'Research',
    contact: 'Contact',
    built: 'Built with Next.js & Vercel',
    languageLabel: 'Switch language',
    themeLabel: 'Switch theme',
    light: 'Light mode',
    dark: 'Dark mode',
  },
  ja: {
    brandAlt: 'LKD ロゴ',
    works: '作品',
    research: '研究',
    contact: '連絡',
    built: 'Next.js & Vercel で構築',
    languageLabel: '言語を切り替え',
    themeLabel: 'テーマを切り替え',
    light: 'ライトモード',
    dark: 'ダークモード',
  },
  zh: {
    brandAlt: 'LKD 标志',
    works: '作品',
    research: '研究',
    contact: '联系',
    built: '使用 Next.js & Vercel 构建',
    languageLabel: '切换语言',
    themeLabel: '切换主题',
    light: '白天模式',
    dark: '夜晚模式',
  },
}

function SunIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.2 14.4A8 8 0 0 1 9.6 3.8a8.6 8.6 0 1 0 10.6 10.6Z" />
    </svg>
  )
}

function SiteHeader() {
  const { language, setLanguage, theme, setTheme } = useLanguage()
  const copy = navCopy[language]
  const navLinks = [
    { href: '/works', label: copy.works },
    { href: '/research', label: copy.research },
    { href: '/#contact', label: copy.contact },
  ]

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="sticky top-0 z-50 border-b border-[#f7b718]/35 bg-[#fffaf0]/92 backdrop-blur-xl dark:border-[#f7b718]/30 dark:bg-neutral-950/86"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:flex-nowrap md:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3 no-underline">
          <span className="grid size-10 shrink-0 place-items-center rounded-md border border-[#f7b718]/35 bg-white p-1 shadow-sm shadow-[#f7b718]/15">
            <img src="/logo-mark.png" alt={copy.brandAlt} className="size-full object-contain" />
          </span>
          <span className="hidden truncate text-sm font-medium tracking-wide text-neutral-800 dark:text-neutral-200 sm:inline">
            KONG WEIPENG
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 md:flex-none md:gap-6">
          <div className="hidden items-center gap-5 text-sm text-neutral-700 dark:text-neutral-300 sm:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="no-underline hover:text-[#b57900] dark:hover:text-[#f7b718]">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div
              className="grid grid-cols-3 rounded-md border border-[#f7b718]/55 bg-white p-0.5 text-[11px] font-medium shadow-sm shadow-[#f7b718]/10 dark:border-[#f7b718]/35 dark:bg-neutral-900 sm:text-xs"
              aria-label={copy.languageLabel}
            >
              {(['en', 'ja', 'zh'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLanguage(option)}
                  className={`min-w-8 rounded px-2 py-1.5 transition sm:min-w-9 ${
                    language === option
                      ? 'bg-[#f7b718] text-black'
                      : 'text-neutral-500 hover:text-[#b57900] dark:hover:text-[#f7b718]'
                  }`}
                >
                  {option === 'en' ? 'EN' : option === 'ja' ? 'JP' : '中'}
                </button>
              ))}
            </div>

            <div
              className="grid grid-cols-2 rounded-md border border-[#f7b718]/55 bg-white p-0.5 text-xs font-medium shadow-sm shadow-[#f7b718]/10 dark:border-[#f7b718]/35 dark:bg-neutral-900"
              aria-label={copy.themeLabel}
            >
              <button
                type="button"
                onClick={() => setTheme('light')}
                aria-label={copy.light}
                title={copy.light}
                className={`grid size-8 place-items-center rounded transition ${
                  theme === 'light'
                    ? 'bg-[#f7b718] text-black'
                    : 'text-neutral-500 hover:text-[#b57900] dark:hover:text-[#f7b718]'
                }`}
              >
                <SunIcon />
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                aria-label={copy.dark}
                title={copy.dark}
                className={`grid size-8 place-items-center rounded transition ${
                  theme === 'dark'
                    ? 'bg-[#f7b718] text-black'
                    : 'text-neutral-500 hover:text-[#b57900] dark:hover:text-[#f7b718]'
                }`}
              >
                <MoonIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-[#f7b718]/20 px-4 py-2 sm:hidden">
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-2 text-center text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md border border-[#f7b718]/35 bg-white/60 px-3 py-2 text-neutral-800 no-underline shadow-sm shadow-[#f7b718]/5 dark:bg-neutral-900 dark:text-neutral-200"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

function SiteFooter() {
  const { language } = useLanguage()
  const copy = navCopy[language]
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[#f7b718]/30 bg-[#fffaf0] dark:border-[#f7b718]/25 dark:bg-neutral-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-md border border-[#f7b718]/30 bg-white p-1 shadow-sm shadow-[#f7b718]/10">
            <img src="/logo-mark.png" alt={copy.brandAlt} className="size-full object-contain" />
          </span>
          <span>© {year} LKD · KONG WEIPENG</span>
        </div>
        <span>{copy.built}</span>
      </div>
    </footer>
  )
}

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SiteHeader />
      {children}
      <SiteFooter />
    </LanguageProvider>
  )
}
