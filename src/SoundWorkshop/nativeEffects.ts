/**
 * nativeEffects.ts
 *
 * 原生 Web Audio API 效果链 — 用于 OfflineAudioContext 免静音导出。
 * 每种效果映射到纯原生 AudioNode 子图（不依赖 Tone.js），
 * 确保在离线渲染中 connect 不出错，导出不静音。
 *
 * 对于 PitchShift 这种原生没有等效节点的高级效果，使用近似方案。
 * 目标：能 WORK，不要求 100% 完美，但必须保证加了效果后导出不是静音。
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface NativeEffectResult {
  /** 该效果子图的输出 AudioNode（下一个效果连到此节点） */
  output: AudioNode
  /** 需要手动 start/stop 的振荡器（如有） */
  oscillators?: OscillatorNode[]
}

/* ------------------------------------------------------------------ */
/*  Effect factories                                                   */
/* ------------------------------------------------------------------ */

/**
 * 根据效果 id 创建原生 AudioNode 子图，返回输出节点和需要启动的振荡器。
 *
 * @param ctx    - OfflineAudioContext
 * @param input  - 上游节点（前一效果输出或 BufferSource）
 * @param values - 效果参数
 */
export function createNativeEffect(
  ctx: OfflineAudioContext,
  input: AudioNode,
  effectId: string,
  values: Record<string, number>,
): NativeEffectResult {
  switch (effectId) {
    case 'volume':
      return createVolume(ctx, input, values)
    case 'echo':
      return createEcho(ctx, input, values)
    case 'vibrato':
      return createVibrato(ctx, input, values)
    case 'pitch':
      return createPitch(ctx, input, values)
    case 'distortion':
      return createDistortion(ctx, input, values)
    case 'reverb':
      return createReverb(ctx, input, values)
    case 'chorus':
      return createChorus(ctx, input, values)
    case 'pong':
      return createPong(ctx, input, values)
    case 'autofilter':
      return createAutoFilter(ctx, input, values)
    case 'phaser':
      return createPhaser(ctx, input, values)
    case 'tremolo':
      return createTremolo(ctx, input, values)
    case 'widen':
      return createWiden(ctx, input, values)
    case 'eq':
      return createEQ(ctx, input, values)
    default: {
      // 未知效果：直通
      const g = ctx.createGain()
      input.connect(g)
      return { output: g }
    }
  }
}

/* ================================================================== */
/*  1. Volume — GainNode                                              */
/* ================================================================== */
function createVolume(
  ctx: OfflineAudioContext,
  input: AudioNode,
  v: Record<string, number>,
): NativeEffectResult {
  const gain = ctx.createGain()
  gain.gain.value = Math.pow(10, (v.volume ?? 0) / 20) // dB → 线性
  input.connect(gain)
  return { output: gain }
}

/* ================================================================== */
/*  2. Echo (FeedbackDelay) — DelayNode + feedback GainNode           */
/* ================================================================== */
function createEcho(
  ctx: OfflineAudioContext,
  input: AudioNode,
  v: Record<string, number>,
): NativeEffectResult {
  const dryGain = ctx.createGain()
  const delay = ctx.createDelay(5.0)
  const wetGain = ctx.createGain()
  const feedback = ctx.createGain()
  const output = ctx.createGain()

  dryGain.gain.value = 0.45
  wetGain.gain.value = 0.55
  delay.delayTime.value = v.delayTime ?? 0.3
  feedback.gain.value = v.feedback ?? 0.5

  // 干路：input → dryGain → output
  input.connect(dryGain)
  dryGain.connect(output)

  // 湿路：input → delay → wetGain → output
  input.connect(delay)
  delay.connect(wetGain)
  wetGain.connect(output)

  // 反馈：delay → feedback → delay
  delay.connect(feedback)
  feedback.connect(delay)

  return { output }
}

