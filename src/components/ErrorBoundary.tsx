import { Component, ErrorInfo, ReactNode } from 'react'
import { WarningOutlined } from '@ant-design/icons'
import './ErrorBoundary.css'

interface Props {
  children: ReactNode
  onNavigate?: (path: string) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  timestamp: string
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      timestamp: '',
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      timestamp: new Date().toLocaleString('zh-CN'),
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] 捕获到渲染错误:', error)
    console.error('[ErrorBoundary] 组件堆栈:', errorInfo.componentStack)
    this.setState({ errorInfo })
  }

  handleReboot = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      timestamp: '',
    })
    this.props.onNavigate?.('/tts')
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    const { error, errorInfo, timestamp } = this.state
    const isDev = process.env.NODE_ENV === 'development'

    return (
      <div className='errbound-overlay'>
        <div className='errbound-scanline' />
        <div className='errbound-grid' />

        <div className='errbound-card'>
          <div className='errbound-header'>
            <div className='errbound-icon-ring'>
              <div className='errbound-ring' />
              <div className='errbound-ring' />
              <div className='errbound-icon'>
                <WarningOutlined />
              </div>
            </div>

            <div className='errbound-titles'>
              <h2 className='errbound-title' data-text='SYSTEM FAILURE'>
                SYSTEM FAILURE
              </h2>
              <span className='errbound-subtitle'>CRITICAL ERROR DETECTED</span>
            </div>
          </div>

          <div className='errbound-terminal'>
            <div className='errbound-line'>
              <span className='errbound-prompt'>&gt; ERROR:</span>
              <span className='errbound-code'>
                {error?.message || 'Unknown runtime error'}
              </span>
            </div>

            {isDev && errorInfo && (
              <div className='errbound-stack'>
                {errorInfo.componentStack?.trim()}
              </div>
            )}

            {!isDev && (
              <div className='errbound-line' style={{ marginTop: 8 }}>
                <span className='errbound-prompt'>&gt; HINT:</span>
                <span className='errbound-code'>
                  应用程序遇到意外错误，请尝试重新加载。如问题持续，请联系技术支持。
                </span>
              </div>
            )}
          </div>

          <div className='errbound-actions'>
            <button className='errbound-btn-retry' onClick={this.handleReboot}>
              REBOOT SYSTEM
            </button>
          </div>

          <div className='errbound-footer'>
            <span className='errbound-status-text'>
              <span className='errbound-status-dot' />
              [ ERR {isDev ? 'DEV' : '#0x01'} ]
            </span>
            {timestamp && (
              <span className='errbound-timestamp'>{timestamp}</span>
            )}
        </div>
      </div>
    </div>
    )
  }
}
