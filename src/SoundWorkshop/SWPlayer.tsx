import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import WaveSurfer from 'wavesurfer.js'

export interface SWPlayerHandle {
  seekTo: (progress: number) => void
}

interface SWPlayerProps {
  src: string
  filename?: string
  onClear?: () => void
  onTogglePlay?: () => void
  playing?: boolean
  onDownload?: () => void
}

const SWPlayer = forwardRef<SWPlayerHandle, SWPlayerProps>(({ src, filename, onClear, onTogglePlay, playing, onDownload }, ref) => {
  const wsRef = useRef<WaveSurfer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  /* 静音的 WaveSurfer —— 仅做波形显示，声音由 Tone.js 输出 */
  useEffect(() => {
    if (!containerRef.current) return
    if (wsRef.current) {
      wsRef.current.destroy()
      wsRef.current = null
    }

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#c4b5fd',
      progressColor: '#7c3aed',
      cursorColor: '#7c3aed',
      cursorWidth: 1,
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      height: 40,
      backend: 'WebAudio',
      normalize: true,
    })
    ws.load(src)
    ws.setVolume(0) // 静音，声音由 Tone.js 输出
    wsRef.current = ws

    return () => {
      ws.destroy()
      wsRef.current = null
    }
  }, [src])

  /* 暴露 seekTo 给父组件，用于同步 Tone.js 播放进度 */
  useImperativeHandle(ref, () => ({
    seekTo: (progress: number) => {
      wsRef.current?.seekTo(progress)
    },
  }))

  return (
    <div className='sw-player'>
      {onTogglePlay && (
        <button className='sw-player-play' onClick={onTogglePlay}>
          {playing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20"/></svg>
          )}
        </button>
      )}
      <div ref={containerRef} className='sw-player-waveform' />
      {onDownload && (
        <button className='sw-player-download' onClick={onDownload} title='下载'>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
      )}
      {onClear && (
        <button className='sw-player-clear' onClick={onClear} title='取消选中'>×</button>
      )}
    </div>
  )
})

export default SWPlayer