/* ================================================================== */
/*  3. Vibrato — DelayNode + LFO 调制 delayTime                       */
/* ================================================================== */
function createVibrato(
  ctx: OfflineAudioContext,
  input: AudioNode,
  v: Record<string, number>,
): NativeEffectResult {
  const delay = ctx.createDelay(0.02) // 最大 20ms
  delay.delayTime.value = 0.005 // 基线 5ms

  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()

  lfo.type = 'sine'
  lfo.frequency.value = v.frequency ?? 5
  lfoGain.gain.value = (v.depth ?? 0.5) * 0.004 // ±4ms 调制

  lfo.connect(lfoGain)
  lfoGain.connect(delay.delayTime)

  input.connect(delay)

  return { output: delay, oscillators: [lfo] }
}

/* ================================================================== */
/*  4. Pitch — playbackRate 近似                                       */
/*     原生 Web Audio 没有 PitchShift 节点，用 source.playbackRate 近似 */
/*     注意：这会同时改变播放速度，导出时长会变化。                    */
/* ================================================================== */
function createPitch(
  ctx: OfflineAudioContext,
  input: AudioNode,
  v: Record<string, number>,
): NativeEffectResult {
  // Pitch 无法在效果链中间处理；必须预先调整 source 的 playbackRate。
  // 此处返回直通，在 handleExport 中单独处理 pitch 参数。
  const g = ctx.createGain()
  input.connect(g)
  return { output: g }
}

/* ================================================================== */
/*  5. Distortion — WaveShaperNode                                     */
/* ================================================================== */
function createDistortion(
  ctx: OfflineAudioContext,
  input: AudioNode,
  v: Record<string, number>,
): NativeEffectResult {
  const d = v.distortion ?? 0.4
  const ws = ctx.createWaveShaper()
  ws.curve = makeDistortionCurve(d * 400) // d ∈ [0,1] → 0~400
  ws.oversample = '4x'
  input.connect(ws)
  return { output: ws }
}

function makeDistortionCurve(amount: number): Float32Array {
  const samples = 44100
  const curve = new Float32Array(samples) as Float32Array
  const deg = Math.PI / 180
  for (let i = 0; i < samples; i++) {
    const x = (i / samples) * 2 - 1
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x))
  }
  return curve
}

/* ================================================================== */
/*  6. Reverb — ConvolverNode 用生成的噪声脉冲响应                     */
/* ================================================================== */
function createReverb(
  ctx: OfflineAudioContext,
  input: AudioNode,
  v: Record<string, number>,
): NativeEffectResult {
  const decay = v.decay ?? 5
  const dryGain = ctx.createGain()
  const wetGain = ctx.createGain()
  const output = ctx.createGain()
  const convolver = ctx.createConvolver()

  dryGain.gain.value = 0.5
  wetGain.gain.value = 0.5

  // 生成衰减噪声脉冲响应
  const irLen = Math.min(Math.ceil(decay * ctx.sampleRate), ctx.sampleRate * 10)
  const irBuffer = ctx.createBuffer(2, irLen, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = irBuffer.getChannelData(ch)
    for (let i = 0; i < irLen; i++) {
      const t = i / irLen
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * decay * 2)
    }
  }
  convolver.buffer = irBuffer

  // 干路：input → dryGain → output
  input.connect(dryGain)
  dryGain.connect(output)

  // 湿路：input → convolver → wetGain → output
  input.connect(convolver)
  convolver.connect(wetGain)
  wetGain.connect(output)

  return { output }
}

/* ================================================================== */
/*  7. Chorus — DelayNode + LFO + 干湿混合                            */
/* ================================================================== */
function createChorus(
  ctx: OfflineAudioContext,
  input: AudioNode,
  v: Record<string, number>,
): NativeEffectResult {
  const delay = ctx.createDelay(0.05)
  delay.delayTime.value = 0.015

  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.type = 'sine'
  lfo.frequency.value = v.frequency ?? 1.5
  lfoGain.gain.value = (v.depth ?? 0.5) * 0.005

  lfo.connect(lfoGain)
  lfoGain.connect(delay.delayTime)

  const dryGain = ctx.createGain()
  const wetGain = ctx.createGain()
  const output = ctx.createGain()

  dryGain.gain.value = 0.6
  wetGain.gain.value = 0.4

  input.connect(dryGain)
  dryGain.connect(output)

  input.connect(delay)
  delay.connect(wetGain)
  wetGain.connect(output)

  return { output, oscillators: [lfo] }
}

