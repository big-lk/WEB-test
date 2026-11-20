import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#14161B',
        paper: '#F1EFEA',
        gold: { DEFAULT: '#A87A07', light: '#EEAF1C', soft: '#F6ECD2' },
      },
      fontFamily: {
        mono: ['"SF Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
