import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { useStoryConfig } from '../../context/StoryConfig'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { MOTION, prefersReducedMotion } from '../../styles/motion'
import StoryBackground from '../story/StoryBackground'
import './scenes.css'

const COUNT_FROM = 3
const SWIPE_THRESHOLD = 42
const COLORS = ['#aa587a', '#c96f85', '#efb8c8', '#fffaf0', '#ffe9a3', '#8b80b8', '#e1a9be']

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
  const [photoIndex, setPhotoIndex] = useState(0)
  const layerRef = useRef(null)
  const titleRef = useRef(null)
  const tapCountRef = useRef(0)
  const swipeRef = useRef({ active: false, x: 0, y: 0, moved: false })
  const reducedMotion = useReducedMotion()

  const photos = useMemo(() => {
    const list = (config.memories || []).filter((m) => m?.src)
    if (!list.length) return []
    const preferred = list.findIndex((m) => m.title === '今天也爱你')
    if (preferred <= 0) return list
    return [list[preferred], ...list.slice(0, preferred), ...list.slice(preferred + 1)]
  }, [config.memories])

  const finalePhoto = photos[photoIndex] || photos[0]

  useEffect(() => {
    setPhotoIndex(0)
  }, [photos])

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

  const stepPhoto = useCallback(
    (dir) => {
      if (photos.length < 2) return
      setPhotoIndex((i) => (i + dir + photos.length) % photos.length)
    },
    [photos.length],
  )

  const onPhotoPointerDown = useCallback((e) => {
    e.stopPropagation()
    const point = 'clientX' in e ? e : e.changedTouches?.[0]
    if (!point) return
    if (typeof e.currentTarget?.setPointerCapture === 'function' && e.pointerId != null) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {
        /* ignore capture failures on unsupported targets */
      }
    }
    swipeRef.current = { active: true, x: point.clientX, y: point.clientY, moved: false }
  }, [])

  const onPhotoPointerMove = useCallback((e) => {
    if (!swipeRef.current.active) return
    const point = 'clientX' in e ? e : e.changedTouches?.[0]
    if (!point) return
    const dx = point.clientX - swipeRef.current.x
    const dy = point.clientY - swipeRef.current.y
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) swipeRef.current.moved = true
  }, [])

  const onPhotoPointerUp = useCallback(
    (e) => {
      if (!swipeRef.current.active) return
      const point = 'clientX' in e ? e : e.changedTouches?.[0]
      const start = swipeRef.current
      swipeRef.current = { active: false, x: 0, y: 0, moved: false }
      if (!point) return
      const dx = point.clientX - start.x
      const dy = point.clientY - start.y
      if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return
      e.stopPropagation()
      stepPhoto(dx < 0 ? 1 : -1)
    },
    [stepPhoto],
  )

  const handlePointer = useCallback(
    (e) => {
      if (!celebrating || !layerRef.current) return
      if (
        e.target instanceof Element &&
        e.target.closest('button, a, .finale-polaroid, .finale-card-head, .finale-card-msg')
      ) {
        return
      }

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
      <StoryBackground scene="finale" sparkles={!reducedMotion} />
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
        <div className="finale-card" ref={titleRef}>
          <div className="finale-card-blob finale-card-blob--tl" aria-hidden />
          <div className="finale-card-blob finale-card-blob--br" aria-hidden />
          <span className="finale-card-spark finale-card-spark--a" aria-hidden />
          <span className="finale-card-spark finale-card-spark--b" aria-hidden />
          <span className="finale-card-spark finale-card-spark--c" aria-hidden />

          <header className="finale-card-head">
            <p className="finale-card-happy">HAPPY</p>
            <h1 className="finale-card-birthday">Birthday</h1>
          </header>

          {finalePhoto?.src ? (
            <div
              className="finale-polaroid"
              role="img"
              aria-label={`${finalePhoto.title || '回忆照片'}，左右滑动可切换`}
              onPointerDown={onPhotoPointerDown}
              onPointerMove={onPhotoPointerMove}
              onPointerUp={onPhotoPointerUp}
              onPointerCancel={onPhotoPointerUp}
            >
              <div className="finale-polaroid-frame">
                <div className="finale-polaroid-shot">
                  <img
                    key={finalePhoto.src + photoIndex}
                    className="finale-polaroid-img"
                    src={finalePhoto.src}
                    alt={finalePhoto.title || ''}
                    decoding="async"
                    draggable="false"
                  />
                  <span className="finale-polaroid-grain" aria-hidden />
                  <span className="finale-polaroid-vignette" aria-hidden />
                </div>
                <p className="finale-polaroid-caption">宝宝 ♡</p>
              </div>
            </div>
          ) : null}

          <p className="finale-card-msg">
            愿你被爱包围，像今晚的烟花一样闪亮。
            <br />
            生日快乐，我的{config.nickname}。
          </p>
        </div>
      )}
    </section>
  )
}
