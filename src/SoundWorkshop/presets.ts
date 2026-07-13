export interface Preset {
  id: string
  name: string
  icon: string
  effects: { effectId: string; values: Record<string, number> }[]
}

const presets: Preset[] = [
  {
    id: 'cute-girl',
    name: '萝莉音',
    icon: '🎀',
    effects: [{ effectId: 'pitch', values: { pitch: 6 } }],
  },
  {
    id: 'deep-man',
    name: '大叔音',
    icon: '🧔',
    effects: [{ effectId: 'pitch', values: { pitch: -6 } }],
  },
  {
    id: 'cute',
    name: '萌妹音',
    icon: '🥰',
    effects: [
      { effectId: 'pitch', values: { pitch: 4 } },
      { effectId: 'vibrato', values: { frequency: 5, depth: 0.2 } },
    ],
  },
  {
    id: 'electronic',
    name: '电音',
    icon: '⚡',
    effects: [
      { effectId: 'distortion', values: { distortion: 0.4 } },
      { effectId: 'autofilter', values: { frequency: 2, depth: 0.5, baseFrequency: 500 } },
    ],
  },
  {
    id: 'ethereal',
    name: '空灵',
    icon: '🌌',
    effects: [{ effectId: 'reverb', values: { decay: 12 } }],
  },
  {
    id: 'valley-echo',
    name: '山谷回声',
    icon: '🏔️',
    effects: [{ effectId: 'echo', values: { delayTime: 0.6, feedback: 0.7 } }],
  },
  {
    id: 'telephone',
    name: '电话音',
    icon: '📞',
    effects: [
      { effectId: 'autofilter', values: { frequency: 8, depth: 0.3, baseFrequency: 800 } },
      { effectId: 'distortion', values: { distortion: 0.05 } },
    ],
  },
  {
    id: 'ghost',
    name: '鬼畜',
    icon: '👻',
    effects: [
      { effectId: 'pitch', values: { pitch: 3 } },
      { effectId: 'echo', values: { delayTime: 0.12, feedback: 0.5 } },
    ],
  },
  {
    id: 'surround',
    name: '环绕',
    icon: '🎧',
    effects: [{ effectId: 'autofilter', values: { frequency: 0.3, depth: 1, baseFrequency: 300 } }],
  },
  {
    id: 'ktv',
    name: 'KTV混响',
    icon: '🎤',
    effects: [
      { effectId: 'echo', values: { delayTime: 0.15, feedback: 0.3 } },
      { effectId: 'reverb', values: { decay: 2 } },
    ],
  },
  {
    id: 'bass-boost',
    name: '低频增强',
    icon: '🔇',
    effects: [{ effectId: 'eq', values: { low: 8, mid: 0, high: -2 } }],
  },

  {
    id: 'heartfelt',
    name: '心里话',
    icon: '💭',
    effects: [
      { effectId: 'echo', values: { delayTime: 0.05, feedback: 0.05 } },
      { effectId: 'reverb', values: { decay: 1 } },
    ],
  },
]

export default presets
