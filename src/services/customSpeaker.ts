// 自定义配音员存储（localStorage）
// 声音设计合成后的音源可加入此列表，当作普通配音员使用

const STORAGE_KEY = 'tts-custom-speakers'
const FAVORITES_KEY = 'tts-favorites'

export interface CustomSpeaker {
  id: string
  name: string
  voiceType: string
  temperament: string
  ref_audio: string   // 相对 server 路径，如 ./api_output/vox_xxx.wav
  createdAt: string
}

export function loadCustomSpeakers(): CustomSpeaker[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const list: CustomSpeaker[] = JSON.parse(raw)
    // 迁移：剔除 ref_audio 是旧相对路径（./ 开头）的条目，让文件系统恢复机制重建
    const hasOldPath = list.some(s => s.ref_audio?.startsWith('./'))
    if (hasOldPath) {
      const clean = list.filter(s => s.ref_audio && !s.ref_audio.startsWith('./'))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean))
      return clean
    }
    return list
  } catch {
    return []
  }
}

export function saveCustomSpeaker(speaker: Omit<CustomSpeaker, 'id' | 'createdAt'>): void {
  const list = loadCustomSpeakers()
  list.push({
    ...speaker,
    id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function deleteCustomSpeaker(id: string): void {
  const list = loadCustomSpeakers().filter(s => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

// 收藏功能
export function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw))
  } catch {
    return new Set()
  }
}

export function saveFavorites(ids: Set<string>): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...ids]))
}
