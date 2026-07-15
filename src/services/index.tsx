import { qwens, getServerPortValue } from './request'
import type {
  HealthResponse,
  ModelStatusResponse,
  ModelLoadRequest,
  ModelLoadResponse,
  ModelUnloadRequest,
  ModelUnloadResponse,
  CloneRequest,
  CloneResponse,
  BatchCloneRequest,
  BatchCloneResponse,
  DialogueRequest,
  DialogueResponse,
  VoxCloneRequest,
  VoxCloneResponse,
  VoxDesignRequest,
  VoxDesignResponse,
  STTRequest,
  STTResponse,
  FilesListResponse,
  CacheStatusResponse,
  CleanupRequest,
  CleanupResponse,
} from './types'

const isElectron = navigator.userAgent.toLowerCase().includes('electron')

// 获取音频输出地址
export function getOutputUrl(audioUrl: string): string {
  const port = getServerPortValue()
  return `http://localhost:${port}${audioUrl}`
}

// 健康检查
export function getHealth() {
  return qwens<HealthResponse>({
    method: 'get',
    url: '/health',
  })
}

// 模型状态
export function getModelStatus() {
  return qwens<ModelStatusResponse>({
    method: 'get',
    url: '/model/status',
  })
}

// 加载模型
export function loadModel(data: ModelLoadRequest) {
  return qwens<ModelLoadResponse>({
    method: 'post',
    url: '/model/load',
    data,
  })
}

// 卸载模型
export async function unloadModel(model: 'tts' | 'voxcpm2'): Promise<{
  success: boolean
  model: string
  action: 'unloaded'
}> {
  const port = getServerPortValue()
  const res = await fetch(`http://localhost:${port}/model/unload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model }),
  })
  return res.json()
}

// 全部卸载（加载新模型前清场）
async function unloadAll(): Promise<void> {
  try {
    const port = getServerPortValue()
    await fetch(`http://localhost:${port}/model/unload`, { method: 'POST' })
  } catch {}
}

// 确保模型已加载（先全部卸载再加载，保证干净状态）
let _currentModel: 'tts' | 'voxcpm2' | null = null

export function getCurrentModel(): 'tts' | 'voxcpm2' | null {
  return _currentModel
}

export function setCurrentModel(model: 'tts' | 'voxcpm2' | null): void {
  _currentModel = model
}

export async function ensureModelLoaded(model: 'tts' | 'voxcpm2'): Promise<boolean> {
  if (_currentModel === model) return true
  await unloadAll()
  try {
    const loadRes = await loadModel({ model })
    if (loadRes.data.success) {
      _currentModel = model
      return true
    }
    return false
  } catch {
    return false
  }
}

// 单条语音克隆
export async function clone(data: CloneRequest, returnRaw = false) {
  if (returnRaw) {
    const port = getServerPortValue()
    const res = await fetch(`http://localhost:${port}/clone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, save_file: false }),
    })
    return res.arrayBuffer()
  }
  return qwens<CloneResponse>({
    method: 'post',
    url: '/clone',
    data: {
      ...data,
      save_file: data.save_file ?? true,
    },
  })
}

// 语音转文本
export function stt(data: STTRequest) {
  return qwens<STTResponse>({
    method: 'post',
    url: '/stt',
    data,
  })
}

// VoxCPM2 声音设计
export async function voxDesign(data: VoxDesignRequest, returnRaw = false) {
  if (returnRaw) {
    const port = getServerPortValue()
    const res = await fetch(`http://localhost:${port}/vox/design`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, save_file: false }),
    })
    return res.arrayBuffer()
  }
  return qwens<VoxDesignResponse>({
    method: 'post',
    url: '/vox/design',
    data: {
      ...data,
      save_file: data.save_file ?? true,
    },
  })
}

// VoxCPM2 克隆 + 情感
export async function voxClone(data: VoxCloneRequest, returnRaw = false) {
  if (returnRaw) {
    const port = getServerPortValue()
    const res = await fetch(`http://localhost:${port}/vox/clone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, save_file: false }),
    })
    return res.arrayBuffer()
  }
  return qwens<VoxCloneResponse>({
    method: 'post',
    url: '/vox/clone',
    data: {
      ...data,
      save_file: data.save_file ?? true,
    },
  })
}

// 批量配音
export async function batchClone(data: BatchCloneRequest, returnRaw = false) {
  if (returnRaw) {
    const port = getServerPortValue()
    const res = await fetch(`http://localhost:${port}/batch-clone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, return_raw: true }),
    })
    return res.arrayBuffer()
  }
  return qwens<BatchCloneResponse>({
    method: 'post',
    url: '/batch-clone',
    data,
  })
}

// 多角色对话
export async function dialogue(data: DialogueRequest, returnRaw = false) {
  if (returnRaw) {
    const port = getServerPortValue()
    const res = await fetch(`http://localhost:${port}/dialogue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, return_raw: true }),
    })
    return res.arrayBuffer()
  }
  return qwens<DialogueResponse>({
    method: 'post',
    url: '/dialogue',
    data,
  })
}

// 缓存状态
export function getCacheStatus() {
  return qwens<CacheStatusResponse>({
    method: 'get',
    url: '/cache',
  })
}

// 清理缓存
export function cleanupCache(data: CleanupRequest) {
  return qwens<CleanupResponse>({
    method: 'post',
    url: '/cleanup',
    data,
  })
}

// 文件列表
export function getFilesList(limit = 100, offset = 0) {
  return qwens<FilesListResponse>({
    method: 'get',
    url: '/files',
    params: { limit, offset },
  })
}
