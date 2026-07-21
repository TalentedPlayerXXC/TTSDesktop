// TTSDesktop 反馈模块 - 反馈弹窗 UI

import { useState } from 'react'
import { Modal, Input, Select, Button, message, Space, Typography } from 'antd'
import {
  BugOutlined,
  BulbOutlined,
  MessageOutlined,
  GithubOutlined,
} from '@ant-design/icons'
import { collectFeedback } from './collector'
import { submitFeedback } from './reporter'
import type { FeedbackData } from './types'

const { TextArea } = Input
const { Text, Paragraph } = Typography

const feedbackTypes: { value: FeedbackData['type']; label: string; icon: React.ReactNode }[] = [
  { value: 'feedback', label: '反馈问题', icon: <MessageOutlined /> },
  { value: 'suggestion', label: '功能建议', icon: <BulbOutlined /> },
  { value: 'crash', label: '崩溃报告', icon: <BugOutlined /> },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function FeedbackModal({ open, onClose }: Props) {
  const [type, setType] = useState<FeedbackData['type']>('feedback')
  const [messageText, setMessageText] = useState('')
  const [contact, setContact] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!messageText.trim()) {
      message.warning('请填写反馈内容')
      return
    }

    setSubmitting(true)
    try {
      const data = await collectFeedback(type, messageText.trim())
      if (contact.trim()) data.contact = contact.trim()

      const result = await submitFeedback(data)

      if (result.success) {
        message.success('反馈已提交！感谢你的反馈 🎉')
        setMessageText('')
        setContact('')
        onClose()
      } else {
        message.error(result.error || '提交失败，请稍后重试')
      }
    } catch (err: any) {
      message.error(err.message || '提交失败')
    }
    setSubmitting(false)
  }

  return (
    <Modal
      title={
        <Space>
          <GithubOutlined style={{ color: '#7c5cfc' }} />
          <span>提交反馈</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button
            type='primary'
            loading={submitting}
            onClick={handleSubmit}
            style={{ background: '#7c5cfc', borderColor: '#7c5cfc' }}
          >
            {submitting ? '提交中…' : '提交反馈'}
          </Button>
        </Space>
      }
      width={480}
      destroyOnClose
    >
      <Paragraph type='secondary' style={{ fontSize: 12, marginBottom: 16 }}>
        你的反馈会直接提交到 GitHub Issues，我们会在上面回复和处理。
      </Paragraph>

      <div style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>反馈类型</Text>
        <Select
          value={type}
          onChange={setType}
          style={{ width: '100%' }}
          options={feedbackTypes.map(t => ({
            label: <Space>{t.icon} {t.label}</Space>,
            value: t.value,
          }))}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>描述你的问题或建议</Text>
        <TextArea
          value={messageText}
          onChange={e => setMessageText(e.target.value)}
          placeholder='请详细描述…\n如果是崩溃，请说明操作步骤'
          rows={4}
          maxLength={2000}
          showCount
        />
      </div>

      <div style={{ marginBottom: 0 }}>
        <Text style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
          联系方式 <Text type='secondary' style={{ fontSize: 11 }}>（可选，方便我们联系你）</Text>
        </Text>
        <Input
          value={contact}
          onChange={e => setContact(e.target.value)}
          placeholder='邮箱 / QQ / 微信号…'
        />
      </div>
    </Modal>
  )
}
