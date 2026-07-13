// request.ts
import axios from 'axios';

// 判断是否是 Electron 环境
const isElectron = navigator.userAgent.toLowerCase().includes('electron');

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

// 接口 1 的实例
export const files = axios.create({
  baseURL: isElectron ? 'http://localhost:3000' : '/file',
})

// 接口 2 的实例
export const apis = axios.create({
  baseURL: isElectron ? 'http://localhost:9880' : '/api',
  // timeout: 5000,
});
// 接口 2 的实例
export const qwens = axios.create({
  baseURL: isElectron ? 'http://localhost:8000' : '/qwen',
  // timeout: 5000,
});