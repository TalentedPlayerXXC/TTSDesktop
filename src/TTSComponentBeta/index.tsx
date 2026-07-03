import { useState } from 'react'
import { Button, Input, Upload, message } from 'antd'
import {
  UploadOutlined,
  PlayCircleOutlined,
  CloseCircleFilled,
  SoundOutlined,
  FileTextOutlined,
  AudioOutlined,
} from '@ant-design/icons'
import IconClone from '../components/IconClone'
import CyberpunkLoading from '../components/CyberpunkLoading'
import { clone, ensureModelLoaded, getOutputUrl } from '../services/index'
import './index.css'

const { TextArea } = Input

function TTSComponentBeta() {
  const [messageApi, contextHolder] = message.useMessage()
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioPath, setAudioPath] = useState<string>('')
  const [text, setText] = useState('')

  const handleFileChange = (info: any) => {
    const file = info.file
    if (!file) {
      setAudioFile(null)
      setAudioPath('')
      return
    }
    const isAudio = file.type?.includes('audio/')
    if (!isAudio) {
      messageApi.error('仅支持上传音频文件（如MP3/WAV等）')
      return
    }
    setAudioFile(file)
    const path = file.originFileObj?.path || ''
    setAudioPath(path)
  }

  const handleSynthesize = async () => {
    if (!text.trim()) {
      messageApi.warning('请输入配音文本')
      return
    }
    if (!audioPath) {
      messageApi.warning('请上传参考音频文件')
      return
    }

    setLoading(true)
    setLoadingMessage('正在加载 Qwen3 TTS 模型...')

    try {
      const ok = await ensureModelLoaded('tts')
      if (!ok) {
        messageApi.error('模型加载失败，请稍后重试')
        setLoading(false)
        return
      }

      setLoadingMessage('正在合成语音...')

      const res = await clone({
        text: text.trim(),
        ref_audio: audioPath,
      })

      if (res.status === 200 && res.data?.success) {
        const fullUrl = getOutputUrl(res.data.audio_url)
        setAudioUrl(fullUrl)
        messageApi.success('合成完成')
      } else {
        messageApi.error('合成失败，请稍后重试')
      }
    } catch {
      messageApi.error('请求失败，请检查服务是否启动')
    }
    setLoading(false)
  }

  return (
    <div className='tts-beta'>
      {contextHolder}
      <div className='tts-beta-header'>
        <h2 className='tts-beta-title'>
          <IconClone /> 一句话克隆
        </h2>
        <p className='tts-beta-subtitle'>上传参考音频，输入目标文本，快速克隆声音</p>
      </div>

      <div className='tts-beta-body'>
        <div className='tts-beta-controls'>
          <div className='tts-beta-section'>
            <div className='tts-beta-section-title'><><FileTextOutlined /> 配音文本</></div>
            <TextArea
              className='tts-beta-text-input'
              placeholder='请输入需要配音的文本内容...'
              value={text}
              onChange={e => setText(e.target.value)}
              maxLength={5000}
              autoSize={{ minRows: 6, maxRows: 10 }}
            />
            <div className='tts-beta-text-footer'>{text.length} / 5000</div>
          </div>
        </div>

        <div className='tts-beta-preview'>
          <div className='tts-beta-section'>
            <div className='tts-beta-section-title'><><AudioOutlined /> 参考音频</></div>
            <Upload
              name="audio"
              maxCount={1}
              accept="audio/*"
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleFileChange}
            >
              <div className={`tts-beta-upload-area${audioFile ? ' uploaded' : ''}`}>
                {audioFile && (
                  <CloseCircleFilled
                    className='tts-beta-upload-remove'
                    onClick={(e) => {
                      e.stopPropagation()
                      setAudioFile(null)
                      setAudioPath('')
                    }}
                  />
                )}
                {audioFile ? (
                  <div className='tts-beta-upload-file'>{audioFile.name}</div>
                ) : (
                  <>
                    <div className='tts-beta-upload-icon'>
                      <UploadOutlined />
                    </div>
                    <div className='tts-beta-upload-text'>点击或拖拽上传参考音频</div>
                  </>
                )}
                <div className='tts-beta-upload-hint'>仅支持 MP3 / WAV 音频格式</div>
              </div>
            </Upload>
          </div>

          <div className='tts-beta-actions'>
            <Button
              type='primary'
              size='large'
              icon={<PlayCircleOutlined />}
              onClick={handleSynthesize}
              loading={loading}
              className='tts-beta-btn-primary'
            >
              合成语音
            </Button>
          </div>

          <div className='tts-beta-preview-center'>
            {audioUrl ? (
              <audio src={audioUrl} controls className='tts-beta-audio' />
            ) : (
              <div className='tts-beta-preview-placeholder'>
                <SoundOutlined className='tts-beta-preview-icon' />
                <p>合成后音频将在此处播放</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CyberpunkLoading
        visible={loading}
        message={loadingMessage}
        modelName='Qwen3 TTS'
      />
    </div>
  )
}

export default TTSComponentBeta
