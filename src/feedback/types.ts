// TTSDesktop 反馈模块 - 类型定义

export interface FeedbackData {
  /** 反馈类型 */
  type: 'feedback' | 'crash' | 'suggestion'
  /** 用户留言 */
  message: string
  /** 应用版本 */
  app_version: string
  /** 操作系统 */
  os: string
  /** 芯片架构 */
  arch: string
  /** 最近日志（截取） */
  logs: string
  /** 当前加载的模型 */
  current_model: string | null
  /** 可选：用户联系方式 */
  contact?: string
}

export interface FeedbackResult {
  success: boolean
  issue_number?: number
  issue_url?: string
  error?: string
}
