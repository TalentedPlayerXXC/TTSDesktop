const isElectron = navigator.userAgent.toLowerCase().includes('electron')

interface FetchOptions {
  method?: string
  url?: string
  data?: any
  responseType?: 'json' | 'blob' | 'arraybuffer'
  headers?: Record<string, string>
}

async function createFetcher(baseURL: string, options: FetchOptions) {
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

export const files = (options: FetchOptions) =>
  createFetcher(isElectron ? 'http://192.168.50.251:3000' : '/file', options)

export const apis = (options: FetchOptions) =>
  createFetcher(isElectron ? 'http://192.168.50.251:9880' : '/api', options)

export const qwens = (options: FetchOptions) =>
  createFetcher(isElectron ? 'http://192.168.50.251:8000' : '/qwen', options)
