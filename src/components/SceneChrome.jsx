import { NICKNAME, SCENES, BIRTH_DATE } from '../data/content'

export default function SceneChrome({ sceneIndex, showCta, ctaLabel, onCta, ctaDisabled }) {
  return (
    <>
      <header className="hud">
        <div className="brand">{BIRTH_DATE}</div>
        <div className="progress" aria-label="进度">
          {SCENES.map((scene, i) => (
            <span
              key={scene.id}
              className={`progress-dot${i === sceneIndex ? ' active' : ''}${i < sceneIndex ? ' done' : ''}`}
              title={scene.label}
            />
          ))}
        </div>
      </header>

      {showCta ? (
        <footer className="scene-footer">
          <button type="button" className="cta" onClick={onCta} disabled={ctaDisabled}>
            {ctaLabel}
          </button>
        </footer>
      ) : null}
    </>
  )
}
