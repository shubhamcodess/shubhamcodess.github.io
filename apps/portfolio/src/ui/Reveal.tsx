import { useEffect, useRef, type ReactNode } from 'react'
import './reveal.css'

interface RevealProps {
  readonly children: ReactNode
  readonly className?: string
  /** Position among siblings that reveal together. Each step waits one stagger longer. */
  readonly index?: number
}

/** One observer for every Reveal on the page. */
let observer: IntersectionObserver | undefined

function watch(element: Element): () => void {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        ;(entry.target as HTMLElement).dataset.reveal = 'in'
        observer?.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  )
  observer.observe(element)
  return () => observer?.unobserve(element)
}

/** Content rises into place the first time it scrolls into view, and then stays put. */
export function Reveal({ children, className, index = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => (ref.current ? watch(ref.current) : undefined), [])

  return (
    <div ref={ref} className={className} data-reveal="out" style={{ '--reveal-index': index } as React.CSSProperties}>
      {children}
    </div>
  )
}
