import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { OPENING_LINES } from '../../data/content'
import Sparkles from '../Sparkles'
import './scenes.css'

export default function StarryOpening({ onReady }) {
  const rootRef = useRef(null)
  const lineRef = useRef(null)
  const onReadyRef = useRef(onReady)
  onReadyRef.current = onReady

  useEffect(() => {
    const ctx = gsap.context(() => {
      const stars = gsap.utils.toArray('.star-dot')
      gsap.fromTo(
        stars,
        { opacity: 0, scale: 0.2 },
        {
          opacity: () => gsap.utils.random(0.25, 1),
          scale: 1,
          duration: 1.4,
          stagger: { each: 0.02, from: 'random' },
          ease: 'power2.out',
        },
      )

      const tl = gsap.timeline({
        delay: 0.6,
        onComplete: () => onReadyRef.current?.(),
      })

      OPENING_LINES.forEach((line) => {
        tl.to(lineRef.current, {
          opacity: 0,
          y: -12,
          duration: 0.35,
          ease: 'power1.in',
        })
          .set(lineRef.current, { textContent: line, y: 16 })
          .to(lineRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: 'power2.out',
          })
          .to({}, { duration: 1.15 })
      })
    }, rootRef)

    return () => ctx.revert()
  }, [])

  const starNodes = Array.from({ length: 80 }, (_, i) => (
    <span
      key={i}
      className="star-dot"
      style={{
        left: `${(i * 17) % 100}%`,
        top: `${(i * 29) % 100}%`,
        animationDelay: `${(i % 9) * 0.2}s`,
        width: `${1 + (i % 3)}px`,
        height: `${1 + (i % 3)}px`,
      }}
    />
  ))

  return (
    <section ref={rootRef} className="scene stars-scene">
      <div className="night-sky" />
      <div className="star-field">{starNodes}</div>
      <Sparkles />
      <div className="scene-copy stars-copy">
        <p ref={lineRef} className="type-line">
          …
        </p>
      </div>
      <div className="moon" aria-hidden />
    </section>
  )
}
