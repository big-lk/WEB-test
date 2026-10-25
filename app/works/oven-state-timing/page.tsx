import type { Metadata } from 'next'
import { ConceptCasePage } from '../../../components/concept-case-page'

export const metadata: Metadata = {
  title: 'AI 预测图像烤箱｜看着成品图调时间和温度',
  description: '2024–2025 年的 AI 家电交互概念：烤箱侧边的图像屏实时生成烤制预想图，用户边调时间、温度、干燥度边看，凭直觉确定参数；附 66 人概念调研。',
}

export default function OvenStateTimingPage() {
  return <ConceptCasePage id="smart-oven-timing" />
}
