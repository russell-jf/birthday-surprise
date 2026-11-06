import dreamscapePc from '../assets/Dreamscape-pc.webp'
import dreamscapeMobile from '../assets/Dreamscape-mobile.webp'

/**
 * Per-scene art-direction backgrounds.
 * Place pairs in src/assets as `{Name}-pc.webp` + `{Name}-mobile.webp`,
 * then point a scene id at that name here.
 */
const PACKS = {
  Dreamscape: { pc: dreamscapePc, mobile: dreamscapeMobile },
}

const SCENE_PACK = {
  stars: 'Dreamscape',
  heart: 'Dreamscape',
  album: 'Dreamscape',
  cake: 'Dreamscape',
  finale: 'Dreamscape',
  gift: 'Dreamscape',
  letter: 'Dreamscape',
}

export function getSceneBackground(sceneId) {
  const key = SCENE_PACK[sceneId] || 'Dreamscape'
  return PACKS[key] || PACKS.Dreamscape
}
