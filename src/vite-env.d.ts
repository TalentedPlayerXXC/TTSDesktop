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
  getCharactersLocal: () => Promise<{ status: string; data?: any[]; tags?: any[]; error?: string }>
  getServerPort: () => Promise<number | null>
  getCharacterPreviewAudio: (params: { game: string; name: string }) => Promise<{ status: string; data?: string; error?: string }>
  getCharacterEmotions: (params: { game: string; name: string }) => Promise<{ status: string; data?: string[]; error?: string }>
  getCharacterPath: (params: { game: string; name: string; emotion?: string }) => Promise<{ status: string; path?: string; error?: string }>
  migrateCustomSpeaker: (params: { sourceFilename: string; name: string; gender: string; voiceType: string; temperament: string }) => Promise<any>
  deleteCustomSpeaker: (params: { name: string }) => Promise<any>
  recoverCustomSpeakers: () => Promise<{ status: string; data?: any[] }>
  startModelDownload: (modelKey: string) => Promise<any>
  getDownloadStatus: (modelKey: string) => Promise<any>
  getStartupModel: () => Promise<string | null>
  getStoragePaths: () => Promise<{ modelsDir: string; userData: string }>
  deleteModelFiles: () => Promise<{ success: boolean; error?: string }>
  quitApp: () => Promise<void>
  onBackendLog: (callback: (data: { level: string; text: string }) => void) => () => void
  mongo: {
    connect: () => Promise<any>
    getCharacters: () => Promise<any>
    getTags: () => Promise<any>
  }
}

interface Window {
  electronAPI?: ElectronAPI
}
