'use client'

import { useEffect, useRef } from 'react'

/**
 * 感性签名（2D 画布，轻量）：与首页「感性场」同一套语法
 * 环的起伏次数 = 自主度 · 颗粒扩散 = 余韵 · 金色比例 = 温度
 */
export default function KanseiSignature({ v, className = '', count = 2600, dark = false }: { v: [number, number, number]; className?: string; count?: number; dark?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0, h = 0
    const resize = () => { const r = canvas.getBoundingClientRect(); w = r.width; h = r.height; canvas.width = w * dpr; canvas.height = h * dpr }
    resize()
    const ro = new ResizeObserver(resize); ro.observe(canvas)

    const [warm, agency, linger] = v
    const q = 2 + Math.floor((agency + 1) * 1.5 + 0.5)
    const amp = 0.14 + 0.12 * (linger + 1) / 2
    const spread = 0.018 + 0.15 * (linger + 1) / 2
    const goldRatio = (warm + 1) / 2 * 0.85 + 0.06
    const pts = Array.from({ length: count }, () => {
      const r = [Math.random(), Math.random(), Math.random(), Math.random()]
      return { t: Math.random(), j: [(r[0] - 0.5) * 2, (r[1] - 0.5) * 2, (r[2] - 0.5) * 2], k: 0.35 + r[3] * r[3] * 1.4, gold: Math.random() < goldRatio, s: 0.6 + Math.random() * 0.9 }
    })
    const gold = 'rgba(238,175,28,'
    let raf = 0, visible = true, start = performance.now()
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(draw) })
    io.observe(canvas)

    function draw(now: number) {
      raf = 0
      const time = reduce ? 0 : (now - start) / 1000
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx!.clearRect(0, 0, w, h)
      const ink = dark || document.documentElement.classList.contains('dark') ? 'rgba(236,234,229,' : 'rgba(20,22,27,'
      const S = Math.min(w, h) * 0.42, cx = w / 2, cy = h / 2
      const rot = time * (0.08 + 0.22 * (warm + 1) / 2), tilt = 1.05
      for (const p of pts) {
        const a = p.t * Math.PI * 2
        let x = (0.82 + amp * Math.cos(q * a)) * Math.cos(a), y = (0.82 + amp * Math.cos(q * a)) * Math.sin(a), z = amp * Math.sin(q * a)
        x += p.j[0] * spread * p.k; y += p.j[1] * spread * p.k; z += p.j[2] * spread * p.k
        const xr = x * Math.cos(rot) - y * Math.sin(rot), yr = x * Math.sin(rot) + y * Math.cos(rot)
        const y2 = yr * Math.cos(tilt) - z * Math.sin(tilt), z2 = yr * Math.sin(tilt) + z * Math.cos(tilt)
        const persp = 1 / (1.9 - z2 * 0.5)
        const px = cx + xr * S * persp * 1.9, py = cy + y2 * S * persp * 1.9
        const alpha = p.gold ? 0.9 : 0.62
        ctx!.fillStyle = (p.gold ? gold : ink) + alpha + ')'
        const r = p.s * (p.gold ? 1.15 : 1) * 0.9
        ctx!.fillRect(px - r / 2, py - r / 2, r, r)
      }
      if (!reduce && visible) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect() }
  }, [v, count, dark])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
