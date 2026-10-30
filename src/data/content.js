import {
  DEFAULT_BIRTH_DATE,
  DEFAULT_CTA_LABELS,
  DEFAULT_GIFTS,
  GIFT_WHEEL_RIM,
  DEFAULT_LETTER_LINES,
  DEFAULT_MEMORIES,
  DEFAULT_NICKNAME,
  DEFAULT_OPENING_LINES,
  DEFAULT_SCENES,
  DEFAULT_TOGETHER,
} from './defaults'

/** @typedef {{ id: string, label: string, hint: string, image?: string, weight?: number }} GiftConfig */
/** @typedef {{ nickname: string, birthDate: string, openingLines: string[], ctaLabels: string[], letterLines: string[], together: { year: number, month: number, day: number }, memories: { src: string, title: string, caption: string }[], giftEnabled: boolean, gifts: GiftConfig[] }} StoryConfig */

const giftAsset = (path) => `${import.meta.env.BASE_URL}${String(path || '').replace(/^\//, '')}`

function resolveGiftImage(gift, index) {
  if (gift?.image) {
    if (/^(https?:)?\/\//.test(gift.image) || gift.image.startsWith('/')) return gift.image
    return giftAsset(gift.image)
  }
  const byId = DEFAULT_GIFTS.find((d) => d.id === gift?.id)
  if (byId?.image) return byId.image
  return DEFAULT_GIFTS[index % DEFAULT_GIFTS.length].image
}

function padCtaLabels(labels, giftEnabled) {
  const expected = giftEnabled ? 6 : 5
  if (Array.isArray(labels) && labels.length === expected) return [...labels]
  if (giftEnabled && Array.isArray(labels) && labels.length === 5) {
    return [...labels.slice(0, 4), DEFAULT_CTA_LABELS[4], labels[4]]
  }
  return giftEnabled ? [...DEFAULT_CTA_LABELS] : DEFAULT_CTA_LABELS.filter((_, i) => i !== 4)
}

/** @type {StoryConfig} */
let runtimeConfig = {
  nickname: DEFAULT_NICKNAME,
  birthDate: DEFAULT_BIRTH_DATE,
  openingLines: [...DEFAULT_OPENING_LINES],
  ctaLabels: [...DEFAULT_CTA_LABELS],
  letterLines: [...DEFAULT_LETTER_LINES],
  together: { ...DEFAULT_TOGETHER },
  memories: DEFAULT_MEMORIES.map((m) => ({ ...m })),
  giftEnabled: true,
  gifts: DEFAULT_GIFTS.map((g) => ({ ...g })),
}

export function getScenes(config = runtimeConfig) {
  if (config?.giftEnabled === false) {
    return DEFAULT_SCENES.filter((s) => s.id !== 'gift')
  }
  return DEFAULT_SCENES
}

/** @deprecated Prefer getScenes() so gift toggle is respected. */
export const SCENES = DEFAULT_SCENES

export function getConfig() {
  return runtimeConfig
}

export function setConfig(next) {
  const hasGiftFlag = next && Object.prototype.hasOwnProperty.call(next, 'giftEnabled')
  const hasGiftsArray = Array.isArray(next?.gifts)
  // Legacy shares without gift fields keep the default wheel.
  const giftEnabled = hasGiftFlag
    ? next.giftEnabled !== false
    : hasGiftsArray
      ? next.gifts.length > 0
      : true

  const sourceGifts = giftEnabled
    ? next?.gifts?.length
      ? next.gifts
      : DEFAULT_GIFTS
    : []

  runtimeConfig = {
    nickname: next?.nickname || DEFAULT_NICKNAME,
    birthDate: next?.birthDate || DEFAULT_BIRTH_DATE,
    openingLines: next?.openingLines?.length ? [...next.openingLines] : [...DEFAULT_OPENING_LINES],
    ctaLabels: padCtaLabels(next?.ctaLabels, giftEnabled),
    letterLines: next?.letterLines?.length ? [...next.letterLines] : [...DEFAULT_LETTER_LINES],
    together: next?.together
      ? {
          year: next.together.year,
          month: next.together.month,
          day: next.together.day,
        }
      : { ...DEFAULT_TOGETHER },
    memories: (next?.memories?.length ? next.memories : DEFAULT_MEMORIES).map((m) => ({
      src: m.src,
      title: m.title,
      caption: m.caption,
    })),
    giftEnabled,
    gifts: sourceGifts.map((g, i) => ({
      id: g.id || `gift${i}`,
      label: g.label,
      hint: g.hint,
      image: resolveGiftImage(g, i),
      weight: Number(g.weight) > 0 ? Number(g.weight) : DEFAULT_GIFTS[i % DEFAULT_GIFTS.length]?.weight || 1,
    })),
  }
  return runtimeConfig
}

export { GIFT_WHEEL_RIM }

export const NICKNAME = DEFAULT_NICKNAME
export const BIRTH_DATE = DEFAULT_BIRTH_DATE
export const OPENING_LINES = DEFAULT_OPENING_LINES
export const MEMORIES = DEFAULT_MEMORIES

export const WALL_PHOTO_COUNT = 40

export function buildWallPhotos(memories = getConfig().memories) {
  const list = memories.length ? memories : DEFAULT_MEMORIES
  return Array.from({ length: WALL_PHOTO_COUNT }, (_, i) => {
    const base = list[i % list.length]
    return {
      ...base,
      id: `wall-${i}`,
      label: `${base.title} · ${i + 1}`,
    }
  })
}

export const WALL_PHOTOS = buildWallPhotos()

export function shareTokenFromLocation(search = window.location.search) {
  const params = new URLSearchParams(search)
  const token = params.get('s') || ''
  return /^[a-f0-9]{32}$/.test(token) ? token : ''
}

export async function loadRemoteConfig(token) {
  const res = await fetch(`/api/public/surprises/${token}`, { credentials: 'omit' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || '无法加载这份生日惊喜')
  }
  const data = await res.json()
  return setConfig(data)
}
