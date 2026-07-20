// request.ts
import axios from 'axios';

// 判断是否是 Electron 环境
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

// 动态端口
let serverPort = 8000

export async function updateServerPort() {
  if (window.electronAPI?.getServerPort) {
    const port = await window.electronAPI.getServerPort()
    if (port) {
      serverPort = port
      qwens.defaults.baseURL = `http://localhost:${port}`
    }
  }
}

export function getServerPortValue() {
  return serverPort
}

export const qwens = axios.create({
  baseURL: isElectron ? 'http://localhost:8000' : '/qwen',
  // timeout: 5000,
});