/** Shared GSAP timing — keep every scene on the same storybook rhythm. */
export const MOTION = {
  fadeIn: 0.55,
  fadeOut: 0.38,
  enter: 0.7,
  soft: 0.9,
  emphasis: 1.15,
  hold: 1.15,
  easeIn: 'power1.in',
  easeOut: 'power2.out',
  easeSoft: 'power2.inOut',
  easeLift: 'power3.out',
  yShift: 14,
  stagger: 0.025,
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
