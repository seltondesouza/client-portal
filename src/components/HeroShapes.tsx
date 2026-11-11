// Decorative black-and-white geometry for the hero. Pure SVG, no gradients. Motion lives in index.css.
export function HeroShapes() {
  return (
    <div aria-hidden className="hs-in pointer-events-none absolute inset-0 overflow-hidden text-foreground">
      <svg className="absolute -left-12 top-16 h-48 w-48 md:-left-20 md:h-80 md:w-80 lg:-left-6 lg:h-[26rem] lg:w-[26rem]" viewBox="0 0 400 400" fill="none">
        <defs>
          <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect x="20" y="210" width="170" height="170" fill="url(#dots)" opacity="0.35" />
        <g className="hs-el hs-float-a">
          <circle cx="150" cy="140" r="90" stroke="currentColor" strokeWidth="2" opacity="0.9" />
          <circle cx="150" cy="140" r="52" fill="currentColor" className="hs-el hs-pulse" />
        </g>
        <g className="hs-el hs-spin">
          <rect x="230" y="60" width="64" height="64" transform="rotate(18 262 92)" stroke="currentColor" strokeWidth="2" />
        </g>
        <g className="hs-el hs-float-b">
          <path d="M60 330 L120 250 L180 330 Z" stroke="currentColor" strokeWidth="2" />
        </g>
      </svg>

      <svg className="absolute -right-12 bottom-24 h-48 w-48 md:-right-20 md:h-80 md:w-80 lg:-right-6 lg:h-[26rem] lg:w-[26rem]" viewBox="0 0 400 400" fill="none">
        <g stroke="currentColor" strokeWidth="2">
          <circle cx="260" cy="230" r="120" opacity="0.9" className="hs-el hs-ripple" />
          <circle cx="260" cy="230" r="84" className="hs-el hs-ripple" style={{ animationDelay: '-2s' }} />
          <circle cx="260" cy="230" r="48" className="hs-el hs-ripple" style={{ animationDelay: '-4s' }} />
        </g>
        <g style={{ transformBox: 'view-box', transformOrigin: '260px 230px' }} className="hs-spin-rev">
          <path d="M260 110 A120 120 0 0 1 380 230 L260 230 Z" fill="currentColor" />
        </g>
        <g className="hs-el hs-float-a">
          <rect x="40" y="250" width="56" height="56" fill="currentColor" transform="rotate(45 68 278)" />
        </g>
        <g className="hs-el hs-spin" stroke="currentColor" strokeWidth="2">
          <path d="M330 40 V80 M310 60 H350" />
        </g>
      </svg>
    </div>
  )
}
