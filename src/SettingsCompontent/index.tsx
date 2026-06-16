import { useState } from 'react'
import { Card, Switch, Slider, Select, Divider, message, ConfigProvider } from 'antd'
import {
  SoundOutlined,
  GlobalOutlined,
  SkinOutlined,
  BellOutlined,
} from '@ant-design/icons'
import IconSettings from '../components/IconSettings'
import './index.css'

const SettingsCompontent = () => {
  const [messageApi, contextHolder] = message.useMessage()

  // 偏好设置状态
  const [autoPlay, setAutoPlay] = useState(false)
  const [defaultSpeed, setDefaultSpeed] = useState(1.0)
  const [defaultVolume, setDefaultVolume] = useState(1.0)
  const [theme, setTheme] = useState('light')
  const [language, setLanguage] = useState('zh')
  const [notifications, setNotifications] = useState(true)
  const [saveHistory, setSaveHistory] = useState(true)

  const handleReset = () => {
    setAutoPlay(false)
    setDefaultSpeed(1.0)
    setDefaultVolume(1.0)
    setTheme('light')
    setLanguage('zh')
    setNotifications(true)
    setSaveHistory(true)
    messageApi.success('已恢复默认设置')
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#7c3aed',
        },
      }}
    >
      <div className='settings-page'>
        {contextHolder}

        <div className='settings-header'>
          <h2 className='settings-title'>
            <IconSettings /> 偏好设置
          </h2>
          <p className='settings-subtitle'>自定义你的配音体验</p>
        </div>

        <div className='settings-content'>
          {/* 外观设置 */}
          <Card className='settings-card' title={<><SkinOutlined /> 外观设置</>}>
            <div className='setting-item'>
              <div className='setting-label'>
                <span>主题模式</span>
                <p className='setting-desc'>选择界面的显示主题</p>
              </div>
              <Select
                value={theme}
                onChange={setTheme}
                style={{ width: 120 }}
                options={[
                  { label: '浅色', value: 'light' },
                  { label: '深色', value: 'dark' },
                  { label: '跟随系统', value: 'system' },
                ]}
              />
            </div>

            <Divider />

            <div className='setting-item'>
              <div className='setting-label'>
                <span>语言</span>
                <p className='setting-desc'>界面显示语言</p>
              </div>
              <Select
                value={language}
                onChange={setLanguage}
                style={{ width: 120 }}
                options={[
                  { label: '简体中文', value: 'zh' },
                  { label: 'English', value: 'en' },
                ]}
              />
            </div>
          </Card>

          {/* 通知与隐私 */}
          <Card className='settings-card' title={<><BellOutlined /> 通知与隐私</>}>
            <div className='setting-item'>
              <div className='setting-label'>
                <span>通知提醒</span>
                <p className='setting-desc'>合成完成时显示通知</p>
              </div>
              <Switch checked={notifications} onChange={setNotifications} />
            </div>

            <Divider />

            <div className='setting-item'>
              <div className='setting-label'>
                <span>保存历史</span>
                <p className='setting-desc'>自动保存配音历史记录</p>
              </div>
              <Switch checked={saveHistory} onChange={setSaveHistory} />
            </div>
          </Card>

          {/* 操作按钮 */}
          <div className='settings-actions'>
            <button className='btn-reset' onClick={handleReset}>
              恢复默认
            </button>
            <button className='btn-save' onClick={() => messageApi.success('设置已保存')}>
              保存设置
            </button>
          </div>
        </div>
      </div>
    </ConfigProvider>
  )
}

export default SettingsCompontent  
