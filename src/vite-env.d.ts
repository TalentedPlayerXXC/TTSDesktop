/// <reference types="vite/client" />

interface CharacterDoc {
  _id: string
  name: string
  gender: string
  voiceType: string
  temperament: string
  ref_audio?: string
  game?: string
}

interface TagDoc {
  _id: string
  label: string
  enum: string
}

interface MongoResult {
  status: 'ok' | 'error'
  error?: string
  id?: string
  data?: any[]
}

interface ElectronAPI {
  selectAudio: () => Promise<{ filePath: string; fileName: string } | null>
  getCharacterEmotions: (params: { game: string; name: string }) => Promise<{ status: string; error?: string; data?: string[] }>
  getCharacterPath: (params: { game: string; name: string; emotion: string }) => Promise<{ status: string; error?: string; path?: string }>
  migrateCustomSpeaker: (params: { name: string; sourceFilename: string; voiceType?: string; temperament?: string }) => Promise<{ status: string; error?: string; path?: string }>
  recoverCustomSpeakers: () => Promise<{ status: string; error?: string; data?: any[] }>
  mongo: {
    connect: () => Promise<MongoResult>
    getCharacters: () => Promise<MongoResult & { data?: CharacterDoc[] }>
    getTags: () => Promise<MongoResult & { data?: TagDoc[] }>
  }
}

interface Window {
  electronAPI?: ElectronAPI
}
