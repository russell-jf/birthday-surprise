import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getConfig, loadRemoteConfig, setConfig, shareTokenFromLocation } from '../data/content'

const StoryConfigContext = createContext({
  ready: false,
  error: '',
  config: getConfig(),
})

export function StoryConfigProvider({ children }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [config, setLocal] = useState(() => getConfig())

  useEffect(() => {
    let cancelled = false
    const token = shareTokenFromLocation()

    ;(async () => {
      try {
        if (token) {
          const next = await loadRemoteConfig(token)
          if (!cancelled) setLocal(next)
        } else {
          setConfig(getConfig())
          if (!cancelled) setLocal(getConfig())
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : '加载失败')
      } finally {
        if (!cancelled) setReady(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(() => ({ ready, error, config }), [ready, error, config])
  return <StoryConfigContext.Provider value={value}>{children}</StoryConfigContext.Provider>
}

export function useStoryConfig() {
  return useContext(StoryConfigContext)
}
