'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    jsQR?: (
      data: Uint8ClampedArray,
      width: number,
      height: number,
      options?: { inversionAttempts?: string },
    ) => {
      data: string
      location: {
        topLeftCorner: { x: number; y: number }
        topRightCorner: { x: number; y: number }
        bottomRightCorner: { x: number; y: number }
        bottomLeftCorner: { x: number; y: number }
      }
    } | null
  }
}

const PAGE_URL = 'https://lkdesigner.top/aomori-ar'

type Pose = {
  x: number
  y: number
  width: number
  angle: number
  visible: boolean
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

function Swan() {
  return (
    <div className="swan-wrap" aria-hidden="true">
      <svg viewBox="0 0 420 300" role="img">
        <defs>
          <filter id="pencil" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" />
          </filter>
          <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="12" stdDeviation="9" floodOpacity="0.32" />
          </filter>
        </defs>

        <ellipse className="ground-shadow" cx="220" cy="252" rx="116" ry="23" />

        <g filter="url(#shadow)">
          <g className="wing wing-left">
            <path d="M190 176 C135 154 96 91 116 47 C150 88 178 104 211 121 C210 143 202 162 190 176 Z" />
            <path className="detail" d="M128 67 C147 105 169 128 197 145 M145 78 C160 111 178 132 201 149" />
          </g>

          <g className="wing wing-right">
            <path d="M245 167 C270 125 312 83 354 57 C354 113 325 166 270 191 C261 184 252 177 245 167 Z" />
            <path className="detail" d="M341 77 C311 103 285 133 263 169 M323 83 C297 110 278 137 259 164" />
          </g>

          <g filter="url(#pencil)">
            <path className="body" d="M165 184 C184 151 220 144 256 158 C281 168 302 186 320 205 C290 236 249 249 204 242 C163 236 136 214 133 192 C132 185 146 180 165 184 Z" />
            <path className="neck" d="M176 185 C183 154 183 126 191 99 C198 74 214 49 237 43 C258 38 275 50 276 69 C277 88 263 97 249 101 C236 105 227 119 222 140 C217 159 218 173 222 186 Z" />
            <path className="tail" d="M302 203 C336 199 361 206 386 223 C357 232 330 235 302 229 Z" />
            <path className="beak-black" d="M235 61 C215 60 196 67 179 81 C196 91 216 91 236 84 Z" />
            <path className="beak-yellow" d="M211 70 L230 68 L238 79 L223 85 L208 80 Z" />
            <circle className="eye" cx="246" cy="62" r="5.5" />
            <path className="body-detail" d="M168 199 C205 215 255 220 301 205 M184 188 C211 199 244 202 278 194" />
          </g>
        </g>
      </svg>
    </div>
  )
}

export default function AomoriARPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const scanCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const lastSeenRef = useRef(0)

  const [ready, setReady] = useState(false)
  const [started, setStarted] = useState(false)
  const [message, setMessage] = useState('点击下方按钮，允许使用摄像头')
  const [pose, setPose] = useState<Pose>({ x: 0, y: 0, width: 180, angle: 0, visible: false })

  useEffect(() => {
    if (window.jsQR) {
      setReady(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js'
    script.async = true
    script.onload = () => setReady(true)
    script.onerror = () => setMessage('识别程序加载失败，请检查网络后刷新')
    document.head.appendChild(script)

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  useEffect(() => stopCamera, [stopCamera])

  const scan = useCallback(() => {
    const video = videoRef.current
    const canvas = scanCanvasRef.current
    const stage = stageRef.current
    const jsQR = window.jsQR

    if (!video || !canvas || !stage || !jsQR || video.readyState < 2) {
      frameRef.current = requestAnimationFrame(scan)
      return
    }

    const maxWidth = 720
    const scaleDown = Math.min(1, maxWidth / video.videoWidth)
    const width = Math.max(1, Math.round(video.videoWidth * scaleDown))
    const height = Math.max(1, Math.round(video.videoHeight * scaleDown))

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) {
      frameRef.current = requestAnimationFrame(scan)
      return
    }

    ctx.drawImage(video, 0, 0, width, height)
    const imageData = ctx.getImageData(0, 0, width, height)
    const result = jsQR(imageData.data, width, height, { inversionAttempts: 'dontInvert' })

    if (result && result.data) {
      const now = performance.now()
      lastSeenRef.current = now

      const stageWidth = stage.clientWidth
      const stageHeight = stage.clientHeight
      const fitScale = Math.max(stageWidth / width, stageHeight / height)
      const offsetX = (stageWidth - width * fitScale) / 2
      const offsetY = (stageHeight - height * fitScale) / 2

      const mapPoint = (point: { x: number; y: number }) => ({
        x: point.x * fitScale + offsetX,
        y: point.y * fitScale + offsetY,
      })

      const tl = mapPoint(result.location.topLeftCorner)
      const tr = mapPoint(result.location.topRightCorner)
      const br = mapPoint(result.location.bottomRightCorner)
      const bl = mapPoint(result.location.bottomLeftCorner)

      const qrWidth = (distance(tl, tr) + distance(bl, br)) / 2
      const center = {
        x: (tl.x + tr.x + br.x + bl.x) / 4,
        y: (tl.y + tr.y + br.y + bl.y) / 4,
      }
      const angle = Math.atan2(tr.y - tl.y, tr.x - tl.x) * (180 / Math.PI)

      setPose({
        x: center.x - qrWidth * 2.25,
        y: center.y - qrWidth * 2.85,
        width: Math.max(170, Math.min(520, qrWidth * 4.1)),
        angle,
        visible: true,
      })

      setMessage(result.data === PAGE_URL ? '识别成功：白鸟正在挥动翅膀' : '已识别二维码，AR 动画已启动')
    } else if (performance.now() - lastSeenRef.current > 450) {
      setPose((current) => (current.visible ? { ...current, visible: false } : current))
      setMessage('请把卡片右下角的二维码完整放进镜头')
    }

    frameRef.current = requestAnimationFrame(scan)
  }, [])

  const startCamera = async () => {
    if (!ready) {
      setMessage('识别程序正在加载，请稍等')
      return
    }

    try {
      stopCamera()
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      streamRef.current = stream
      if (!videoRef.current) return
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setStarted(true)
      setMessage('请把卡片右下角的二维码完整放进镜头')
      lastSeenRef.current = performance.now()
      frameRef.current = requestAnimationFrame(scan)
    } catch (error) {
      console.error(error)
      setMessage('无法打开摄像头。请在浏览器设置中允许摄像头权限。')
    }
  }

  return (
    <main className="ar-page">
      <div ref={stageRef} className="stage">
        <video ref={videoRef} className="camera" playsInline muted />
        <canvas ref={scanCanvasRef} className="scan-canvas" />

        {!started && (
          <div className="intro-card">
            <div className="mini-map">青森</div>
            <h1>青森・ハクチョウ AR</h1>
            <p>扫码进入后，点击按钮打开摄像头，再对准卡片右下角的二维码。</p>
            <button type="button" onClick={startCamera} disabled={!ready}>
              {ready ? '开启 AR 摄像头' : '正在加载…'}
            </button>
          </div>
        )}

        <div
          className={`swan-layer ${pose.visible ? 'is-visible' : ''}`}
          style={{
            width: `${pose.width}px`,
            transform: `translate3d(${pose.x}px, ${pose.y}px, 0) rotate(${pose.angle}deg)`,
          }}
        >
          <Swan />
        </div>

        {started && (
          <div className="guide" aria-hidden="true">
            <span className="corner tl" />
            <span className="corner tr" />
            <span className="corner br" />
            <span className="corner bl" />
          </div>
        )}

        <div className="status-bar">
          <span className={`dot ${pose.visible ? 'active' : ''}`} />
          <span>{message}</span>
        </div>
      </div>

      <style jsx>{`
        .ar-page {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #07120b;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          overflow: hidden;
        }

        .stage {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 35%, rgba(76, 160, 88, 0.24), transparent 38%),
            #07120b;
        }

        .camera {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .scan-canvas {
          position: absolute;
          width: 1px;
          height: 1px;
          opacity: 0;
          pointer-events: none;
        }

        .intro-card {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: min(86vw, 410px);
          padding: 28px;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.94);
          color: #123b1e;
          text-align: center;
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.34);
          backdrop-filter: blur(16px);
        }

        .mini-map {
          width: 106px;
          height: 86px;
          display: grid;
          place-items: center;
          margin: 0 auto 18px;
          background: #dfff62;
          color: #168541;
          border: 5px solid #3bac48;
          border-radius: 38% 55% 34% 48%;
          font-weight: 800;
          font-size: 25px;
          transform: rotate(-4deg);
          box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.7);
        }

        h1 {
          margin: 0 0 10px;
          font-size: 25px;
        }

        p {
          margin: 0 0 22px;
          line-height: 1.65;
          color: #47634f;
          font-size: 15px;
        }

        button {
          width: 100%;
          border: 0;
          border-radius: 999px;
          padding: 15px 18px;
          font-size: 17px;
          font-weight: 800;
          color: white;
          background: #168541;
          box-shadow: 0 10px 25px rgba(22, 133, 65, 0.28);
        }

        button:disabled {
          opacity: 0.55;
        }

        .swan-layer {
          position: absolute;
          left: 0;
          top: 0;
          aspect-ratio: 1.4;
          transform-origin: 50% 50%;
          opacity: 0;
          pointer-events: none;
          transition: opacity 160ms ease;
          will-change: transform, opacity;
          filter: drop-shadow(0 16px 12px rgba(0, 0, 0, 0.34));
        }

        .swan-layer.is-visible {
          opacity: 1;
        }

        .swan-wrap {
          width: 100%;
          height: 100%;
          animation: hover 1.9s ease-in-out infinite;
          transform-origin: 50% 70%;
        }

        .swan-wrap :global(svg) {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .swan-wrap :global(.body),
        .swan-wrap :global(.neck),
        .swan-wrap :global(.tail),
        .swan-wrap :global(.wing path:first-child) {
          fill: #fffef7;
          stroke: #585552;
          stroke-width: 5;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .swan-wrap :global(.wing) {
          transform-box: fill-box;
          transform-origin: 50% 100%;
        }

        .swan-wrap :global(.wing-left) {
          animation: flapLeft 760ms ease-in-out infinite alternate;
        }

        .swan-wrap :global(.wing-right) {
          animation: flapRight 760ms ease-in-out infinite alternate;
        }

        .swan-wrap :global(.detail),
        .swan-wrap :global(.body-detail) {
          fill: none;
          stroke: #d6c8b9;
          stroke-width: 4;
          stroke-linecap: round;
        }

        .swan-wrap :global(.beak-black) {
          fill: #191919;
          stroke: #191919;
          stroke-width: 3;
        }

        .swan-wrap :global(.beak-yellow) {
          fill: #f7c400;
          stroke: #191919;
          stroke-width: 3;
        }

        .swan-wrap :global(.eye) {
          fill: #111;
        }

        .swan-wrap :global(.ground-shadow) {
          fill: rgba(0, 0, 0, 0.18);
          filter: blur(7px);
          animation: shadowPulse 1.9s ease-in-out infinite;
        }

        .guide {
          position: absolute;
          left: 50%;
          top: 52%;
          width: min(76vw, 420px);
          aspect-ratio: 1;
          transform: translate(-50%, -50%);
          pointer-events: none;
          opacity: 0.42;
        }

        .corner {
          position: absolute;
          width: 42px;
          height: 42px;
          border-color: white;
          border-style: solid;
        }

        .tl { left: 0; top: 0; border-width: 4px 0 0 4px; border-radius: 14px 0 0 0; }
        .tr { right: 0; top: 0; border-width: 4px 4px 0 0; border-radius: 0 14px 0 0; }
        .br { right: 0; bottom: 0; border-width: 0 4px 4px 0; border-radius: 0 0 14px 0; }
        .bl { left: 0; bottom: 0; border-width: 0 0 4px 4px; border-radius: 0 0 0 14px; }

        .status-bar {
          position: absolute;
          left: 50%;
          bottom: max(24px, env(safe-area-inset-bottom));
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 9px;
          width: max-content;
          max-width: calc(100vw - 30px);
          padding: 11px 15px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.58);
          backdrop-filter: blur(12px);
          font-size: 13px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #ffcc35;
          box-shadow: 0 0 0 4px rgba(255, 204, 53, 0.16);
          flex: 0 0 auto;
        }

        .dot.active {
          background: #79f68f;
          box-shadow: 0 0 0 4px rgba(121, 246, 143, 0.18);
        }

        @keyframes hover {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }

        @keyframes flapLeft {
          from { transform: rotate(-13deg) scaleY(0.96); }
          to { transform: rotate(14deg) scaleY(1.05); }
        }

        @keyframes flapRight {
          from { transform: rotate(12deg) scaleY(0.96); }
          to { transform: rotate(-13deg) scaleY(1.05); }
        }

        @keyframes shadowPulse {
          0%, 100% { opacity: 0.24; transform: scaleX(1); }
          50% { opacity: 0.14; transform: scaleX(0.84); }
        }
      `}</style>
    </main>
  )
}
