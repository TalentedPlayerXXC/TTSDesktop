import { useRef, useState, useEffect } from 'react'
import WaveSurfer from 'wavesurfer.js'

interface AudioPlayerProps {
  src: string
  filename?: string
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function AudioPlayer({ src, filename }: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WaveSurfer | null>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showVolume, setShowVolume] = useState(false)

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
      autoplay: false,
    })

    ws.load(src)

    ws.on('ready', () => {
      setDuration(ws.getDuration())
    })

    ws.on('audioprocess', () => {
      setCurrent(ws.getCurrentTime())
    })

    ws.on('play', () => setPlaying(true))
    ws.on('pause', () => setPlaying(false))
    ws.on('finish', () => {
      setPlaying(false)
      setCurrent(ws.getDuration())
    })

    wsRef.current = ws

    return () => {
      ws.destroy()
      wsRef.current = null
    }
  }, [src])

  const togglePlay = () => {
    if (!wsRef.current) return
    wsRef.current.playPause()
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value)
    setVolume(v)
    if (wsRef.current) wsRef.current.setVolume(v)
  }

  return (
    <div className='hs-audio'>
      <button className='hs-audio-btn' onClick={togglePlay} title={playing ? '暂停' : '播放'}>
        {playing ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20"/></svg>
        )}
      </button>

      <div className='hs-audio-waveform' ref={containerRef} />

      <span className='hs-audio-time'>{formatTime(current)} / {formatTime(duration)}</span>

      <div className='hs-audio-actions'>
        <a className='hs-audio-btn' href={src} download={filename || 'audio.wav'} title='下载'>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </a>

        <div className='hs-audio-volume-wrap'>
          <button className='hs-audio-btn' title='音量'>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              {volume > 0 && <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>}
              {volume > 0.5 && <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>}
            </svg>
          </button>
          <div className={`hs-audio-volume-popup ${showVolume ? 'visible' : ''}`}>
            <input
              type='range'
              min='0' max='1' step='0.05'
              value={volume}
              onChange={handleVolumeChange}
              className='hs-audio-volume-slider'
              orient='vertical'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AudioPlayer
