import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { loadSettings, saveSettings, Settings } from './settings'

interface SettingsContextValue {
  settings: Settings
  updateSettings: (partial: Partial<Settings>) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial }
      saveSettings(next)
      return next
    })
  }, [])

  const resetSettings = useCallback(() => {
    const defaults: Settings = { theme: 'light' }
    setSettings(defaults)
    saveSettings(defaults)
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}