/* ================================================================== */
/*  8. PingPongDelay — 左右声道交叉反馈延迟                           */
/* ================================================================== */
function createPong(
  ctx: OfflineAudioContext,
  input: AudioNode,
  v: Record<string, number>,
): NativeEffectResult {
  const output = ctx.createGain()

  const splitter = ctx.createChannelSplitter(2)
  const leftDelay = ctx.createDelay(5.0)
  const rightDelay = ctx.createDelay(5.0)
  const leftFeedback = ctx.createGain()
  const rightFeedback = ctx.createGain()
  const merger = ctx.createChannelMerger(2)

  const delayTime = v.delayTime ?? 0.3
  const fb = v.feedback ?? 0.5

  leftDelay.delayTime.value = delayTime
  rightDelay.delayTime.value = delayTime
  leftFeedback.gain.value = fb
  rightFeedback.gain.value = fb

  // 输入 → splitter
  input.connect(splitter)

  // L → leftDelay
  splitter.connect(leftDelay, 0, 0)
  // R → rightDelay
  splitter.connect(rightDelay, 1, 0)

  // 交叉反馈：leftDelay → rightFeedback → rightDelay
  leftDelay.connect(rightFeedback)
  rightFeedback.connect(rightDelay, 0, 0)
  // 交叉反馈：rightDelay → leftFeedback → leftDelay
  rightDelay.connect(leftFeedback)
  leftFeedback.connect(leftDelay, 0, 0)

  // 左右延迟输出 → merger
  leftDelay.connect(merger, 0, 0)
  rightDelay.connect(merger, 0, 1)

  // 干信号也送到 merger
  // 用 wetGain 控制湿声
  const wetGain = ctx.createGain()
  wetGain.gain.value = 0.5
  merger.connect(wetGain)
  wetGain.connect(output)

  // 干信号：input → dryGain → output
  const dryGain = ctx.createGain()
  dryGain.gain.value = 0.5
  input.connect(dryGain)
  dryGain.connect(output)

  return { output }
}

/* ================================================================== */
/*  9. AutoFilter — BiquadFilterNode + LFO                            */
/* ================================================================== */
function createAutoFilter(
  ctx: OfflineAudioContext,
  input: AudioNode,
  v: Record<string, number>,
): NativeEffectResult {
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.Q.value = 2

  const baseFreq = v.baseFrequency ?? 400
  const modOctaves = 3.5
  const minFreq = Math.max(baseFreq, 20)
  const maxFreq = Math.min(baseFreq * Math.pow(2, modOctaves * (v.depth ?? 0.5)), ctx.sampleRate / 2)
  const centerFreq = (minFreq + maxFreq) / 2
  const halfRange = (maxFreq - minFreq) / 2

  filter.frequency.value = centerFreq

  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.type = 'sine'
  lfo.frequency.value = v.frequency ?? 2
  lfoGain.gain.value = halfRange

  lfo.connect(lfoGain)
  lfoGain.connect(filter.frequency)

  input.connect(filter)

  return { output: filter, oscillators: [lfo] }
}

/* ================================================================== */
/*  10. Phaser — 串联全通滤波器 + LFO                                  */
/* ================================================================== */
function createPhaser(
  ctx: OfflineAudioContext,
  input: AudioNode,
  v: Record<string, number>,
): NativeEffectResult {
  const stages = v.stages ?? 6
  const baseFreq = 350
  const octaves = v.octaves ?? 3
  const modRange = baseFreq * Math.pow(2, octaves)

  // 所有全通滤波器共用一个 LFO
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.type = 'sine'
  lfo.frequency.value = v.frequency ?? 2
  lfoGain.gain.value = modRange

  // 串联 all-pass
  let lastNode: AudioNode = input
  for (let i = 0; i < stages; i++) {
    const ap = ctx.createBiquadFilter()
    ap.type = 'allpass'
    ap.frequency.value = baseFreq * Math.pow(2, (i / stages) * 2.5)
    ap.Q.value = 1

    lastNode.connect(ap)
    lastNode = ap

    // 共享 LFO 调制
    lfoGain.connect(ap.frequency)
  }

  const output = ctx.createGain()
  lastNode.connect(output)

  return { output, oscillators: [lfo] }
}

