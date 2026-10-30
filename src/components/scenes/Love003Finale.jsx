import { useEffect, useState } from 'react'
import { useStoryConfig } from '../../context/StoryConfig'
import { getLove003Html } from '../../utils/preloadLove003'
import StoryBackground from '../story/StoryBackground'
import StoryLoader from '../StoryLoader'
import './scenes.css'

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function buildLetterHtml(lines) {
  return lines
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed) return '<br>'
      if (trimmed.startsWith('--')) {
        return `<span class="say"><span class="space"></span> ${escapeHtml(trimmed)}</span><br>`
      }
      return `<span class="say">${escapeHtml(trimmed)}</span><br>`
    })
    .join('\n')
}

/**
 * Embeds Awesome-Love-Code Web/003 (MIT).
 * When remote config is present, inject letter + together date into a blob document.
 */
export default function Love003Finale() {
  const { config } = useStoryConfig()
  const [src, setSrc] = useState('')
  const [frameReady, setFrameReady] = useState(false)
  const [loaderOut, setLoaderOut] = useState(false)

  useEffect(() => {
    let revoked = ''
    let cancelled = false

    ;(async () => {
      try {
        let html = await getLove003Html()
        const letter = buildLetterHtml(config.letterLines)
        html = html.replace(
          /<div id="code">[\s\S]*?<\/div>/,
          `<div id="code">\n${letter}\n                </div>`,
        )
        html = html.replace(
          /together\.setFullYear\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/,
          `together.setFullYear(${config.together.year}, ${config.together.month}, ${config.together.day})`,
        )
        // Keep relative Love_files paths working inside the blob by rewriting to absolute URLs.
        const loveRoot = new URL(`${import.meta.env.BASE_URL}love003/`, window.location.origin).href
        html = html.replaceAll('./Love_files/', `${loveRoot}Love_files/`)
        html = html.replaceAll('"./Love_files/', `"${loveRoot}Love_files/`)
        const blob = new Blob([html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        if (cancelled) {
          URL.revokeObjectURL(url)
          return
        }
        revoked = url
        setFrameReady(false)
        setLoaderOut(false)
        setSrc(url)
      } catch {
        if (cancelled) return
        setFrameReady(false)
        setLoaderOut(false)
        setSrc(`${import.meta.env.BASE_URL}love003/index.html`)
      }
    })()

    return () => {
      cancelled = true
      if (revoked) URL.revokeObjectURL(revoked)
    }
  }, [config.letterLines, config.together])

  useEffect(() => {
    if (!frameReady) return undefined
    /* Short settle so the seed paints before the loader fades — avoid long artificial wait. */
    const id = window.setTimeout(() => setLoaderOut(true), 160)
    return () => window.clearTimeout(id)
  }, [frameReady])

  return (
    <section className="scene love003-scene">
      <StoryBackground variant="blush" />

      {!loaderOut ? <StoryLoader done={frameReady} /> : null}

      {src ? (
        <iframe
          className={`love003-frame${frameReady ? ' is-ready' : ''}`}
          title="一封情书"
          src={src}
          allow="autoplay"
          onLoad={() => setFrameReady(true)}
        />
      ) : null}
    </section>
  )
}
