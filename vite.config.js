import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// VITE_BASE=/birthday/ for Insightboard packaging;
// default build keeps GitHub Pages path /birthday-surprise/.
export default defineConfig(({ command }) => {
  const fromEnv = process.env.VITE_BASE
  const base =
    fromEnv ||
    (command === 'build' ? '/birthday-surprise/' : '/')

  return {
    plugins: [react()],
    base,
  }
})
