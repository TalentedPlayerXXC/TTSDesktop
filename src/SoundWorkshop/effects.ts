import * as Tone from 'tone'

export interface EffectParam {
  key: string
  label: string
  min: number
  max: number
  step: number
  default: number
}

export interface EffectDef {
  id: string
  name: string
  icon: string
  params: EffectParam[]
  create: (values: Record<string, number>) => Tone.ToneAudioNode
  update: (node: Tone.ToneAudioNode, values: Record<string, number>) => void
}

const effects: EffectDef[] = [
  {
    id: 'volume',
    name: '音量',
    icon: '🔊',
    params: [
      { key: 'volume', label: '音量', min: -20, max: 20, step: 1, default: 0 },
    ],
    create: (v) => new Tone.Volume(v.volume),
    update: (n, v) => {
      const node = n as Tone.Volume
      node.volume.value = v.volume
    },
  },
  {
    id: 'echo',
    name: '回声',
    icon: '🔁',
    params: [
      { key: 'delayTime', label: '延迟时间', min: 0.05, max: 1, step: 0.05, default: 0.3 },
      { key: 'feedback', label: '反馈量', min: 0, max: 0.95, step: 0.05, default: 0.5 },
    ],
    create: (v) => new Tone.FeedbackDelay({ delayTime: v.delayTime, feedback: v.feedback }),
    update: (n, v) => {
      const node = n as Tone.FeedbackDelay
      node.delayTime.value = v.delayTime
      node.feedback.value = v.feedback
    },
  },
  {
    id: 'vibrato',
    name: '颤音',
    icon: '🌊',
    params: [
      { key: 'frequency', label: '频率', min: 1, max: 10, step: 0.5, default: 5 },
      { key: 'depth', label: '深度', min: 0, max: 1, step: 0.05, default: 0.5 },
    ],
    create: (v) => new Tone.Vibrato({ frequency: v.frequency, depth: v.depth }).start(),
    update: (n, v) => {
      const node = n as Tone.Vibrato
      node.frequency.value = v.frequency
      node.depth.value = v.depth
    },
  },
  {
    id: 'pitch',
    name: '变声',
    icon: '🎤',
    params: [
      { key: 'pitch', label: '音调偏移', min: -12, max: 12, step: 1, default: 0 },
    ],
    create: (v) => new Tone.PitchShift({ pitch: v.pitch }),
    update: (n, v) => {
      const node = n as Tone.PitchShift
      node.pitch = v.pitch
    },
  },
  {
    id: 'distortion',
    name: '失真',
    icon: '🔊',
    params: [
      { key: 'distortion', label: '失真度', min: 0, max: 1, step: 0.05, default: 0.4 },
    ],
    create: (v) => new Tone.Distortion({ distortion: v.distortion }),
    update: (n, v) => {
      const node = n as Tone.Distortion
      node.distortion = v.distortion
    },
  },
  {
    id: 'reverb',
    name: '混响',
    icon: '🏛️',
    params: [
      { key: 'decay', label: '衰减时间', min: 1, max: 20, step: 1, default: 5 },
    ],
    create: (v) => new Tone.Reverb({ decay: v.decay }),
    update: (n, v) => {
      const node = n as Tone.Reverb
      node.decay = v.decay
    },
  },
  {
    id: 'chorus',
    name: '合唱',
    icon: '🔀',
    params: [
      { key: 'frequency', label: '频率', min: 0.1, max: 5, step: 0.1, default: 1.5 },
      { key: 'depth', label: '深度', min: 0, max: 1, step: 0.05, default: 0.5 },
    ],
    create: (v) => new Tone.Chorus({ frequency: v.frequency, depth: v.depth }).start(),
    update: (n, v) => {
      const node = n as Tone.Chorus
      ;(node as any).frequency = v.frequency
      node.depth.value = v.depth
    },
  },
  {
    id: 'pong',
    name: '乒乓延迟',
    icon: '🔄',
    params: [
      { key: 'delayTime', label: '延迟时间', min: 0.05, max: 1, step: 0.05, default: 0.3 },
      { key: 'feedback', label: '反馈量', min: 0, max: 0.95, step: 0.05, default: 0.5 },
    ],
    create: (v) => new Tone.PingPongDelay({ delayTime: v.delayTime, feedback: v.feedback }),
    update: (n, v) => {
      const node = n as Tone.PingPongDelay
      node.delayTime.value = v.delayTime
      node.feedback.value = v.feedback
    },
  },
  {
    id: 'autofilter',
    name: '自动滤波',
    icon: '📡',
    params: [
      { key: 'frequency', label: '频率', min: 0.1, max: 10, step: 0.1, default: 2 },
      { key: 'depth', label: '深度', min: 0, max: 1, step: 0.05, default: 0.5 },
      { key: 'baseFrequency', label: '基础频率', min: 200, max: 3000, step: 50, default: 400 },
    ],
    create: (v) => new Tone.AutoFilter({ frequency: v.frequency, depth: v.depth, baseFrequency: v.baseFrequency }).start(),
    update: (n, v) => {
      const node = n as Tone.AutoFilter
      node.frequency.value = v.frequency
      node.depth.value = v.depth
      node.baseFrequency = v.baseFrequency
    },
  },
  {
    id: 'phaser',
    name: '移相器',
    icon: '🌀',
    params: [
      { key: 'frequency', label: '频率', min: 0.1, max: 10, step: 0.1, default: 2 },
      { key: 'octaves', label: '八度', min: 0, max: 5, step: 1, default: 3 },
      { key: 'stages', label: '阶段数', min: 2, max: 12, step: 1, default: 6 },
    ],
    create: (v) => new Tone.Phaser({ frequency: v.frequency, octaves: v.octaves, stages: v.stages }).start(),
    update: (n, v) => {
      const node = n as Tone.Phaser
      node.frequency.value = v.frequency
      node.octaves = v.octaves
      node.stages = v.stages
    },
  },
  {
    id: 'tremolo',
    name: '震音',
    icon: '🌊',
    params: [
      { key: 'frequency', label: '频率', min: 0.1, max: 10, step: 0.1, default: 5 },
      { key: 'depth', label: '深度', min: 0, max: 1, step: 0.05, default: 0.5 },
    ],
    create: (v) => new Tone.Tremolo({ frequency: v.frequency, depth: v.depth }).start(),
    update: (n, v) => {
      const node = n as Tone.Tremolo
      node.frequency.value = v.frequency
      node.depth.value = v.depth
    },
  },
  {
    id: 'widen',
    name: '立体声加宽',
    icon: '🔊',
    params: [
      { key: 'width', label: '宽度', min: 0, max: 1, step: 0.05, default: 0.5 },
    ],
    create: (v) => new Tone.StereoWidener({ width: v.width }),
    update: (n, v) => {
      const node = n as Tone.StereoWidener
      node.width.value = v.width
    },
  },
  {
    id: 'eq',
    name: '三段均衡器',
    icon: '🎚️',
    params: [
      { key: 'low', label: '低频', min: -20, max: 20, step: 1, default: 0 },
      { key: 'mid', label: '中频', min: -20, max: 20, step: 1, default: 0 },
      { key: 'high', label: '高频', min: -20, max: 20, step: 1, default: 0 },
    ],
    create: (v) => new Tone.EQ3({ low: v.low, mid: v.mid, high: v.high }),
    update: (n, v) => {
      const node = n as Tone.EQ3
      node.low.value = v.low
      node.mid.value = v.mid
      node.high.value = v.high
    },
  },

]

export default effects
