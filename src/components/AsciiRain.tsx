import { useEffect, useRef } from 'react'

const GLYPHS = '01{}<>/\\|#$%&=+*~:;ΞΣ₿◆▪░▒'
const FONT = 14
const FPS = 18

// Lightweight "terminal" rain: falling columns of code-like characters on one canvas.
// Capped frame rate, paused when the tab is hidden, static for users who prefer reduced motion.
export function AsciiRain({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let cols = 0
    let drops: number[] = []
    let raf = 0
    let last = 0
    const glyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]

    function resize() {
      const { clientWidth: w, clientHeight: h } = canvas!
      canvas!.width = w
      canvas!.height = h
      cols = Math.ceil(w / FONT)
      drops = Array.from({ length: cols }, () => Math.random() * -40)
      ctx!.font = `${FONT}px ui-monospace, SFMono-Regular, Menlo, monospace`
    }

    function draw() {
      const style = getComputedStyle(canvas!)
      const fg = style.color
      const accent = style.getPropertyValue('--live').trim() || '#c8f54a'
      // Fade the previous frame so characters leave a trail (transparent canvas, so the page background shows through).
      ctx!.globalCompositeOperation = 'destination-out'
      ctx!.fillStyle = 'rgba(0,0,0,0.12)'
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height)
      ctx!.globalCompositeOperation = 'source-over'
      for (let i = 0; i < cols; i++) {
        const y = drops[i] * FONT
        if (y > 0) {
          ctx!.fillStyle = fg
          ctx!.globalAlpha = 0.5
          ctx!.fillText(glyph(), i * FONT, y)
          ctx!.fillStyle = accent
          ctx!.globalAlpha = 0.9
          if (Math.random() < 0.08) ctx!.fillText(glyph(), i * FONT, y)
          ctx!.globalAlpha = 1
        }
        drops[i] += 1
        if (y > canvas!.height && Math.random() > 0.975) drops[i] = Math.random() * -20
      }
    }

    function loop(t: number) {
      raf = requestAnimationFrame(loop)
      if (t - last < 1000 / FPS) return
      last = t
      draw()
    }

    resize()
    if (reduced) {
      for (let k = 0; k < 40; k++) { drops = drops.map((d) => d + 1); draw() } // one still frame
    } else {
      raf = requestAnimationFrame(loop)
    }
    const onVis = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden && !reduced) raf = requestAnimationFrame(loop)
    }
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 size-full text-foreground ${className ?? ''}`} />
}
