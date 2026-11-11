import { useEffect, useRef } from 'react'

// Adds the "in" class once the element is on screen or already scrolled past (see .reveal in index.css).
// Uses scroll position, so a fast scroll or an anchor jump can never leave content hidden.
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const stop = () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
    function check() {
      if (el!.getBoundingClientRect().top < window.innerHeight * 0.9) {
        el!.classList.add('in')
        stop()
      }
    }
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    check()
    return stop
  }, [])
  return ref
}
