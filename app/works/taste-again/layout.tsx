import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '好久没吃｜个人饮食周期微信小程序',
  description: '记录距上次食用天数并设定个人参考周期，帮助判断今天是否值得再次选择。',
  openGraph: {
    title: '好久没吃｜个人饮食周期微信小程序',
    description: '把距上次食用天数与个人参考周期放在一起，帮助用户判断什么时候再次选择。',
    images: ['/works/portfolio/haojiu-meichi-cover.png'],
  },
}

export default function TasteAgainCaseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
