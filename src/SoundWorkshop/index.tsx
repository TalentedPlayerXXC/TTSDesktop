import { useState, useRef, useEffect, useCallback } from 'react'
import { message, Button } from 'antd'
import {
  UploadOutlined,
  SoundOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import * as Tone from 'tone'
import SWPlayer, { type SWPlayerHandle } from './SWPlayer'
import effectsList, { type EffectDef, type EffectParam } from './effects'
import presets from './presets'
import { usePresets } from './usePresets'
import { createNativeEffect } from './nativeEffects'
import './styles.css'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ActiveEffect {
  def: EffectDef
  values: Record<string, number>
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ================================================================== */

function SoundWorkshop() {
  const [messageApi, contextHolder] = message.useMessage()

  /* ---- state ----------------------------------------------------- */
  const [file, setFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [outputVolume, setOutputVolume] = useState(0)
  const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([])
  const [activeTab, setActiveTab] = useState<'effects' | 'presets'>('effects')
  const [playing, setPlaying] = useState(false)
  const { activePreset, handlePresetClick, resetPreset } = usePresets(activeEffects, setActiveEffects)

  /* ---- refs ------------------------------------------------------ */
  const playerRef = useRef<Tone.Player | null>(null)
  const chainRef = useRef<Tone.ToneAudioNode[]>([])
  const swPlayerRef = useRef<SWPlayerHandle>(null)
  const playStartRef = useRef(0)

  /* ---- 销毁效果链（不动 player，只断开效果节点） ------------------ */
  const disposeChain = useCallback(() => {
    // 只断开效果节点，不动 player
    chainRef.current.forEach((n) => {
      try {
        n.disconnect()
      } catch { /* ok */ }
    })
    chainRef.current = []

    // 把 player 直接连到 destination（空链状态）
    if (playerRef.current) {
      playerRef.current.toDestination()
    }
  }, [])

  /* ---- 重建效果链（每次 activeEffects 变化时调用） ---------------- */
  const buildChain = useCallback(() => {
    if (!playerRef.current) return
    disposeChain()

    // 从 player 开始连接
    let node: Tone.ToneAudioNode = playerRef.current
    for (const ae of activeEffects) {
      const effect = ae.def.create(ae.values)
      node.connect(effect as any)
      chainRef.current.push(effect as any)
      node = effect as any
    }

    // 最后一个节点连到 destination
    node.toDestination()

    // 确保输出音量生效
    Tone.getDestination().volume.value = outputVolume
  }, [activeEffects, disposeChain, outputVolume])

  /* ---- 加载音频文件 ---------------------------------------------- */
  const handleFile = useCallback(
    async (f: File) => {
      const url = URL.createObjectURL(f)
      setAudioUrl(url)
      setFile(f)

      await Tone.start()

      disposeChain()

      /* 创建 Tone.Player */
      const player = new Tone.Player({
        url,
        autostart: false,
        onstop: () => setPlaying(false),
      })
      await player.loaded
      playerRef.current = player
      buildChain()
    },
    [buildChain, disposeChain],
  )

  /* ---- 效果参数更新 ---------------------------------------------- */
  const updateEffect = useCallback((index: number, key: string, value: number) => {
    setActiveEffects((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], values: { ...next[index].values, [key]: value } }
      return next
    })
  }, [])

  /* ---- 添加效果 -------------------------------------------------- */
  const addEffect = useCallback((def: EffectDef) => {
    const values: Record<string, number> = {}
    def.params.forEach((p) => {
      values[p.key] = p.default
    })
    setActiveEffects((prev) => [...prev, { def, values }])
  }, [])

  /* ---- Tab 切换（清空效果） -------------------------------------- */
  const switchTab = (tab: 'effects' | 'presets') => {
    setActiveTab(tab)
    setActiveEffects([])
    resetPreset()
  }

  /* ---- 移除效果 -------------------------------------------------- */
  const removeEffect = useCallback((index: number) => {
    setActiveEffects((prev) => prev.filter((_, i) => i !== index))
  }, [])

  /* ---- 播放/暂停 ------------------------------------------------ */
  const togglePlay = useCallback(() => {
    if (!playerRef.current) return
    if (playing) {
      playerRef.current.stop()
      setPlaying(false)
    } else {
      playStartRef.current = Tone.now()
      playerRef.current.start(0)
      setPlaying(true)
    }
  }, [playing])

  /* ---- 导出 WAV ------------------------------------------------- */
  function audioBufferToWav(audioBuffer: AudioBuffer, volumeDb = 0) {
    const numChannels = audioBuffer.numberOfChannels
    const sampleRate = audioBuffer.sampleRate
    const bitDepth = 16
    const volume = Math.pow(10, volumeDb / 20) // dB → 线性增益
    const bytesPerSample = bitDepth / 8
    const blockAlign = numChannels * bytesPerSample
    const dataLength = audioBuffer.length * blockAlign
    const bufferLength = 44 + dataLength
    const arrayBuffer = new ArrayBuffer(bufferLength)
    const view = new DataView(arrayBuffer)

    const writeStr = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
    }

    writeStr(0, 'RIFF')
    view.setUint32(4, bufferLength - 8, true)
    writeStr(8, 'WAVE')
    writeStr(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true) // PCM
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * blockAlign, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)
    writeStr(36, 'data')
    view.setUint32(40, dataLength, true)

    const channels: Float32Array[] = []
    for (let c = 0; c < numChannels; c++) channels.push(audioBuffer.getChannelData(c))

    let offset = 44
    let maxSample = 0
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let c = 0; c < numChannels; c++) {
        const s = Math.max(-1, Math.min(1, channels[c][i] * volume))
        if (Math.abs(s) > maxSample) maxSample = Math.abs(s)
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
        offset += 2
      }
    }

    console.log('[export] maxSample:', maxSample, 'silent?', maxSample < 0.001)
    return new Blob([arrayBuffer], { type: 'audio/wav' })
  }

  const handleExport = useCallback(async () => {
    if (!playerRef.current?.buffer || !file) {
      messageApi.warning('请先上传音频文件')
      return
    }
    messageApi.loading({ content: '正在渲染效果...', key: 'export', duration: 0 })

    try {
      const audioBuffer = playerRef.current.buffer.get() as AudioBuffer
      if (!audioBuffer) throw new Error('无法获取音频缓冲')

      const sampleRate = audioBuffer.sampleRate
      const numChannels = audioBuffer.numberOfChannels

      // --- 检查是否有 Pitch 效果（需要调整 playbackRate） ---
      const pitchEffect = activeEffects.find((ae) => ae.def.id === 'pitch')
      let playbackRate = 1
      if (pitchEffect) {
        // 半音 → 频率比：2^(semitones/12)
        playbackRate = Math.pow(2, (pitchEffect.values.pitch ?? 0) / 12)
      }

      // --- 调整时长（playbackRate ≠ 1 时长会变） ---
      const dur = audioBuffer.duration / playbackRate
      const totalSamples = Math.ceil(dur * sampleRate)

      // --- 创建 OfflineAudioContext ---
      const ctx = new OfflineAudioContext(numChannels, totalSamples, sampleRate)

      // --- 创建 BufferSource（原生） ---
      const source = ctx.createBufferSource()
      source.buffer = audioBuffer
      source.playbackRate.value = playbackRate

      // --- 使用原生 AudioNode 重建效果链 ---
      const allOscillators: OscillatorNode[] = []
      let currentNode: AudioNode = source

      for (const ae of activeEffects) {
        if (ae.def.id === 'pitch') continue // 已在 source 上处理
        const result = createNativeEffect(ctx, currentNode, ae.def.id, ae.values)
        currentNode = result.output
        if (result.oscillators) {
          allOscillators.push(...result.oscillators)
        }
      }

      // --- 最后一个节点连到 destination ---
      currentNode.connect(ctx.destination)

      // --- 启动所有振荡器（LFO 等） ---
      for (const osc of allOscillators) {
        osc.start(0)
      }

      // --- 启动音源并渲染 ---
      source.start(0)
      const renderedBuffer = await ctx.startRendering()

      console.log(
        '[export] native render OK —',
        'channels:', renderedBuffer.numberOfChannels,
        'length:', renderedBuffer.length,
        'duration:', renderedBuffer.duration,
      )

      // --- 输出音量（dB 增益） ---
      const wavBlob = audioBufferToWav(renderedBuffer, outputVolume)

      // --- 检查是否静音 ---
      let maxSample = 0
      for (let c = 0; c < renderedBuffer.numberOfChannels; c++) {
        const data = renderedBuffer.getChannelData(c)
        for (let i = 0; i < Math.min(data.length, 10000); i++) {
          if (Math.abs(data[i]) > maxSample) maxSample = Math.abs(data[i])
        }
      }
      console.log('[export] maxSample (first 10k):', maxSample, 'silent?', maxSample < 0.001)

      // --- 下载 ---
      const link = document.createElement('a')
      link.href = URL.createObjectURL(wavBlob)
      link.download = (file.name.replace(/\.[^.]+$/, '') || 'processed') + '_processed.wav'
      link.click()
      messageApi.success({ content: '导出完成', key: 'export' })
    } catch (e) {
      console.error('[export] render error:', e)
      messageApi.error({ content: '渲染导出失败: ' + (e instanceof Error ? e.message : '未知错误'), key: 'export' })
    }
  }, [playerRef, activeEffects, file, messageApi, outputVolume])

  /* ---- 效果链变化时重建 ------------------------------------------ */
  useEffect(() => {
    buildChain()
  }, [activeEffects, buildChain])

  /* ---- 波形同步 Tone.js 播放进度 --------------------------------- */
  useEffect(() => {
    if (!playing || !swPlayerRef.current) return
    const interval = setInterval(() => {
      const elapsed = Tone.now() - playStartRef.current
      const dur = playerRef.current?.buffer?.duration || 1
      const progress = Math.min(elapsed / dur, 1)
      swPlayerRef.current?.seekTo(progress)
    }, 50)
    return () => clearInterval(interval)
  }, [playing])

  /* ---- 卸载清理 -------------------------------------------------- */
  useEffect(() => {
    return () => {
      disposeChain()
    }
  }, [disposeChain])

  /* ---- 上传：拖拽 ------------------------------------------------ */
  const AUDIO_MAGIC: Record<string, Uint8Array> = {
    'RIFF': new Uint8Array([0x52, 0x49, 0x46, 0x46]), // WAV
    'ID3':  new Uint8Array([0x49, 0x44, 0x33]),       // MP3 (ID3v2)
    'fLaC': new Uint8Array([0x66, 0x4C, 0x61, 0x43]), // FLAC
    'OggS': new Uint8Array([0x4F, 0x67, 0x67, 0x53]), // OGG
  }

  async function checkAudioSignature(file: File): Promise<boolean> {
    try {
      const buf = await file.slice(0, 8).arrayBuffer()
      const head = new Uint8Array(buf)
      // 检查魔数
      for (const [, magic] of Object.entries(AUDIO_MAGIC)) {
        if (magic.every((b, i) => head[i] === b)) return true
      }
      // M4A/MP4: bytes 4-7 = ftyp
      if (head[4] === 0x66 && head[5] === 0x74 && head[6] === 0x79 && head[7] === 0x70) return true
      // MP3 (无 ID3v2 头): 第一个字节是 0xFF (MPEG 同步)
      if (head[0] === 0xFF) return true
      return false
    } catch { return false }
  }

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      const f = e.dataTransfer.files[0]
      const validExt = f?.name?.match(/\.(wav|mp3|flac|ogg|m4a)$/i)
      const validSig = f ? await checkAudioSignature(f) : false
      if (f && (validExt || validSig)) {
        handleFile(f)
      } else {
        messageApi.warning('请上传音频文件')
      }
    },
    [handleFile, messageApi],
  )

  /* ---- 上传：点击选择 -------------------------------------------- */
  const handleSelectFile = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'audio/*'
    input.onchange = (e: any) => {
      const f = e.target.files?.[0]
      if (f) handleFile(f)
    }
    input.click()
  }, [handleFile])

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */

  return (
    <div className="sw">
      {contextHolder}

      <div className="sw-body">
        {/* ===== 左面板：上传 + 波形 ===== */}
        <div className="sw-left">
          <div className="sw-left-header">
            <h2>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ marginRight: 6, verticalAlign: 'middle' }}>
                <rect x="2" y="8" width="3" height="12" rx="1" fill="#7c3aed">
                  <animate attributeName="height" values="12;18;12" dur="0.6s" repeatCount="indefinite" />
                  <animate attributeName="y" values="8;2;8" dur="0.6s" repeatCount="indefinite" />
                </rect>
                <rect x="7" y="5" width="3" height="18" rx="1" fill="#7c3aed" opacity="0.85">
                  <animate attributeName="height" values="18;10;18" dur="0.7s" repeatCount="indefinite" />
                  <animate attributeName="y" values="5;11;5" dur="0.7s" repeatCount="indefinite" />
                </rect>
                <rect x="12" y="3" width="3" height="22" rx="1" fill="#7c3aed" opacity="0.7">
                  <animate attributeName="height" values="22;14;22" dur="0.5s" repeatCount="indefinite" />
                  <animate attributeName="y" values="3;7;3" dur="0.5s" repeatCount="indefinite" />
                </rect>
                <rect x="17" y="6" width="3" height="16" rx="1" fill="#7c3aed" opacity="0.85">
                  <animate attributeName="height" values="16;8;16" dur="0.8s" repeatCount="indefinite" />
                  <animate attributeName="y" values="6;10;6" dur="0.8s" repeatCount="indefinite" />
                </rect>
                <rect x="22" y="9" width="3" height="10" rx="1" fill="#7c3aed" opacity="0.6">
                  <animate attributeName="height" values="10;16;10" dur="0.55s" repeatCount="indefinite" />
                  <animate attributeName="y" values="9;5;9" dur="0.55s" repeatCount="indefinite" />
                </rect>
              </svg>
              声音工坊
            </h2>
            <p>上传音频，添加实时效果，导出处理后的声音</p>
          </div>

          {!file ? (
            <div
              className="sw-upload-zone"
              onClick={handleSelectFile}
              onDragOver={(e) => {
                e.preventDefault()
                e.currentTarget.classList.add('dragover')
              }}
              onDragLeave={(e) => e.currentTarget.classList.remove('dragover')}
              onDrop={handleDrop}
            >
              <div className="sw-upload-icon">
                <UploadOutlined />
              </div>
              <div className="sw-upload-text">点击或拖拽上传</div>
              <div className="sw-upload-hint">WAV / MP3 / FLAC / OGG</div>
            </div>
          ) : (
            <>
              <SWPlayer ref={swPlayerRef}
                src={audioUrl}
                filename={file?.name}
                onClear={() => { setPlaying(false); setFile(null); setAudioUrl('') }}
                onTogglePlay={togglePlay}
                playing={playing}
              />

              <Button type='primary' icon={<DownloadOutlined />} onClick={handleExport} block style={{ marginTop: 8 }}>
                导出 WAV
              </Button>

              <div className='sw-output-volume'>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>输出音量</span>
                <div className='sw-output-volume-slider'>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>-20dB</span>
                  <input
                    type='range'
                    min={-20} max={20} step={1}
                    value={outputVolume}
                    onChange={e => {
                      const v = parseFloat(e.target.value)
                      setOutputVolume(v)
                      Tone.getDestination().volume.value = v
                    }}
                  />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+20dB</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ===== 右面板：效果链 + 操作 ===== */}
        <div className="sw-right">
          <h3 className="sw-section-title">
            <SoundOutlined /> 效果链
            {activeEffects.length > 0 && (
              <span className="sw-section-sub">({activeEffects.length})</span>
            )}
          </h3>

          {/* Tabs */}
          <div className='sw-tabs'>
            <button className={`sw-tab ${activeTab === 'effects' ? 'active' : ''}`} onClick={() => switchTab('effects')}>
              🎛️ 效果
            </button>
            <button className={`sw-tab ${activeTab === 'presets' ? 'active' : ''}`} onClick={() => switchTab('presets')}>
              🎯 预设
            </button>
          </div>

          <div className="sw-tab-content">
            {/* 可用效果列表（网格） */}
            {activeTab === 'effects' ? (
              <div className='sw-effects-grid'>
                {effectsList.map(e => {
                  const isAdded = activeEffects.some(a => a.def.id === e.id)
                  return (
                    <div
                      key={e.id}
                      className={`sw-effect-grid-item${isAdded ? ' added' : ''}`}
                      onClick={() => {
                        if (isAdded) {
                          setActiveEffects(prev => prev.filter(a => a.def.id !== e.id))
                        } else {
                          addEffect(e)
                        }
                      }}
                    >
                      <span className='sw-effect-grid-icon'>{e.icon}</span>
                      <span>{e.name}</span>
                      {!isAdded && <span className='sw-effect-grid-add'>＋</span>}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className='sw-preset-grid'>
                {presets.map(p => (
                  <div key={p.id} className={`sw-preset-item${activePreset === p.id ? ' active' : ''}`} onClick={() => handlePresetClick(p)}>
                    <span className='sw-preset-icon'>{p.icon}</span>
                    <span>{p.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 已激活效果链（始终显示） */}
            {activeEffects.length === 0 ? (
              <div className="sw-effects-empty">
                <div className="sw-effects-empty-icon">
                  <SoundOutlined />
                </div>
                <div>还没有添加效果</div>
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.6 }}>
                  在上方列表中点击 ＋添加
                </div>
              </div>
            ) : (
              <div className="sw-effects-list">
                {activeEffects.map((ae, i) => (
                  <div key={`${ae.def.id}-${i}`} className="sw-effect-card">
                    <div className="sw-effect-head">
                      <span className="sw-effect-name">
                        {ae.def.icon} {ae.def.name}
                      </span>
                      <button className="sw-effect-remove" onClick={() => removeEffect(i)}>
                        ×
                      </button>
                    </div>
                    <div className="sw-effect-params">
                      {ae.def.params.map((p: EffectParam) => (
                        <div key={p.key} className="sw-effect-param">
                          <span>{p.label}</span>
                          <input
                            type="range"
                            min={p.min}
                            max={p.max}
                            step={p.step}
                            value={ae.values[p.key]}
                            onChange={(e) =>
                              updateEffect(i, p.key, parseFloat(e.target.value))
                            }
                          />
                          <span className="sw-effect-param-value">
                            {ae.values[p.key].toFixed(p.step < 0.1 ? 2 : 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>


        </div>
      </div>
    </div>
  )
}

export default SoundWorkshop
