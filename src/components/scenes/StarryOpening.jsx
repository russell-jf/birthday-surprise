import { useCallback, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useStoryConfig } from '../../context/StoryConfig'
import { prefersReducedMotion } from '../../styles/motion'
import StoryBackground from '../story/StoryBackground'
import './scenes.css'

/** Opening-only timing — a bit leisurely so each line can land. */
const OPEN = {
  delay: 0.35,
  fadeOut: 0.3,
  fadeIn: 0.45,
  hold: 0.9,
  yShift: 10,
}

export default function StarryOpening({ onReady }) {
  const { config } = useStoryConfig()
  const rootRef = useRef(null)
  const lineRef = useRef(null)
  const timelineRef = useRef(null)
  const onReadyRef = useRef(onReady)
  const revealedRef = useRef(false)
  const lines = config.openingLines

  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  const revealAll = useCallback(() => {
    if (revealedRef.current) return
    revealedRef.current = true
    timelineRef.current?.kill()
    timelineRef.current = null
    if (lineRef.current) {
      gsap.set(lineRef.current, { opacity: 1, y: 0, textContent: lines.join('\n') })
    }
    onReadyRef.current?.()
  }, [lines])

  useEffect(() => {
    revealedRef.current = false
    const reduced = prefersReducedMotion()

    const ctx = gsap.context(() => {
      if (reduced) {
        if (lineRef.current) {
          lineRef.current.textContent = lines.join('\n')
        }
        revealedRef.current = true
        onReadyRef.current?.()
        return
      }

      const tl = gsap.timeline({
        delay: OPEN.delay,
        onComplete: () => {
          if (!revealedRef.current) {
            revealedRef.current = true
            onReadyRef.current?.()
          }
        },
      })
      timelineRef.current = tl

      lines.forEach((line) => {
        tl.to(lineRef.current, {
          opacity: 0,
          y: -OPEN.yShift,
          duration: OPEN.fadeOut,
          ease: 'power1.in',
        })
          .set(lineRef.current, { textContent: line, y: OPEN.yShift })
          .to(lineRef.current, {
            opacity: 1,
            y: 0,
            duration: OPEN.fadeIn,
            ease: 'power2.out',
          })
          .to({}, { duration: OPEN.hold })
      })
    }, rootRef)

    return () => {
      timelineRef.current = null
      ctx.revert()
    }
  }, [lines])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        revealAll()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [revealAll])

  return (
    <section ref={rootRef} className="scene stars-scene" onClick={revealAll}>
      <StoryBackground variant="blush" stars sparkles moon />
      <div className="story-copy scene-copy stars-copy">
        <p ref={lineRef} className="type-line type-line--stack">
          …
        </p>
        <p className="stars-skip-hint"></p>
      </div>
    </section>
  )
}
