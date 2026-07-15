import { useEffect, useState } from 'react'
import './ModelDownload.css'

interface ModelInfo {
  name: string
  downloaded: boolean
  size_gb: number
  files: string[]
}

interface DownloadStatus {
  status: 'pending' | 'downloading' | 'completed' | 'error'
  progress: number
  message: string
}

export default function ModelDownload({ onComplete }: { onComplete: () => void }) {
  const [models, setModels] = useState<Record<string, ModelInfo>>({})
  const [statuses, setStatuses] = useState<Record<string, DownloadStatus>>({})
  const [checking, setChecking] = useState(true)

  // 挂载时查缺
  useEffect(() => {
    ;(async () => {
      try {
        const api = (window as any).electronAPI
        const port = await api.getServerPort()
        const res = await fetch(`http://127.0.0.1:${port}/models-info`)
        const info = await res.json()
        setModels(info)
      } catch (e) {
        console.error('[download] check models failed:', e)
      }
      setChecking(false)
    })()
  }, [])

  // 下载缺失的模型
  const handleDownloadAll = async () => {
    const api = (window as any).electronAPI
    const missing = Object.entries(models).filter(([_, m]) => !m.downloaded)

    for (const [key] of missing) {
      setStatuses(prev => ({ ...prev, [key]: { status: 'pending', progress: 0, message: '准备中...' } }))

      const res = await api.startModelDownload(key)
      if (res.action === 'already_downloaded') {
        setStatuses(prev => ({ ...prev, [key]: { status: 'completed', progress: 100, message: '已存在' } }))
        continue
      }
      if (res.status === 'error') {
        setStatuses(prev => ({ ...prev, [key]: { status: 'error', progress: 0, message: res.error || '下载失败' } }))
        continue
      }

      // 轮询进度
      await new Promise<void>((resolve) => {
        const interval = setInterval(async () => {
          const s: DownloadStatus = await api.getDownloadStatus(key)
          setStatuses(prev => ({ ...prev, [key]: s }))

          if (s.status === 'completed' || s.status === 'error') {
            clearInterval(interval)
            resolve()
          }
        }, 500)
      })
    }

    onComplete()
  }

  const missingModels = Object.entries(models).filter(([_, m]) => !m.downloaded)
  const allDownloading = Object.keys(statuses).length > 0
  const allDone = missingModels.length === 0 || (
    allDownloading && missingModels.every(([k]) => statuses[k]?.status === 'completed')
  )

  if (checking) return null
  if (missingModels.length === 0) return null
  if (allDone) return null

  return (
    <div className='model-download-overlay'>
      <div className='model-download-card'>
        <div className='model-download-header'>
          <span className='model-download-icon'>📥</span>
          <h2>下载模型文件</h2>
        </div>

        <div className='model-download-disclaimer'>
          ⚠️ 模型将从国内魔搭（ModelScope）下载。由于魔搭的特殊性，
          <strong>不支持断点续传</strong>，下载失败请重试。
          模型合计约 2-4GB，具体大小视网络情况而定。
        </div>

        {missingModels.map(([key, model]) => {
          const s = statuses[key]
          return (
            <div key={key} className='model-download-item'>
              <div className='model-download-info'>
                <span className='model-download-name'>{model.name || key}</span>
                <span className='model-download-size'>{(model.size_gb || '?')} GB</span>
              </div>
              {s ? (
                <div className='model-download-progress'>
                  <div className='model-download-progress-bar'>
                    <div
                      className='model-download-progress-fill'
                      style={{ width: `${s.progress || 0}%` }}
                    />
                  </div>
                  <span className='model-download-progress-text'>
                    {s.status === 'downloading' ? `${s.progress}%` : s.status === 'completed' ? '完成' : s.message || s.status}
                  </span>
                </div>
              ) : (
                <span className='model-download-status' style={{ fontSize: 12, color: '#9ca3af' }}>待下载</span>
              )}
            </div>
          )
        })}

        {!allDownloading && (
          <button
            className='model-download-btn'
            style={{ width: '100%', marginTop: 12, padding: '8px 0' }}
            onClick={handleDownloadAll}
          >
            开始下载
          </button>
        )}

        {allDownloading && (
          <p className='model-download-hint'>下载过程中请勿关闭应用...</p>
        )}
      </div>
    </div>
  )
}
