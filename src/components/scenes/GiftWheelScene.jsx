import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LuckyWheel } from '@lucky-canvas/react'
import { GIFT_WHEEL_RIM } from '../../data/content'
import { useStoryConfig } from '../../context/StoryConfig'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import StoryBackground from '../story/StoryBackground'
import StoryCopy from '../story/StoryCopy'
import PrimaryButton from '../story/PrimaryButton'
import './scenes.css'

const MAX_CHANCES = 3
const STORAGE_KEY = 'birthday-surprise:gift-wins'

/* Match lucky-canvas demo: soft cream / mint wedges */
const PRIZE_BG = ['#fff3c4', '#c8f4ef', '#fff3c4', '#c8f4ef', '#fff3c4', '#c8f4ef', '#fff3c4', '#c8f4ef']

function wheelSize() {
  if (typeof window === 'undefined') return 300
  return Math.floor(Math.min(window.innerWidth * 0.78, 340, window.innerHeight * 0.42))
}

function loadWins() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveWins(wins) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(wins))
  } catch {
    /* ignore quota / private mode */
  }
}

/** Weighted pick among gifts not in `excludedIds`. Returns original index, or -1 if none left. */
function pickGiftIndex(gifts, excludedIds = new Set()) {
  const eligible = gifts
    .map((g, i) => ({ g, i }))
    .filter(({ g }) => !excludedIds.has(g.id))
  if (!eligible.length) return -1

  const weights = eligible.map(({ g }) => {
    const w = Number(g.weight)
    return Number.isFinite(w) && w > 0 ? w : 1
  })
  const total = weights.reduce((sum, w) => sum + w, 0)
  let ticket = Math.random() * total
  for (let i = 0; i < eligible.length; i += 1) {
    ticket -= weights[i]
    if (ticket <= 0) return eligible[i].i
  }
  return eligible[eligible.length - 1].i
}

