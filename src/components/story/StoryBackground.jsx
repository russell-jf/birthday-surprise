import Sparkles from '../Sparkles'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { getSceneBackground } from '../../data/sceneBackgrounds'

/**
 * Shared scene atmosphere — photo wash (pc / mobile) plus light accents.
 */
export default function StoryBackground({
  scene = 'stars',
  stars = false,
  starCount = 40,
  sparkles = false,
  moon = false,
  className = '',
}) {
  const reduced = useReducedMotion()
  const count = reduced ? Math.min(starCount, 14) : starCount
  const showSparkles = sparkles && !reduced
  const { pc, mobile } = getSceneBackground(scene)

  const starNodes = stars
    ? Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="story-star"
          style={{
            left: `${(i * 17) % 100}%`,
            top: `${(i * 29) % 100}%`,
            animationDelay: `${(i % 9) * 0.25}s`,
            width: `${1 + (i % 3)}px`,
            height: `${1 + (i % 3)}px`,
          }}
        />
      ))
    : null

  return (
    <div className={`story-bg story-bg--photo${className ? ` ${className}` : ''}`} aria-hidden>
      <picture className="story-bg__photo">
        <source media="(max-width: 768px)" srcSet={mobile} type="image/webp" />
        <img src={pc} alt="" decoding="async" fetchPriority="low" />
      </picture>
      <div className="story-bg__wash" />
      <div className="story-bg__grain" />
      <div className="story-bg__vignette" />
      {stars ? <div className="story-bg__stars">{starNodes}</div> : null}
      {showSparkles ? <Sparkles /> : null}
    </div>
  )
}
