import './scenes.css'

/**
 * Embeds Awesome-Love-Code Web/002 (MIT) — canvas 爱心.
 * Source lives in /public/love002
 */
export default function HeartScene() {
  return (
    <section className="scene heart-scene">
      <iframe
        className="love002-frame"
        title="爱心"
        src={`${import.meta.env.BASE_URL}love002/index.html`}
        allow="autoplay"
      />
    </section>
  )
}
