// 模型管理
export interface HealthResponse {
  status: string
  qwen3_loaded: boolean
  whisper_loaded: boolean
  voxcpm2_loaded: boolean
}

export interface ModelStatusResponse {
  qwen3: boolean
  whisper: boolean
  voxcpm2: boolean
}

export interface ModelLoadRequest {
  model: 'tts' | 'voxcpm2'
}

export interface ModelLoadResponse {
  success: boolean
  model: string
  action: string
}

export interface ModelUnloadRequest {
  model: 'tts' | 'voxcpm2'
}

export interface ModelUnloadResponse {
  success: boolean
  model: string
  action: string
}

// 语音克隆
export interface CloneRequest {
  text: string
  ref_audio: string
  ref_text?: string
  stream?: boolean
  save_file?: boolean
  filename?: string
}

export interface CloneResponse {
  success: boolean
  text: string
  ref_audio: string
  audio_url: string
  filename: string
}

// 批量克隆
export interface BatchCloneItem {
  text: string
  ref_audio: string
  ref_text?: string
}

export interface BatchCloneRequest {
  items: BatchCloneItem[]
  merge?: boolean
  output_filename?: string
  return_raw?: boolean
}

export interface BatchCloneFile {
  index: number
  text: string
  audio_url: string
  filename: string
}

export interface BatchCloneResponse {
  success: boolean
  total: number
  generated: number
  files: BatchCloneFile[]
  merged?: {
    filename: string
    audio_url: string
  }
}

// 对话生成
export interface DialogueItem {
  text: string
  ref_audio: string
  ref_text?: string
}

export interface DialogueRequest {
  items: DialogueItem[]
  output_filename?: string
  return_raw?: boolean
}

export interface DialogueResponse {
  success: boolean
  total_items: number
  generated: number
  audio_url: string
  filename: string
}

// STT
export interface STTRequest {
  ref_audio: string
}

export interface STTResponse {
  success: boolean
  ref_audio: string
  text: string
}

// VoxCPM2 克隆
export interface VoxCloneRequest {
  text: string
  ref_audio: string
  ref_text?: string
  instruct?: string
  inference_timesteps?: number
  cfg_value?: number
  save_file?: boolean
}

export interface VoxCloneResponse {
  success: boolean
  text: string
  ref_audio: string
  audio_url: string
  filename: string
  processing_time: number
  real_time_factor: number
  audio_duration: number
}

// VoxCPM2 声音设计
export interface VoxDesignRequest {
  text: string
  instruct: string
  inference_timesteps?: number
  cfg_value?: number
  save_file?: boolean
}

export interface VoxDesignResponse {
  success: boolean
  text: string
  instruct: string
  audio_url: string
  filename: string
  processing_time: number
  real_time_factor: number
  audio_duration: number
}

// 文件管理
export interface FileItem {
  filename: string
  size: number
  url: string
}

export interface FilesListResponse {
  files: FileItem[]
  total: number
  limit: number
  offset: number
}

// 错误
export interface ApiError {
  detail: string
}
