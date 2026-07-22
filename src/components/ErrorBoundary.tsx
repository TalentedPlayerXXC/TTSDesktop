import { Component, ErrorInfo, ReactNode } from 'react'
import { WarningOutlined } from '@ant-design/icons'
import { submitFeedback } from '../feedback/reporter'
import { collectFeedback, sanitizePath } from '../feedback/collector'
import './ErrorBoundary.css'

/** 同会话内已上报的错误 key 集合，页面刷新后重置 */
const reportedErrors = new Set<string>()

function makeErrorKey(error: Error, stack: string): string {
  const firstFrame = stack.match(/\n\s+at\s+(.+)/)?.[1] || ''
  return `${error.name}:${error.message}|${firstFrame}`
}

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

    // 自动上报到 GitHub Issues → 门将巡检链路
    this.reportCrash(error, errorInfo)
  }

  async reportCrash(error: Error, errorInfo: ErrorInfo) {
    // 防重：同会话内相同错误只报一次
    const key = makeErrorKey(error, errorInfo.componentStack || '')
    if (reportedErrors.has(key)) {
      console.log('[ErrorBoundary] 跳过重复错误上报:', key)
      return
    }
    reportedErrors.add(key)

    try {
      const componentStack = errorInfo.componentStack
        ? sanitizePath(errorInfo.componentStack.trim())
        : '(无堆栈)'

      const message = [
        `**${error.name}:** ${error.message}`,
        '',
        '**组件堆栈:**',
        '```',
        componentStack,
        '```',
      ].join('\n')

      const data = await collectFeedback('crash', message)
      const result = await submitFeedback(data)
      if (result.success) {
        console.log('[ErrorBoundary] 崩溃已自动上报:', result.issue_url)
      } else {
        console.warn('[ErrorBoundary] 自动上报失败:', result.error)
      }
    } catch (e) {
      // 兜底：任何异常绝不影响用户界面
      console.warn('[ErrorBoundary] 自动上报异常:', e)
    }
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
