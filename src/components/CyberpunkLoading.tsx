import { SoundOutlined, ApiOutlined } from '@ant-design/icons'
import './CyberpunkLoading.css'

interface CyberpunkLoadingProps {
  visible: boolean
  message?: string
  modelName?: string
}

function CyberpunkLoading({ visible, message, modelName }: CyberpunkLoadingProps) {
  if (!visible) return null

  const displayModel = modelName || 'AI'

  return (
    <div className='cyber-overlay'>
      <div className='cyber-card'>
        <div className='cyber-scanline' />
        <div className='cyber-noise' />

        <div className='cyber-content'>
          <div className='cyber-icon-ring'>
            <div className='cyber-ring' />
            <div className='cyber-ring' />
            <div className='cyber-ring' />
            <div className='cyber-icon'>
              <ApiOutlined />
            </div>
          </div>

          <h2 className='cyber-title' data-text='LOADING'>
            LOADING
          </h2>

          <p className='cyber-status'>
            {message || (
              <>
                <SoundOutlined /> 正在加载 <span className='highlight'>{displayModel}</span> 模型...
              </>
            )}
          </p>

          <div className='cyber-dots'>
            <div className='cyber-dot' />
            <div className='cyber-dot' />
            <div className='cyber-dot' />
            <div className='cyber-dot' />
          </div>

          <div className='cyber-progress'>
            <div className='cyber-progress-bar' style={{ width: '100%' }} />
          </div>

          <div className='cyber-footer'>
            <span className='cyber-footer-text'>[ SYSTEM BOOTING ]</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CyberpunkLoading
