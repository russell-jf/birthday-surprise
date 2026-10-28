import { Suspense, lazy, useCallback, useState } from 'react'
import { SCENES } from './data/content'
import SceneChrome from './components/SceneChrome'
import StarryOpening from './components/scenes/StarryOpening'
import FireworksScene from './components/scenes/FireworksScene'
import Love003Finale from './components/scenes/Love003Finale'

const HeartScene = lazy(() => import('./components/scenes/HeartScene'))
const AlbumScene = lazy(() => import('./components/scenes/AlbumScene'))
const CakeScene = lazy(() => import('./components/scenes/CakeScene'))

const CTA_LABELS = [
  '进入惊喜',
  '翻开相册',
  '去吹蜡烛',
  '倒数烟花',
  '打开情书',
  null,
]

function SceneFallback() {
  return (
    <div className="fade-panel" style={{ color: '#9d174d' }}>
      加载中…
    </div>
  )
}

export default function App() {
  const [sceneIndex, setSceneIndex] = useState(0)
  const [openingReady, setOpeningReady] = useState(false)
  const [cakeDone, setCakeDone] = useState(false)

  const goNext = useCallback(() => {
    setSceneIndex((i) => Math.min(i + 1, SCENES.length - 1))
  }, [])

  const handleOpeningReady = useCallback(() => setOpeningReady(true), [])
  const handleCakeDone = useCallback(() => setCakeDone(true), [])

  const ctaDisabled =
    (sceneIndex === 0 && !openingReady) || (sceneIndex === 3 && !cakeDone)

  const showCta = sceneIndex < SCENES.length - 1
  const chromeHidden = sceneIndex === SCENES.length - 1

  return (
    <div className={`app${chromeHidden ? ' finale-mode' : ''}`}>
      <div className="scene-layer">
        <Suspense fallback={<SceneFallback />}>
          {sceneIndex === 0 && <StarryOpening onReady={handleOpeningReady} />}
          {sceneIndex === 1 && <HeartScene />}
          {sceneIndex === 2 && <AlbumScene />}
          {sceneIndex === 3 && <CakeScene onExtinguished={handleCakeDone} />}
          {sceneIndex === 4 && <FireworksScene />}
          {sceneIndex === 5 && <Love003Finale />}
        </Suspense>
      </div>

      {!chromeHidden ? (
        <SceneChrome
          sceneIndex={sceneIndex}
          showCta={showCta}
          ctaLabel={CTA_LABELS[sceneIndex] ?? '继续'}
          onCta={goNext}
          ctaDisabled={ctaDisabled}
        />
      ) : null}
    </div>
  )
}
