import './liquid-glass.css'

/**
 * Paper window surface (gift-site language).
 * Kept as a named panel so scene call sites stay stable.
 */
export default function LiquidGlassPanel({
  children,
  className = '',
  fallbackClassName = '',
  style,
  width = 'min(92vw, 22rem)',
}) {
  return (
    <div
      className={`glass-panel-fallback ${fallbackClassName} ${className}`.trim()}
      style={{ width, ...style }}
    >
      {children}
    </div>
  )
}
