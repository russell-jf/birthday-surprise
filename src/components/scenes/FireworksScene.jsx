import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { NICKNAME } from '../../data/content'
import './scenes.css'

const COUNT_FROM = 3

function spawnBurst(layer, x, y) {
  const colors = ['#be1a25', '#ff6b8a', '#ffc0cb', '#ffffff', '#fbbf24', '#ff8fab']
  for (let i = 0; i < 28; i += 1) {
    const spark = document.createElement('span')
    spark.className = 'fw-spark'
    spark.style.left = `${x}px`
    spark.style.top = `${y}px`
    spark.style.background = colors[i % colors.length]
    layer.appendChild(spark)

    const angle = (Math.PI * 2 * i) / 28
    const dist = 60 + Math.random() * 120
    gsap.to(spark, {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      opacity: 0,
      scale: 0.2,
      duration: 0.9 + Math.random() * 0.5,
      ease: 'power2.out',
      onComplete: () => spark.remove(),
    })
  }
}

export default function FireworksScene() {
  const [count, setCount] = useState(COUNT_FROM)
  const [celebrating, setCelebrating] = useState(false)
  const layerRef = useRef(null)
  const titleRef = useRef(null)

  useEffect(() => {
    if (count < 0) return undefined
    if (count === 0) {
      setCelebrating(true)
      return undefined
    }
    const id = window.setTimeout(() => setCount((c) => c - 1), 900)
    return () => window.clearTimeout(id)
  }, [count])

  useEffect(() => {
    if (!celebrating || !layerRef.current) return undefined

    const layer = layerRef.current
    const burst = () => {
      const x = window.innerWidth * (0.2 + Math.random() * 0.6)
      const y = window.innerHeight * (0.15 + Math.random() * 0.45)
      spawnBurst(layer, x, y)
    }

    burst()
    const interval = window.setInterval(burst, 700)
    gsap.fromTo(
      titleRef.current,
      { scale: 0.6, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1, ease: 'back.out(1.6)' },
    )

    return () => window.clearInterval(interval)
  }, [celebrating])

  return (
    <section className="scene finale-scene">
      <div className="finale-glow" />
      <div ref={layerRef} className="fw-layer" aria-hidden />

      {!celebrating ? (
        <div className="countdown">
          <span key={count} className="countdown-num">
            {count}
          </span>
          <p>准备烟花…</p>
        </div>
      ) : (
        <div className="scene-copy finale-copy">
          <h1 ref={titleRef}>生日快乐，{NICKNAME}！</h1>
          <p>愿你被爱包围，像今晚的烟花一样闪亮。</p>
        </div>
      )}
    </section>
  )
}
