import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useStoryConfig } from '../../context/StoryConfig'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { MOTION, prefersReducedMotion } from '../../styles/motion'
import StoryBackground from '../story/StoryBackground'
import StoryCopy from '../story/StoryCopy'
import './scenes.css'

const COUNT_FROM = 3
const COLORS = ['#be1a25', '#ff6b8a', '#ffc0cb', '#ffffff', '#fbbf24', '#ff8fab', '#f472b6']

/** Parametric heart for easter-egg bursts (normalized -1..1 → screen). */
function heartPoint(t, size) {
  const x = 16 * Math.sin(t) ** 3
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
  return { x: (x / 16) * size, y: (-y / 16) * size }
}

function spawnBurst(layer, x, y, reduced, { heart = false, mega = false } = {}) {
  const count = heart ? (reduced ? 24 : 48) : mega ? (reduced ? 36 : 64) : reduced ? 18 : 42
  const maxDist = heart ? 90 : mega ? (reduced ? 110 : 160) : reduced ? 80 : 130

  for (let i = 0; i < count; i += 1) {
    const spark = document.createElement('span')
    spark.className = heart ? 'fw-spark fw-spark--heart' : 'fw-spark'
    spark.style.left = `${x}px`
    spark.style.top = `${y}px`
    spark.style.background = COLORS[i % COLORS.length]
    if (heart) spark.style.boxShadow = `0 0 14px ${COLORS[i % COLORS.length]}`
    layer.appendChild(spark)

    let dx
    let dy
    if (heart) {
      const p = heartPoint((Math.PI * 2 * i) / count, maxDist * (0.75 + Math.random() * 0.35))
      dx = p.x
      dy = p.y
    } else {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2
      const dist = 40 + Math.random() * maxDist
      dx = Math.cos(angle) * dist
      dy = Math.sin(angle) * dist
    }

    gsap.to(spark, {
      x: dx,
      y: dy,
      opacity: 0,
      scale: heart ? 0.15 : 0.18,
      duration: reduced ? 0.5 : 0.85 + Math.random() * 0.55,
      ease: MOTION.easeOut,
      onComplete: () => spark.remove(),
    })
  }

  /* Secondary ring for denser feel */
  if (!reduced && !heart) {
    const ring = mega ? 20 : 12
    for (let i = 0; i < ring; i += 1) {
      const spark = document.createElement('span')
      spark.className = 'fw-spark fw-spark--tiny'
      spark.style.left = `${x}px`
      spark.style.top = `${y}px`
      spark.style.background = COLORS[(i + 3) % COLORS.length]
      layer.appendChild(spark)
      const angle = (Math.PI * 2 * i) / ring
      const dist = 20 + Math.random() * 40
      gsap.to(spark, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 10,
        opacity: 0,
        scale: 0.1,
        duration: 0.55 + Math.random() * 0.3,
        ease: MOTION.easeOut,
        onComplete: () => spark.remove(),
      })
    }
  }
}

function spawnFloatingNote(layer, x, y, text) {
  const note = document.createElement('div')
  note.className = 'fw-egg'
  note.textContent = text
  note.style.left = `${x}px`
  note.style.top = `${y}px`
  layer.appendChild(note)
  gsap.fromTo(
    note,
    { opacity: 0, y: 8, scale: 0.86 },
    {
      opacity: 1,
      y: -48,
      scale: 1,
      duration: 1.4,
      ease: MOTION.easeOut,
      onComplete: () => {
        gsap.to(note, {
          opacity: 0,
          duration: 0.35,
          onComplete: () => note.remove(),
        })
      },
    },
  )
}

export default function FireworksScene() {
  const { config } = useStoryConfig()
  const [count, setCount] = useState(COUNT_FROM)
  const [celebrating, setCelebrating] = useState(false)
  const layerRef = useRef(null)
  const titleRef = useRef(null)
  const tapCountRef = useRef(0)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (count < 0) return undefined
    if (count === 0) {
      setCelebrating(true)
      return undefined
    }
    const wait = prefersReducedMotion() ? 400 : 900
    const id = window.setTimeout(() => setCount((c) => c - 1), wait)
    return () => window.clearTimeout(id)
  }, [count])

  useEffect(() => {
    if (!celebrating || !layerRef.current) return undefined

    const layer = layerRef.current
    const reduced = prefersReducedMotion()
    const burst = () => {
      const x = window.innerWidth * (0.18 + Math.random() * 0.64)
      const y = window.innerHeight * (0.12 + Math.random() * 0.42)
      spawnBurst(layer, x, y, reduced)
    }

    burst()
    burst()
    const interval = window.setInterval(burst, reduced ? 900 : 480)
    const titleEl = titleRef.current

    if (titleEl) {
      if (reduced) {
        gsap.set(titleEl, { scale: 1, opacity: 1 })
      } else {
        gsap.fromTo(
          titleEl,
          { scale: 0.72, opacity: 0 },
          { scale: 1, opacity: 1, duration: MOTION.soft, ease: MOTION.easeLift },
        )
      }
    }

    return () => {
      window.clearInterval(interval)
      if (titleEl) gsap.killTweensOf(titleEl)
    }
  }, [celebrating])

  const handlePointer = useCallback(
    (e) => {
      if (!celebrating || !layerRef.current) return
      /* Ignore chrome buttons */
      if (e.target instanceof Element && e.target.closest('button, a')) return

      const layer = layerRef.current
      const reduced = prefersReducedMotion()
      const point = 'clientX' in e ? e : e.changedTouches?.[0]
      if (!point) return
      const x = point.clientX
      const y = point.clientY

      tapCountRef.current += 1
      const n = tapCountRef.current
      const isHeart = n % 5 === 0
      const isMega = n % 12 === 0

      spawnBurst(layer, x, y, reduced, { heart: isHeart || isMega, mega: isMega })

      if (isMega) {
        spawnFloatingNote(layer, x, y, `永远爱你，${config.nickname}`)
      } else if (isHeart) {
        spawnFloatingNote(layer, x, y, '♡ 小心心烟花')
      }
    },
    [celebrating, config.nickname],
  )

  return (
    <section
      className={`scene finale-scene${celebrating ? ' is-live' : ''}`}
      onPointerDown={handlePointer}
    >
      <StoryBackground variant="deep" sparkles={!reducedMotion} />
      <div className="finale-glow" aria-hidden />
      <div ref={layerRef} className="fw-layer" aria-hidden />

      {!celebrating ? (
        <div className="countdown">
          <span key={count} className="countdown-num">
            {count}
          </span>
          <p>准备烟花…</p>
        </div>
      ) : (
        <StoryCopy className="finale-copy" titleAs="h1">
          <h1 ref={titleRef} className="story-title">
            生日快乐，{config.nickname}！
          </h1>
          <p className="story-body">愿你被爱包围，像今晚的烟花一样闪亮。</p>
          <p className="finale-tap-hint">轻触屏幕，为你绽放</p>
        </StoryCopy>
      )}
    </section>
  )
}
