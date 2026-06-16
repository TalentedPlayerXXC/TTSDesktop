[中文](readme.md) | [English](readme_EN.md)

# QwenTTS Desktop

基于 Electron + React 的桌面配音客户端，提供智能配音、声音克隆、声音设计三项核心功能。

## 功能

- **智能配音** — 选择配音员（按性别、风格分类），输入文本一键合成
- **一句话克隆** — 上传参考音频，快速克隆目标声音
- **声音设计** — 通过提示词 + 参数（语速/音量）定制语音风格
- **偏好设置** — 自定义主题、语言、通知等个性化配置

## 技术栈

Electron · React 19 · TypeScript · Vite 6 · Ant Design 6 · react-router 7 · Axios

## 启动

```bash
# 构建并启动
npm run preview

# 或开发模式（需两个终端）
npm run dev                        # Vite 开发服务器
NODE_ENV=development npm start     # Electron
```

## 更新日志

详细更新内容请查看 [update.md](./update.md)
