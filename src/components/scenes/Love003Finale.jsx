import StoryBackground from '../story/StoryBackground'
import './scenes.css'

/**
 * Embeds Awesome-Love-Code Web/003 (MIT) as the final scene.
 * Source lives in /public/love003 — palette/fonts aligned with the storybook.
 */
export default function Love003Finale() {
  return (
    <section className="scene love003-scene">
      <StoryBackground variant="blush" />
      <iframe
        className="love003-frame"
        title="一封情书"
        src={`${import.meta.env.BASE_URL}love003/index.html`}
        allow="autoplay"
      />
    </section>
  )
}
