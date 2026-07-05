'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Language = 'en' | 'ja' | 'zh'
export type Theme = 'system' | 'light' | 'dark'

type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  theme: Theme
  setTheme: (theme: Theme) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Theme and language should still work in restricted preview contexts.
  }
}

function documentLanguage(language: Language) {
  if (language === 'ja') return 'ja'
  if (language === 'zh') return 'zh-CN'
  return 'en'
}

function resolveTheme(theme: Theme) {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', resolveTheme(theme) === 'dark')
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [theme, setThemeState] = useState<Theme>('system')

  useEffect(() => {
    const saved = readStorage('lkd-language')
    if (saved === 'en' || saved === 'ja' || saved === 'zh') {
      setLanguageState(saved)
      document.documentElement.lang = documentLanguage(saved)
    }

    const savedTheme = readStorage('lkd-theme')
    const nextTheme = savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system' ? savedTheme : 'system'
    setThemeState(nextTheme)
    applyTheme(nextTheme)

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const syncSystemTheme = () => {
      if (readStorage('lkd-theme') !== 'light' && readStorage('lkd-theme') !== 'dark') {
        applyTheme('system')
      }
    }
    media.addEventListener('change', syncSystemTheme)
    return () => media.removeEventListener('change', syncSystemTheme)
  }, [])

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage)
    document.documentElement.lang = documentLanguage(nextLanguage)
    writeStorage('lkd-language', nextLanguage)
  }

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme)
    applyTheme(nextTheme)
    writeStorage('lkd-theme', nextTheme)
  }

  const value = useMemo(() => ({ language, setLanguage, theme, setTheme }), [language, theme])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
