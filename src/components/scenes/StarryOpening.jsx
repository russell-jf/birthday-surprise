import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { OPENING_LINES } from '../../data/content'
import { MOTION, prefersReducedMotion } from '../../styles/motion'
import StoryBackground from '../story/StoryBackground'
import './scenes.css'

export default function StarryOpening({ onReady }) {
  const rootRef = useRef(null)
  const lineRef = useRef(null)
  const onReadyRef = useRef(onReady)

  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  useEffect(() => {
    const reduced = prefersReducedMotion()

    const ctx = gsap.context(() => {
      if (reduced) {
        if (lineRef.current) {
          lineRef.current.textContent = OPENING_LINES[OPENING_LINES.length - 1]
        }
        onReadyRef.current?.()
        return
      }

      const tl = gsap.timeline({
        delay: 0.45,
        onComplete: () => onReadyRef.current?.(),
      })

      OPENING_LINES.forEach((line) => {
        tl.to(lineRef.current, {
          opacity: 0,
          y: -MOTION.yShift,
          duration: MOTION.fadeOut,
          ease: MOTION.easeIn,
        })
          .set(lineRef.current, { textContent: line, y: MOTION.yShift })
          .to(lineRef.current, {
            opacity: 1,
            y: 0,
            duration: MOTION.fadeIn,
            ease: MOTION.easeOut,
          })
          .to({}, { duration: MOTION.hold })
      })
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="scene stars-scene">
      <StoryBackground variant="blush" stars sparkles moon />
      <div className="story-copy scene-copy stars-copy">
        <p ref={lineRef} className="type-line">
          …
        </p>
      </div>
    </section>
  )
}
