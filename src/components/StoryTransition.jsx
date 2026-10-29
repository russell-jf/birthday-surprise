import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { MOTION, prefersReducedMotion } from '../styles/motion'

/** Soft page turn between scenes — opacity only so nested 3D stays stable. */
export default function StoryTransition({ sceneKey, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1 })
      return undefined
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0 },
        { opacity: 1, duration: MOTION.fadeIn, ease: MOTION.easeOut },
      )
    }, ref)

    return () => ctx.revert()
  }, [sceneKey])

  return (
    <div ref={ref} className="scene-transition" data-scene={sceneKey}>
      {children}
    </div>
  )
}
