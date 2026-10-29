import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * On-demand blow detection via microphone.
 * Call `startListening()` from a user gesture; do not auto-prompt on mount.
 */
export function useBlowDetection({
  holdMs = 380,
  baselineMs = 300,
  margin = 0.045,
  minThreshold = 0.06,
  enabled = true,
} = {}) {
  /** @type {'idle' | 'listening' | 'blowing' | 'done' | 'denied'} */
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  const onBlowRef = useRef(null)
  const meterRef = useRef(null)
  const hintHotRef = useRef(false)
  const rafRef = useRef(0)
  const streamRef = useRef(null)
  const audioRef = useRef(null)
  const stoppedRef = useRef(false)
  const statusRef = useRef(status)

  useEffect(() => {
    statusRef.current = status
  }, [status])

  const setOnBlow = useCallback((fn) => {
    onBlowRef.current = fn
  }, [])

  const setMeterEl = useCallback((el) => {
    meterRef.current = el
  }, [])

  const cleanup = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    const ctx = audioRef.current?.ctx
    audioRef.current = null
    if (ctx && ctx.state !== 'closed') {
      ctx.close().catch(() => {})
    }
    if (meterRef.current) {
      meterRef.current.style.width = '0%'
    }
  }, [])

  const stopListening = useCallback(
    (nextStatus = 'idle') => {
      stoppedRef.current = true
      cleanup()
      setStatus(nextStatus)
    },
    [cleanup],
  )

  const startListening = useCallback(async () => {
    if (!enabled) return
    if (statusRef.current === 'listening' || statusRef.current === 'blowing') return
    if (statusRef.current === 'done') return
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('此浏览器不支持麦克风')
      setStatus('denied')
      return
    }

    stoppedRef.current = false
    setError(null)
    setStatus('listening')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })

      if (stoppedRef.current) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }

      const AudioCtx = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioCtx()
      if (ctx.state === 'suspended') {
        await ctx.resume()
      }

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.35
      source.connect(analyser)

      streamRef.current = stream
      audioRef.current = { ctx, analyser }

      const data = new Uint8Array(analyser.fftSize)
      const readRms = () => {
        analyser.getByteTimeDomainData(data)
        let sum = 0
        for (let i = 0; i < data.length; i += 1) {
          const v = (data[i] - 128) / 128
          sum += v * v
        }
        return Math.sqrt(sum / data.length)
      }

      // Calibrate ambient noise for ~baselineMs
      const calibStart = performance.now()
      let calibSum = 0
      let calibCount = 0
      while (performance.now() - calibStart < baselineMs) {
        if (stoppedRef.current) return
        calibSum += readRms()
        calibCount += 1
        await new Promise((r) => setTimeout(r, 16))
      }
      const baseline = calibCount ? calibSum / calibCount : 0.02
      const threshold = Math.max(minThreshold, baseline + margin)

      let holdStart = 0
      let lastUi = 0

      const tick = () => {
        if (stoppedRef.current) return
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {})
        }

        const rms = readRms()
        const now = performance.now()

        // Drive meter via DOM — avoid React re-render every frame
        if (now - lastUi >= 100 && meterRef.current) {
          lastUi = now
          const pct = Math.min(100, (rms / Math.max(threshold * 1.6, 0.12)) * 100)
          meterRef.current.style.width = `${pct}%`
        }

        if (rms > threshold) {
          if (!holdStart) holdStart = now
          if (!hintHotRef.current) {
            hintHotRef.current = true
            setStatus('blowing')
          }
          if (now - holdStart >= holdMs) {
            stoppedRef.current = true
            cleanup()
            setStatus('done')
            onBlowRef.current?.()
            return
          }
        } else {
          holdStart = 0
          if (hintHotRef.current) {
            hintHotRef.current = false
            setStatus('listening')
          }
        }

        rafRef.current = requestAnimationFrame(tick)
      }

      rafRef.current = requestAnimationFrame(tick)
    } catch (err) {
      cleanup()
      setError(err instanceof Error ? err.message : '麦克风不可用')
      setStatus('denied')
    }
  }, [enabled, baselineMs, margin, minThreshold, holdMs, cleanup])

  useEffect(() => {
    if (!enabled && statusRef.current !== 'done') {
      stopListening('idle')
    }
  }, [enabled, stopListening])

  useEffect(() => () => cleanup(), [cleanup])

  return {
    status,
    error,
    startListening,
    stopListening,
    setOnBlow,
    setMeterEl,
  }
}
