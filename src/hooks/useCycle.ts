import { useEffect, useState } from 'react'

// Steps 0..n-1 forever. Stays on `start` for users who prefer reduced motion.
export function useCycle(n: number, ms: number, start = 0) {
  const [i, setI] = useState(start)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI((v) => (v + 1) % n), ms)
    return () => clearInterval(t)
  }, [n, ms])
  return i
}
