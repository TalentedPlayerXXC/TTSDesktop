import { useState } from 'react'

export default function DisclaimerModal({ onAgree }: { onAgree: () => void }) {
  const [loading, setLoading] = useState(false)

  const handleDisagree = () => {
    setLoading(true)
    ;window.electronAPI?.quitApp?.()
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999,
    }}>
      <div style={{
        background: '#1a1a2e',
        border: '1px solid #7c3aed',
        borderRadius: 12,
        padding: 36,
        width: 460,
        color: '#e0e0e0',
      }}>
        <div style={{ fontSize: 28, textAlign: 'center', marginBottom: 8 }}>⚠️</div>
        <h2 style={{ textAlign: 'center', margin: '0 0 20px', color: '#c4b5fd', fontSize: 18 }}>
          免责声明
        </h2>

        <p style={{ fontSize: 13, lineHeight: 1.7, color: '#d1d5db', marginBottom: 16 }}>
          本软件仅供学习、研究和个人合法用途。
        </p>

        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 16,
        }}>
          <div style={{ fontWeight: 600, color: '#fca5a5', marginBottom: 6, fontSize: 13 }}>
            ❌ 严禁用于：
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#fca5a5', lineHeight: 1.8 }}>
            <li>诈骗、冒充他人身份</li>
            <li>伪造语音、伪造证据</li>
            <li>任何违法违规行为</li>
          </ul>
        </div>

        <div style={{
          textAlign: 'center',
          fontSize: 14,
          color: '#fbbf24',
          marginBottom: 24,
          fontWeight: 500,
        }}>
          玩归玩，别越线，进去了我可捞不了你 🙏
        </div>

        <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginBottom: 20 }}>
          点击「同意」代表你已阅读并接受以上条款。
          <br />
          不同意请立即关闭应用。
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={handleDisagree}
            disabled={loading}
            style={{
              padding: '8px 24px',
              background: 'transparent',
              border: '1px solid #6b7280',
              borderRadius: 6,
              color: '#9ca3af',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 13,
            }}
          >
            {loading ? '正在退出...' : '不同意，退出'}
          </button>
          <button
            onClick={onAgree}
            style={{
              padding: '8px 24px',
              background: '#7c3aed',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            同意并继续
          </button>
        </div>
      </div>
    </div>
  )
}
