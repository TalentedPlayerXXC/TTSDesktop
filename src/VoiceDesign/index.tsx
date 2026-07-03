import { useState } from 'react'
import { Input, Button, message } from 'antd'
import {
  PlayCircleOutlined,
  SoundOutlined,
  FileTextOutlined,
  EditOutlined,
} from '@ant-design/icons'
import IconDesign from '../components/IconDesign'
import CyberpunkLoading from '../components/CyberpunkLoading'
import { voxDesign, getOutputUrl } from '../services/index'
import './index.css'

const { TextArea } = Input

const DEFAULT_PROMPTS = [
  '温柔知性的成熟女声，说话节奏舒缓，语调自然亲切',
  '深沉富有磁性的男声，带有轻微的沙哑感，适合故事旁白',
  '活泼元气的少女音，语调轻快上扬，充满青春气息',
  '稳重庄重的新闻播音腔，字正腔圆，语速均匀',
  '慵懒随性的氛围感声音，带些许气泡音，松弛自然',
  '清澈明亮的少年音，充满朝气，咬字清晰有力',
  '低沉性感的烟嗓女声，微微沙哑，情感饱满',
  '儒雅温和的书卷气男声，语速偏慢，沉稳有韵味',
]

const VoiceDesign = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const [text, setText] = useState('')
  const [voicePrompt, setVoicePrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const handleSynthesize = async () => {
    if (!text.trim()) {
      messageApi.warning('请输入配音文本')
      return
    }
    if (!voicePrompt.trim()) {
      messageApi.warning('请输入语音风格提示词')
      return
    }

    setLoading(true)
    setLoadingMessage('正在合成语音...')

    try {
      const res = await voxDesign({
        text: text.trim(),
        instruct: voicePrompt.trim(),
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
    <div className='voice-design'>
      {contextHolder}

      <div className='voice-design-header'>
        <h2 className='voice-design-title'>
          <IconDesign /> 声音设计
        </h2>
        <p className='voice-design-subtitle'>输入文本与风格描述，AI 为你设计专属语音</p>
      </div>

      <div className='voice-design-body'>
        <div className='voice-design-controls'>
          <div className='voice-design-section'>
            <div className='voice-design-section-title'><><EditOutlined /> 配音文本</></div>
            <TextArea
              className='voice-design-prompt-input'
              placeholder='请输入需要配音的文本内容...'
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={5000}
              autoSize={{ minRows: 4, maxRows: 6 }}
            />
            <div className='voice-design-text-footer'>
              {text.length} / 5000
            </div>
          </div>

          <div className='voice-design-section'>
            <div className='voice-design-section-title'><><FileTextOutlined /> 语音风格提示词</></div>
            <TextArea
              className='voice-design-prompt-input'
              placeholder='描述你想要的语音风格，例如：温柔知性的成熟女声，说话节奏舒缓'
              value={voicePrompt}
              onChange={(e) => setVoicePrompt(e.target.value)}
              maxLength={500}
              autoSize={{ minRows: 3, maxRows: 5 }}
            />
            <div className='voice-design-text-footer'>
              {voicePrompt.length} / 500
            </div>
            <div className='voice-design-default-prompts'>
              {DEFAULT_PROMPTS.map((p) => (
                <span
                  key={p}
                  className={`voice-design-prompt-tag${voicePrompt === p ? ' active' : ''}`}
                  onClick={() => setVoicePrompt(p)}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className='voice-design-preview'>
          <div className='voice-design-preview-center'>
            {!audioUrl ? (
              <div className='voice-design-preview-placeholder'>
                <SoundOutlined className='voice-design-preview-icon' />
                <p>合成后音频将在此处播放</p>
              </div>
            ) : (
              <audio src={audioUrl} controls className='voice-design-audio' />
            )}
          </div>
          <div className='voice-design-actions'>
            <Button
              type='primary'
              size='large'
              icon={<PlayCircleOutlined />}
              onClick={handleSynthesize}
              loading={loading}
              className='voice-design-btn-primary'
            >
              合成试听
            </Button>
          </div>
        </div>
      </div>

      <CyberpunkLoading
        visible={loading}
        message={loadingMessage}
      />
    </div>
  )
}

export default VoiceDesign
