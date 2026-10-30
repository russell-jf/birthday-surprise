import { writeFileSync } from 'node:fs'

const R = 182
const CX = 200
const CY = 200
const bulbs = []

for (let i = 0; i < 24; i += 1) {
  const a = ((-90 + i * 15) * Math.PI) / 180
  const x = (CX + R * Math.cos(a)).toFixed(1)
  const y = (CY + R * Math.sin(a)).toFixed(1)
  const fill = i % 2 ? '#9ef0d2' : '#ffffff'
  bulbs.push(`  <circle cx="${x}" cy="${y}" r="7" fill="${fill}"/>`)
}

/* Canvas-safe SVG: evenodd ring path (no <mask>, which Image→canvas often drops). */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <radialGradient id="rimGlow" cx="50%" cy="50%" r="50%">
      <stop offset="70%" stop-color="#ff7aa8"/>
      <stop offset="100%" stop-color="#f0487c"/>
    </radialGradient>
  </defs>
  <path fill="url(#rimGlow)" fill-rule="evenodd" d="M200 2a198 198 0 1 1 0 396a198 198 0 1 1 0-396zM200 34a166 166 0 1 0 0 332a166 166 0 1 0 0-332z"/>
  <g>
${bulbs.join('\n')}
  </g>
</svg>
`

writeFileSync(new URL('../public/gift/wheel-rim.svg', import.meta.url), svg)
console.log('ok', bulbs.length)
