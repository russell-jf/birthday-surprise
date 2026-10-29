import { Suspense, lazy, useCallback, useState } from 'react'
import { SCENES } from './data/content'
import SceneChrome from './components/SceneChrome'
import StoryTransition from './components/StoryTransition'
import StarryOpening from './components/scenes/StarryOpening'
import FireworksScene from './components/scenes/FireworksScene'
import Love003Finale from './components/scenes/Love003Finale'

const HeartScene = lazy(() => import('./components/scenes/HeartScene'))
const AlbumScene = lazy(() => import('./components/scenes/AlbumScene'))
const CakeScene = lazy(() => import('./components/scenes/CakeScene'))

const CTA_LABELS = [
  '进入惊喜',
  '开启我们的故事',
  '去吹蜡烛',
  '倒数烟花',
  '打开情书',
  null,
]

function SceneFallback() {
  return <div className="fade-panel">加载中…</div>
}

export default function App() {
  const [sceneIndex, setSceneIndex] = useState(0)
  const [openingReady, setOpeningReady] = useState(false)
  const [heartReady, setHeartReady] = useState(false)
  const [heartOpening, setHeartOpening] = useState(false)
  const [cakeDone, setCakeDone] = useState(false)

  const goNext = useCallback(() => {
    setSceneIndex((i) => Math.min(i + 1, SCENES.length - 1))
  }, [])

  const handleOpeningReady = useCallback(() => setOpeningReady(true), [])
  const handleHeartReady = useCallback(() => setHeartReady(true), [])
  const handleHeartOpened = useCallback(() => {
    setHeartOpening(false)
    setHeartReady(false)
    goNext()
  }, [goNext])
  const handleCakeDone = useCallback(() => setCakeDone(true), [])

  const handleCta = useCallback(() => {
    if (sceneIndex === 1) {
      if (heartOpening) return
      setHeartOpening(true)
      return
    }
    goNext()
  }, [sceneIndex, heartOpening, goNext])

  const ctaDisabled =
    (sceneIndex === 0 && !openingReady) ||
    (sceneIndex === 1 && (!heartReady || heartOpening)) ||
    (sceneIndex === 3 && !cakeDone)

  const showCta = sceneIndex < SCENES.length - 1
  const chromeHidden = sceneIndex === SCENES.length - 1
  const sceneKey = SCENES[sceneIndex]?.id ?? String(sceneIndex)

  return (
    <div className={`app${chromeHidden ? ' finale-mode' : ''}`}>
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

      {!chromeHidden ? (
        <SceneChrome
          sceneIndex={sceneIndex}
          showCta={showCta}
          ctaLabel={CTA_LABELS[sceneIndex] ?? '继续'}
          onCta={handleCta}
          ctaDisabled={ctaDisabled}
        />
      ) : null}
    </div>
  )
}
