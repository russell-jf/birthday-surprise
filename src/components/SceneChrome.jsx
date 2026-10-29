import { SCENES, BIRTH_DATE } from '../data/content'
import PrimaryButton from './story/PrimaryButton'

export default function SceneChrome({ sceneIndex, showCta, ctaLabel, onCta, ctaDisabled }) {
  const page = String(sceneIndex + 1).padStart(2, '0')
  const total = String(SCENES.length).padStart(2, '0')

  return (
    <>
      <header className="hud">
        <div className="brand">{BIRTH_DATE}</div>
        <div className="chrome-meta">
          <div className="progress" aria-label="进度">
            {SCENES.map((scene, i) => (
              <span
                key={scene.id}
                className={`progress-dot${i === sceneIndex ? ' active' : ''}${i < sceneIndex ? ' done' : ''}`}
                title={scene.label}
              />
            ))}
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
