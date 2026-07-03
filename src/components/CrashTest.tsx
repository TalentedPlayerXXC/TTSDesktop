import { useState } from 'react'
import { Button, message } from 'antd'
import { ExperimentOutlined, WarningOutlined } from '@ant-design/icons'
import CyberpunkLoading from './CyberpunkLoading'

function CrashTest() {
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [loadingModel, setLoadingModel] = useState('')

  const testLoading = () => {
    setLoading(true)
    setLoadingMsg('正在加载测试模型...')
    setLoadingModel('TEST-X')
    setTimeout(() => {
      setLoading(false)
      message.success('加载动画测试完成')
    }, 3000)
  }

  const testCrash = () => {
    throw new Error('[TEST] 这是一个模拟的页面渲染崩溃，用于测试 ErrorBoundary 是否能正常兜底')
  }

  return (
    <div style={{ padding: '48px 32px' }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: '#1a1a2e', marginBottom: 8 }}>
        <ExperimentOutlined style={{ marginRight: 8 }} />
        测试面板
      </h2>
      <p style={{ fontSize: 13, color: '#999', marginBottom: 32 }}>
        用于验证 ErrorBoundary 错误兜底和 CyberpunkLoading 加载动画
      </p>

      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <Button
          type='primary'
          size='large'
          icon={<ExperimentOutlined />}
          onClick={testLoading}
        >
          测试加载动画 (3s)
        </Button>
        <Button
          danger
          size='large'
          icon={<WarningOutlined />}
          onClick={testCrash}
        >
          触发白屏崩溃
        </Button>
      </div>

      <CyberpunkLoading
        visible={loading}
        message={loadingMsg}
        modelName={loadingModel}
      />
    </div>
  )
}

export default CrashTest
