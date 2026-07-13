import { useState } from 'react'
import { Input, Button, message, Modal, Slider } from 'antd'
import AudioPlayer from '../components/AudioPlayer'
import '../components/AudioPlayer.css'
import {
  PlayCircleOutlined,
  SoundOutlined,
  FileTextOutlined,
  EditOutlined,
  UserAddOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import IconDesign from '../components/IconDesign'
import CyberpunkLoading from '../components/CyberpunkLoading'
import { voxDesign, getOutputUrl } from '../services/index'
import { saveCustomSpeaker } from '../services/customSpeaker'
import './index.css'

const { TextArea } = Input

const DEFAULT_PROMPTS = [
  '御姐声线，声线偏暖略带气声，语速中偏慢，尾音自然下沉，适合情感旁白',
  '低沉磁性男低音，胸腔共鸣明显，语速偏慢，带适度沙哑颗粒感，适合深沉故事',
  '元气甜美少女音，明亮靠前，语调轻快上扬，带笑意发声，活泼有朝气',
  '稳重新闻男声，声道偏厚实，咬字清晰有力，语速均匀，庄重但不僵硬',
  '慵懒松弛的氛围感女声，带轻微气泡音，发声靠后，语调自然起伏，适合睡前故事',
  '清亮活力少年音，声道通透气息足，语调明快上扬，充满阳光感',
  '烟嗓质感女声，声线偏粗带摩擦感，微微撕裂感，情感饱满有穿透力',
  '温润醇厚男中音，声道宽阔共鸣好，语速偏慢吐字沉稳，有儒雅书卷气',
]

const VoiceDesign = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const [text, setText] = useState('')
  const [voicePrompt, setVoicePrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [customName, setCustomName] = useState('')
  const [pendingFilename, setPendingFilename] = useState('')

  // 高级参数
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [steps, setSteps] = useState(6)
  const [cfg, setCfg] = useState(4.0)

  const handleAddToSpeaker = async () => {
    if (!customName.trim()) {
      messageApi.warning('请输入角色名')
      return
    }

    // 1. 迁移音频文件到 characters/自定义/
    let migratePath = ''
    if (window.electronAPI) {
      const migrateRes = await window.electronAPI.migrateCustomSpeaker({
        name: customName.trim(),
        sourceFilename: pendingFilename,
      })
      if (migrateRes.status !== 'ok') {
        messageApi.error('文件迁移失败: ' + (migrateRes.error || '未知错误'))
        return
      }
      migratePath = migrateRes.path!
    }

    // 2. 保存到 localStorage
    saveCustomSpeaker({
      name: customName.trim(),
      voiceType: '',
      temperament: '',
      ref_audio: migratePath,
    })
    messageApi.success(`「${customName.trim()}」已加入配音员列表，去配音页看看吧 🎉`)
    setShowAddModal(false)
    setCustomName('')
  }

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
        inference_timesteps: steps,
        cfg_value: cfg,
      })

      if (res.status === 200 && res.data?.success) {
        const fullUrl = getOutputUrl(res.data.audio_url)
        setAudioUrl(fullUrl)
        setPendingFilename(res.data.filename || '')
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

          <div className='voice-design-section'>
            <div
              className='voice-design-section-title'
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setShowAdvanced(v => !v)}
            >
              <><SettingOutlined /> 高级参数 {showAdvanced ? '▲' : '▼'}</>
            </div>
            {showAdvanced && (
              <div className='voice-design-advanced'>
                <div className='voice-design-param'>
                  <div className='voice-design-param-header'>
                    <span>扩散步数</span>
                    <span className='voice-design-param-value'>{steps}</span>
                  </div>
                  <Slider
                    min={1}
                    max={10}
                    value={steps}
                    onChange={setSteps}
                    marks={{ 1: '1', 5: '5', 10: '10' }}
                  />
                  <div className='voice-design-param-desc'>步数越高音质越好，但生成越慢（默认 6）</div>
                </div>
                <div className='voice-design-param'>
                  <div className='voice-design-param-header'>
                    <span>CFG 强度</span>
                    <span className='voice-design-param-value'>{cfg.toFixed(1)}</span>
                  </div>
                  <Slider
                    min={0.5}
                    max={5.0}
                    step={0.1}
                    value={cfg}
                    onChange={setCfg}
                    marks={{ 0.5: '0.5', 2: '2', 4: '4', 5: '5' }}
                  />
                  <div className='voice-design-param-desc'>越高越贴近提示词，但可能失真（默认 4.0）</div>
                </div>
              </div>
            )}
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
              <>
              <AudioPlayer src={audioUrl} />
                <Button
                  type='default'
                  icon={<UserAddOutlined />}
                  onClick={() => setShowAddModal(true)}
                  className='voice-design-add-speaker-btn'
                >
                  🎨 加入配音员
                </Button>
              </>
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

      <Modal
        title='🎨 加入配音员'
        open={showAddModal}
        onCancel={() => { setShowAddModal(false); setCustomName('') }}
        footer={[
          <Button key='cancel' onClick={() => { setShowAddModal(false); setCustomName('') }}>
            稍后再说
          </Button>,
          <Button key='confirm' type='primary' onClick={handleAddToSpeaker}>
            加入列表
          </Button>,
        ]}
      >
        <div>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>角色名</div>
          <Input
            placeholder='给这个声音取个名字'
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            maxLength={20}
            onPressEnter={handleAddToSpeaker}
          />
        </div>
      </Modal>
    </div>
  )
}

export default VoiceDesign
