// fetch_request.ts — 原生 fetch 方案，作为 Axios 的备胎 🛞
// 当 axios 供应链出问题时，切到这套方案继续用

const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

// 动态端口（与 Axios 版 request.tsx 保持同步）
let serverPort = 8000

export async function updateServerPort() {
  if (window.electronAPI?.getServerPort) {
    const port = await window.electronAPI.getServerPort()
    if (port) {
      serverPort = port
    }
  }
}

export function getServerPortValue() {
  return serverPort
}

function getBaseUrl(): string {
  return isElectron ? `http://localhost:${serverPort}` : '/qwen'
}

interface FetchOptions {
  method?: string
  url?: string
  data?: any
  responseType?: 'json' | 'blob' | 'arraybuffer'
  headers?: Record<string, string>
}

async function createFetcher<T = any>(baseURL: string, options: FetchOptions): Promise<{ status: number; data: T }> {
  const { method = 'get', url = '', data, responseType = 'json', headers = {} } = options
  const fullUrl = `${baseURL}${url}`
  const isFormData = data instanceof FormData
  const fetchOptions: RequestInit = {
    method: method.toUpperCase(),
    headers: isFormData ? headers : { 'Content-Type': 'application/json', ...headers },
    body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
  }

  const res = await fetch(fullUrl, fetchOptions)

  let result
  if (responseType === 'blob') {
    result = await res.blob()
  } else if (responseType === 'arraybuffer') {
    result = await res.arrayBuffer()
  } else {
    result = await res.json()
  }

  return { status: res.status, data: result }
}

export const files = <T = any>(options: FetchOptions) =>
  createFetcher<T>(isElectron ? 'http://localhost:3000' : '/file', options)

export const apis = <T = any>(options: FetchOptions) =>
  createFetcher<T>(isElectron ? 'http://localhost:9880' : '/api', options)

export const qwens = <T = any>(options: FetchOptions) =>
  createFetcher<T>(getBaseUrl(), options)
