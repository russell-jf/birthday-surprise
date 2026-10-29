import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import './scenes.css'

const PETAL_COUNT = 28
const STAR_COUNT = 48

/**
 * Embeds Awesome-Love-Code Web/002 (MIT) — canvas 玫瑰.
 * Source lives in /public/love002
 *
 * Phase 1: fade in + rise + sway + starlight
 * Phase 2: petal scatter + slight zoom → onOpened
 */
export default function HeartScene({ onReady, opening = false, onOpened }) {
  const rootRef = useRef(null)
  const stageRef = useRef(null)
  const swayTween = useRef(null)
  const onReadyRef = useRef(onReady)
  const onOpenedRef = useRef(onOpened)
  onReadyRef.current = onReady
  onOpenedRef.current = onOpened

  // Phase 1 — 登场
  useEffect(() => {
    const ctx = gsap.context(() => {
      const stars = gsap.utils.toArray('.heart-star')
      const stage = stageRef.current

      gsap.set(rootRef.current, { opacity: 0 })
      gsap.set(stage, { y: '42%', scale: 0.92, transformOrigin: '50% 60%' })
      gsap.set(stars, { opacity: 0, scale: 0.2 })

      const tl = gsap.timeline({
        onComplete: () => onReadyRef.current?.(),
      })

      tl.to(rootRef.current, {
        opacity: 1,
        duration: 1.1,
        ease: 'power2.out',
      })
        .to(
          stage,
          {
            y: 0,
            scale: 1,
            duration: 2.2,
            ease: 'power3.out',
          },
          0.15,
        )
        .to(
          stars,
          {
            opacity: () => gsap.utils.random(0.25, 0.95),
            scale: 1,
            duration: 1.6,
            stagger: { each: 0.025, from: 'random' },
            ease: 'power2.out',
          },
          0.45,
        )

      // 花瓣轻微摆动
      swayTween.current = gsap.to(stage, {
        rotation: 2.2,
        duration: 2.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 2.1,
      })
    }, rootRef)

    return () => {
      swayTween.current?.kill()
      ctx.revert()
    }
  }, [])

  // Phase 2 — 点击开启
  useEffect(() => {
    if (!opening) return

    const stage = stageRef.current
    const petals = gsap.utils.toArray('.heart-scatter-petal', rootRef.current)
    swayTween.current?.kill()

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
        scale: 1.18,
        opacity: 0.15,
        rotation: 0,
        duration: 1.15,
        ease: 'power2.inOut',
      },
      0,
    )
      .to(
        rootRef.current,
        {
          scale: 1.06,
          duration: 1.15,
          ease: 'power2.inOut',
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
          ease: 'power2.out',
        },
        0.12,
      )
      .to(
        rootRef.current,
        {
          opacity: 0,
          duration: 0.35,
          ease: 'power1.in',
        },
        0.85,
      )

    return () => tl.kill()
  }, [opening])

  const stars = Array.from({ length: STAR_COUNT }, (_, i) => (
    <span
      key={i}
      className="heart-star"
      style={{
        left: `${(i * 19) % 100}%`,
        top: `${(i * 31) % 100}%`,
        width: `${1 + (i % 3)}px`,
        height: `${1 + (i % 3)}px`,
        animationDelay: `${(i % 8) * 0.22}s`,
      }}
    />
  ))

  const petals = Array.from({ length: PETAL_COUNT }, (_, i) => (
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
      <div className="heart-sky" aria-hidden />
      <div className="heart-star-field" aria-hidden>
        {stars}
      </div>

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
