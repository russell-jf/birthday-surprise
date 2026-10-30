import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { MOTION, prefersReducedMotion } from '../../styles/motion'
import StoryBackground from '../story/StoryBackground'
import StoryCopy from '../story/StoryCopy'
import './scenes.css'

const PETAL_COUNT = 28
const PETAL_COUNT_REDUCED = 12

function IllustratedRose({ reduced }) {
  return (
    <div className={`rose-illust${reduced ? ' is-reduced' : ''}`} aria-hidden>
      <div className="rose-illust__glow" />
      <svg className="rose-illust__svg" viewBox="0 0 240 280" xmlns="http://www.w3.org/2000/svg">
        {/* stem */}
        <path
          d="M118 148 C112 176 108 206 116 248 C118 258 122 262 128 256"
          fill="none"
          stroke="#66bb6a"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M118 148 C112 176 108 206 116 248"
          fill="none"
          stroke="#81c784"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* leaves */}
        <ellipse cx="92" cy="198" rx="28" ry="12" fill="#81c784" transform="rotate(-28 92 198)" />
        <ellipse cx="92" cy="198" rx="18" ry="7" fill="#a5d6a7" transform="rotate(-28 92 198)" opacity="0.75" />
        <ellipse cx="152" cy="214" rx="26" ry="11" fill="#66bb6a" transform="rotate(32 152 214)" />
        <ellipse cx="152" cy="214" rx="16" ry="6" fill="#a5d6a7" transform="rotate(32 152 214)" opacity="0.7" />
        {/* outer petals */}
        <ellipse cx="120" cy="108" rx="52" ry="48" fill="#f48fb1" />
        <ellipse cx="86" cy="118" rx="34" ry="40" fill="#f06292" transform="rotate(-28 86 118)" />
        <ellipse cx="154" cy="118" rx="34" ry="40" fill="#f06292" transform="rotate(28 154 118)" />
        <ellipse cx="100" cy="86" rx="30" ry="36" fill="#f8bbd0" transform="rotate(-18 100 86)" />
        <ellipse cx="140" cy="86" rx="30" ry="36" fill="#f8bbd0" transform="rotate(18 140 86)" />
        {/* mid petals */}
        <ellipse cx="120" cy="100" rx="36" ry="34" fill="#ec407a" />
        <ellipse cx="102" cy="104" rx="22" ry="28" fill="#f48fb1" transform="rotate(-22 102 104)" />
        <ellipse cx="138" cy="104" rx="22" ry="28" fill="#f48fb1" transform="rotate(22 138 104)" />
        <ellipse cx="120" cy="82" rx="24" ry="26" fill="#fce4ec" />
        {/* inner swirl */}
        <ellipse cx="120" cy="98" rx="18" ry="16" fill="#e91e63" />
        <path
          d="M120 86 C132 90 134 104 120 110 C108 104 110 92 120 86 Z"
          fill="#ad1457"
        />
        <ellipse cx="116" cy="94" rx="6" ry="8" fill="#ff80ab" opacity="0.85" />
        {/* soft highlight */}
        <ellipse cx="104" cy="78" rx="10" ry="6" fill="#ffffff" opacity="0.35" />
      </svg>
      {!reduced ? (
        <div className="rose-illust__sparkles">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      ) : null}
    </div>
  )
}

/**
 * Storybook rose — flat illustration.
 * Phase 1: fade in + rise + sway
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
      gsap.set(stage, { y: '28%', scale: 0.92, transformOrigin: '50% 70%' })

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
          duration: 1.8,
          ease: MOTION.easeLift,
        },
        0.12,
      )

      swayTween.current = gsap.to(stage, {
        rotation: 2.2,
        duration: 3.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 1.7,
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
        scale: 1.12,
        opacity: 0.12,
        rotation: 0,
        duration: MOTION.emphasis,
        ease: MOTION.easeSoft,
      },
      0,
    )
      .to(
        rootRef.current,
        {
          scale: 1.04,
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

  const petals = Array.from(
    { length: reducedMotion ? PETAL_COUNT_REDUCED : PETAL_COUNT },
    (_, i) => (
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
    ),
  )

  return (
    <section ref={rootRef} className="scene heart-scene">
      <StoryBackground variant="blush" stars starCount={36} sparkles={!reducedMotion} />
      <StoryCopy title="一朵只给你的玫瑰" subtitle="轻轻晃一晃，再点下方开启我们的故事。" />

      <div className="heart-stage-wrap">
        <div ref={stageRef} className="heart-stage">
          <IllustratedRose reduced={reducedMotion} />
        </div>
      </div>

      <div className="heart-scatter" aria-hidden>
        {petals}
      </div>
    </section>
  )
}
