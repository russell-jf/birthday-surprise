import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getScenes } from './data/content'
import { StoryConfigProvider, useStoryConfig } from './context/StoryConfig'
import SceneChrome from './components/SceneChrome'
import StoryLoader from './components/StoryLoader'
import StoryTransition from './components/StoryTransition'
import StarryOpening from './components/scenes/StarryOpening'
import FireworksScene from './components/scenes/FireworksScene'
import Love003Finale from './components/scenes/Love003Finale'
import { ensureSceneHash, hashForScene, sceneIndexFromHash } from './utils/sceneHash'
import { preloadLove003 } from './utils/preloadLove003'

const HeartScene = lazy(() => import('./components/scenes/HeartScene'))
const AlbumScene = lazy(() => import('./components/scenes/AlbumScene'))
const CakeScene = lazy(() => import('./components/scenes/CakeScene'))
const GiftWheelScene = lazy(() => import('./components/scenes/GiftWheelScene'))

function StoryApp() {
  const { ready, error, config } = useStoryConfig()
  const scenes = useMemo(() => getScenes(config), [config])
  const [sceneIndex, setSceneIndex] = useState(0)
  const [openingReady, setOpeningReady] = useState(false)
  const [heartReady, setHeartReady] = useState(false)
  const [heartOpening, setHeartOpening] = useState(false)
  const [cakeDone, setCakeDone] = useState(false)
  const [giftDone, setGiftDone] = useState(false)
  const titleRef = useRef(null)
  const sceneIndexRef = useRef(sceneIndex)
  const scenesRef = useRef(scenes)
  const ctaRef = useRef({ disabled: true, handleCta: () => {} })

  useEffect(() => {
    sceneIndexRef.current = sceneIndex
  }, [sceneIndex])

  useEffect(() => {
    scenesRef.current = scenes
  }, [scenes])

  const clampScene = useCallback((index) => {
    return Math.max(0, Math.min(index, scenesRef.current.length - 1))
  }, [])

  const resetGatesFor = useCallback((index, list = scenesRef.current) => {
    const id = list[index]?.id
    setOpeningReady(false)
    setHeartReady(false)
    setHeartOpening(false)
    setCakeDone(false)
    setGiftDone(false)
    const order = list.map((s) => s.id)
    const atOrPast = (sceneId) => {
      const i = order.indexOf(sceneId)
      return i >= 0 && index > i
    }
    if (atOrPast('stars') || index > 0) setOpeningReady(true)
    if (atOrPast('heart')) setHeartReady(true)
    if (atOrPast('cake')) setCakeDone(true)
    if (atOrPast('gift') || id === 'letter') setGiftDone(true)
  }, [])

  const goTo = useCallback(
    (index) => {
      const next = clampScene(index)
      const hash = hashForScene(next, scenesRef.current)
      if (window.location.hash === hash) {
        resetGatesFor(next)
        setSceneIndex(next)
        return
      }
      window.location.hash = hash
    },
    [clampScene, resetGatesFor],
  )

  const goNext = useCallback(() => {
    goTo(sceneIndexRef.current + 1)
  }, [goTo])

  const goPrev = useCallback(() => {
    goTo(sceneIndexRef.current - 1)
  }, [goTo])

  useEffect(() => {
    if (!ready) return
    const initial = sceneIndexFromHash(window.location.hash, scenes)
    ensureSceneHash(initial, scenes)
    resetGatesFor(initial, scenes)
    setSceneIndex(initial)

    const onHashChange = () => {
      const next = sceneIndexFromHash(window.location.hash, scenesRef.current)
      resetGatesFor(next)
      setSceneIndex(next)
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [ready, scenes, resetGatesFor])

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true })
  }, [sceneIndex])

  /* Warm letter-scene assets during earlier scenes so the finale opens faster. */
  useEffect(() => {
    if (!ready) return undefined
    const id = scenes[sceneIndex]?.id
    const nearLetter = id === 'cake' || id === 'finale' || id === 'gift' || id === 'letter'
    if (nearLetter) {
      preloadLove003()
      return undefined
    }
    const ric = window.requestIdleCallback
    if (typeof ric === 'function') {
      const handle = ric(() => preloadLove003(), { timeout: 4000 })
      return () => window.cancelIdleCallback?.(handle)
    }
    const t = window.setTimeout(() => preloadLove003(), 1800)
    return () => window.clearTimeout(t)
  }, [ready, sceneIndex, scenes])

  const handleOpeningReady = useCallback(() => setOpeningReady(true), [])
  const handleHeartReady = useCallback(() => setHeartReady(true), [])
  const handleHeartOpened = useCallback(() => {
    setHeartOpening(false)
    setHeartReady(false)
    goNext()
  }, [goNext])
  const handleCakeDone = useCallback(() => setCakeDone(true), [])
  const handleGiftPicked = useCallback(() => setGiftDone(true), [])

  const sceneId = scenes[sceneIndex]?.id

  const handleCta = useCallback(() => {
    if (scenesRef.current[sceneIndexRef.current]?.id === 'heart') {
      if (heartOpening) return
      setHeartOpening(true)
      return
    }
    goNext()
  }, [heartOpening, goNext])

  const ctaDisabled =
    (sceneId === 'stars' && !openingReady) ||
    (sceneId === 'heart' && (!heartReady || heartOpening)) ||
    (sceneId === 'cake' && !cakeDone) ||
    (sceneId === 'gift' && !giftDone)

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
        if (sceneIndexRef.current >= scenesRef.current.length - 1) return
        e.preventDefault()
        ctaRef.current.handleCta()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goNext, goPrev])

  if (!ready) {
    return <StoryLoader />
  }

  if (error) {
    return <div className="fade-panel">{error}</div>
  }

  const showCta = sceneIndex < scenes.length - 1
  const sceneKey = sceneId ?? String(sceneIndex)
  const ctaLabel = config.ctaLabels[sceneIndex] ?? '继续'
  const sceneLabel = scenes[sceneIndex]?.label ?? ''

  return (
    <div className="app">
      <h2 ref={titleRef} className="scene-live-title" tabIndex={-1}>
        {sceneLabel}
      </h2>

      <div className="scene-layer">
        <Suspense fallback={<StoryLoader />}>
          <StoryTransition sceneKey={sceneKey}>
            {sceneId === 'stars' && <StarryOpening onReady={handleOpeningReady} />}
            {sceneId === 'heart' && (
              <HeartScene
                onReady={handleHeartReady}
                opening={heartOpening}
                onOpened={handleHeartOpened}
              />
            )}
            {sceneId === 'album' && <AlbumScene />}
            {sceneId === 'cake' && <CakeScene onExtinguished={handleCakeDone} />}
            {sceneId === 'finale' && <FireworksScene />}
            {sceneId === 'gift' && <GiftWheelScene onPicked={handleGiftPicked} />}
            {sceneId === 'letter' && <Love003Finale />}
          </StoryTransition>
        </Suspense>
      </div>

      <SceneChrome
        sceneIndex={sceneIndex}
        scenes={scenes}
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
