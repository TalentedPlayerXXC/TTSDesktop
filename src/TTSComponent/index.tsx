import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { Input, Button, Select, Popconfirm, message } from 'antd'
import {
  SearchOutlined,
  PlayCircleOutlined,
  HeartOutlined,
  HeartFilled,
  FireFilled,
  SoundOutlined,
  FileTextOutlined,
  TeamOutlined,
  PlusOutlined,
  CloseOutlined,
  SmileOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons'
import IconTTS from '../components/IconTTS'
import AudioPlayer from '../components/AudioPlayer'
import '../components/AudioPlayer.css'
import { loadCustomSpeakers, saveCustomSpeaker, deleteCustomSpeaker, loadFavorites, saveFavorites } from '../services/customSpeaker'
import { getSessionCache, setSessionCache } from '../services/sessionCache'
import { clone, dialogue, voxClone, ensureModelLoaded, getCurrentModel, getOutputUrl } from '../services/index'
import type { BatchCloneItem } from '../services/types'
import CyberpunkLoading from '../components/CyberpunkLoading'
import './index.css'
const { TextArea } = Input

type Mode = 'single' | 'multi' | 'emotion'

interface CharacterRaw {
  _id: string
  name: string
  gender: string
  voiceType: string
  temperament: string
  game?: string
}

interface TagItem {
  _id: string
  label: string
  enum: string
}

interface Speaker {
  id: string
  name: string
  gender: 'male' | 'female' | '男' | '女'
  tags: string[]
  voiceType?: string
  temperament?: string
  game?: string
}

interface SpeakerType {
  key: string
  label: string
  isFavorite?: boolean
  isHot?: boolean
  isCustom?: boolean
  isDynamic?: boolean
}

interface MultiLine {
  id: number
  speakerId: string | null
  text: string
}

const MODES: { key: Mode; label: string }[] = [
  { key: 'single', label: '单人配音' },
  { key: 'multi', label: '多人配音' },
  { key: 'emotion', label: '情感配音' },
]

const EMOTIONS = [
  '开心', '悲伤', '愤怒', '温柔',
  '沉稳', '活泼', '治愈', '深沉',
  '元气', '性感', '严肃', '慵懒',
]

let lineIdCounter = 2

const TTSComponent = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const [mode, setMode] = useState<Mode>('single')

  // 单人/情感 共享
  const [text, setText] = useState('')
  const [searchText, setSearchText] = useState('')
  const [activeType, setActiveType] = useState('all')
  const [selectedSpeaker, setSelectedSpeaker] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites())

  // 多人
  const [lines, setLines] = useState<MultiLine[]>([])
  const [editingLineId, setEditingLineId] = useState<number | null>(null)
  const [inputSpeaker, setInputSpeaker] = useState<string>('')
  const [inputText, setInputText] = useState<string>('')
  const [inputEmotion, setInputEmotion] = useState<string>('')

  // 情感
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])

  // 数据库 & 自定义数据
  const [characters, setCharacters] = useState<Speaker[]>([])
  const [tags, setTags] = useState<TagItem[]>([])
  const [charactersLoading, setCharactersLoading] = useState(false)
  const [availableEmotions, setAvailableEmotions] = useState<string[]>([])
  const [selectedEmotion, setSelectedEmotion] = useState('')
  const [showAllTags, setShowAllTags] = useState(false)
  const [synthesizing, setSynthesizing] = useState(false)
  const [modelLoading, setModelLoading] = useState(false)
  const [modelLoadingMsg, setModelLoadingMsg] = useState('')

  const currentEmotions = useMemo(() => {
    if (!inputSpeaker) return []
    return availableEmotions
  }, [inputSpeaker, availableEmotions])

  // 多人模式：选择角色后获取可用情感（跟单人一致，通过 IPC getCharacterEmotions）
  useEffect(() => {
    if (!inputSpeaker || !window.electronAPI) { setAvailableEmotions([]); return }
    const speaker = characters.find(s => s.id === inputSpeaker)
    if (!speaker?.game) { setAvailableEmotions([]); return }
    if (speaker.game === '🎨 自定义') { setAvailableEmotions([]); return }
    window.electronAPI.getCharacterEmotions({ game: speaker.game, name: speaker.name }).then((res: any) => {
      if (res.status === 'ok' && res.data) {
        setAvailableEmotions(res.data)
        setInputEmotion(res.data[0] || '')
        if (res.data[0]) setSelectedEmotion(res.data[0])
      }
    }).catch(() => {})
  }, [inputSpeaker, characters])

  const handleModeChange = async (newMode: Mode) => {
    setMode(newMode)
    const targetModel = newMode === 'emotion' ? 'voxcpm2' as const : 'tts' as const
    if (getCurrentModel() !== targetModel) {
      setModelLoading(true)
      setModelLoadingMsg(targetModel === 'voxcpm2' ? '🎭 情感模块正在加载戏精属性...' : '🏃 配音员正在赶来的路上...')
      await ensureModelLoaded(targetModel)
      setModelLoading(false)
    }
  }
  const [audioUrl, setAudioUrl] = useState('')
  const [audioFilename, setAudioFilename] = useState('')

  useEffect(() => {
    if (!window.electronAPI) return

    const cached = getSessionCache()
    if (cached) {
      const chars = Array.isArray(cached.characters) ? cached.characters : []
      setCharacters(chars.map((c: any) => ({
        id: c._id || c.id,
        name: c.name,
        gender: c.gender,
        tags: [c.voiceType, c.temperament].filter(Boolean),
        voiceType: c.voiceType || '',
        temperament: c.temperament || '',
        game: c.game || '',
      })))
      setTags(Array.isArray(cached.tags) ? cached.tags : [])
      // 从 localStorage 合并自定义配音员
      const customSpeakers = loadCustomSpeakers()
      if (customSpeakers.length > 0) {
        setCharacters(prev => [...prev, ...customSpeakers.map(s => ({
          id: s.id,
          name: s.name,
          gender: ['萝莉', '少女', '御姐'].includes(s.voiceType) ? '女' : '男',
          tags: [s.voiceType, s.temperament].filter(Boolean),
          voiceType: s.voiceType || '',
          temperament: s.temperament || '',
          game: '🎨 自定义',
        }))])
      }
      // 文件系统恢复仍然执行（处理 localStorage 被清但文件还在的情况）
      runRecovery()
      return
    }

    setCharactersLoading(true)

    // 尝试本地加载，失败则回退 MongoDB
    const tryLocal = () => {
      window.electronAPI?.getCharactersLocal?.().then((localRes: any) => {
        setTimeout(() => {
          if (localRes?.status === 'ok' && localRes.data?.length) {
            const mapped = localRes.data.map((c: any) => ({
              id: c.id, name: c.name, gender: c.gender,
              tags: [c.voiceType, c.temperament].filter(Boolean),
              voiceType: c.voiceType || '', temperament: c.temperament || '', game: c.game || '',
            }))
            if (localRes.tags?.length) setTags(localRes.tags)
            const custom = loadCustomSpeakers()
            setCharacters(custom.length > 0 ? [...mapped, ...custom.map(s => ({
              id: s.id, name: s.name,
              gender: ['萝莉', '少女', '御姐'].includes(s.voiceType) ? '女' : '男',
              tags: [s.voiceType, s.temperament].filter(Boolean),
              voiceType: s.voiceType || '', temperament: s.temperament || '', game: '🎨 自定义',
            }))] : mapped)
            setCharactersLoading(false)
            // 本地成功，后台尝 MongoDB
            window.electronAPI.mongo.getCharacters().then((charRes: any) => {
              if (charRes.status === 'ok' && charRes.data?.length) {
                const mapped = charRes.data.map((c: CharacterRaw) => ({
                  id: c._id, name: c.name, gender: c.gender,
                  tags: [c.voiceType, c.temperament].filter(Boolean),
                  voiceType: c.voiceType || '', temperament: c.temperament || '', game: c.game || '',
                }))
                const custom = loadCustomSpeakers()
                setCharacters(custom.length > 0 ? [...mapped, ...custom.map(s => ({
                  id: s.id, name: s.name,
                  gender: ['萝莉', '少女', '御姐'].includes(s.voiceType) ? '女' : '男',
                  tags: [s.voiceType, s.temperament].filter(Boolean),
                  voiceType: s.voiceType || '', temperament: s.temperament || '', game: '🎨 自定义',
                }))] : mapped)
              }
              window.electronAPI.mongo.getTags().then((tagRes: any) => {
                if (tagRes.status === 'ok' && tagRes.data?.length) setTags(tagRes.data)
              }).catch(() => {})
            }).catch(() => {})
          } else {
            fallbackToMongo()
          }
        }, 500);
      }).catch(() => fallbackToMongo())
    }

    const fallbackToMongo = () => {
      Promise.all([
        window.electronAPI.mongo.getCharacters(),
        window.electronAPI.mongo.getTags(),
      ]).then(([charRes, tagRes]) => {
        if (charRes.status === 'ok' && tagRes.status === 'ok') {
          setSessionCache(charRes.data || [], tagRes.data || [])
        }
        if (charRes.status === 'ok' && charRes.data?.length) {
          const mapped = charRes.data.map((c: CharacterRaw) => ({
            id: c._id, name: c.name, gender: c.gender,
            tags: [c.voiceType, c.temperament].filter(Boolean),
            voiceType: c.voiceType || '', temperament: c.temperament || '', game: c.game || '',
          }))
          const custom = loadCustomSpeakers()
          setCharacters(custom.length > 0 ? [...mapped, ...custom.map(s => ({
            id: s.id, name: s.name,
            gender: ['萝莉', '少女', '御姐'].includes(s.voiceType) ? '女' : '男',
            tags: [s.voiceType, s.temperament].filter(Boolean),
            voiceType: s.voiceType || '', temperament: s.temperament || '', game: '🎨 自定义',
          }))] : mapped)
        }
        if (tagRes.status === 'ok' && tagRes.data?.length) {
          setTags(tagRes.data)
        }
      }).catch(() => {}).finally(() => setCharactersLoading(false))
    }

    tryLocal()

    runRecovery()
  }, [])

  // 删除自定义配音员
  const handleDeleteCustom = async (speaker: any) => {
    deleteCustomSpeaker(speaker.id)
    await window.electronAPI?.deleteCustomSpeaker?.({ name: speaker.name })
    setCharacters(prev => prev.filter(c => c.id !== speaker.id))
    message.success(`已删除「${speaker.name}」`)
  }

  function runRecovery() {
    if (window.electronAPI?.recoverCustomSpeakers) {
      window.electronAPI.recoverCustomSpeakers().then(res => {
        if (res.status === 'ok' && res.data?.length) {
          const existing = loadCustomSpeakers()
          const existingNames = new Set(existing.map(s => s.name))
          // 同步：删除 localStorage 中但文件系统中不存在的条目
          const recoveredNames = new Set(res.data.map(s => s.name))
          existing.forEach(s => { if (!recoveredNames.has(s.name)) deleteCustomSpeaker(s.id) })
          // 新增：文件系统中有但 localStorage 中没有的
          res.data.forEach(s => { if (!existingNames.has(s.name)) saveCustomSpeaker(s) })
          setCharacters(prev => {
            const currentNames = new Set(prev.map(c => c.name))
            // 先从列表移除已删除的
            let updated = prev.filter(c => c.game !== '🎨 自定义' || recoveredNames.has(c.name))
            // 再加入新的
            const newOnes = res.data.filter(s => !currentNames.has(s.name)).map(s => ({
              id: s.id,
              name: s.name,
              gender: ['萝莉', '少女', '御姐'].includes(s.voiceType) ? '女' : '男',
              tags: [s.voiceType, s.temperament].filter(Boolean),
              voiceType: s.voiceType || '',
              temperament: s.temperament || '',
              game: '🎨 自定义',
            }))
            return newOnes.length ? [...updated, ...newOnes] : updated
          })
        } else {
          // 文件系统没有任何自定义配音员了，清空 localStorage
          const existing = loadCustomSpeakers()
          existing.forEach(s => deleteCustomSpeaker(s.id))
          setCharacters(prev => prev.filter(c => c.game !== '🎨 自定义'))
        }
      }).catch(() => {})
    }
  }

  const speakerTypes = useMemo((): SpeakerType[] => {
    const fixed: SpeakerType[] = [
      { key: 'favorite', label: '我的收藏', isFavorite: true },
      { key: 'custom', label: '自定义', isCustom: true },
      { key: 'all', label: '全部' },
      { key: 'male', label: '男声' },
      { key: 'female', label: '女声' },
    ]
    const dynamic = tags.map(t => ({ key: t.enum, label: t.label, isDynamic: true }))
    return [...fixed, ...dynamic]
  }, [tags])

  const filteredSpeakers = useMemo(() => {
    let list = characters
    if (activeType === 'favorite') {
      list = list.filter(s => favorites.has(s.id))
    } else if (activeType === 'custom') {
      list = list.filter(s => s.game === '🎨 自定义')
    } else if (activeType === 'male') {
      list = list.filter(s => s.gender === '男')
    } else if (activeType === 'female') {
      list = list.filter(s => s.gender === '女')
    } else if (activeType !== 'all') {
      const label = speakerTypes.find(t => t.key === activeType)?.label || ''
      list = list.filter(s => s.voiceType === label || s.temperament === label)
    }
    if (searchText.trim()) {
      const kw = searchText.trim().toLowerCase()
      list = list.filter(s => s.name.includes(kw))
    }
    return list
  }, [activeType, searchText, favorites, characters, speakerTypes])

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveFavorites(next)
      return next
    })
  }

  // 快速试听
  const [previewSpeaker, setPreviewSpeaker] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chatListRef = useRef<HTMLDivElement>(null)
  const editingOriginalRef = useRef<string>('')

  const handleSelectSpeaker = async (id: string) => {
    setSelectedSpeaker(id)
    const speaker = characters.find(c => c.id === id)
    if (!speaker?.game || !window.electronAPI) return
    if (speaker.game === '🎨 自定义') { setAvailableEmotions([]); return }

    // 快速试听
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    setPreviewSpeaker(null)
    const audioRes = await window.electronAPI.getCharacterPreviewAudio({ game: speaker.game, name: speaker.name })
    if (audioRes.status === 'ok' && audioRes.data) {
      const audio = new Audio(`data:audio/wav;base64,${audioRes.data}`)
      audio.volume = 0.3
      audio.play().then(() => setPreviewSpeaker(id)).catch(() => {})
      audio.addEventListener('ended', () => { setPreviewSpeaker(null); audioRef.current = null })
      audioRef.current = audio
    }

    const res = await window.electronAPI.getCharacterEmotions({ game: speaker.game, name: speaker.name })
    if (res.status === 'ok' && res.data) {
      setAvailableEmotions(res.data)
      if (res.data[0]) setSelectedEmotion(res.data[0])
    }
  }

  const addLine = () => {
    setLines(prev => [...prev, { id: lineIdCounter++, speakerId: null, text: '' }])
  }

  const removeLine = (id: number) => {
    setLines(prev => prev.filter(l => l.id !== id))
  }

  const updateLineSpeaker = (id: number, speakerId: string | null) => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, speakerId } : l))
  }

  const updateLineText = (id: number, text: string) => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, text } : l))
  }

  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight
    }
  }, [lines])

  const handleAddLine = () => {
    if (!inputSpeaker || !inputText.trim()) return
    setLines(prev => [...prev, { id: lineIdCounter++, speakerId: inputSpeaker, text: inputText.trim() }])
    setInputText('')
  }

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotion(prev => prev === emotion ? '' : emotion)
  }

  const handleSynthesize = async () => {
    // 停掉正在播放的试听
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    setPreviewSpeaker(null)

    if (mode === 'single') {
      if (!text.trim()) { messageApi.warning('请输入配音文本'); return }
      if (!selectedSpeaker) { messageApi.warning('请选择一个配音员'); return }
      const speaker = characters.find(c => c.id === selectedSpeaker)
      if (!speaker) return

      setSynthesizing(true)
      try {
        let refAudio = ''
        if (speaker.game === '🎨 自定义') {
          const pathRes = await window.electronAPI?.getCharacterPath({ game: '🎨 自定义', name: speaker.name, emotion: '默认' })
          if (pathRes?.status === 'ok') refAudio = pathRes.path
          else { messageApi.error('获取自定义角色音频失败'); setSynthesizing(false); return }
        } else {
          const pathRes = await window.electronAPI?.getCharacterPath({ game: speaker.game || '', name: speaker.name, emotion: selectedEmotion || '默认' })
          if (pathRes?.status === 'ok') refAudio = pathRes.path
          else { messageApi.error('获取角色音频失败'); setSynthesizing(false); return }
        }

        const loaded = await ensureModelLoaded('tts')
        if (!loaded) { messageApi.error('模型加载失败'); setSynthesizing(false); return }

        const res = await clone({ text: text.trim(), ref_audio: refAudio })
        if (res.data.success) {
          setAudioUrl(getOutputUrl(res.data.audio_url))
          setAudioFilename(res.data.filename)
          messageApi.success('合成完成！')
        } else {
          messageApi.error('合成失败')
        }
      } catch (e: any) {
        messageApi.error(e?.message || '合成出错')
      }
      setSynthesizing(false)

    } else if (mode === 'multi') {
      const validLines = lines.filter(l => l.speakerId && l.text.trim())
      if (validLines.length === 0) { messageApi.warning('请至少添加一个角色并填写内容'); return }

      setSynthesizing(true)
      try {
        const items: BatchCloneItem[] = []
        for (const line of validLines) {
          const speaker = characters.find(c => c.id === line.speakerId)
          if (!speaker) continue
          const pathRes = await window.electronAPI?.getCharacterPath({ game: speaker.game || '', name: speaker.name, emotion: '默认' })
          if (pathRes?.status === 'ok') {
            items.push({ text: line.text.trim(), ref_audio: pathRes.path })
          }
        }
        if (items.length === 0) { messageApi.error('无法获取角色音频路径'); setSynthesizing(false); return }

        const loaded = await ensureModelLoaded('tts')
        if (!loaded) { messageApi.error('模型加载失败'); setSynthesizing(false); return }

        const res = await dialogue({ items })
        if (res.data.success) {
          setAudioUrl(getOutputUrl(res.data.audio_url))
          setAudioFilename(res.data.filename)
          messageApi.success(`合成完成！共 ${res.data.generated} 条`)
        } else {
          messageApi.error('合成失败')
        }
      } catch (e: any) {
        messageApi.error(e?.message || '合成出错')
      }
      setSynthesizing(false)

    } else if (mode === 'emotion') {
      if (!text.trim()) { messageApi.warning('请输入配音文本'); return }
      if (!selectedSpeaker) { messageApi.warning('请选择一个配音员'); return }
      const speaker = characters.find(c => c.id === selectedSpeaker)
      if (!speaker) return

      setSynthesizing(true)
      try {
        const pathRes = await window.electronAPI?.getCharacterPath({ game: speaker.game || '', name: speaker.name, emotion: selectedEmotion || '默认' })
        let refAudio = ''
        if (pathRes?.status === 'ok') refAudio = pathRes.path
        else { messageApi.error('获取角色音频失败'); setSynthesizing(false); return }

        const loaded = await ensureModelLoaded('voxcpm2')
        if (!loaded) { messageApi.error('模型加载失败'); setSynthesizing(false); return }

        const res = await voxClone({ text: text.trim(), ref_audio: refAudio, instruct: selectedEmotion || undefined })
        if (res.data.success) {
          setAudioUrl(getOutputUrl(res.data.audio_url))
          setAudioFilename(res.data.filename)
          messageApi.success('合成完成！')
        } else {
          messageApi.error('合成失败')
        }
      } catch (e: any) {
        messageApi.error(e?.message || '合成出错')
      }
      setSynthesizing(false)
    }
  }

  const fixedTypes = speakerTypes.filter(t => !t.isDynamic)
  const dynamicTypes = speakerTypes.filter(t => t.isDynamic)

  return (
    <div className='tts'>
      {contextHolder}
      <div className='tts-header'>
        <h2 className='tts-title'>
          <IconTTS /> 智能配音
        </h2>
        <p className='tts-subtitle'>单人配音、多人对话、情感配音，灵活生成</p>
      </div>

      <div className='tts-mode-tabs'>
        {MODES.map(m => (
          <button
            key={m.key}
            className={`tts-mode-tab${mode === m.key ? ' active' : ''}`}
            onClick={() => handleModeChange(m.key)}
          >
            {m.key === 'single' && <UserSwitchOutlined />}
            {m.key === 'multi' && <TeamOutlined />}
            {m.key === 'emotion' && <SmileOutlined />}
            {m.label}
          </button>
        ))}
      </div>

      <div className='tts-body'>

        {/* === 左侧控制区 === */}
        <div className='tts-controls'>

          {/* 单人/情感：配音文本 */}
          {(mode === 'single' || mode === 'emotion') && (
            <div className='tts-section'>
              <div className='tts-section-title'><><FileTextOutlined /> 配音文本</></div>
              <TextArea
                className='tts-text-input'
                placeholder='请输入需要配音的文本内容...'
                value={text}
                onChange={e => setText(e.target.value)}
                maxLength={5000}
                autoSize={{ minRows: 6, maxRows: 10 }}
              />
              <div className='tts-text-footer'>{text.length} / 5000</div>
            </div>
          )}

          {/* 单人：可用情感 */}
          {mode === 'single' && availableEmotions.length > 0 && (
            <div className='tts-section'>
              <div className='tts-section-title'><><SmileOutlined /> 可用情感</></div>
              <div className='tts-emotion-tags'>
                {availableEmotions.map(e => (
                  <span
                    key={e}
                    className={`tts-emotion-tag${selectedEmotion === e ? ' active' : ''}`}
                    onClick={() => setSelectedEmotion(selectedEmotion === e ? '' : e)}
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 情感：情感风格 */}
          {mode === 'emotion' && (
            <div className='tts-section'>
              <div className='tts-section-title'><><SmileOutlined /> 情感风格</></div>
              <div className='tts-emotion-tags'>
                {EMOTIONS.map(e => (
                  <span
                    key={e}
                    className={`tts-emotion-tag${selectedEmotion === e ? ' active' : ''}`}
                    onClick={() => setSelectedEmotion(selectedEmotion === e ? '' : e)}
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
            )}

            {/* 多人：聊天气泡面板 */}
          {mode === 'multi' && (
            <div className='tts-chat-panel'>
              <div className='tts-section-title' style={{ marginBottom: 12 }}>
                <TeamOutlined /> 💬 对话脚本
              </div>
              <div className='tts-chat-list' ref={chatListRef}>
                {lines.length === 0 ? (
                  <div className='tts-chat-empty'>
                    <div className='tts-speaker-empty'>
                      <SoundOutlined className='tts-empty-icon' />
                      <p>暂无台词，请在右侧添加</p>
                    </div>
                  </div>
                ) : (
                  lines.map((line, i) => {
                    const speaker = characters.find(s => s.id === line.speakerId)
                    const isEditing = editingLineId === line.id
                    return (
                      <div key={line.id} className='tts-chat-bubble'>
                        <div className={`tts-chat-bubble-avatar${speaker?.gender === 'female' || speaker?.gender === '女' ? ' female' : ''}`}>
                          {speaker?.name?.charAt(0) || '?'}
                        </div>
                        <div className='tts-chat-bubble-content'>
                          <div className='tts-chat-bubble-header'>
                            <span className='tts-chat-bubble-name'>{speaker?.name || '未选择'}</span>
                            <span className='tts-chat-bubble-index'>#{i + 1}</span>
                          </div>
                          {isEditing ? (
                            <Input
                              className='tts-chat-bubble-input'
                              size='small'
                              value={line.text}
                              onChange={e => updateLineText(line.id, e.target.value)}
                              onBlur={() => setEditingLineId(null)}
                              onPressEnter={() => setEditingLineId(null)}
                              onKeyDown={e => {
                                if (e.key === 'Escape') {
                                  updateLineText(line.id, editingOriginalRef.current)
                                  setEditingLineId(null)
                                }
                              }}
                              autoFocus
                            />
                          ) : (
                            <div
                              className='tts-chat-bubble-text'
                              onClick={() => {
                                editingOriginalRef.current = line.text
                                setEditingLineId(line.id)
                              }}
                            >
                              {line.text || '（点击输入台词）'}
                            </div>
                          )}
                        </div>
                        <div className='tts-chat-bubble-actions'>
                          <div
                            className='tts-chat-bubble-play'
                            title='试听'
                            onClick={() => {
                              // TODO: 试听单个句子
                            }}
                          >
                            ▶
                          </div>
                          <div
                            className='tts-chat-bubble-del'
                            title='删除'
                            onClick={() => removeLine(line.id)}
                          >
                            ×
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              <div className='tts-chat-footer'>
                <div className='tts-multi-input-row'>
                  {/* 列1：角色名称 */}
                  <div className='tts-multi-name' onClick={() => { setInputSpeaker(''); setInputEmotion('') }}>
                    {inputSpeaker ? (
                      <span>{characters.find(s => s.id === inputSpeaker)?.name || '未知角色'}</span>
                    ) : (
                      <span className='tts-multi-name-placeholder'>选择角色</span>
                    )}
                  </div>

                  {/* 列2：可用情感 */}
                  <div className='tts-multi-emotion'>
                    <Select
                      placeholder={!inputSpeaker ? '先选择角色' : currentEmotions.length === 0 ? '无情感' : '选择情感'}
                      value={inputEmotion || undefined}
                      onChange={v => setInputEmotion(v || '')}
                      options={currentEmotions.map(e => ({ value: e, label: e }))}
                      size='small'
                      style={{ width: '100%' }}
                      allowClear
                      disabled={!inputSpeaker || currentEmotions.length === 0}
                    />
                  </div>

                  {/* 列3：配音文字 */}
                  <div className='tts-multi-text'>
                    <TextArea
                      placeholder='输入台词...'
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      onPressEnter={e => { if (!e.shiftKey) { e.preventDefault(); handleAddLine() } }}
                      autoSize={{ minRows: 1, maxRows: 3 }}
                    />
                  </div>

                  {/* 清除按钮 */}
                  <Button
                    icon={<CloseOutlined />}
                    onClick={() => { setInputSpeaker(''); setInputText(''); setInputEmotion('') }}
                  />
                </div>
                <div className='tts-chat-actions'>
                  <Button
                    icon={<PlusOutlined />}
                    size='small'
                    onClick={handleAddLine}
                    disabled={!inputSpeaker || !inputText.trim()}
                  >
                    + 添加台词
                  </Button>
                  <Button
                    type='primary'
                    size='small'
                    icon={<PlayCircleOutlined />}
                    onClick={handleSynthesize}
                    disabled={lines.filter(l => l.speakerId && l.text.trim()).length === 0}
                  >
                    {synthesizing ? '合成中...' : '🎬 合成全部'}
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* === 右侧预览区 === */}
        <div className='tts-preview'>

          {/* 单人/情感：选择配音员 */}
          {(mode === 'single' || mode === 'emotion') && (
            <div className='tts-section tts-speaker-section'>
              <div className='tts-section-title'><><TeamOutlined /> 选择配音员</></div>
              <Input
                placeholder='搜索配音员'
                prefix={<SearchOutlined style={{ color: '#bbb' }} />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                className='tts-speaker-search'
              />
              <div className='tts-speaker-types'>
                {fixedTypes.map(type => (
                  <button
                    key={type.key}
                    className={`tts-type-btn${activeType === type.key ? ' active' : ''}`}
                    onClick={() => setActiveType(type.key)}
                  >
                    {type.isFavorite && (
                      <HeartFilled style={{ fontSize: 11, color: '#f59e0b' }} />
                    )}
                    {type.isHot && (
                      <FireFilled style={{ fontSize: 11, color: '#f59e0b' }} />
                    )}
                    {type.isCustom && <span style={{ marginRight: 2 }}>🎨</span>}
                    {type.label}
                  </button>
                ))}
                {dynamicTypes.length > 0 && (
                  <>
                    {showAllTags && dynamicTypes.map(type => (
                      <button
                        key={type.key}
                        className={`tts-type-btn${activeType === type.key ? ' active' : ''}`}
                        onClick={() => setActiveType(type.key)}
                      >
                        {type.label}
                      </button>
                    ))}
                    <button
                      className='tts-type-btn tts-type-btn-more'
                      onClick={() => setShowAllTags(!showAllTags)}
                    >
                      {showAllTags ? '收起 ▲' : '更多 ▼'}
                    </button>
                  </>
                )}
              </div>
              {charactersLoading ? (
                <div className='tts-speaker-list'>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className='tts-speaker-skeleton-card'>
                      <div className='tts-speaker-skeleton-avatar' />
                      <div className='tts-speaker-skeleton-name' />
                      <div className='tts-speaker-skeleton-tags'>
                        <div className='tts-speaker-skeleton-tag' />
                        <div className='tts-speaker-skeleton-tag' />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredSpeakers.length === 0 ? (
                <div className='tts-speaker-empty'>
                  <SoundOutlined className='tts-empty-icon' />
                  <p>
                    {activeType === 'favorite'
                      ? '还没有收藏的配音员哦～'
                      : '没有找到匹配的配音员'}
                  </p>
                </div>
              ) : (
                <div className='tts-speaker-list'>
                  {filteredSpeakers.map(speaker => (
                    <div
                      key={speaker.id}
                      className={`tts-speaker-item${selectedSpeaker === speaker.id ? ' selected' : ''}`}
                      onClick={() => handleSelectSpeaker(speaker.id)}
                    >
                      <button
                        className={`tts-speaker-fav${favorites.has(speaker.id) ? ' favorited' : ''}`}
                        onClick={e => {
                          e.stopPropagation()
                          toggleFavorite(speaker.id)
                        }}
                      >
                        {favorites.has(speaker.id) ? (
                          <HeartFilled />
                        ) : (
                          <HeartOutlined />
                        )}
                      </button>
                      <div
                        className={`tts-speaker-avatar${speaker.gender === 'female' || speaker.gender === '女' ? ' female' : ''}${previewSpeaker === speaker.id ? ' playing' : ''}`}
                      >
                        {speaker.name.charAt(0)}
                        {previewSpeaker === speaker.id && <span className='tts-speaker-playing' />}
                      </div>
                      <div className='tts-speaker-name'>{speaker.name}</div>
                      {speaker.game === '🎨 自定义' && (
                        <Popconfirm
                          title={`删除「${speaker.name}」？`}
                          description='删除后无法恢复'
                          okText='删除'
                          okType='danger'
                          cancelText='取消'
                          onConfirm={() => handleDeleteCustom(speaker)}
                        >
                          <button
                            className='tts-speaker-delete'
                            onClick={(e) => e.stopPropagation()}
                          >
                            <CloseOutlined />
                          </button>
                        </Popconfirm>
                      )}
                      <div className='tts-speaker-tags'>
                        {speaker.tags.map(tag => (
                          <span key={tag} className='tts-speaker-tag'>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 多人：角色列表 — 复用单人模式的筛选+标签+搜索+角色卡片 */}
          {mode === 'multi' && (
            <div className='tts-role-panel'>
              <div className='tts-section-title' style={{ marginBottom: 12 }}>
                <TeamOutlined /> 🎭 角色列表
              </div>
              <Input
                placeholder='搜索配音员'
                prefix={<SearchOutlined style={{ color: '#bbb' }} />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                className='tts-speaker-search'
              />
              <div className='tts-speaker-types'>
                {fixedTypes.map(type => (
                  <button
                    key={type.key}
                    className={`tts-type-btn${activeType === type.key ? ' active' : ''}`}
                    onClick={() => setActiveType(type.key)}
                  >
                    {type.isFavorite && (
                      <HeartFilled style={{ fontSize: 11, color: '#f59e0b' }} />
                    )}
                    {type.isHot && (
                      <FireFilled style={{ fontSize: 11, color: '#f59e0b' }} />
                    )}
                    {type.isCustom && <span style={{ marginRight: 2 }}>🎨</span>}
                    {type.label}
                  </button>
                ))}
                {dynamicTypes.length > 0 && (
                  <>
                    {showAllTags && dynamicTypes.map(type => (
                      <button
                        key={type.key}
                        className={`tts-type-btn${activeType === type.key ? ' active' : ''}`}
                        onClick={() => setActiveType(type.key)}
                      >
                        {type.label}
                      </button>
                    ))}
                    <button
                      className='tts-type-btn tts-type-btn-more'
                      onClick={() => setShowAllTags(!showAllTags)}
                    >
                      {showAllTags ? '收起 ▲' : '更多 ▼'}
                    </button>
                  </>
                )}
              </div>
              {charactersLoading ? (
                <div className='tts-speaker-list'>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className='tts-speaker-skeleton-card'>
                      <div className='tts-speaker-skeleton-avatar' />
                      <div className='tts-speaker-skeleton-name' />
                      <div className='tts-speaker-skeleton-tags'>
                        <div className='tts-speaker-skeleton-tag' />
                        <div className='tts-speaker-skeleton-tag' />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredSpeakers.length === 0 ? (
                <div className='tts-speaker-empty'>
                  <SoundOutlined className='tts-empty-icon' />
                  <p>
                    {activeType === 'favorite'
                      ? '还没有收藏的配音员哦～'
                      : '没有找到匹配的配音员'}
                  </p>
                </div>
              ) : (
                <div className='tts-speaker-list'>
                  {filteredSpeakers.map(speaker => (
                    <div
                      key={speaker.id}
                      className={`tts-speaker-item${inputSpeaker === speaker.id ? ' selected' : ''}`}
                      onClick={() => setInputSpeaker(speaker.id)}
                    >
                      <button
                        className={`tts-speaker-fav${favorites.has(speaker.id) ? ' favorited' : ''}`}
                        onClick={e => {
                          e.stopPropagation()
                          toggleFavorite(speaker.id)
                        }}
                      >
                        {favorites.has(speaker.id) ? (
                          <HeartFilled />
                        ) : (
                          <HeartOutlined />
                        )}
                      </button>
                      <div
                        className={`tts-speaker-avatar${speaker.gender === 'female' || speaker.gender === '女' ? ' female' : ''}`}
                      >
                        {speaker.name.charAt(0)}
                      </div>
                      <div className='tts-speaker-name'>{speaker.name}</div>
                      {speaker.game === '🎨 自定义' && (
                        <Popconfirm
                          title={`删除「${speaker.name}」？`}
                          description='删除后无法恢复'
                          okText='删除'
                          okType='danger'
                          cancelText='取消'
                          onConfirm={() => handleDeleteCustom(speaker)}
                        >
                          <button
                            className='tts-speaker-delete'
                            onClick={(e) => e.stopPropagation()}
                          >
                            <CloseOutlined />
                          </button>
                        </Popconfirm>
                      )}
                      <div className='tts-speaker-tags'>
                        {speaker.tags.map(tag => (
                          <span key={tag} className='tts-speaker-tag'>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {mode !== 'multi' && (
            <div className='tts-actions'>
              <Button
                type='primary'
                size='large'
                icon={<PlayCircleOutlined />}
                onClick={handleSynthesize}
                disabled={!selectedSpeaker}
                className='tts-btn-primary'
              >
                {synthesizing ? '合成中...' : '合成试听'}
              </Button>
            </div>
          )}
          <div className='tts-preview-center'>
            {audioUrl ? (
              <AudioPlayer src={audioUrl} />
            ) : (
              <div className='tts-preview-placeholder'>
                <SoundOutlined className='tts-preview-icon' />
                <p>合成后音频将在此处播放</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {synthesizing && (
        <CyberpunkLoading visible={synthesizing} message='正在合成音频...' modelName='TTS' />
      )}
      {modelLoading && (
        <CyberpunkLoading visible={modelLoading} message={modelLoadingMsg} />
      )}
    </div>
  )
}

export default TTSComponent
