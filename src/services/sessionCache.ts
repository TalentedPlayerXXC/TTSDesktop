// 应用生命周期内的内存缓存，关闭即销毁
// 避免每次切到配音页都请求 MongoDB，又不留 localStorage 残留

interface SessionData {
  characters: any[]
  tags: any[]
}

let cache: SessionData | null = null

export function getSessionCache(): SessionData | null {
  return cache
}

export function setSessionCache(characters: any[], tags: any[]): void {
  cache = { characters, tags }
}
