import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages: https://<user>.github.io/birthday-surprise/
  base: command === 'build' ? '/birthday-surprise/' : '/',
}))
