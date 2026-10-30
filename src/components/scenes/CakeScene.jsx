import { useEffect, useRef, useState } from 'react'
import { useBlowDetection } from '../../hooks/useBlowDetection'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import PrimaryButton from '../story/PrimaryButton'
import StoryBackground from '../story/StoryBackground'
import StoryCopy from '../story/StoryCopy'
import './scenes.css'

function statusCopy(status, lit) {
  if (!lit || status === 'done') return '愿望已收下，蜡烛熄灭啦！'
  if (status === 'blowing') return '检测到吹气，再坚持一下…'
  if (status === 'listening') return '正在听，对着麦克风轻轻吹一口气～'
  if (status === 'denied') return '未授权麦克风 · 可用下方按钮吹灭'
  return '点「用麦克风吹蜡烛」开启权限，或直接手动吹灭'
}

function Candle({ lit, reduced, delay = 0 }) {
  return (
    <span className={`cake-candle${lit ? '' : ' is-out'}`} style={{ '--flame-delay': `${delay}s` }}>
      <span className="cake-candle__stick" />
      <span className="cake-candle__flame" aria-hidden>
        {!reduced ? <span className="cake-candle__glow" /> : null}
        <span className="cake-candle__outer" />
        <span className="cake-candle__inner" />
      </span>
      {!lit ? <span className="cake-candle__smoke" aria-hidden /> : null}
    </span>
  )
}

function IllustratedCake({ lit, reduced }) {
  return (
    <div className={`cake-illust${lit ? '' : ' is-out'}${reduced ? ' is-reduced' : ''}`}>
      <div className="cake-illust__plate" />
      <div className="cake-illust__tier cake-illust__tier--base">
        <span className="cake-illust__frost" />
        <span className="cake-illust__drip cake-illust__drip--l" />
        <span className="cake-illust__drip cake-illust__drip--c" />
        <span className="cake-illust__drip cake-illust__drip--r" />
        <span className="cake-illust__berry cake-illust__berry--1" />
        <span className="cake-illust__berry cake-illust__berry--2" />
        <span className="cake-illust__berry cake-illust__berry--3" />
      </div>
      <div className="cake-illust__tier cake-illust__tier--top">
        <span className="cake-illust__frost cake-illust__frost--top" />
        <span className="cake-illust__bow" />
      </div>
      <div className="cake-illust__candles">
        <Candle lit={lit} reduced={reduced} delay={0} />
        <Candle lit={lit} reduced={reduced} delay={0.18} />
        <Candle lit={lit} reduced={reduced} delay={0.08} />
      </div>
      {lit && !reduced ? (
        <div className="cake-illust__sparkles" aria-hidden>
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

export default function CakeScene({ onExtinguished }) {
  const [lit, setLit] = useState(true)
  const blownRef = useRef(false)
  const reduced = useReducedMotion()
  const { status, startListening, setOnBlow, setMeterEl } = useBlowDetection({
    enabled: lit,
    holdMs: 380,
  })

  useEffect(() => {
    setOnBlow(() => {
      if (blownRef.current) return
      blownRef.current = true
      setLit(false)
      onExtinguished?.()
    })
  }, [onExtinguished, setOnBlow])

  const extinguishManually = () => {
    if (blownRef.current) return
    blownRef.current = true
    setLit(false)
    onExtinguished?.()
  }

  const showMicButton = lit && status === 'idle'
  const showMeter = lit && (status === 'listening' || status === 'blowing')

  return (
    <section className="scene cake-scene">
      <StoryBackground variant="blush" sparkles={lit && !reduced} />
      <StoryCopy title="许个愿吧" subtitle={statusCopy(status, lit)} />

      <div className="cake-stage" aria-hidden={!lit}>
        <IllustratedCake lit={lit} reduced={reduced} />
      </div>

      <div className="cake-controls">
        {showMeter ? (
          <div className="mic-meter" aria-hidden>
            <div className="mic-meter-fill" ref={setMeterEl} />
          </div>
        ) : null}

        {lit && status === 'denied' ? (
          <p className="mic-hint">未授权麦克风 · 可用下方按钮</p>
        ) : null}
        {lit && status === 'blowing' ? <p className="mic-hint hot">检测到吹气…</p> : null}

        {showMicButton ? (
          <PrimaryButton onClick={() => startListening()}>用麦克风吹蜡烛</PrimaryButton>
        ) : null}

        {lit ? (
          <PrimaryButton variant="ghost" onClick={extinguishManually}>
            轻轻吹灭蜡烛
          </PrimaryButton>
        ) : null}
      </div>
    </section>
  )
}
