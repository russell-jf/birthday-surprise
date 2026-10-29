import { useEffect, useState } from 'react'
import { useStoryConfig } from '../../context/StoryConfig'
import StoryBackground from '../story/StoryBackground'
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
  const [src, setSrc] = useState(`${import.meta.env.BASE_URL}love003/index.html`)

  useEffect(() => {
    let revoked = ''
    let cancelled = false

    ;(async () => {
      try {
        const base = `${import.meta.env.BASE_URL}love003/index.html`
        const res = await fetch(base)
        if (!res.ok) return
        let html = await res.text()
        const letter = buildLetterHtml(config.letterLines)
        html = html.replace(/<div id="code">[\s\S]*?<\/div>/, `<div id="code">\n${letter}\n                </div>`)
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
        setSrc(url)
      } catch {
        // Fall back to static embed.
      }
    })()

    return () => {
      cancelled = true
      if (revoked) URL.revokeObjectURL(revoked)
    }
  }, [config.letterLines, config.together])

  return (
    <section className="scene love003-scene">
      <StoryBackground variant="blush" />
      <iframe className="love003-frame" title="一封情书" src={src} allow="autoplay" />
    </section>
  )
}
