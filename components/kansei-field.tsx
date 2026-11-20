'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLanguage, type Language } from './language-context'
import LogoMark from './logo-mark'
import { getOrderedPortfolioWorks } from '../lib/portfolio-data'
import { FIELD_IDS, FIELD_SHORT, kansei } from '../lib/kansei'
import { LOGO_SVG } from '../lib/logo-paths'
import { VERT, FRAG } from '../lib/field-shaders'

type HeroCopy = { eyebrow: string; title: string; role: string; intro: string; primary: string; secondary: string; status: string }

const FC: Record<Language, {
  stir: string; tags: string[]; rail: [string, string]; scroll: string
  s1: [string, string, string, string, string]; s2: [string, string, string, string, string]
  panelEyebrow: string; panelTitle: string; panelSub: string; poles: [string, string][]; enc: [string, string, string]; youIdle: string; youDone: string; go: string
  legendTitle: string; legend: string; legend2: string; warm: string; agency: string; linger: string; click: string; nogl: string
}> = {
  zh: {
    stir: '试着搅动它', tags: ['产品经理', '交互设计', '感性工学', '智能硬件', '汽车 HMI'], rail: ['介绍', '感性场'], scroll: '滚动',
    s1: ['01 / 映射', '感性工学，是把感受', '翻译', '成形状。', '同一团粒子散成 7 件作品，每件的形态都由它的感性向量算出来——不是画出来的。'],
    s2: ['02 / 潜在关系', '作品之间，有看不见的', '流', '。', '共享同一个感性词的作品之间有粒子流动：2022 年的冰箱和 2025 年的驾驶 HMI，在回应同一种「安心」。'],
    panelEyebrow: 'SD · 你的感性签名', panelTitle: '拖动三根量表', panelSub: '散落的尘埃会按同一套语法，凝聚成属于你的形状。',
    poles: [['冷静', '温暖'], ['被引导', '自己做主'], ['高效', '有余韵']], enc: ['金色比例', '环的起伏', '颗粒扩散'],
    youIdle: '移动任意一根量表，生成你的签名。', youDone: '你的签名已在中心成形。与它最接近的作品——', go: '去看这个作品 →',
    legendTitle: '签名语法', legend: '环的起伏次数 = 自主度 · 颗粒扩散 = 余韵 · 金色比例 = 温度', legend2: '作品之间的流 = 共享的感性词',
    warm: '温暖', agency: '自主', linger: '余韵', click: '点击进入案例 →', nogl: '当前浏览器不支持 WebGL，已显示静态版本。',
  },
  ja: {
    stir: 'かき混ぜてみて', tags: ['プロダクトマネージャー', 'インタラクションデザイン', '感性工学', 'スマートハードウェア', '車載 HMI'], rail: ['紹介', '感性場'], scroll: 'スクロール',
    s1: ['01 / 写像', '感性工学とは、感じたことを', '形', 'に訳すこと。', '同じ粒子が 7 つの作品に分かれ、それぞれの形は感性ベクトルから計算されます。'],
    s2: ['02 / 潜在的な関係', '作品のあいだには、見えない', '流れ', 'がある。', '同じ感性語を共有する作品のあいだを粒子が流れます。'],
    panelEyebrow: 'SD · あなたの感性シグネチャ', panelTitle: '3 本の尺度を動かす', panelSub: '散らばった粒子が同じ文法で、あなたの形に集まります。',
    poles: [['冷静', '温かい'], ['導かれる', '自分で決める'], ['効率的', '余韻がある']], enc: ['金色の割合', '環の起伏', '粒子の広がり'],
    youIdle: 'どれか 1 本を動かすと、あなたのシグネチャが生まれます。', youDone: 'シグネチャが中心にできました。いちばん近い作品——', go: 'この作品を見る →',
    legendTitle: 'シグネチャの文法', legend: '環の起伏 = 自律度 · 粒子の広がり = 余韻 · 金色の割合 = 温かさ', legend2: '作品間の流れ = 共有する感性語',
    warm: '温かさ', agency: '自律', linger: '余韻', click: 'クリックで事例へ →', nogl: 'このブラウザは WebGL に対応していないため、静的版を表示しています。',
  },
  en: {
    stir: 'Try stirring it', tags: ['Product Manager', 'Interaction Design', 'Kansei Engineering', 'Smart Hardware', 'Automotive HMI'], rail: ['Intro', 'Kansei field'], scroll: 'Scroll',
    s1: ['01 / Mapping', 'Kansei engineering ', 'translates', ' feeling into form.', 'One cloud of particles becomes 7 works — each shape computed from its kansei vector, not drawn.'],
    s2: ['02 / Latent links', 'Between the works runs an unseen ', 'flow', '.', 'Works that share a kansei word exchange particles: a 2022 fridge and a 2025 driving HMI answer the same need for reassurance.'],
    panelEyebrow: 'SD · YOUR KANSEI SIGNATURE', panelTitle: 'Move the three scales', panelSub: 'Scattered dust gathers into your own shape, using the same grammar.',
    poles: [['Calm', 'Warm'], ['Guided', 'Self-directed'], ['Efficient', 'Lingering']], enc: ['Gold ratio', 'Ring waves', 'Spread'],
    youIdle: 'Move any scale to generate your signature.', youDone: 'Your signature has formed. The closest work —', go: 'See this work →',
    legendTitle: 'Signature grammar', legend: 'Ring waves = agency · Spread = lingering · Gold ratio = warmth', legend2: 'Flows between works = shared kansei words',
    warm: 'Warm', agency: 'Agency', linger: 'Linger', click: 'Click to open the case →', nogl: 'WebGL is not available; showing the static version.',
  },
}

