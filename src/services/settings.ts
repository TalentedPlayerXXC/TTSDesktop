export interface Settings {
  theme: 'light' | 'dark' | 'system'
}

const STORAGE_KEY = 'tts-desktop-settings'

const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
    }
  } catch {}
  return { ...DEFAULT_SETTINGS }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
