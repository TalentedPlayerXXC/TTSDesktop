import { qwens } from './fetch_request'
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
} from './types'

const isElectron = navigator.userAgent.toLowerCase().includes('electron')
const OUTPUT_BASE = isElectron ? 'http://localhost:8000' : '/qwen'

export function getOutputUrl(audioUrl: string): string {
  return `${OUTPUT_BASE}${audioUrl}`
}

export function getHealth() {
  return qwens<HealthResponse>({ method: 'get', url: '/health' })
}

export function getModelStatus() {
  return qwens<ModelStatusResponse>({ method: 'get', url: '/model/status' })
}

export function loadModel(data: ModelLoadRequest) {
  return qwens<ModelLoadResponse>({ method: 'post', url: '/model/load', data })
}

export function unloadModel(data: ModelUnloadRequest) {
  return qwens<ModelUnloadResponse>({ method: 'post', url: '/model/unload', data })
}

let currentLoadedModel: 'tts' | 'voxcpm2' | null = null

export async function ensureModelLoaded(model: 'tts' | 'voxcpm2'): Promise<boolean> {
  if (currentLoadedModel === model) return true

  try {
    await unloadModel({ model })

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

export function stt(data: STTRequest) {
  return qwens<STTResponse>({ method: 'post', url: '/stt', data })
}

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

export function batchClone(data: BatchCloneRequest) {
  return qwens<BatchCloneResponse>({
    method: 'post',
    url: '/batch-clone',
    data,
  })
}

export function dialogue(data: DialogueRequest) {
  return qwens<DialogueResponse>({
    method: 'post',
    url: '/dialogue',
    data,
  })
}

export function getFilesList(limit = 100, offset = 0) {
  return qwens<FilesListResponse>({ method: 'get', url: `/files?limit=${limit}&offset=${offset}` })
}
