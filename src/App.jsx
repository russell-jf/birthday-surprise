import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { SCENES } from './data/content'
import { StoryConfigProvider, useStoryConfig } from './context/StoryConfig'
import SceneChrome from './components/SceneChrome'
import StoryTransition from './components/StoryTransition'
import StarryOpening from './components/scenes/StarryOpening'
import FireworksScene from './components/scenes/FireworksScene'
import Love003Finale from './components/scenes/Love003Finale'
import { ensureSceneHash, hashForScene, sceneIndexFromHash } from './utils/sceneHash'

const HeartScene = lazy(() => import('./components/scenes/HeartScene'))
const AlbumScene = lazy(() => import('./components/scenes/AlbumScene'))
const CakeScene = lazy(() => import('./components/scenes/CakeScene'))

function SceneFallback() {
  return <div className="fade-panel">加载中…</div>
}

function clampScene(index) {
  return Math.max(0, Math.min(index, SCENES.length - 1))
}

function StoryApp() {
  const { ready, error, config } = useStoryConfig()
  const [sceneIndex, setSceneIndex] = useState(() =>
    typeof window !== 'undefined' ? sceneIndexFromHash() : 0,
  )
  const [openingReady, setOpeningReady] = useState(false)
  const [heartReady, setHeartReady] = useState(false)
  const [heartOpening, setHeartOpening] = useState(false)
  const [cakeDone, setCakeDone] = useState(false)
  const titleRef = useRef(null)
  const sceneIndexRef = useRef(sceneIndex)
  const ctaRef = useRef({ disabled: true, handleCta: () => {} })

  useEffect(() => {
    sceneIndexRef.current = sceneIndex
  }, [sceneIndex])

  const resetGatesFor = useCallback((index) => {
    // Re-enter gated scenes with a fresh lock; later scenes stay unlocked.
    setOpeningReady(false)
    setHeartReady(false)
    setHeartOpening(false)
    setCakeDone(false)
    if (index > 0) setOpeningReady(true)
    if (index > 1) setHeartReady(true)
    if (index > 3) setCakeDone(true)
  }, [])

  const goTo = useCallback(
    (index) => {
      const next = clampScene(index)
      const hash = hashForScene(next)
      if (window.location.hash === hash) {
        resetGatesFor(next)
        setSceneIndex(next)
        return
      }
      window.location.hash = hash
    },
    [resetGatesFor],
  )

  const goNext = useCallback(() => {
    goTo(sceneIndexRef.current + 1)
  }, [goTo])

  const goPrev = useCallback(() => {
    goTo(sceneIndexRef.current - 1)
  }, [goTo])

  useEffect(() => {
    ensureSceneHash(sceneIndexFromHash())

    const onHashChange = () => {
      const next = sceneIndexFromHash()
      resetGatesFor(next)
      setSceneIndex(next)
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [resetGatesFor])

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true })
  }, [sceneIndex])

  const handleOpeningReady = useCallback(() => setOpeningReady(true), [])
  const handleHeartReady = useCallback(() => setHeartReady(true), [])
  const handleHeartOpened = useCallback(() => {
    setHeartOpening(false)
    setHeartReady(false)
    goNext()
  }, [goNext])
  const handleCakeDone = useCallback(() => setCakeDone(true), [])

  const handleCta = useCallback(() => {
    if (sceneIndexRef.current === 1) {
      if (heartOpening) return
      setHeartOpening(true)
      return
    }
    goNext()
  }, [heartOpening, goNext])

  const ctaDisabled =
    (sceneIndex === 0 && !openingReady) ||
    (sceneIndex === 1 && (!heartReady || heartOpening)) ||
    (sceneIndex === 3 && !cakeDone)

  useEffect(() => {
    ctaRef.current = { disabled: ctaDisabled, handleCta }
  }, [ctaDisabled, handleCta])

  useEffect(() => {
    const isTypingTarget = (el) => {
      if (!el || !(el instanceof Element)) return false
      const tag = el.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
    }

    const onKeyDown = (e) => {
      if (isTypingTarget(e.target)) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
        return
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
        return
      }
      if (e.key === 'Enter') {
        const tag = e.target instanceof Element ? e.target.tagName : ''
        if (tag === 'BUTTON' || tag === 'A') return
        if (ctaRef.current.disabled) return
        if (sceneIndexRef.current >= SCENES.length - 1) return
        e.preventDefault()
        ctaRef.current.handleCta()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goNext, goPrev])

  if (!ready) {
    return <div className="fade-panel">加载惊喜中…</div>
  }

  if (error) {
    return <div className="fade-panel">{error}</div>
  }

  const showCta = sceneIndex < SCENES.length - 1
  const sceneKey = SCENES[sceneIndex]?.id ?? String(sceneIndex)
  const ctaLabel = config.ctaLabels[sceneIndex] ?? '继续'
  const sceneLabel = SCENES[sceneIndex]?.label ?? ''

  return (
    <div className="app">
      <h2 ref={titleRef} className="scene-live-title" tabIndex={-1}>
        {sceneLabel}
      </h2>

      <div className="scene-layer">
        <Suspense fallback={<SceneFallback />}>
          <StoryTransition sceneKey={sceneKey}>
            {sceneIndex === 0 && <StarryOpening onReady={handleOpeningReady} />}
            {sceneIndex === 1 && (
              <HeartScene
                onReady={handleHeartReady}
                opening={heartOpening}
                onOpened={handleHeartOpened}
              />
            )}
            {sceneIndex === 2 && <AlbumScene />}
            {sceneIndex === 3 && <CakeScene onExtinguished={handleCakeDone} />}
            {sceneIndex === 4 && <FireworksScene />}
            {sceneIndex === 5 && <Love003Finale />}
          </StoryTransition>
        </Suspense>
      </div>

      <SceneChrome
        sceneIndex={sceneIndex}
        showCta={showCta}
        ctaLabel={ctaLabel}
        onCta={handleCta}
        ctaDisabled={ctaDisabled}
        onGoTo={goTo}
      />
    </div>
  )
}

export default function App() {
  return (
    <StoryConfigProvider>
      <StoryApp />
    </StoryConfigProvider>
  )
}
