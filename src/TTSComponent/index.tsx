import { useState, useMemo } from 'react'
import { Input, Button, message } from 'antd'
import {
  SearchOutlined,
  PlayCircleOutlined,
  HeartOutlined,
  HeartFilled,
  FireFilled,
  FireOutlined,
  SoundOutlined,
  FileTextOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import IconTTS from '../components/IconTTS'
import './index.css'
const { TextArea } = Input

interface Speaker {
  id: string
  name: string
  gender: 'male' | 'female'
  tags: string[]
}

interface SpeakerType {
  key: string
  label: string
  isFavorite?: boolean
  isHot?: boolean
}

const SPEAKER_TYPES: SpeakerType[] = [
  { key: 'favorite', label: '我的收藏', isFavorite: true },
  { key: 'all', label: '全部' },
  { key: 'male', label: '男声' },
  { key: 'female', label: '女声' },
  { key: 'affection', label: '情感' },
  { key: 'dialect', label: '方言' },
  { key: 'anime', label: '二次元' },
  { key: 'ancient', label: '古风' },
  { key: 'news', label: '新闻' },
  { key: 'cartoon', label: '童声' },
  // {key: 'other', label: '其他' },
  {key: 'custom', label: '自定义' },
  // {key: 'recent', label: '最近使用' },
  {key: 'popular', label: '热门推荐',isHot: true},
]

const MOCK_SPEAKERS: Speaker[] = [
  { id: '1', name: '悠然', gender: 'female', tags: ['情感', '温柔'] },
  { id: '2', name: '清风', gender: 'male', tags: ['磁性', '深沉'] },
  { id: '3', name: '小糖', gender: 'female', tags: ['二次元', '活泼'] },
  { id: '4', name: '阿杰', gender: 'male', tags: ['古风', '中二'] },
  { id: '5', name: '沐晴', gender: 'female', tags: ['新闻', '端庄'] },
  { id: '6', name: '老刘', gender: 'male', tags: ['方言', '亲切'] },
  { id: '7', name: '灵儿', gender: 'female', tags: ['童声', '可爱'] },
  { id: '8', name: '凯旋', gender: 'male', tags: ['新闻', '浑厚'] },
  { id: '9', name: '诗雅', gender: 'female', tags: ['古风', '婉约'] },
  { id: '10', name: '大鹏', gender: 'male', tags: ['情感', '治愈'] },
  { id: '11', name: '晓梦', gender: 'female', tags: ['二次元', '元气'] },
  { id: '12', name: '逸飞', gender: 'male', tags: ['磁性', '温柔'] },
]

const TTSComponent = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const [text, setText] = useState('')
  const [searchText, setSearchText] = useState('')
  const [activeType, setActiveType] = useState('all')
  const [selectedSpeaker, setSelectedSpeaker] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const filteredSpeakers = useMemo(() => {
    let list = MOCK_SPEAKERS

    if (activeType === 'favorite') {
      list = list.filter(s => favorites.has(s.id))
    } else if (activeType === 'male') {
      list = list.filter(s => s.gender === 'male')
    } else if (activeType === 'female') {
      list = list.filter(s => s.gender === 'female')
    } else if (activeType !== 'all') {
      const typeLabel = SPEAKER_TYPES.find(t => t.key === activeType)?.label || ''
      list = list.filter(s => s.tags.some(tag => tag.includes(typeLabel)))
    }

    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase()
      list = list.filter(s => s.name.includes(keyword))
    }

    return list
  }, [activeType, searchText, favorites])

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelectSpeaker = (id: string) => {
    setSelectedSpeaker(id)
  }

  const handleSynthesize = () => {
    if (!text.trim()) {
      messageApi.warning('请输入配音文本')
      return
    }
    if (!selectedSpeaker) {
      messageApi.warning('请选择一个配音员')
      return
    }
    messageApi.success('开始合成...')
  }

  return (
    <div className='tts'>
      {contextHolder}
      <div className='tts-header'>
        <h2 className='tts-title'>
          <IconTTS /> 智能配音
        </h2>
        <p className='tts-subtitle'>选择配音员，输入文本内容，快速生成配音</p>
      </div>

      <div className='tts-body'>
        <div className='tts-controls'>
          <div className='tts-section'>
            <div className='tts-section-title'><><FileTextOutlined /> 配音文本</></div>
            <TextArea
              className='tts-text-input'
              placeholder='请输入需要配音的文本内容...'
              value={text}
              onChange={e => setText(e.target.value)}
              maxLength={300}
              autoSize={{ minRows: 6, maxRows: 10 }}
            />
            <div className='tts-text-footer'>{text.length} / 300</div>
          </div>
        </div>

        <div className='tts-preview'>
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
              {SPEAKER_TYPES.map(type => (
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
                  {type.label}
                </button>
              ))}
            </div>
            {filteredSpeakers.length === 0 ? (
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
                      className={`tts-speaker-avatar${speaker.gender === 'female' ? ' female' : ''}`}
                    >
                      {speaker.name.charAt(0)}
                    </div>
                    <div className='tts-speaker-name'>{speaker.name}</div>
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

          <div className='tts-actions'>
            <Button
              type='primary'
              size='large'
              icon={<PlayCircleOutlined />}
              onClick={handleSynthesize}
              className='tts-btn-primary'
            >
              合成试听
            </Button>
          </div>
          <div className='tts-preview-center'>
            <div className='tts-preview-placeholder'>
              <SoundOutlined className='tts-preview-icon' />
              <p>合成后音频将在此处播放</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TTSComponent
