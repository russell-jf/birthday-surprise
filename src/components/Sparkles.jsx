const SPARKS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${(i * 37) % 100}%`,
  top: `${(i * 53) % 100}%`,
  dur: `${2.2 + (i % 5) * 0.45}s`,
  delay: `${(i % 7) * 0.18}s`,
  size: `${2 + (i % 4)}px`,
}))

export default function Sparkles() {
  return (
    <div className="sparkle-field" aria-hidden>
      {SPARKS.map((s) => (
        <span
          key={s.id}
          className="sparkle"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
            ['--dur']: s.dur,
          }}
        />
      ))}
    </div>
  )
}
