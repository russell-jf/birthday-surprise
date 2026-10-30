import { getScenes } from '../data/content'
import { useStoryConfig } from '../context/StoryConfig'
import PrimaryButton from './story/PrimaryButton'

export default function SceneChrome({
  sceneIndex,
  scenes,
  showCta,
  ctaLabel,
  onCta,
  ctaDisabled,
  onGoTo,
}) {
  const { config } = useStoryConfig()
  const sceneList = scenes?.length ? scenes : getScenes(config)
  const page = String(sceneIndex + 1).padStart(2, '0')
  const total = String(sceneList.length).padStart(2, '0')

  return (
    <>
      <header className="hud">
        <div className="brand">{config.birthDate}</div>
        <div className="chrome-meta">
          <div className="progress" role="navigation" aria-label="进度">
            {sceneList.map((scene, i) => {
              const active = i === sceneIndex
              return (
                <button
                  key={scene.id}
                  type="button"
                  className={`progress-dot${active ? ' active' : ''}${i < sceneIndex ? ' done' : ''}`}
                  aria-label={`第 ${i + 1} 幕：${scene.label}`}
                  aria-current={active ? 'step' : undefined}
                  title={scene.label}
                  onClick={() => onGoTo?.(i)}
                />
              )
            })}
          </div>
          <span className="page-index" aria-hidden>
            {page}/{total}
          </span>
        </div>
      </header>

      {showCta ? (
        <footer className="scene-footer">
          <PrimaryButton onClick={onCta} disabled={ctaDisabled}>
            {ctaLabel}
          </PrimaryButton>
        </footer>
      ) : null}
    </>
  )
}
