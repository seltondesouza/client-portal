import { useEffect, useState } from 'react'
import { CheckIcon } from 'lucide-react'

// Small vector animations for the homepage. Pure SVG/CSS, black and white, one accent. Keyframes live in index.css.

// A website wireframe that assembles itself block by block, then starts again.
export function BuildAnimation() {
  return (
    <svg viewBox="0 0 420 280" fill="none" className="mx-auto w-full max-w-md text-foreground" role="img" aria-label="Um website a ser construído, bloco a bloco">
      <rect x="6" y="6" width="408" height="268" rx="14" stroke="currentColor" strokeWidth="2" className="bd-frame" />
      <g className="bd-loop">
        <circle cx="28" cy="28" r="4" fill="currentColor" className="bd-b" style={{ animationDelay: '0.2s' }} />
        <circle cx="42" cy="28" r="4" fill="currentColor" className="bd-b" style={{ animationDelay: '0.3s' }} />
        <circle cx="56" cy="28" r="4" fill="currentColor" className="bd-b" style={{ animationDelay: '0.4s' }} />
        <rect x="24" y="48" width="372" height="1.5" fill="currentColor" opacity="0.25" className="bd-b" style={{ animationDelay: '0.5s' }} />
        <rect x="24" y="64" width="88" height="10" rx="5" fill="currentColor" className="bd-b" style={{ animationDelay: '0.7s' }} />
        <rect x="260" y="64" width="40" height="8" rx="4" fill="currentColor" opacity="0.35" className="bd-b" style={{ animationDelay: '0.8s' }} />
        <rect x="312" y="64" width="40" height="8" rx="4" fill="currentColor" opacity="0.35" className="bd-b" style={{ animationDelay: '0.9s' }} />
        <rect x="364" y="62" width="32" height="12" rx="6" fill="var(--live)" className="bd-b" style={{ animationDelay: '1s' }} />
        <rect x="24" y="96" width="196" height="16" rx="4" fill="currentColor" className="bd-b" style={{ animationDelay: '1.2s' }} />
        <rect x="24" y="120" width="150" height="16" rx="4" fill="currentColor" className="bd-b" style={{ animationDelay: '1.35s' }} />
        <rect x="24" y="148" width="180" height="7" rx="3.5" fill="currentColor" opacity="0.3" className="bd-b" style={{ animationDelay: '1.5s' }} />
        <rect x="24" y="162" width="140" height="7" rx="3.5" fill="currentColor" opacity="0.3" className="bd-b" style={{ animationDelay: '1.6s' }} />
        <rect x="24" y="182" width="84" height="24" rx="12" fill="var(--live)" stroke="currentColor" strokeWidth="1.5" className="bd-b" style={{ animationDelay: '1.8s' }} />
        <rect x="248" y="92" width="148" height="116" rx="10" stroke="currentColor" strokeWidth="2" className="bd-b" style={{ animationDelay: '1.4s' }} />
        <circle cx="290" cy="130" r="14" fill="currentColor" className="bd-b" style={{ animationDelay: '1.9s' }} />
        <path d="M262 196 L300 160 L330 184 L352 164 L384 196 Z" fill="currentColor" opacity="0.25" className="bd-b" style={{ animationDelay: '2s' }} />
        {[0, 1, 2].map((i) => (
          <g key={i} className="bd-b" style={{ animationDelay: `${2.3 + i * 0.2}s` }}>
            <rect x={24 + i * 126} y="224" width="114" height="36" rx="8" stroke="currentColor" strokeWidth="2" />
            <rect x={36 + i * 126} y="236" width="50" height="6" rx="3" fill="currentColor" opacity="0.4" />
            <rect x={36 + i * 126} y="246" width="72" height="5" rx="2.5" fill="currentColor" opacity="0.2" />
          </g>
        ))}
      </g>
    </svg>
  )
}

// Types a domain name, then shows it is available. Loops through a few examples.
const NAMES = ['cafe-aurora.pt', 'studio-lume.com', 'clinica-sorriso.pt', 'loja-do-bairro.eu']
export function DomainTyper() {
  const [n, setN] = useState(0)
  const [len, setLen] = useState(0)
  const [reduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const name = NAMES[n]
  const done = len >= name.length || reduced

  useEffect(() => {
    if (reduced) return
    const t = setTimeout(
      () => {
        if (len < name.length) setLen(len + 1)
        else {
          setN((n + 1) % NAMES.length)
          setLen(0)
        }
      },
      len < name.length ? 90 : 2200,
    )
    return () => clearTimeout(t)
  }, [len, n, name.length, reduced])

  return (
    <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 rounded-full border bg-card px-5 py-3 shadow-lift" aria-label="Exemplo de pesquisa de domínio">
      <span className="truncate font-mono text-[15px]">
        {reduced ? name : name.slice(0, len)}
        {!done && <span className="ml-px inline-block h-4 w-[2px] translate-y-0.5 bg-foreground" />}
      </span>
      <span className={`flex shrink-0 items-center gap-1 rounded-full bg-live px-2.5 py-1 text-xs font-medium text-live-foreground transition-opacity duration-300 ${done ? 'opacity-100' : 'opacity-0'}`}>
        <CheckIcon className="size-3.5" /> Disponível
      </span>
    </div>
  )
}

// One small looping icon per highlighted service.
export function ServiceIcon({ kind }: { kind: 'domain' | 'redesign' | 'seo' | 'logo' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-14" aria-hidden>
      {kind === 'domain' && (
        <g>
          <circle cx="32" cy="32" r="22" />
          <g className="si-globe">
            <ellipse cx="32" cy="32" rx="9" ry="22" />
            <path d="M10 32h44" />
          </g>
          <path d="M14 20h36M14 44h36" opacity="0.4" />
        </g>
      )}
      {kind === 'redesign' && (
        <g>
          <rect x="8" y="12" width="48" height="40" rx="5" />
          <rect x="14" y="19" width="14" height="26" rx="2" className="si-swap-a" fill="currentColor" />
          <rect x="34" y="19" width="16" height="10" rx="2" className="si-swap-b" />
          <rect x="34" y="35" width="16" height="10" rx="2" className="si-swap-a" />
        </g>
      )}
      {kind === 'seo' && (
        <g>
          <path d="M10 54h46" />
          <rect x="14" y="36" width="8" height="18" className="si-bar" style={{ animationDelay: '0s' }} fill="currentColor" />
          <rect x="28" y="26" width="8" height="28" className="si-bar" style={{ animationDelay: '0.25s' }} fill="currentColor" />
          <rect x="42" y="14" width="8" height="40" className="si-bar" style={{ animationDelay: '0.5s' }} fill="var(--live)" />
        </g>
      )}
      {kind === 'logo' && (
        <g>
          <path d="M32 8 L54 32 L32 56 L10 32 Z" className="si-draw" pathLength={100} />
          <circle cx="32" cy="32" r="7" fill="currentColor" className="si-dot" />
        </g>
      )}
    </svg>
  )
}
