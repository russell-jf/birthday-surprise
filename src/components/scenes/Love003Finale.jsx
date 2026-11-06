import { useEffect, useMemo, useRef, useState } from 'react'
import { togetherStartDate } from '../../data/content'
import { useStoryConfig } from '../../context/StoryConfig'
import { prefersReducedMotion } from '../../styles/motion'
import StoryBackground from '../story/StoryBackground'
import './scenes.css'

function pad2(n) {
  return String(n).padStart(2, '0')
}

function elapseFrom(date) {
  const secondsTotal = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  const days = Math.floor(secondsTotal / 86400)
  const hours = Math.floor((secondsTotal % 86400) / 3600)
  const minutes = Math.floor((secondsTotal % 3600) / 60)
  const seconds = secondsTotal % 60
  return { days, hours, minutes, seconds }
}

/**
 * Envelope gate → open to show the configured love letter directly.
 * phase: sealed | opening | opened | closing
 */
export default function Love003Finale() {
  const { config } = useStoryConfig()
  const [phase, setPhase] = useState('sealed')
  const [elapse, setElapse] = useState(null)
  const timersRef = useRef([])

  const together = config.together
  const togetherDate = useMemo(() => togetherStartDate(together), [together])

  const letterBlocks = useMemo(() => {
    const lines = config.letterLines?.length ? config.letterLines : []
    const blocks = []
    let buf = []
    lines.forEach((line) => {
      const text = String(line)
      if (!text.trim()) {
        if (buf.length) {
          blocks.push({ type: 'para', lines: buf })
          buf = []
        }
        return
      }
      if (text.trim().startsWith('--')) {
        if (buf.length) {
          blocks.push({ type: 'para', lines: buf })
          buf = []
        }
        blocks.push({ type: 'sign', text: text.trim().replace(/^--\s*/, '') })
        return
      }
      buf.push(text)
    })
    if (buf.length) blocks.push({ type: 'para', lines: buf })
    return blocks
  }, [config.letterLines])

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }

  const later = (fn, ms) => {
    const id = window.setTimeout(fn, ms)
    timersRef.current.push(id)
    return id
  }

  useEffect(() => () => clearTimers(), [])

  useEffect(() => {
    const tick = () => setElapse(elapseFrom(togetherDate))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [togetherDate])

  const openEnvelope = () => {
    if (phase !== 'sealed') return
    const reduced = prefersReducedMotion()
    clearTimers()
    setPhase('opening')
    later(() => setPhase('opened'), reduced ? 100 : 1180)
  }

  const closeEnvelope = () => {
    if (phase !== 'opened') return
    const reduced = prefersReducedMotion()
    clearTimers()
    setPhase('closing')
    later(() => setPhase('sealed'), reduced ? 120 : 980)
  }

  const onStageClick = (e) => {
    if (phase !== 'opened') return
    if (e.target.closest('.letter-card')) return
    closeEnvelope()
  }

  const showLetter = phase === 'opened' || phase === 'closing'
  const gateClass = [
    'envelope-gate',
    phase === 'opening' ? 'is-opening' : '',
    phase === 'opened' ? 'is-open-hold' : '',
    phase === 'closing' ? 'is-closing' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      className={`scene love003-scene${showLetter ? ' is-opened' : ''}${phase === 'closing' ? ' is-closing' : ''}`}
      onClick={onStageClick}
    >
      <StoryBackground scene="letter" />

      <div className="envelope-stage">
        <div className="envelope-gate-grid" aria-hidden />
        <span className="envelope-spark envelope-spark--a" aria-hidden />
        <span className="envelope-spark envelope-spark--b" aria-hidden />
        <span className="envelope-spark envelope-spark--c" aria-hidden />

        <div className={gateClass}>
          <div className="envelope-postmark" aria-hidden>
            <span>SPECIAL</span>
            <span>DELIVERY</span>
            <strong>今天</strong>
          </div>

          <p className="envelope-lead">有一封信在等你</p>

          <button
            type="button"
            className="envelope"
            aria-label={`打开给${config.nickname}的信封`}
            onClick={openEnvelope}
            disabled={phase !== 'sealed'}
          >
            <div className="envelope-sheet" aria-hidden>
              <p className="envelope-sheet-title">有一封信，等你很久了</p>
            </div>
            <div className="envelope-flap" aria-hidden />
            <div className="envelope-pocket" aria-hidden />
            <span className="envelope-seal" aria-hidden>
              <svg viewBox="0 0 24 24" width="20" height="20" focusable="false">
                <path
                  d="M12 20s-7-4.6-7-9.2A3.8 3.8 0 0 1 12 8.2a3.8 3.8 0 0 1 7 2.6C19 15.4 12 20 12 20z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="envelope-for">FOR YOU</span>
          </button>


          <div className="letter-clock-box">
            <span className="letter-clock-name">{together.fromName}</span> 和{' '}
            <span className="letter-clock-name">{together.toName}</span> 在一起的
            <div className="letter-clock" aria-live="polite">
              {elapse ? (
                <>
                  第 <span className="letter-clock-digit">{elapse.days}</span> 天{' '}
                  <span className="letter-clock-digit">{pad2(elapse.hours)}</span> 小时{' '}
                  <span className="letter-clock-digit">{pad2(elapse.minutes)}</span> 分钟{' '}
                  <span className="letter-clock-digit">{pad2(elapse.seconds)}</span> 秒
                </>
              ) : null}
            </div>
          </div>
        </div>

        {showLetter ? (
          <>
            <article
              className={`letter-card${phase === 'closing' ? ' is-closing' : ''}`}
              aria-label="生日情书"
            >
              <div className="letter-card-stamp" aria-hidden>
                <span>SPECIAL</span>
                <span>DELIVERY</span>
              </div>

              <div className="letter-card-inner">
                <h2 className="letter-card-title">有一封信，等你很久了</h2>

                <div className="letter-card-body">
                  {letterBlocks.map((block, i) =>
                    block.type === 'sign' ? (
                      <p key={`s-${i}`} className="letter-card-sign">
                        —— {block.text}
                      </p>
                    ) : (
                      <p key={`p-${i}`} className="letter-card-para">
                        {block.lines.map((line, j) => (
                          <span key={j}>
                            {line}
                            {j < block.lines.length - 1 ? <br /> : null}
                          </span>
                        ))}
                      </p>
                    ),
                  )}
                </div>

                <p className="letter-card-for">FOR YOU</p>
              </div>
            </article>

          </>
        ) : null}
      </div>
    </section>
  )
}
