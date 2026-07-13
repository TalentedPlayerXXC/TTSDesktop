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

export interface ElectronAPI {
  selectAudio: () => Promise<any>
  getCharactersLocal: () => Promise<{ status: string; data?: any[]; error?: string }>
  getCharacterEmotions: (params: { game: string; name: string }) => Promise<{ status: string; data?: string[]; error?: string }>
  getCharacterPath: (params: { game: string; name: string; emotion?: string }) => Promise<{ status: string; path?: string; error?: string }>
  migrateCustomSpeaker: (params: { sourceFilename: string; name: string; gender: string; voiceType: string; temperament: string }) => Promise<any>
  deleteCustomSpeaker: (params: { name: string }) => Promise<any>
  recoverCustomSpeakers: () => Promise<{ status: string; data?: any[] }>
  mongo: {
    connect: () => Promise<any>
    getCharacters: () => Promise<any>
    getTags: () => Promise<any>
  }
}

interface Window {
  electronAPI?: ElectronAPI
}
