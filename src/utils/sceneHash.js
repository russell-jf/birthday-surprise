import { SCENES } from '../data/content'

/** Parse `#/stars` / `#stars` → scene index (fallback 0). */
export function sceneIndexFromHash(hash = window.location.hash) {
  const id = String(hash || '')
    .replace(/^#\/?/, '')
    .split(/[?#]/)[0]
  const idx = SCENES.findIndex((s) => s.id === id)
  return idx >= 0 ? idx : 0
}

export function hashForScene(index) {
  const scene = SCENES[Math.max(0, Math.min(index, SCENES.length - 1))]
  return `#/${scene.id}`
}

export function ensureSceneHash(index) {
  const next = hashForScene(index)
  if (window.location.hash !== next) {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${next}`)
  }
}