const COVER_FALLBACK: Record<string, string> = {
  'co-creative-ai-training': '/works/portfolio/generated/ai-cocreation-chat-v2.png',
}

export default function KanseiField({ hero }: { hero: HeroCopy }) {
  const { language } = useLanguage()
  const c = FC[language]
  const wrapRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const labelRefs = useRef<(HTMLDivElement | null)[]>([])
  const stirRef = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState(0)
  const [morph, setMorph] = useState(0)
  const [hovered, setHovered] = useState(-1)
  const [noGL, setNoGL] = useState(false)
  const [you, setYou] = useState<[number, number, number] | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const youRef = useRef<[number, number, number]>([0, 0, 0])
  const youOnRef = useRef(false)

  const works = useMemo(() => {
    const all = getOrderedPortfolioWorks(language)
    return FIELD_IDS.map((id) => {
      const w = all.find((x) => x.id === id)!
      const k = kansei[id]
      return { id, title: FIELD_SHORT[id]?.[language] ?? id, full: w?.title ?? id, year: w?.year ?? '', href: w?.href ?? '/works', desc: w?.description ?? '', v: k.v, words: k.words[language], cover: k.cover ?? COVER_FALLBACK[id] ?? w?.image ?? '' }
    })
  }, [language])
  const worksRef = useRef(works); worksRef.current = works

  const nearest = useMemo(() => {
    if (!you) return null
    const sc = works.map((w, i) => ({ i, d: Math.hypot(w.v[0] - you[0], w.v[1] - you[1], w.v[2] - you[2]) })).sort((a, b) => a.d - b.d)[0]
    return { i: sc.i, pct: Math.round(Math.max(0, 1 - sc.d / 3.4) * 100) }
  }, [you, works])
  const nearestRef = useRef<number>(-1); nearestRef.current = nearest?.i ?? -1

  useEffect(() => {
    let disposed = false, raf = 0
    let cleanup = () => {}
    ;(async () => {
      const THREE = await import('three')
      const canvas = canvasRef.current
      if (!canvas || disposed) return
      let renderer: InstanceType<typeof THREE.WebGLRenderer>
      try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' }) } catch { setNoGL(true); return }
      const mobile = window.matchMedia('(max-width: 900px)').matches
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const PR = Math.min(window.devicePixelRatio, 2); renderer.setPixelRatio(PR)
      const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
      const COUNT = mobile ? 26000 : 56000
      const NW = FIELD_IDS.length
      const ws = worksRef.current

      // —— logo 采样 ——
      const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(LOGO_SVG); await img.decode()
      const SS = 320, cv = document.createElement('canvas'); cv.width = cv.height = SS; const cx = cv.getContext('2d')!; cx.drawImage(img, 0, 0, SS, SS)
      const d = cx.getImageData(0, 0, SS, SS).data, ink: number[][] = [], gold: number[][] = []
      for (let j = 0; j < SS; j++) for (let i = 0; i < SS; i++) { const k = (j * SS + i) * 4; if (d[k + 3] < 128) continue; const r = d[k], g = d[k + 1], b = d[k + 2]
        if (r < 60 && g < 60 && b < 60) ink.push([i, j]); else if (r > 200 && g > 140 && g < 200 && b < 90) gold.push([i, j]) }
      const pos = new Float32Array(COUNT * 3), type = new Float32Array(COUNT), rnd = new Float32Array(COUNT * 4), grp = new Float32Array(COUNT), tt = new Float32Array(COUNT), pr = new Float32Array(COUNT * 2), uv = new Float32Array(COUNT * 2)
      const pairs: { a: number; b: number }[] = []
      for (let a = 0; a < NW; a++) for (let b = a + 1; b < NW; b++) if (kansei[FIELD_IDS[a]].words.zh.some((x) => kansei[FIELD_IDS[b]].words.zh.includes(x))) pairs.push({ a, b })
      const nStream = Math.floor(COUNT * 0.13), nYou = Math.floor(COUNT * 0.1), nSig = COUNT - nStream - nYou
      for (let p = 0; p < COUNT; p++) {
        const isG = Math.random() < 0.36, src = isG ? gold : ink, q = src[(Math.random() * src.length) | 0]
        pos[p * 3] = (q[0] + Math.random() - SS / 2) / SS * 3.2; pos[p * 3 + 1] = -(q[1] + Math.random() - SS / 2) / SS * 3.2; pos[p * 3 + 2] = (Math.random() - 0.5) * (isG ? 0.42 : 0.32) + (isG ? 0.1 : 0); type[p] = isG ? 1 : 0
        for (let k = 0; k < 4; k++) rnd[p * 4 + k] = Math.random(); tt[p] = Math.random()
        if (p < nSig) grp[p] = p % NW; else if (p < nSig + nYou) grp[p] = 7; else { grp[p] = 8; const pp = pairs[p % pairs.length]; pr[p * 2] = pp.a; pr[p * 2 + 1] = pp.b }
      }
      const gs = Math.ceil(Math.sqrt(COUNT * 1.6)), gh = Math.ceil(COUNT / gs)
      const order = Array.from({ length: COUNT }, (_, i) => i).sort(() => Math.random() - 0.5)
      order.forEach((p, n) => { uv[p * 2] = ((n % gs) + Math.random()) / gs; uv[p * 2 + 1] = (((n / gs) | 0) + Math.random()) / gh })
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aLogo', new THREE.BufferAttribute(pos, 3))
      geo.setAttribute('aType', new THREE.BufferAttribute(type, 1)); geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 4))
      geo.setAttribute('aGroup', new THREE.BufferAttribute(grp, 1)); geo.setAttribute('aT', new THREE.BufferAttribute(tt, 1))
      geo.setAttribute('aPair', new THREE.BufferAttribute(pr, 2)); geo.setAttribute('aUV', new THREE.BufferAttribute(uv, 2))
      const uK = [...ws.map((w) => new THREE.Vector3(...w.v)), new THREE.Vector3()], uC = Array.from({ length: 8 }, () => new THREE.Vector3())
      const U: Record<string, { value: any }> = { uTime: { value: 0 }, uMorph: { value: 0 }, uSize: { value: mobile ? 2.4 : 2.1 }, uPR: { value: PR }, uYou: { value: 0 }, uFocus: { value: -1 }, uFocusAmt: { value: 0 },
        uTurb: { value: 0.03 }, uLinger: { value: 0 }, uWarmAll: { value: 0.5 }, uMouse: { value: new THREE.Vector3(99, 99, 0) }, uMouseAmt: { value: 0 }, uK: { value: uK }, uC: { value: uC },
        uImg: { value: 0 }, uImgG: { value: -1 }, uImgAsp: { value: 1.6 }, uImgW: { value: 3.9 }, uCover: { value: null }, uImgC: { value: new THREE.Vector3() }, uLogoOff: { value: new THREE.Vector3() }, uLogoS: { value: 1 }, uPort: { value: 0 }, uDark: { value: 0 } }
      const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false })
      const points = new THREE.Points(geo, mat); points.frustumCulled = false; scene.add(points)
      // 封面贴图
      const tl = new THREE.TextureLoader(); const covers: any[] = []
      ws.forEach((w, i) => { if (!w.cover) return; tl.load(w.cover, (t) => { t.colorSpace = THREE.NoColorSpace; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; (t as any).asp = t.image.width / t.image.height; covers[i] = t }) })

      // —— 交互 ——
      const mouse = new THREE.Vector2(9, 9); let lastMove = 0, mouseAct = 0, dragging = false, lx = 0, yaw = 0, yawV = 0, hovIdx = -1, hoverT = 0, focusAmt = 0, youOn = 0
      const onMove = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); mouse.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); lastMove = performance.now()
        if (dragging) { const dx = e.clientX - lx; lx = e.clientX; if (U.uMorph.value > 0.5) { yawV = dx * 0.0035; yaw += yawV } } }
      const onDown = (e: PointerEvent) => { dragging = true; lx = e.clientX; downAt = [e.clientX, e.clientY] }
      let downAt = [0, 0]
      const onUp = (e: PointerEvent) => { dragging = false; if (Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) < 5 && hovIdx >= 0 && U.uMorph.value > 0.7) window.location.href = worksRef.current[hovIdx].href }
      canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerdown', onDown); window.addEventListener('pointerup', onUp)
      const onLeave = () => mouse.set(9, 9); canvas.addEventListener('pointerleave', onLeave)

      let fitD = 10, port = false
      const resize = () => { const r = canvas.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); port = camera.aspect < 1
        const t = Math.tan(THREE.MathUtils.degToRad(16)); fitD = Math.max(3.2 / t, (port ? 3.4 : 6.0) / (t * camera.aspect)) }
      resize(); const ro = new ResizeObserver(resize); ro.observe(canvas)

      const clock = new THREE.Clock(), v = new THREE.Vector3(), ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3()
      let m = 0, cmx = 0, cmy = 0, t0 = 0, lastStage = -1, lastHov = -2, lastMorphReport = -1, k0 = 0
      const loop = () => {
        raf = requestAnimationFrame(loop)
        const t = clock.getElapsedTime(), dt = Math.min(t - t0, 0.05); t0 = t
        // 滚动进度
        const wrap = wrapRef.current; if (!wrap) return
        const rect = wrap.getBoundingClientRect(); const prog = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - window.innerHeight)))
        if (rect.bottom < 0 || rect.top > window.innerHeight) return
        const mT = Math.min(1, prog / 0.38)
        m += (mT - m) * Math.min(1, dt * 2.6)
        const st = m < 0.35 ? 0 : prog < 0.7 ? 1 : 2
        if (st !== lastStage) { setStage(st); lastStage = st }
        if (Math.abs(m - lastMorphReport) > 0.02) { setMorph(m); lastMorphReport = m }
        U.uDark.value = document.documentElement.classList.contains('dark') ? 1 : 0
        if (!dragging && !reduce) { yaw += yawV; yawV *= 0.95; if (m > 0.6) yaw += dt * 0.04 }
        const y3 = youRef.current, yt = youOnRef.current
        U.uLinger.value = yt ? y3[2] : 0; U.uTurb.value = reduce ? 0 : 0.03 + (yt ? (y3[1] + 1) / 2 * 0.05 : 0.02)
        youOn += ((yt && m > 0.5 ? 1 : 0) - youOn) * Math.min(1, dt * 1.6); U.uYou.value = youOn; uK[7].set(y3[0], y3[1], y3[2])
        // 首屏：logo 在右
        k0 = Math.min(1, m * 3); const ke = k0 * k0 * (3 - 2 * k0)
        U.uLogoOff.value.set(port ? 0 : (1 - ke) * 2.35, port ? (1 - ke) * -1.75 : 0, 0); U.uLogoS.value = port ? 0.85 + 0.15 * ke : 1
        const ringR = port ? 1.9 : 2.35
        for (let i = 0; i < NW; i++) { const a = yaw + i / NW * Math.PI * 2 - Math.PI / 2; uC[i].set(Math.cos(a) * ringR, Math.sin(a) * ringR * 0.66 + (port ? 0.2 : 0), Math.sin(a) * 1.6) }
        uC[7].set(0, port ? 0.2 : 0, 0)
        cmx += ((mouse.x > 5 ? 0 : mouse.x) - cmx) * 0.04; cmy += ((mouse.y > 5 ? 0 : mouse.y) - cmy) * 0.04
        camera.position.set(cmx * 0.9, cmy * 0.5 + 0.2, fitD); camera.lookAt(0, 0, 0)
        ray.setFromCamera(mouse, camera); if (ray.ray.intersectPlane(plane, hit)) U.uMouse.value.lerp(hit, 0.25)
        const moving = performance.now() - lastMove < 180 ? 1 : 0; mouseAct += (moving - mouseAct) * 0.08; U.uMouseAmt.value = mouseAct * (reduce ? 0 : 1) * (m > 0.6 ? 0.45 : 1)
        if (stirRef.current) { v.set(port ? 0 : 2.35, port ? -1.25 : 0, 0).project(camera); stirRef.current.style.transform = `translate(${(v.x * 0.5 + 0.5) * canvas.clientWidth - 40}px,${(-v.y * 0.5 + 0.5) * canvas.clientHeight + canvas.clientHeight * 0.25}px)`; stirRef.current.style.opacity = m < 0.05 && mouseAct < 0.3 ? '1' : '0' }
        // 悬停签名
        let best = -1, bd = 1e9
        if (m > 0.7 && mouse.x < 5) for (let i = 0; i < NW; i++) { v.copy(uC[i]).project(camera); const dd = Math.hypot((v.x - mouse.x) * canvas.clientWidth / 2, (v.y - mouse.y) * canvas.clientHeight / 2); if (dd < Math.min(90, canvas.clientWidth * 0.08) && dd < bd) { bd = dd; best = i } }
        hovIdx = best; if (best !== lastHov) { setHovered(best); lastHov = best; canvas.style.cursor = best >= 0 ? 'pointer' : 'grab' }
        hoverT = best >= 0 ? hoverT + dt : 0
        const imgOn = best >= 0 && hoverT > 0.25 && m > 0.8 && !!covers[best]
        if (U.uImg.value < 0.02 && best >= 0 && covers[best] && U.uImgG.value !== best) { U.uImgG.value = best; const tx = covers[best]; U.uCover.value = tx; const asp = tx.asp, maxW = port ? 3.2 : 4.4, maxH = port ? 2.3 : 2.6; U.uImgW.value = Math.min(maxW, maxH * asp); U.uImgAsp.value = asp }
        U.uImg.value += ((imgOn && U.uImgG.value === best ? 1 : 0) - U.uImg.value) * Math.min(1, dt * (imgOn ? 1.8 : 3.2))
        U.uImgC.value.set(0, 0.1, 1.0); U.uPort.value = port ? 1 : 0
        const fi = best >= 0 ? best : youOn > 0.5 && nearestRef.current >= 0 ? nearestRef.current : -1
        if (fi >= 0) U.uFocus.value = fi; focusAmt += ((fi >= 0 ? (best >= 0 ? 1 : 0.35) : 0) - focusAmt) * 0.1; U.uFocusAmt.value = focusAmt
        labelRefs.current.forEach((el, i) => { if (!el) return; v.copy(uC[i]); v.y -= 0.62; v.project(camera)
          el.style.transform = `translate(-50%,0) translate(${((v.x * 0.5 + 0.5) * canvas.clientWidth).toFixed(1)}px,${((-v.y * 0.5 + 0.5) * canvas.clientHeight).toFixed(1)}px)`
          el.style.opacity = String(Math.max(0, (m - 0.75) / 0.25) * (best >= 0 && best !== i ? 0.3 : 1) * (1 - U.uImg.value * 0.7)) })
        U.uTime.value = t * (reduce ? 0 : 1) * (1 - (yt ? y3[2] : 0) * 0.35); U.uMorph.value = m
        renderer.render(scene, camera)
      }
      raf = requestAnimationFrame(loop)
      cleanup = () => { cancelAnimationFrame(raf); ro.disconnect(); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerdown', onDown); window.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointerleave', onLeave); geo.dispose(); mat.dispose(); renderer.dispose() }
    })()
    return () => { disposed = true; cancelAnimationFrame(raf); cleanup() }
  }, [])

  const onSlide = (i: number, val: number) => {
    const next: [number, number, number] = [...youRef.current] as [number, number, number]; next[i] = val
    youRef.current = next; youOnRef.current = true; setYou(next)
    const wrap = wrapRef.current
    if (wrap && morph < 0.6) window.scrollTo({ top: wrap.offsetTop + (wrap.offsetHeight - window.innerHeight) * 0.45, behavior: 'smooth' })
  }
  const yv = you ?? [0, 0, 0]
  const encs = [`${Math.round(((yv[0] + 1) / 2 * 0.85 + 0.06) * 100)}%`, `${2 + Math.floor((yv[1] + 1) * 1.5 + 0.5)}×`, (0.018 + 0.152 * (yv[2] + 1) / 2).toFixed(3)]
  const hw = hovered >= 0 ? works[hovered] : null
  const cap = stage === 2 ? c.s2 : c.s1

  return (
    <section ref={wrapRef} className="relative" style={{ height: '290vh' }} aria-label="Kansei field">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 size-full touch-pan-y" style={{ cursor: 'grab' }} aria-label={c.legend} />
        {noGL ? <LogoMark className="absolute right-[12%] top-1/2 size-[30vmin] -translate-y-1/2 text-[#14161B] dark:text-white" /> : null}

        {/* 第一屏：定位 */}
        <div className={`pointer-events-none absolute inset-0 transition-all duration-700 ${morph > 0.12 ? '-translate-y-6 opacity-0' : 'opacity-100'}`}>
          <div className="mx-auto flex h-full max-w-6xl items-center px-5 md:px-8">
            <div className="pointer-events-auto mt-[-30vh] max-w-[540px] md:mt-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#74777F]">{hero.eyebrow}</p>
              <h1 className="mt-4 text-5xl font-semibold leading-none tracking-[-0.02em] md:mt-5 md:text-7xl">{hero.title}</h1>
              <p className="mt-2 font-mono text-[12px] tracking-[0.32em] text-[#A4A6AD]">KONG WEIPENG</p>
              <p className="mt-6 text-lg font-medium leading-relaxed md:text-xl">{hero.role}</p>
              <p className="mt-3 hidden max-w-md text-[14px] leading-7 text-[#50535C] dark:text-neutral-400 md:block">{hero.intro}</p>
              <div className="mt-5 hidden flex-wrap gap-2 md:flex">
                {c.tags.map((tag, i) => (
                  <span key={tag} className={`rounded-full border px-3 py-1.5 text-[11.5px] ${i < 2 ? 'border-[#EEAF1C]/60 bg-[#EEAF1C]/12 text-[#7A5806] dark:text-[#EEAF1C]' : 'border-black/15 text-[#3B3E46] dark:border-white/15 dark:text-neutral-300'}`}>{tag}</span>
                ))}
              </div>
              <div className="mt-7 flex gap-2.5">
                <Link href="/works" className="rounded-[13px] bg-[#14161B] px-5 py-3 text-[13px] font-semibold text-white no-underline shadow-[0_6px_18px_rgba(20,22,27,0.18)] transition hover:bg-[#262931] dark:bg-white dark:text-[#14161B]">{hero.primary} →</Link>
                <Link href="/research" className="glass rounded-[13px] px-5 py-3 text-[13px] font-semibold text-[#14161B] no-underline dark:text-white">{hero.secondary}</Link>
              </div>
              <p className="mt-7 hidden items-center gap-2 text-[11.5px] text-[#74777F] md:flex"><i className="size-[7px] rounded-full bg-[#5DBB7A] shadow-[0_0_0_3px_rgba(93,187,122,0.18)]" />{hero.status}</p>
            </div>
          </div>
        </div>
        <div ref={stirRef} className="pointer-events-none absolute left-0 top-0 hidden items-center gap-2 font-mono text-[11px] text-[#74777F] transition-opacity duration-500 md:flex"><span className="h-px w-5 bg-[#A4A6AD]" />{c.stir}</div>

        {/* 第二屏：叙事字幕 / 悬停卡片 */}
        <div className={`pointer-events-none absolute left-[max(20px,calc(50%-36rem))] top-24 w-[min(300px,80vw)] transition-all duration-500 md:top-1/2 md:-translate-y-1/2 ${morph > 0.6 && !hw ? 'opacity-100' : 'opacity-0'}`}>
          <p className="font-mono text-[11px] text-[#A4A6AD]">{cap[0]}</p>
          <p className="mt-3 text-2xl font-light leading-snug tracking-[-0.02em] md:text-[34px] md:leading-[1.2]">{cap[1]}<b className="font-semibold text-[#A87A07] dark:text-[#EEAF1C]">{cap[2]}</b>{cap[3]}</p>
          <p className="mt-3 hidden text-[13px] leading-7 text-[#50535C] dark:text-neutral-400 md:block">{cap[4]}</p>
        </div>
        {hw ? (
          <div className="glass pointer-events-none absolute left-4 right-4 top-24 rounded-[20px] p-5 md:left-[max(20px,calc(50%-36rem))] md:right-auto md:top-1/2 md:w-[290px] md:-translate-y-1/2">
            <div className="flex justify-between font-mono text-[10px] tracking-[0.12em] text-[#74777F]"><span>No.{String(hovered + 1).padStart(2, '0')}</span><em className="not-italic font-semibold text-[#A87A07]">{hw.year}</em></div>
            <h3 className="mt-2 text-base font-semibold leading-snug">{hw.full}</h3>
            <p className="mt-2 hidden text-[12.5px] leading-6 text-[#4A4D57] dark:text-neutral-300 md:block">{hw.desc}</p>
            <div className="mt-3 grid grid-cols-3 gap-1.5 font-mono">
              {[c.warm, c.agency, c.linger].map((lab, i) => (
                <div key={lab} className="rounded-[9px] bg-black/[0.04] px-2 py-1.5 text-[10px] text-[#A4A6AD] dark:bg-white/[0.06]">{lab}<b className="block text-[12px] text-[#14161B] dark:text-white">{hw.v[i] > 0 ? '+' : ''}{hw.v[i].toFixed(2)}</b></div>
              ))}
            </div>
            <p className="mt-3 text-[11.5px] font-semibold">{c.click} <span className="font-normal text-[#A4A6AD]">{hw.words.join(' / ')}</span></p>
          </div>
        ) : null}

        {/* 签名标签 */}
        {works.map((w, i) => (
          <div key={w.id} ref={(el) => { labelRefs.current[i] = el }} className="pointer-events-none absolute left-0 top-0 whitespace-nowrap text-center opacity-0">
            <span className="font-mono text-[9.5px] text-[#A4A6AD]">{String(i + 1).padStart(2, '0')} · {w.year}</span>
            <b className="block text-[11px] font-semibold md:text-[12px]">{w.title}</b>
            <small className="block text-[10px] tracking-[0.06em] text-[#A87A07] dark:text-[#EEAF1C]">{w.words.slice(0, 2).join(' · ')}</small>
          </div>
        ))}

        {/* SD 面板 */}
        <aside className={`glass absolute bottom-16 left-3 right-3 rounded-[22px] p-4 transition-opacity duration-500 md:bottom-auto md:left-auto md:right-[max(20px,calc(50%-36rem))] md:top-1/2 md:w-[280px] md:-translate-y-1/2 md:p-5 ${morph > 0.45 ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
          <p className="font-mono text-[10px] tracking-[0.2em] text-[#74777F]">{c.panelEyebrow}</p>
          <h3 className="mt-1.5 hidden text-[15px] font-semibold md:block">{c.panelTitle}</h3>
          <p className="mt-1 hidden text-[11.5px] leading-5 text-[#74777F] md:block">{c.panelSub}</p>
          <button type="button" onClick={() => setPanelOpen((o) => !o)} className="absolute right-4 top-3.5 rounded-full bg-black/[0.05] px-3 py-1 text-[11px] font-medium dark:bg-white/10 md:hidden">{panelOpen ? '−' : '+'}</button>
          {c.poles.map(([l, r], i) => (
            <label key={l} className={`mt-3 md:mt-4 ${panelOpen ? 'block' : 'hidden md:block'}`}>
              <span className="flex justify-between text-[11.5px] font-semibold"><span>{l}</span><span className="text-[#A87A07] dark:text-[#EEAF1C]">{r}</span></span>
              <input type="range" min={-100} max={100} defaultValue={0} onInput={(e) => onSlide(i, Number((e.target as HTMLInputElement).value) / 100)}
                className="mt-1 h-5 w-full cursor-ew-resize appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-px [&::-webkit-slider-runnable-track]:bg-black/20 dark:[&::-webkit-slider-runnable-track]:bg-white/25 [&::-webkit-slider-thumb]:-mt-[7px] [&::-webkit-slider-thumb]:size-[15px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[4px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#EEAF1C] [&::-webkit-slider-thumb]:shadow-[0_0_0_0.5px_rgba(20,22,27,0.3),0_2px_6px_rgba(20,22,27,0.15)]" />
              <span className="hidden justify-between font-mono text-[10px] text-[#A4A6AD] md:flex"><span>{c.enc[i]}</span><span>{encs[i]}</span></span>
            </label>
          ))}
          <div className="mt-3 border-t border-black/[0.08] pt-3 text-[12px] leading-6 dark:border-white/10 md:mt-4 md:pt-4">
            {nearest ? (
              <>
                <span className="hidden md:inline">{c.youDone}</span>
                <span className="flex items-baseline justify-between"><strong className="text-[15px]">{works[nearest.i].title}</strong><span className="text-[22px] font-light tabular-nums">{nearest.pct}%</span></span>
                <Link href={works[nearest.i].href} className="mt-1 inline-block text-[12px] font-semibold text-[#14161B] no-underline decoration-[#EEAF1C] dark:text-white" style={{ textDecorationLine: 'underline' }}>{c.go}</Link>
              </>
            ) : <span className="text-[#74777F]">{c.youIdle}</span>}
          </div>
        </aside>

        <div className={`pointer-events-none absolute bottom-7 right-[max(20px,calc(50%-36rem))] hidden text-right text-[10.5px] leading-5 text-[#74777F] transition-opacity duration-500 md:block ${morph > 0.6 ? 'opacity-100' : 'opacity-0'}`}>
          <b className="font-semibold text-[#14161B] dark:text-white">{c.legendTitle}</b><br />{c.legend}<br />{c.legend2}
        </div>

        {/* 进度 */}
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 text-[11px] text-[#74777F]">
          <span className={stage === 0 ? 'font-semibold text-[#14161B] dark:text-white' : ''}>{c.rail[0]}</span>
          <span className="relative h-0.5 w-28 rounded bg-black/10 dark:bg-white/15 md:w-40">
            <i className="absolute inset-y-0 left-0 rounded bg-[#14161B] dark:bg-white" style={{ width: `${morph * 100}%` }} />
            <b className="absolute top-1/2 -ml-[5px] -mt-[5px] size-2.5 rounded-full bg-[#EEAF1C] shadow-[0_0_10px_#EEAF1C]" style={{ left: `${morph * 100}%` }} />
          </span>
          <span className={stage > 0 ? 'font-semibold text-[#14161B] dark:text-white' : ''}>{c.rail[1]}</span>
          <span className="hidden opacity-60 md:inline">{c.scroll} ↓</span>
        </div>
        {noGL ? <p className="absolute bottom-16 left-1/2 -translate-x-1/2 text-[11px] text-[#74777F]">{c.nogl}</p> : null}
      </div>
    </section>
  )
}
