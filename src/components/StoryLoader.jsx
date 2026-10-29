import { useId } from 'react'

/**
 * Shared visual loader — heartbeat, no copy on screen.
 * @param {{ done?: boolean, className?: string, label?: string }} props
 */
export default function StoryLoader({ done = false, className = '', label = '加载中' }) {
  const gradId = useId()

  return (
    <div
      className={`story-loader${done ? ' is-done' : ''}${className ? ` ${className}` : ''}`}
      role="status"
      aria-live="polite"
      aria-busy={!done}
      aria-label={label}
    >
      <div className="story-loader__bloom" aria-hidden />
      <div className="story-loader__heart" aria-hidden>
        <svg viewBox="0 0 32 29" className="story-loader__svg" focusable="false">
          <defs>
            <linearGradient id={gradId} x1="6" y1="2" x2="26" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ff8fb3" />
              <stop offset="45%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#be185d" />
            </linearGradient>
          </defs>
          <path
            fill={`url(#${gradId})`}
            d="M16 27.4S1.5 18.2 1.5 9.6C1.5 4.9 5.1 1.8 9.3 1.8c2.6 0 4.9 1.3 6.7 3.3 1.8-2 4.1-3.3 6.7-3.3 4.2 0 7.8 3.1 7.8 7.8 0 8.6-14.5 17.8-14.5 17.8z"
          />
        </svg>
      </div>
    </div>
  )
}
