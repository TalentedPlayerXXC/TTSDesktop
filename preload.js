const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  selectAudio: () => ipcRenderer.invoke('select-audio'),
  getCharacterEmotions: (params) => ipcRenderer.invoke('get-character-emotions', params),
  getCharacterPath: (params) => ipcRenderer.invoke('get-character-path', params),
  migrateCustomSpeaker: (params) => ipcRenderer.invoke('migrate-custom-speaker', params),
  recoverCustomSpeakers: () => ipcRenderer.invoke('recover-custom-speakers'),
  mongo: {
    connect: () => ipcRenderer.invoke('mongo-connect'),
    getCharacters: () => ipcRenderer.invoke('mongo-get-characters'),
    getTags: () => ipcRenderer.invoke('mongo-get-tags'),
  },
})