export default function GiftWheelScene({ onPicked }) {
  const { config } = useStoryConfig()
  const gifts = useMemo(
    () => (config.gifts?.length ? config.gifts : []),
    [config.gifts],
  )
  const reducedMotion = useReducedMotion()
  const luckyRef = useRef(null)
  const spinningRef = useRef(false)
  const pendingIndexRef = useRef(0)
  const onPickedRef = useRef(onPicked)
  const [spinning, setSpinning] = useState(false)
  const [wins, setWins] = useState(() => loadWins())
  const [winModal, setWinModal] = useState(null)
  const [bagOpen, setBagOpen] = useState(false)
  const [size, setSize] = useState(wheelSize)

  const chancesLeft = Math.max(0, MAX_CHANCES - wins.length)
  const wonIds = useMemo(() => new Set(wins.map((w) => w.id)), [wins])

  useEffect(() => {
    onPickedRef.current = onPicked
  }, [onPicked])

  useEffect(() => {
    if (wins.length) onPickedRef.current?.()
  }, [wins.length])

  useEffect(() => {
    const onResize = () => setSize(wheelSize())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!winModal && !bagOpen) return undefined
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      setWinModal(null)
      setBagOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [bagOpen, winModal])

  const blocks = useMemo(
    () => [
      {
        padding: '16px',
        background: '#ff6b9d',
        imgs: [
          {
            src: GIFT_WHEEL_RIM,
            width: '100%',
            height: '100%',
            rotate: true,
          },
        ],
      },
    ],
    [],
  )

  const prizes = useMemo(
    () =>
      gifts.map((gift, i) => {
        const emptied = wonIds.has(gift.id)
        const imgSize = size < 280 ? '28%' : '30%'
        return {
          background: emptied ? '#e5dde1' : PRIZE_BG[i % PRIZE_BG.length],
          fonts: [
            {
              text: emptied ? '抽空了' : gift.label,
              top: emptied ? '38%' : '10%',
              fontColor: emptied ? '#9a8a90' : '#9d174d',
              fontSize: size < 280 ? '12px' : '13px',
              fontWeight: '600',
              lineHeight: '16px',
              wordWrap: true,
              lengthLimit: '70%',
            },
          ],
          imgs:
            emptied || !gift.image
              ? []
              : [
                  {
                    src: gift.image,
                    top: '36%',
                    width: imgSize,
                    height: imgSize,
                  },
                ],
        }
      }),
    [gifts, size, wonIds],
  )

  const spinLabel = spinning
    ? '…'
    : chancesLeft <= 0
      ? '已抽完'
      : wins.length
        ? '再抽'
        : '抽奖'

  const buttons = useMemo(
    () => [
      { radius: '48%', background: '#ff6b9d' },
      { radius: '42%', background: '#ffffff' },
      {
        radius: '36%',
        background: chancesLeft <= 0 ? '#c9a0ad' : '#ff5f93',
        pointer: true,
        fonts: [
          {
            text: spinLabel,
            top: '-12px',
            fontColor: '#ffffff',
            fontSize: size < 280 ? '14px' : '16px',
            fontWeight: '700',
          },
        ],
      },
    ],
    [chancesLeft, size, spinLabel],
  )

  const defaultConfig = useMemo(
    () => ({
      gutter: '0px',
      speed: reducedMotion ? 12 : 20,
      accelerationTime: reducedMotion ? 400 : 2200,
      decelerationTime: reducedMotion ? 700 : 3000,
      stopRange: 0.55,
    }),
    [reducedMotion],
  )

  const defaultStyle = useMemo(
    () => ({
      fontColor: '#9d174d',
      fontSize: '13px',
      fontWeight: '600',
    }),
    [],
  )

  const handleStart = useCallback(() => {
    if (spinningRef.current || !luckyRef.current || !gifts.length) return
    if (chancesLeft <= 0) return

    const index = pickGiftIndex(gifts, wonIds)
    if (index < 0) return

    spinningRef.current = true
    setSpinning(true)
    setWinModal(null)
    setBagOpen(false)

    pendingIndexRef.current = index
    luckyRef.current.play()
    window.setTimeout(
      () => luckyRef.current?.stop(index),
      reducedMotion ? 450 : 2800,
    )
  }, [chancesLeft, gifts, reducedMotion, wonIds])

  const handleEnd = useCallback(() => {
    spinningRef.current = false
    setSpinning(false)
    const picked = gifts[pendingIndexRef.current]
    if (!picked) return

    const entry = {
      ...picked,
      drawId: `${picked.id}-${Date.now()}`,
    }
    setWins((prev) => {
      const next = [...prev, entry].slice(0, MAX_CHANCES)
      saveWins(next)
      return next
    })
    setWinModal(entry)
    onPicked?.(entry)
  }, [gifts, onPicked])

  if (!gifts.length) {
    return (
      <section className="scene gift-scene">
        <StoryBackground variant="blush" sparkles={!reducedMotion} />
        <StoryCopy title="礼物转盘" subtitle="还没有准备好礼物清单。" />
      </section>
    )
  }

  return (
    <section className="scene gift-scene">
      <StoryBackground variant="blush" sparkles={!reducedMotion} />

      <StoryCopy className="gift-copy" titleAs="h1">
        <h1 className="story-title">挑选一份礼物</h1>
      </StoryCopy>

      <div className="gift-stage" style={{ width: size, height: size }}>
        <LuckyWheel
          key={`wheel-${[...wonIds].sort().join('|') || '0'}`}
          ref={luckyRef}
          width={`${size}px`}
          height={`${size}px`}
          blocks={blocks}
          prizes={prizes}
          buttons={buttons}
          defaultConfig={defaultConfig}
          defaultStyle={defaultStyle}
          onStart={handleStart}
          onEnd={handleEnd}
        />
      </div>

      <div className="gift-toolbar">
        <p className="gift-chances" aria-live="polite">
          剩余机会 <strong>{chancesLeft}</strong> / {MAX_CHANCES}
        </p>
        <PrimaryButton
          variant="ghost"
          className="gift-bag-btn"
          onClick={() => setBagOpen(true)}
          disabled={!wins.length}
        >
          我的礼物{wins.length ? ` · ${wins.length}` : ''}
        </PrimaryButton>
      </div>

      {winModal ? (
        <div
          className="gift-modal-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setWinModal(null)
          }}
        >
          <div
            className="gift-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gift-win-title"
          >
            <button
              type="button"
              className="gift-modal-close"
              aria-label="关闭"
              onClick={() => setWinModal(null)}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">
                <path
                  d="M6.4 6.4l11.2 11.2M17.6 6.4L6.4 17.6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <article className="gift-modal-card gift-modal-card--hero">
              <p className="gift-modal-kicker">恭喜抽中</p>
              {winModal.image ? (
                <img className="gift-modal-thumb" src={winModal.image} alt="" />
              ) : null}
              <h2 id="gift-win-title" className="gift-modal-title">
                {winModal.label}
              </h2>
            </article>

            <article className="gift-modal-card gift-modal-card--detail">
              <p className="gift-modal-hint">{winModal.hint}</p>
              <p className="gift-modal-meta">
                {chancesLeft > 0 ? `还可以再抽 ${chancesLeft} 次` : '三次机会已用完'}
              </p>
              <div className="gift-modal-actions">
                <PrimaryButton onClick={() => setWinModal(null)}>开心收下</PrimaryButton>
                {chancesLeft > 0 ? (
                  <PrimaryButton variant="ghost" onClick={() => setWinModal(null)}>
                    继续抽
                  </PrimaryButton>
                ) : (
                  <PrimaryButton
                    variant="ghost"
                    onClick={() => {
                      setWinModal(null)
                      setBagOpen(true)
                    }}
                  >
                    查看我的礼物
                  </PrimaryButton>
                )}
              </div>
            </article>
          </div>
        </div>
      ) : null}

      {bagOpen ? (
        <div
          className="gift-modal-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setBagOpen(false)
          }}
        >
          <div
            className="gift-modal gift-modal--bag"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gift-bag-title"
          >
            <button
              type="button"
              className="gift-modal-close"
              aria-label="关闭"
              onClick={() => setBagOpen(false)}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">
                <path
                  d="M6.4 6.4l11.2 11.2M17.6 6.4L6.4 17.6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <article className="gift-modal-card gift-modal-card--hero">
              <p className="gift-modal-kicker">我的礼物</p>
              <h2 id="gift-bag-title" className="gift-modal-title">
                已抽中 {wins.length} 份
              </h2>
            </article>

            <article className="gift-modal-card gift-modal-card--detail">
              {wins.length ? (
                <ul className="gift-bag-list">
                  {wins.map((item, i) => (
                    <li key={item.drawId} className="gift-bag-item">
                      {item.image ? (
                        <img className="gift-bag-thumb" src={item.image} alt="" />
                      ) : (
                        <span className="gift-bag-thumb gift-bag-thumb--empty" />
                      )}
                      <div className="gift-bag-copy">
                        <p className="gift-bag-label">
                          <span className="gift-bag-index">{i + 1}</span>
                          {item.label}
                        </p>
                        <p className="gift-bag-hint">{item.hint}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="gift-modal-hint">还没有抽中礼物，先去转一次吧。</p>
              )}
            </article>
          </div>
        </div>
      ) : null}
    </section>
  )
}
