const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  selectAudio: () => ipcRenderer.invoke('select-audio'),
  getCharactersLocal: () => ipcRenderer.invoke('get-characters-local'),
  getServerPort: () => ipcRenderer.invoke('get-server-port'),
  getCharacterPreviewAudio: (params) => ipcRenderer.invoke('get-character-preview-audio', params),
  getCharacterEmotions: (params) => ipcRenderer.invoke('get-character-emotions', params),
  getCharacterPath: (params) => ipcRenderer.invoke('get-character-path', params),
  migrateCustomSpeaker: (params) => ipcRenderer.invoke('migrate-custom-speaker', params),
  deleteCustomSpeaker: (params) => ipcRenderer.invoke('delete-custom-speaker', params),
  recoverCustomSpeakers: () => ipcRenderer.invoke('recover-custom-speakers'),
  mongo: {
    connect: () => ipcRenderer.invoke('mongo-connect'),
    getCharacters: () => ipcRenderer.invoke('mongo-get-characters'),
    getTags: () => ipcRenderer.invoke('mongo-get-tags'),
  },
  startModelDownload: (modelKey) => ipcRenderer.invoke('start-model-download', modelKey),
  getDownloadStatus: (modelKey) => ipcRenderer.invoke('get-download-status', modelKey),
  getStartupModel: () => ipcRenderer.invoke('get-startup-model'),
  getStoragePaths: () => ipcRenderer.invoke('get-storage-paths'),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  deleteModelFiles: () => ipcRenderer.invoke('delete-model-files'),
  quitApp: () => ipcRenderer.invoke('quit-app'),
  onBackendLog: (callback) => {
    const handler = (_event, data) => callback(data)
    ipcRenderer.on('backend-log', handler)
    return () => ipcRenderer.removeListener('backend-log', handler)
  },
})
