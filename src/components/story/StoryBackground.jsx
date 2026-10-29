import Sparkles from '../Sparkles'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/**
 * Shared atmosphere layer — same palette / glow language across scenes.
 * variant: blush | deep | soft | glow
 */
export default function StoryBackground({
  variant = 'blush',
  stars = false,
  starCount = 48,
  sparkles = false,
  moon = false,
  className = '',
}) {
  const reduced = useReducedMotion()
  const count = reduced ? Math.min(starCount, 16) : starCount
  const showSparkles = sparkles && !reduced

  const starNodes = stars
    ? Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="story-star"
          style={{
            left: `${(i * 17) % 100}%`,
            top: `${(i * 29) % 100}%`,
            animationDelay: `${(i % 9) * 0.2}s`,
            width: `${1 + (i % 3)}px`,
            height: `${1 + (i % 3)}px`,
          }}
        />
      ))
    : null

  return (
    <div className={`story-bg story-bg--${variant}${className ? ` ${className}` : ''}`} aria-hidden>
      <div className="story-bg__wash" />
      {stars ? <div className="story-bg__stars">{starNodes}</div> : null}
      {showSparkles ? <Sparkles /> : null}
      {moon ? <div className="story-moon" /> : null}
    </div>
  )
}
