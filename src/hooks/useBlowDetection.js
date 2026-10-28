import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Detects a sustained loud breath into the microphone.
 * Falls back gracefully when permission is denied.
 */
export function useBlowDetection({ threshold = 0.18, holdMs = 450, enabled = true } = {}) {
  const [ready, setReady] = useState(false)
  const [blowing, setBlowing] = useState(false)
  const [error, setError] = useState(null)
  const [level, setLevel] = useState(0)
  const onBlowRef = useRef(null)
  const rafRef = useRef(0)
  const streamRef = useRef(null)
  const audioRef = useRef(null)

  const setOnBlow = useCallback((fn) => {
    onBlowRef.current = fn
  }, [])

  useEffect(() => {
    if (!enabled) return undefined

    let cancelled = false
    let holdStart = 0

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: false,
          },
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        const ctx = new AudioContext()
        const source = ctx.createMediaStreamSource(stream)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 512
        source.connect(analyser)

        streamRef.current = stream
        audioRef.current = { ctx, analyser }
        setReady(true)
        setError(null)

        const data = new Uint8Array(analyser.fftSize)

        const tick = () => {
          analyser.getByteTimeDomainData(data)
          let sum = 0
          for (let i = 0; i < data.length; i += 1) {
            const v = (data[i] - 128) / 128
            sum += v * v
          }
          const rms = Math.sqrt(sum / data.length)
          setLevel(rms)

          if (rms > threshold) {
            if (!holdStart) holdStart = performance.now()
            setBlowing(true)
            if (performance.now() - holdStart >= holdMs) {
              onBlowRef.current?.()
              holdStart = performance.now() + 2000
            }
          } else {
            holdStart = 0
            setBlowing(false)
          }

          rafRef.current = requestAnimationFrame(tick)
        }

        rafRef.current = requestAnimationFrame(tick)
      } catch (err) {
        setError(err instanceof Error ? err.message : '麦克风不可用')
        setReady(false)
      }
    }

    start()

    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      audioRef.current?.ctx.close().catch(() => {})
      streamRef.current = null
      audioRef.current = null
    }
  }, [enabled, holdMs, threshold])

  return { ready, blowing, error, level, setOnBlow }
}
