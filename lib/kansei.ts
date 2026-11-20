import type { Language } from '../components/language-context'

/**
 * 感性向量：[温暖(+)/冷静(-), 自己做主(+)/被引导(-), 有余韵(+)/高效(-)]，范围 -1..1
 * 目前为作者根据案例描述给出的暂定值（未经调研），之后可替换为调研数据。
 * 签名语法：环的起伏次数 = 自主度 · 颗粒扩散 = 余韵 · 金色比例 = 温度
 */
export type KanseiEntry = { v: [number, number, number]; words: Record<Language, string[]>; cover?: string }

export const kansei: Record<string, KanseiEntry> = {
  'fridge-timeline': { v: [-0.2, -0.8, -0.7], words: { zh: ['有序', '安心', '联动'], ja: ['秩序', '安心', '連動'], en: ['Order', 'Reassurance', 'Linked'] } },
  'alive-energy-link': { v: [0.85, -0.3, 0.5], words: { zh: ['生命感', '安心', '联动'], ja: ['生命感', '安心', '連動'], en: ['Aliveness', 'Reassurance', 'Linked'] } },
  'smart-oven-timing': { v: [0.45, 0.45, -0.2], words: { zh: ['期待', '看得见', '自己做主'], ja: ['期待', '見える', '自分で決める'], en: ['Anticipation', 'Visible', 'Self-directed'] } },
  'co-creative-ai-training': { v: [0.1, 0.9, 0.3], cover: '/works/portfolio/ai-cocreation-steps-zh.svg', words: { zh: ['被理解', '自己做主', '信任'], ja: ['理解される', '自分で決める', '信頼'], en: ['Understood', 'Self-directed', 'Trust'] } },
  'transparent-driving-hud': { v: [-0.8, -0.45, -0.6], words: { zh: ['安心', '信任', '看得见'], ja: ['安心', '信頼', '見える'], en: ['Reassurance', 'Trust', 'Visible'] } },
  frametrace: { v: [0.5, 0.6, 0.9], words: { zh: ['直觉', '怀念', '期待'], ja: ['直感', '懐かしさ', '期待'], en: ['Intuitive', 'Nostalgia', 'Anticipation'] } },
  'taste-again': { v: [0.75, 0.85, 0.6], words: { zh: ['怀念', '节奏', '自己做主'], ja: ['懐かしさ', 'リズム', '自分で決める'], en: ['Nostalgia', 'Rhythm', 'Self-directed'] } },
  'factory-planning': { v: [-0.6, -0.6, -0.8], words: { zh: ['秩序', '安全', '效率'], ja: ['秩序', '安全', '効率'], en: ['Order', 'Safety', 'Efficiency'] } },
  'corporate-vi': { v: [-0.3, -0.2, -0.3], words: { zh: ['可信', '秩序', '识别'], ja: ['信頼', '秩序', '識別'], en: ['Credible', 'Order', 'Recognition'] } },
}

/** 首页「感性场」展示的 7 件作品（按时间） */
export const FIELD_SHORT: Record<string, Record<Language, string>> = {
  'fridge-timeline': { zh: 'Fridge Timeline', ja: 'Fridge Timeline', en: 'Fridge Timeline' },
  'alive-energy-link': { zh: 'ALIVE', ja: 'ALIVE', en: 'ALIVE' },
  'smart-oven-timing': { zh: 'AI 预测图像烤箱', ja: 'AI 予測画像オーブン', en: 'AI Preview Oven' },
  'co-creative-ai-training': { zh: 'AI 共创界面', ja: 'AI 共創インターフェース', en: 'AI Co-Creation UI' },
  'transparent-driving-hud': { zh: '驾驶 HMI', ja: '運転 HMI', en: 'Driving HMI' },
  frametrace: { zh: 'FrameTrace', ja: 'FrameTrace', en: 'FrameTrace' },
  'taste-again': { zh: '好久没吃', ja: 'Long Time No Taste', en: 'Long Time No Taste' },
}

export const FIELD_IDS = ['fridge-timeline', 'alive-energy-link', 'smart-oven-timing', 'co-creative-ai-training', 'transparent-driving-hud', 'frametrace', 'taste-again']

export function kanseiByHref(href: string): KanseiEntry | undefined {
  const map: Record<string, string> = {
    '/works/fridge-timeline': 'fridge-timeline', '/works/alive-energy-link': 'alive-energy-link', '/works/oven-state-timing': 'smart-oven-timing',
    '/works/ai-judgement': 'co-creative-ai-training', '/works/driving-attention': 'transparent-driving-hud', '/works/frametrace': 'frametrace',
    '/works/taste-again': 'taste-again', '/works/factory-planning': 'factory-planning', '/works/corporate-vi': 'corporate-vi',
  }
  return kansei[map[href] ?? '']
}
