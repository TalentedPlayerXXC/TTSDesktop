import { apis, files, qwens } from "./fetch_request"

function getTTS({ ref_audio_path = '', text = '', prompt_text = '' }) {
  return apis({
    method: 'post',
    url: '/tts',
    data: {
      text,
      text_lang: 'zh',
      ref_audio_path: ref_audio_path || '',
      prompt_lang: 'zh',
      prompt_text,
      text_split_method: 'cut5',
      batch_size: 1,
      media_type: 'wav',
      streaming_mode: true,
      speed_factor: 1,
    },
    responseType: 'blob',
  })
}

function qwen(formData: FormData) {
  return qwens({
    method: 'post',
    url: '/voice-clone',
    data: formData,
  })
}

function getModels() {
  return fetch('/api/models', { method: 'get' }).then(r => r.json())
}

function getSpks(modelName: string) {
  return fetch('/v2/spks', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: modelName }),
  }).then(r => r.json())
}

function getFileLink({ fileName = '', isBase64 = false, file = '' }) {
  return files({
    method: 'post',
    url: '/getFileLink',
    data: { fileName, isBase64, file },
  })
}

function getEmotionList() {
  return fetch('/file/getEmotionList', { method: 'get' }).then(r => r.json())
}

export {
  getTTS,
  getFileLink,
  getModels,
  getSpks,
  getEmotionList,
  qwen,
}
