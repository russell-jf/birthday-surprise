/** Warm HTTP cache for the letter-scene iframe so first open feels snappy. */

const LOVE_ASSETS = [
  'Love_files/default.css',
  'Love_files/jquery.min.js',
  'Love_files/jscex.min.js',
  'Love_files/jscex-parser.js',
  'Love_files/jscex-jit.js',
  'Love_files/jscex-builderbase.min.js',
  'Love_files/jscex-async.min.js',
  'Love_files/jscex-async-powerpack.min.js',
  'Love_files/functions.js',
  'Love_files/love.js',
]

let started = false
/** @type {Promise<string> | null} */
let htmlPromise = null

function loveRoot() {
  return `${import.meta.env.BASE_URL}love003/`
}

function fetchText(url) {
  return fetch(url, { credentials: 'same-origin' }).then((res) => {
    if (!res.ok) throw new Error(`Failed to load ${url}`)
    return res.text()
  })
}

/** Prefetch letter HTML (shared by Love003Finale). */
export function getLove003Html() {
  if (!htmlPromise) {
    htmlPromise = fetchText(`${loveRoot()}index.html`).catch((err) => {
      htmlPromise = null
      throw err
    })
  }
  return htmlPromise
}

/**
 * Inject preload hints + kick off fetches during earlier scenes.
 * Safe to call multiple times.
 */
export function preloadLove003() {
  if (started || typeof document === 'undefined') return
  started = true

  const root = loveRoot()
  getLove003Html().catch(() => {})

  for (const file of LOVE_ASSETS) {
    const href = `${root}${file}`
    const as = file.endsWith('.css') ? 'style' : 'script'
    if (!document.querySelector(`link[rel="preload"][href="${href}"]`)) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = as
      link.href = href
      document.head.appendChild(link)
    }
    /* Warm cache; ignore failures (adblock / offline). */
    fetch(href, { credentials: 'same-origin' }).catch(() => {})
  }
}
