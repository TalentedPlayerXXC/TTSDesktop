import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { Input, Button, Select, message } from 'antd'
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
import { clone, batchClone, voxClone, ensureModelLoaded, getCurrentModel, getOutputUrl } from '../services/index'
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
  const [lines, setLines] = useState<MultiLine[]>([
    { id: 0, speakerId: null, text: '' },
    { id: 1, speakerId: null, text: '' },
  ])

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
  const handleModeChange = async (newMode: Mode) => {
    setMode(newMode)
    const targetModel = newMode === 'emotion' ? 'voxcpm2' as const : 'tts' as const
    if (getCurrentModel() !== targetModel) {
      setModelLoading(true)
      setModelLoadingMsg(targetModel === 'voxcpm2' ? '正在加载情感模型 VoxCPM2...' : '正在加载 TTS 模型...')
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
  }

  // 清洗无效收藏 ID
  const cleanFavorites = useCallback((arr: any[]) => {
    const allIds = new Set(arr.map(c => c.id))
    setFavorites(prev => {
      const cleaned = new Set([...prev].filter(id => allIds.has(id)))
      if (cleaned.size !== prev.size) saveFavorites(cleaned)
      return cleaned
    })
  }, [])

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

        const res = await batchClone({ items, merge: true })
        if (res.data.success) {
          if (res.data.merged) {
            setAudioUrl(getOutputUrl(res.data.merged.audio_url))
            setAudioFilename(res.data.merged.filename)
          } else if (res.data.files?.length > 0) {
            setAudioUrl(getOutputUrl(res.data.files[0].audio_url))
            setAudioFilename(res.data.files[0].filename)
          }
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

  const speakerOptions = characters.map(s => ({
    value: s.id,
    label: s.name,
  }))

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

          {/* 多人：角色行 */}
          {mode === 'multi' && (
            <div className='tts-section tts-multi-section'>
              <div className='tts-section-title'><><TeamOutlined /> 配音角色</></div>
              <div className='tts-multi-lines'>
                {lines.map((line, i) => (
                  <div key={line.id} className='tts-multi-line'>
                    <div className='tts-multi-line-index'>{i + 1}</div>
                    <Select
                      className='tts-multi-line-speaker'
                      placeholder='选配音员'
                      value={line.speakerId}
                      onChange={val => updateLineSpeaker(line.id, val)}
                      options={speakerOptions}
                      size='small'
                    />
                    <Input
                      className='tts-multi-line-text'
                      placeholder='输入台词...'
                      value={line.text}
                      onChange={e => updateLineText(line.id, e.target.value)}
                      size='small'
                    />
                    {lines.length > 1 && (
                      <CloseOutlined
                        className='tts-multi-line-remove'
                        onClick={() => removeLine(line.id)}
                      />
                    )}
                  </div>
                ))}
              </div>
              <Button
                className='tts-multi-add'
                icon={<PlusOutlined />}
                onClick={addLine}
                block
                size='small'
              >
                添加角色
              </Button>
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
                        <button
                          className='tts-speaker-delete'
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteCustom(speaker)
                          }}
                          title='删除此自定义配音员'
                        >
                          ×
                        </button>
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

          {/* 多人：角色总览 */}
          {mode === 'multi' && (
            <div className='tts-section tts-multi-summary'>
              <div className='tts-section-title'><><TeamOutlined /> 角色概览</></div>
              {lines.filter(l => l.speakerId).length === 0 ? (
                <div className='tts-speaker-empty'>
                  <SoundOutlined className='tts-empty-icon' />
                  <p>请在左侧添加角色和台词</p>
                </div>
              ) : (
                <div className='tts-multi-role-list'>
                  {lines.filter(l => l.speakerId).map(line => {
                    const speaker = characters.find(s => s.id === line.speakerId)
                    return (
                      <div key={line.id} className='tts-multi-role-item'>
                        <div className={`tts-multi-role-avatar${speaker?.gender === 'female' || speaker?.gender === '女' ? ' female' : ''}`}>
                          {speaker?.name?.charAt(0) || '?'}
                        </div>
                        <div className='tts-multi-role-info'>
                          <div className='tts-multi-role-name'>{speaker?.name || '未选择'}</div>
                          <div className='tts-multi-role-text'>{line.text || '（空）'}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <div className='tts-actions'>
            <Button
              type='primary'
              size='large'
              icon={<PlayCircleOutlined />}
              onClick={handleSynthesize}
              disabled={!selectedSpeaker}
              className='tts-btn-primary'
            >
              {synthesizing ? '合成中...' : (mode === 'multi' ? '合并合成' : '合成试听')}
            </Button>
          </div>
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
