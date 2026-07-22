// TTSDesktop 反馈模块 - 系统信息收集

import type { FeedbackData } from './types'
import { getCurrentModel } from '../services/index'

declare const __APP_VERSION__: string

/** 获取应用版本 */
function getAppVersion(): string {
  try {
    if (typeof __APP_VERSION__ !== 'undefined' && __APP_VERSION__ !== 'unknown') {
      return __APP_VERSION__
    }
  } catch {}
  return 'unknown'
}

/** 获取 CPU 架构 */
function getArch(): string {
  const p = (navigator.platform || '').toLowerCase()
  const ua = navigator.userAgent.toLowerCase()
  if (p.includes('arm') || p.includes('macarm')) return 'arm64'
  if (p.includes('x86_64') || p.includes('win64') || p.includes('macintel')) return 'x64'
  if (ua.includes('arm64') || ua.includes('aarch64')) return 'arm64'
  if (ua.includes('x64') || ua.includes('x86_64') || ua.includes('win64')) return 'x64'
  return 'unknown'
}

/** 获取操作系统信息（同步部分，不含真实 macOS 版本） */
function getOSBase(): string {
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('windows')) {
    const m = ua.match(/windows nt (\d+[.\d]*)/)
    const winVer: Record<string, string> = { '10.0': '10', '6.3': '8.1', '6.2': '8', '6.1': '7' }
    if (m && winVer[m[1]]) return `Windows ${winVer[m[1]]}`
    if (m) return `Windows ${m[1]}`
    return 'Windows'
  }
  if (ua.includes('mac os')) return 'macOS'
  if (ua.includes('linux')) return 'Linux'
  return 'unknown'
}

/** 获取当前加载的模型 */
function readCurrentModel(): string | null {
  try {
    return getCurrentModel()
  } catch {
    return null
  }
}

/** 脱敏日志中的绝对路径：/Users/xxx/.../a/b → /a/b */
function sanitizePath(line: string): string {
  return line
    // macOS: /Users/xxx/.../a/b → /a/b  (守2段)
    .replace(/\/Users\/[^/\s]+\/(?:[^/\s]+\/)*([^/\s]+\/[^/\s]+)/g, '/$1')
    .replace(/\/Users\/[^/\s]+\/([^/\s]+)/g, '/$1')
    // Linux: /home/xxx/.../a/b → /a/b
    .replace(/\/home\/[^/\s]+\/(?:[^/\s]+\/)*([^/\s]+\/[^/\s]+)/g, '/$1')
    .replace(/\/home\/[^/\s]+\/([^/\s]+)/g, '/$1')
    // Windows: C:\Users\xxx\...\a\b → \a\b
    .replace(/[A-Za-z]:\\Users\\[^\\\s]+\\(?:[^\\\s]+\\)*([^\\\s]+\\[^\\\s]+)/g, '\\$1')
    .replace(/[A-Za-z]:\\Users\\[^\\\s]+\\([^\\\s]+)/g, '\\$1')
}

/** 收集最近的控制台日志 */
function collectLogs(): string {
  try {
    const logs = (window as any).__consoleLogs__
    if (Array.isArray(logs) && logs.length > 0) {
      return logs.slice(-30).map(sanitizePath).join('\n')
    }
  } catch {}
  return '(日志收集未启用)'
}

/**
 * 收集系统信息并返回 FeedbackData（异步，因为需要 IPC 拿真实 macOS 版本）
 */
export async function collectFeedback(
  type: FeedbackData['type'],
  message: string
): Promise<FeedbackData> {
  const data: FeedbackData = {
    type,
    message,
    app_version: getAppVersion(),
    os: getOSBase(),
    arch: getArch(),
    logs: collectLogs(),
    current_model: readCurrentModel(),
  }

  // 优先走 IPC 获取真实 macOS 版本
  if (data.os === 'macOS' && window.electronAPI?.getSystemInfo) {
    try {
      const info = await window.electronAPI.getSystemInfo()
      if (info.macosVersion) {
        data.os = `macOS ${info.macosVersion}`
      }
    } catch {}
  }

  return data
}
