// TTSDesktop 反馈模块 - GitHub Issues API 客户端
//
// Token 存储在 config.ts（已 gitignore），确保密钥不提交到仓库。
// Token 仅 issues:write 权限，即使泄漏也只会被用来刷 Issue。

import type { FeedbackData, FeedbackResult } from './types'
import { GITHUB_TOKEN, REPO_OWNER, REPO_NAME } from './config'

const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`

/** 将 FeedbackData 格式化为 GitHub Issue 的 Markdown 正文 */
function formatIssueBody(data: FeedbackData): string {
  const lines: string[] = [
    '## 📋 反馈信息',
    '',
    `| 项目 | 内容 |`,
    `|------|------|`,
    `| 类型 | ${data.type} |`,
    `| 版本 | ${data.app_version} |`,
    `| 系统 | ${data.os} |`,
    `| 架构 | ${data.arch} |`,
    `| 模型 | ${data.current_model || '未加载'} |`,
    `| 时间 | ${new Date().toISOString()} |`,
    '',
  ]

  if (data.message) {
    lines.push('## 💬 用户留言', '', data.message, '')
  }

  if (data.logs) {
    lines.push('## 📄 日志', '', '```', data.logs, '```', '')
  }

  if (data.contact) {
    lines.push('---', '', `📧 联系方式：${data.contact}`)
  }

  return lines.join('\n')
}

/**
 * 将反馈数据提交为 GitHub Issue
 */
export async function submitFeedback(data: FeedbackData): Promise<FeedbackResult> {
  // 没配 Token，兜底打开浏览器手动提 Issue
  if (!GITHUB_TOKEN) {
    const body = encodeURIComponent(formatIssueBody(data))
    const title = encodeURIComponent(getIssueTitle(data))
    window.open(
      `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/new?title=${title}&body=${body}`,
      '_blank'
    )
    return { success: true, issue_url: `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues` }
  }

  try {
    const res = await fetch(`${API_BASE}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        title: getIssueTitle(data),
        body: formatIssueBody(data),
        labels: [data.type === 'crash' ? 'bug' : data.type === 'suggestion' ? 'enhancement' : 'feedback'],
      }),
    })

    if (!res.ok) {
      const errBody = await res.text()
      return { success: false, error: `GitHub API 错误 (${res.status}): ${errBody}` }
    }

    const issue = await res.json()
    return {
      success: true,
      issue_number: issue.number,
      issue_url: issue.html_url,
    }
  } catch (err: any) {
    return { success: false, error: err.message || '网络请求失败' }
  }
}

function getIssueTitle(data: FeedbackData): string {
  const prefix = data.type === 'crash' ? '🐛 崩溃' : data.type === 'suggestion' ? '💡 建议' : '📝 反馈'
  return `[${prefix}] v${data.app_version} - ${data.message.slice(0, 40)}${data.message.length > 40 ? '…' : ''}`
}
