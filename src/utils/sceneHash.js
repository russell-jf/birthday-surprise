import { getScenes } from '../data/content'

/** Parse `#/stars` / `#stars` → scene index (fallback 0). */
export function sceneIndexFromHash(hash = window.location.hash, scenes = getScenes()) {
  const id = String(hash || '')
    .replace(/^#\/?/, '')
    .split(/[?#]/)[0]
  const idx = scenes.findIndex((s) => s.id === id)
  if (idx >= 0) return idx
  // Gift hash while gift scene is disabled → skip to letter.
  if (id === 'gift') {
    const letter = scenes.findIndex((s) => s.id === 'letter')
    return letter >= 0 ? letter : 0
  }
  return 0
}

export function hashForScene(index, scenes = getScenes()) {
  const scene = scenes[Math.max(0, Math.min(index, scenes.length - 1))]
  return `#/${scene.id}`
}

export function ensureSceneHash(index, scenes = getScenes()) {
  const next = hashForScene(index, scenes)
  if (window.location.hash !== next) {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${next}`)
  }
}
