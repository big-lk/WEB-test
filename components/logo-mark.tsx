import { LOGO_PATHS } from '../lib/logo-paths'

export default function LogoMark({ className = 'size-6', title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 640 640" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      {LOGO_PATHS.map((p, i) => (
        <path key={i} fill={p.fill === '#111111' ? 'currentColor' : p.fill} fillRule="evenodd" d={p.d} className={p.fill === '#F6F7F7' ? 'opacity-0' : undefined} />
      ))}
    </svg>
  )
}
