import { useEffect, useState } from 'react'
import { Button, Input, Upload, message, Select, Slider } from 'antd'
import {
  UploadOutlined,
  PlayCircleOutlined,
  CloseCircleFilled,
  SoundOutlined,
  FileTextOutlined,
  SettingOutlined,
  AudioOutlined,
} from '@ant-design/icons'
import IconClone from '../components/IconClone'
import { qwen } from '../services/index'
import './index.css'

const { TextArea } = Input

function TTSComponentBeta() {
  const [messageApi, contextHolder] = message.useMessage()
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isShow, setIshow] = useState(true)

  const [text, setText] = useState('')
  const [textLang, setTextLang] = useState('zh')
  const [textSplitMethod, setTextSplitMethod] = useState('cut0')
  const [speedFactor, setSpeedFactor] = useState(1)

  useEffect(() => {
  }, [])

  const handleFileChange = (info: any) => {
    const file = info.file
    if (!file) {
      setAudioFile(null)
      setIshow(true)
      return
    }
    const isAudio = file.type?.includes('audio/')
    if (!isAudio) {
      messageApi.error('仅支持上传音频文件（如MP3/WAV等）')
      return
    }
    setAudioFile(file)
    setIshow(false)

    const reader = new FileReader()
    reader.readAsDataURL(file)
    localStorage.removeItem('audioData')
    reader.onload = () => {
      localStorage.setItem('audioData', reader.result as string)
    }
  }

  const handleSynthesize = () => {
    if (!text.trim()) {
      messageApi.warning('请输入配音文本')
      return
    }
    if (!audioFile) {
      messageApi.warning('请上传参考音频文件')
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append('ref_audio', audioFile)
    formData.append('text', text)
    formData.append('ref_text', text)
    formData.append('rate', String(speedFactor))
    formData.append('text_lang', textLang)
    formData.append('text_split_method', textSplitMethod)

    qwen(formData).then(res => {
      console.log(res, 'res')
      if (res.status === 200 && res?.data) {
        const source = URL.createObjectURL(res.data)
        setAudioUrl(source)
      } else {
        messageApi.error('合成失败，请稍后重试')
      }
      setLoading(false)
    }).catch(() => {
      messageApi.error('请求失败，请检查服务是否启动')
      setLoading(false)
    })
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
              maxLength={300}
              autoSize={{ minRows: 6, maxRows: 10 }}
            />
            <div className='tts-beta-text-footer'>{text.length} / 300</div>
          </div>

          <div className='tts-beta-section'>
            <div className='tts-beta-section-title'><><SettingOutlined /> 参数设置</></div>

            <div className='tts-beta-param-row'>
              <span className='tts-beta-param-label'>输出文本语言</span>
              <div className='tts-beta-param-control'>
                <Select
                  value={textLang}
                  onChange={setTextLang}
                  style={{ width: '100%' }}
                >
                  <Select.Option value="zh">中文</Select.Option>
                  <Select.Option value="en">英文</Select.Option>
                </Select>
              </div>
            </div>

            <div className='tts-beta-param-row'>
              <span className='tts-beta-param-label'>文本切割方式</span>
              <div className='tts-beta-param-control'>
                <Select
                  value={textSplitMethod}
                  onChange={setTextSplitMethod}
                  style={{ width: '100%' }}
                >
                  <Select.Option value="cut0">不切</Select.Option>
                  <Select.Option value="cut1">凑四句一切</Select.Option>
                  <Select.Option value="cut2">50字一切</Select.Option>
                  <Select.Option value="cut3">按中文。切</Select.Option>
                  <Select.Option value="cut4">按英文.切</Select.Option>
                  <Select.Option value="cut5">按标点符号切</Select.Option>
                </Select>
              </div>
            </div>

            <div className='tts-beta-param-row'>
              <span className='tts-beta-param-label'>语速</span>
              <div className='tts-beta-param-control'>
                <Slider
                  min={0.1}
                  max={2}
                  step={0.1}
                  value={speedFactor}
                  onChange={setSpeedFactor}
                  marks={{ 0.1: '0.1x', 0.5: '0.5x', 1: '1x', 1.5: '1.5x', 2: '2x' }}
                  tooltip={{ formatter: (val?: number) => `${val}x` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className='tts-beta-preview'>
          <div className='tts-beta-section'>
            <div className='tts-beta-section-title'><><AudioOutlined /> 参考音频</></div>
            <Upload
              name="audioUrl"
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
                      setIshow(true)
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
    </div>
  )
}

export default TTSComponentBeta
