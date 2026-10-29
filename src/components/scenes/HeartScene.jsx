import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { MOTION, prefersReducedMotion } from '../../styles/motion'
import StoryBackground from '../story/StoryBackground'
import './scenes.css'

const PETAL_COUNT = 28
const PETAL_COUNT_REDUCED = 12

/**
 * Embeds Awesome-Love-Code Web/002 (MIT) — canvas rose.
 * Phase 1: fade in + rise + sway + starlight
 * Phase 2: petal scatter + slight zoom → onOpened
 */
export default function HeartScene({ onReady, opening = false, onOpened }) {
  const rootRef = useRef(null)
  const stageRef = useRef(null)
  const swayTween = useRef(null)
  const reducedMotion = useReducedMotion()
  const onReadyRef = useRef(onReady)
  const onOpenedRef = useRef(onOpened)

  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  useEffect(() => {
    onOpenedRef.current = onOpened
  }, [onOpened])

  useEffect(() => {
    const reduced = prefersReducedMotion()

    const ctx = gsap.context(() => {
      const stage = stageRef.current

      if (reduced) {
        gsap.set(rootRef.current, { opacity: 1 })
        gsap.set(stage, { y: 0, scale: 1 })
        onReadyRef.current?.()
        return
      }

      gsap.set(rootRef.current, { opacity: 0 })
      gsap.set(stage, { y: '36%', scale: 0.94, transformOrigin: '50% 60%' })

      const tl = gsap.timeline({
        onComplete: () => onReadyRef.current?.(),
      })

      tl.to(rootRef.current, {
        opacity: 1,
        duration: MOTION.soft,
        ease: MOTION.easeOut,
      }).to(
        stage,
        {
          y: 0,
          scale: 1,
          duration: 2,
          ease: MOTION.easeLift,
        },
        0.12,
      )

      swayTween.current = gsap.to(stage, {
        rotation: 2,
        duration: 2.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 1.9,
      })
    }, rootRef)

    return () => {
      swayTween.current?.kill()
      ctx.revert()
    }
  }, [])

  useEffect(() => {
    if (!opening) return undefined

    const stage = stageRef.current
    const petals = gsap.utils.toArray('.heart-scatter-petal', rootRef.current)
    swayTween.current?.kill()
    const reduced = prefersReducedMotion()

    if (reduced) {
      onOpenedRef.current?.()
      return undefined
    }

    const tl = gsap.timeline({
      onComplete: () => onOpenedRef.current?.(),
    })

    gsap.set(petals, {
      opacity: 0,
      x: 0,
      y: 0,
      scale: 0.4,
      rotation: 0,
    })

    tl.to(
      stage,
      {
        scale: 1.16,
        opacity: 0.15,
        rotation: 0,
        duration: MOTION.emphasis,
        ease: MOTION.easeSoft,
      },
      0,
    )
      .to(
        rootRef.current,
        {
          scale: 1.05,
          duration: MOTION.emphasis,
          ease: MOTION.easeSoft,
          transformOrigin: '50% 50%',
        },
        0,
      )
      .to(
        petals,
        {
          opacity: 1,
          duration: 0.2,
          stagger: 0.012,
        },
        0.05,
      )
      .to(
        petals,
        {
          x: () => gsap.utils.random(-220, 220),
          y: () => gsap.utils.random(-280, 120),
          rotation: () => gsap.utils.random(-160, 160),
          scale: () => gsap.utils.random(0.55, 1.25),
          opacity: 0,
          duration: 1.05,
          stagger: { each: 0.018, from: 'center' },
          ease: MOTION.easeOut,
        },
        0.12,
      )
      .to(
        rootRef.current,
        {
          opacity: 0,
          duration: MOTION.fadeOut,
          ease: MOTION.easeIn,
        },
        0.85,
      )

    return () => tl.kill()
  }, [opening])

  const petals = Array.from({ length: reducedMotion ? PETAL_COUNT_REDUCED : PETAL_COUNT }, (_, i) => (
    <span
      key={i}
      className="heart-scatter-petal"
      style={{
        left: `${42 + (i % 7) * 2.5}%`,
        top: `${38 + Math.floor(i / 7) * 4}%`,
        ['--petal-hue']: `${330 + (i % 5) * 6}`,
      }}
      aria-hidden
    />
  ))

  return (
    <section ref={rootRef} className="scene heart-scene">
      <StoryBackground variant="glow" stars starCount={40} />

      <div ref={stageRef} className="heart-stage">
        <iframe
          className="love002-frame"
          title="玫瑰"
          src={`${import.meta.env.BASE_URL}love002/index.html`}
          allow="autoplay"
        />
      </div>

      <div className="heart-scatter" aria-hidden>
        {petals}
      </div>
    </section>
  )
}
