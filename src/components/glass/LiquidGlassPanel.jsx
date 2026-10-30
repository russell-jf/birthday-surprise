import LiquidGlass from 'liquid-glass-react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import './liquid-glass.css'

const DEFAULTS = {
  displacementScale: 58,
  blurAmount: 0.08,
  saturation: 145,
  aberrationIntensity: 1.4,
  elasticity: 0.16,
  cornerRadius: 28,
  padding: '1.25rem 1.15rem 1.2rem',
  mode: 'standard',
  overLight: true,
}

/**
 * Floating liquid-glass surface. The library always applies translate(-50%, -50%),
 * so this panel is positioned at top/left 50% of its containing block.
 */
export default function LiquidGlassPanel({
  children,
  className = '',
  fallbackClassName = '',
  style,
  width = 'min(92vw, 22rem)',
  enabled,
  ...glassProps
}) {
  const reducedMotion = useReducedMotion()
  const useGlass = enabled ?? !reducedMotion

  if (!useGlass) {
    return (
      <div className={`glass-panel-fallback ${fallbackClassName} ${className}`.trim()} style={style}>
        {children}
      </div>
    )
  }

  return (
    <LiquidGlass
      className={`glass-panel-liquid ${className}`.trim()}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width,
        ...style,
      }}
      {...DEFAULTS}
      {...glassProps}
    >
      {children}
    </LiquidGlass>
  )
}
