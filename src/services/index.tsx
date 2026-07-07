import { qwens } from './request'
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
const OUTPUT_BASE = isElectron ? 'http://localhost:8000' : '/qwen'

// 获取音频输出地址
export function getOutputUrl(audioUrl: string): string {
  return `${OUTPUT_BASE}${audioUrl}`
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
export function unloadModel(data: ModelUnloadRequest) {
  return qwens<ModelUnloadResponse>({
    method: 'post',
    url: '/model/unload',
    data,
  })
}

// 确保模型已加载（先卸载再加载，保证干净状态）
let currentLoadedModel: 'tts' | 'voxcpm2' | null = null

// 导出当前模型，方便其他组件读取
export function getCurrentModel(): 'tts' | 'voxcpm2' | null {
  return currentLoadedModel
}

export async function ensureModelLoaded(model: 'tts' | 'voxcpm2'): Promise<boolean> {
  if (currentLoadedModel === model) return true

  try {
    if (currentLoadedModel) {
      await unloadModel({ model: currentLoadedModel })
    }

    const loadRes = await loadModel({ model })
    if (loadRes.data.success) {
      currentLoadedModel = model
      return true
    }
    return false
  } catch {
    return false
  }
}

// 单条语音克隆
export function clone(data: CloneRequest) {
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
export function voxDesign(data: VoxDesignRequest) {
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
export function voxClone(data: VoxCloneRequest) {
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
export function batchClone(data: BatchCloneRequest) {
  return qwens<BatchCloneResponse>({
    method: 'post',
    url: '/batch-clone',
    data,
  })
}

// 多角色对话
export function dialogue(data: DialogueRequest) {
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
