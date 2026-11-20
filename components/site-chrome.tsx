'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LanguageProvider, useLanguage } from './language-context'
import LogoMark from './logo-mark'

const navCopy = {
  en: {
    brandAlt: 'LKD logo',
    timeline: 'Timeline',
    resume: 'Resume',
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
    timeline: '歩み',
    resume: '履歴書',
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
    timeline: '时间线',
    resume: '简历',
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
  const pathname = usePathname()
  const copy = navCopy[language]
  const navLinks = [
    { href: '/works', label: copy.works },
    { href: '/timeline', label: copy.timeline },
    { href: '/research', label: copy.research },
    { href: '/resume', label: copy.resume },
    { href: '/#contact', label: copy.contact },
  ]
  const isActive = (href: string) => href !== '/#contact' && pathname?.startsWith(href)
  const seg = (on: boolean) =>
    `rounded-[9px] px-2.5 py-1.5 transition ${on ? 'bg-white text-[#14161B] shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:bg-white/15 dark:text-white' : 'text-[#74777F] hover:text-[#14161B] dark:text-neutral-400 dark:hover:text-white'}`

  return (
    <nav role="navigation" aria-label="Main navigation" className="sticky top-0 z-50 px-3 pt-3 md:px-6 md:pt-5">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-[18px] py-1.5 pl-3 pr-1.5 md:pl-4">
        <Link href="/" className="flex min-w-0 items-center gap-3 text-[#14161B] no-underline dark:text-white" aria-label={copy.brandAlt}>
          <LogoMark className="size-7 shrink-0" />
          <span className="hidden leading-tight sm:block">
            <b className="block text-[13px] font-semibold tracking-[0.04em]">孔维鹏</b>
            <span className="block font-mono text-[9.5px] tracking-[0.22em] text-[#74777F]">KONG WEIPENG</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <div className="hidden items-center gap-0.5 text-[13px] md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-[11px] px-3 py-2 no-underline transition ${isActive(link.href) ? 'bg-white/80 text-[#14161B] dark:bg-white/10 dark:text-white' : 'text-[#3A3D45] hover:bg-white/70 dark:text-neutral-300 dark:hover:bg-white/10'}`}
              >
                {link.label}
              </Link>
            ))}
            <span className="mx-1.5 h-4 w-px bg-black/10 dark:bg-white/15" />
          </div>
          <div className="flex rounded-[12px] bg-black/[0.05] p-[3px] text-[11.5px] font-medium dark:bg-white/[0.06]" aria-label={copy.languageLabel}>
            {(['zh', 'ja', 'en'] as const).map((option) => (
              <button key={option} type="button" onClick={() => setLanguage(option)} className={seg(language === option)}>
                {option === 'en' ? 'EN' : option === 'ja' ? '日' : '中'}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={copy.themeLabel}
            title={theme === 'dark' ? copy.light : copy.dark}
            className="ml-1 grid size-9 place-items-center rounded-[12px] text-[#3A3D45] transition hover:bg-white/70 dark:text-neutral-300 dark:hover:bg-white/10"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
      <div className="glass mx-auto mt-2 flex max-w-6xl justify-between gap-1 rounded-[14px] p-1 text-[12px] md:hidden">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex-1 rounded-[10px] py-1.5 text-center no-underline ${isActive(link.href) ? 'bg-white text-[#14161B] dark:bg-white/15 dark:text-white' : 'text-[#3A3D45] dark:text-neutral-300'}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

function SiteFooter() {
  const { language } = useLanguage()
  const copy = navCopy[language]
  const year = new Date().getFullYear()

  return (
    <footer className="relative mt-10 border-t border-black/[0.06] dark:border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-[12.5px] text-[#74777F] md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-center gap-3 text-[#14161B] dark:text-white">
          <LogoMark className="size-6" />
          <span className="text-[#74777F]">© {year} LKD · KONG WEIPENG</span>
        </div>
        <span className="font-mono text-[11px] tracking-[0.12em]">KANSEI PRODUCT DESIGN · HCI — {copy.built}</span>
      </div>
    </footer>
  )
}

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="paper-bg" aria-hidden="true" />
      <SiteHeader />
      {children}
      <SiteFooter />
      <div className="paper-grain" aria-hidden="true" />
    </LanguageProvider>
  )
}
