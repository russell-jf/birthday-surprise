import {
  DEFAULT_BIRTH_DATE,
  DEFAULT_CTA_LABELS,
  DEFAULT_LETTER_LINES,
  DEFAULT_MEMORIES,
  DEFAULT_NICKNAME,
  DEFAULT_OPENING_LINES,
  DEFAULT_SCENES,
  DEFAULT_TOGETHER,
} from './defaults'

/** @typedef {{ nickname: string, birthDate: string, openingLines: string[], ctaLabels: string[], letterLines: string[], together: { year: number, month: number, day: number }, memories: { src: string, title: string, caption: string }[] }} StoryConfig */

/** @type {StoryConfig} */
let runtimeConfig = {
  nickname: DEFAULT_NICKNAME,
  birthDate: DEFAULT_BIRTH_DATE,
  openingLines: [...DEFAULT_OPENING_LINES],
  ctaLabels: [...DEFAULT_CTA_LABELS],
  letterLines: [...DEFAULT_LETTER_LINES],
  together: { ...DEFAULT_TOGETHER },
  memories: DEFAULT_MEMORIES.map((m) => ({ ...m })),
}

export const SCENES = DEFAULT_SCENES

export function getConfig() {
  return runtimeConfig
}

export function setConfig(next) {
  runtimeConfig = {
    nickname: next.nickname || DEFAULT_NICKNAME,
    birthDate: next.birthDate || DEFAULT_BIRTH_DATE,
    openingLines: next.openingLines?.length ? [...next.openingLines] : [...DEFAULT_OPENING_LINES],
    ctaLabels: next.ctaLabels?.length === 5 ? [...next.ctaLabels] : [...DEFAULT_CTA_LABELS],
    letterLines: next.letterLines?.length ? [...next.letterLines] : [...DEFAULT_LETTER_LINES],
    together: next.together
      ? {
          year: next.together.year,
          month: next.together.month,
          day: next.together.day,
        }
      : { ...DEFAULT_TOGETHER },
    memories: (next.memories?.length ? next.memories : DEFAULT_MEMORIES).map((m) => ({
      src: m.src,
      title: m.title,
      caption: m.caption,
    })),
  }
  return runtimeConfig
}

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