/* ================================================================== */
/*  11. Tremolo — GainNode + LFO                                      */
/* ================================================================== */
function createTremolo(
  ctx: OfflineAudioContext,
  input: AudioNode,
  v: Record<string, number>,
): NativeEffectResult {
  const gain = ctx.createGain()
  const depth = v.depth ?? 0.5
  gain.gain.value = 1 - depth / 2

  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.type = 'sine'
  lfo.frequency.value = v.frequency ?? 5
  lfoGain.gain.value = depth / 2

  lfo.connect(lfoGain)
  lfoGain.connect(gain.gain)

  input.connect(gain)

  return { output: gain, oscillators: [lfo] }
}

/* ================================================================== */
/*  12. Stereo Widener — Mid/Side 矩阵                                */
/* ================================================================== */
function createWiden(
  ctx: OfflineAudioContext,
  input: AudioNode,
  v: Record<string, number>,
): NativeEffectResult {
  const w = v.width ?? 0.5

  // 如果输入是单声道，直通
  if (input.channelCount < 2) {
    const g = ctx.createGain()
    input.connect(g)
    return { output: g }
  }

  const splitter = ctx.createChannelSplitter(2)
  const outputMerger = ctx.createChannelMerger(2)

  // M/S 矩阵
  // L_out = L * (1)   + R * (-w)  = L - w * R
  // R_out = R * (1)   + L * (-w)  = R - w * L
  // 实际上为了让中心信号不受影响：
  // Side-only boost: S' = S * (1 + w), M' = M
  // L' = M + S' = (L + R)/2 + (L - R)/2 * (1 + w) = L * (1+w) - R * w
  // 简化实现：用更简单的左右交叉馈送
  const gLL = ctx.createGain() // L → L
  const gLR = ctx.createGain() // L → R (invert)
  const gRL = ctx.createGain() // R → L (invert)
  const gRR = ctx.createGain() // R → R

  gLL.gain.value = 1 + w * 0.3
  gLR.gain.value = -w * 0.3
  gRL.gain.value = -w * 0.3
  gRR.gain.value = 1 + w * 0.3

  input.connect(splitter)

  splitter.connect(gLL, 0, 0)
  gLL.connect(outputMerger, 0, 0)
  splitter.connect(gRL, 1, 0)
  gRL.connect(outputMerger, 0, 0)

  splitter.connect(gRR, 1, 0)
  gRR.connect(outputMerger, 0, 1)
  splitter.connect(gLR, 0, 0)
  gLR.connect(outputMerger, 0, 1)

  return { output: outputMerger }
}

/* ================================================================== */
/*  13. Three-band EQ — Lowshelf / Peaking / Highshelf                */
/* ================================================================== */
function createEQ(
  ctx: OfflineAudioContext,
  input: AudioNode,
  v: Record<string, number>,
): NativeEffectResult {
  const low = ctx.createBiquadFilter()
  low.type = 'lowshelf'
  low.frequency.value = 300
  low.gain.value = v.low ?? 0

  const mid = ctx.createBiquadFilter()
  mid.type = 'peaking'
  mid.frequency.value = 1000
  mid.Q.value = 1
  mid.gain.value = v.mid ?? 0

  const high = ctx.createBiquadFilter()
  high.type = 'highshelf'
  high.frequency.value = 4000
  high.gain.value = v.high ?? 0

  // 串联：input → low → mid → high
  input.connect(low)
  low.connect(mid)
  mid.connect(high)

  return { output: high }
}
