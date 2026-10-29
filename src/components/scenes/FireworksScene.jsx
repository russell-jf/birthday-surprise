import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { NICKNAME } from '../../data/content'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { MOTION, prefersReducedMotion } from '../../styles/motion'
import StoryBackground from '../story/StoryBackground'
import StoryCopy from '../story/StoryCopy'
import './scenes.css'

const COUNT_FROM = 3

function spawnBurst(layer, x, y, reduced) {
  const colors = ['#be1a25', '#ff6b8a', '#ffc0cb', '#ffffff', '#fbbf24', '#ff8fab']
  const count = reduced ? 12 : 28
  for (let i = 0; i < count; i += 1) {
    const spark = document.createElement('span')
    spark.className = 'fw-spark'
    spark.style.left = `${x}px`
    spark.style.top = `${y}px`
    spark.style.background = colors[i % colors.length]
    layer.appendChild(spark)

    const angle = (Math.PI * 2 * i) / count
    const dist = 60 + Math.random() * (reduced ? 70 : 120)
    gsap.to(spark, {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      opacity: 0,
      scale: 0.2,
      duration: reduced ? 0.45 : 0.9 + Math.random() * 0.5,
      ease: MOTION.easeOut,
      onComplete: () => spark.remove(),
    })
  }
}

export default function FireworksScene() {
  const [count, setCount] = useState(COUNT_FROM)
  const [celebrating, setCelebrating] = useState(false)
  const layerRef = useRef(null)
  const titleRef = useRef(null)
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
      const x = window.innerWidth * (0.2 + Math.random() * 0.6)
      const y = window.innerHeight * (0.15 + Math.random() * 0.45)
      spawnBurst(layer, x, y, reduced)
    }

    burst()
    const interval = window.setInterval(burst, reduced ? 1200 : 700)
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

  return (
    <section className="scene finale-scene">
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
            生日快乐，{NICKNAME}！
          </h1>
          <p className="story-body">愿你被爱包围，像今晚的烟花一样闪亮。</p>
        </StoryCopy>
      )}
    </section>
  )
}
