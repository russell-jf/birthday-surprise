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
        <div className="brand brand--stamp" aria-label={config.birthDate}>
          <span className="brand-stamp-glow" aria-hidden />
          <span className="brand-stamp-icon" aria-hidden>
            <svg viewBox="0 0 24 24" width="14" height="14" focusable="false">
              <path
                d="M12 2.2c.55 1.4.2 2.4-.55 3.15-.7.7-1.05 1.35-.85 2.15.55-.15 1.05-.55 1.4-1.05.4 1.05.15 2-.55 2.7C10.7 9.9 10 11 10 12.4h4c0-1.4-.7-2.5-1.45-3.25-.7-.7-.95-1.65-.55-2.7.35.5.85.9 1.4 1.05.2-.8-.15-1.45-.85-2.15C12.2 4.6 11.85 3.6 12 2.2z"
                fill="currentColor"
                opacity="0.95"
              />
              <rect x="10.35" y="12.2" width="3.3" height="8.2" rx="1.2" fill="currentColor" />
              <path
                d="M8.2 20.4h7.6c.2 0 .35.15.3.35-.2.7-1.35 1.25-4.1 1.25s-3.9-.55-4.1-1.25c-.05-.2.1-.35.3-.35z"
                fill="currentColor"
                opacity="0.75"
              />
            </svg>
          </span>
          <span className="brand-stamp-kicker">BIRTHDAY MAIL</span>
          <strong className="brand-stamp-date">{config.birthDate}</strong>
          <span className="brand-stamp-tag">特递</span>
        </div>
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
