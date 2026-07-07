import { useEffect, useState } from 'react'
import { Card, Select, Button, message, Modal } from 'antd'
import {
  SkinOutlined,
  DeleteOutlined,
  ClearOutlined,
  ClockCircleOutlined,
  CompressOutlined,
} from '@ant-design/icons'
import IconSettings from '../components/IconSettings'
import { useSettings } from '../services/SettingsContext'
import { getCacheStatus, cleanupCache } from '../services/index'
import type { CacheStatusResponse } from '../services/types'
import './index.css'

const SettingsCompontent = () => {
  const { settings, updateSettings, resetSettings } = useSettings()
  const [messageApi, contextHolder] = message.useMessage()

  const [cache, setCache] = useState<CacheStatusResponse | null>(null)
  const [cacheLoading, setCacheLoading] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean
    mode: 'all' | 'older_than' | 'by_size'
    title: string
    desc: string
  }>({ open: false, mode: 'all', title: '', desc: '' })

  const loadCache = async () => {
    setCacheLoading(true)
    try {
      const res = await getCacheStatus()
      if (res.status === 200 && res.data) {
        setCache(res.data)
      }
    } catch {
      // 服务未启动等静默处理
    }
    setCacheLoading(false)
  }

  useEffect(() => {
    loadCache()
  }, [])

  const handleCleanup = async (mode: 'all' | 'older_than' | 'by_size') => {
    setCleaning(true)
    try {
      const params: any = { mode }
      if (mode === 'older_than') params.expire_hours = 24
      if (mode === 'by_size') params.max_size_mb = 500
      const res = await cleanupCache(params)
      if (res.status === 200 && res.data?.success) {
        const d = res.data
        messageApi.success(`清理完成！删除了 ${d.deleted_count} 个文件，释放 ${d.freed_mb.toFixed(1)} MB`)
        loadCache()
      } else {
        messageApi.error('清理失败，请稍后重试')
      }
    } catch {
      messageApi.error('请求失败，请检查服务是否启动')
    }
    setCleaning(false)
    setConfirmModal(prev => ({ ...prev, open: false }))
  }

  const showConfirm = (mode: 'all' | 'older_than' | 'by_size') => {
    const configs = {
      all: { title: '一键清空', desc: '将删除所有已生成的音频文件，此操作不可撤销。' },
      older_than: { title: '清理 24 小时前的文件', desc: '仅保留最近 24 小时内生成的音频，24 小时前的将被删除。' },
      by_size: { title: '限制缓存 500MB', desc: '自动删除最早的音频文件，直到缓存总大小低于 500MB。' },
    }
    const cfg = configs[mode]
    setConfirmModal({ open: true, mode, title: cfg.title, desc: cfg.desc })
  }

  const formatSize = (mb: number) => {
    if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`
    return `${mb.toFixed(1)} MB`
  }

  return (
    <div className='settings-page'>
      {contextHolder}
      <div className='settings-header'>
        <h2 className='settings-title'>
          <IconSettings /> 偏好设置
        </h2>
        <p className='settings-subtitle'>自定义你的配音体验</p>
      </div>

      <div className='settings-content'>
        <Card className='settings-card' title={<><SkinOutlined /> 外观设置</>}>
          <div className='setting-item'>
            <div className='setting-label'>
              <span>主题模式</span>
              <p className='setting-desc'>选择界面的显示主题</p>
            </div>
            <Select
              value={settings.theme}
              onChange={val => updateSettings({ theme: val })}
              style={{ width: 120 }}
              options={[
                { label: '浅色', value: 'light' },
                { label: '深色', value: 'dark' },
                { label: '跟随系统', value: 'system' },
              ]}
            />
          </div>
        </Card>

        <Card className='settings-card' title={<><DeleteOutlined /> 缓存管理</>}>
          {cache ? (
            <div className='cache-status'>
              <div className='cache-stats'>
                <div className='cache-stat-item'>
                  <span className='cache-stat-value'>{cache.total_files}</span>
                  <span className='cache-stat-label'>文件数</span>
                </div>
                <div className='cache-stat-divider' />
                <div className='cache-stat-item'>
                  <span className='cache-stat-value'>{formatSize(cache.total_mb)}</span>
                  <span className='cache-stat-label'>总大小</span>
                </div>
                <div className='cache-stat-divider' />
                <div className='cache-stat-item'>
                  <span className='cache-stat-value'>{cache.oldest_age_hours.toFixed(1)}h</span>
                  <span className='cache-stat-label'>最早文件</span>
                </div>
              </div>
              <div className='cache-actions'>
                <Button
                  icon={<ClearOutlined />}
                  onClick={() => showConfirm('all')}
                  loading={cleaning}
                  danger
                >
                  一键清空
                </Button>
                <Button
                  icon={<ClockCircleOutlined />}
                  onClick={() => showConfirm('older_than')}
                  loading={cleaning}
                >
                  清理 24h 前
                </Button>
                <Button
                  icon={<CompressOutlined />}
                  onClick={() => showConfirm('by_size')}
                  loading={cleaning}
                >
                  限制 500MB
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ color: cacheLoading ? '#888' : '#bbb', padding: '8px 0' }}>
              {cacheLoading ? '正在加载缓存状态...' : '无法获取缓存信息（服务未启动？）'}
            </div>
          )}
        </Card>

        <div className='settings-actions'>
          <button className='btn-reset' onClick={resetSettings}>
            恢复默认
          </button>
        </div>
      </div>

      <Modal
        title={confirmModal.title}
        open={confirmModal.open}
        onOk={() => handleCleanup(confirmModal.mode)}
        onCancel={() => setConfirmModal(prev => ({ ...prev, open: false }))}
        okText='确认清理'
        cancelText='取消'
        okButtonProps={{ danger: confirmModal.mode === 'all' }}
      >
        <p style={{ margin: 0 }}>{confirmModal.desc}</p>
      </Modal>
    </div>
  )
}

export default SettingsCompontent
