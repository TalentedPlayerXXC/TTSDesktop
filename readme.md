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

## 最近更新 2025-06-17

### ✨ 新增功能

#### 1. 左侧圆弧导航菜单 (SidebarMenu)
- 采用 Canvas 动效实现的垂直居中圆弧布局导航
- 包含 4 个功能入口：智能配音、一句话克隆、声音设计、偏好设置
- 每个按钮配备动态 Canvas 图标：
  - **智能配音** - 麦克风图标，带呼吸光晕和粒子效果
  - **一句话克隆** - DNA 双螺旋图标，动态旋转动画
  - **声音设计** - 调色板图标，颜料点微动效果
  - **偏好设置** - 齿轮图标，持续旋转动画
- 悬停时显示 Tooltip 提示标签
- 激活态图标颜色从紫色变为金色，视觉反馈清晰

#### 2. 右下角智能助手 (Mascot)
- Canvas 绘制的可爱角色形象，带眨眼、呼吸、星光粒子等动画
- 点击展开反馈菜单：
  - GitHub Issues 快捷入口
  - 问题反馈表单（支持标题和详细描述）
- 气泡提示框引导用户反馈问题

#### 3. 偏好设置页面 (SettingsComponent)
- 独立组件目录结构 (`src/SettingsCompontent/`)
- 采用 ConfigProvider 统一主题色为紫色 (#7c3aed)
- 两大功能模块：
  - **外观设置** - 主题模式（浅色/深色/跟随系统）、界面语言（中文/English）
  - **通知与隐私** - 通知提醒开关、历史记录保存开关
- 底部操作按钮：恢复默认、保存设置
- 卡片标题使用静态图标，页面标题使用动态 Canvas 图标

### 🎨 UI/UX 优化

#### 1. 统一的视觉风格
- **卡片标题样式统一** - 所有组件的分区标题采用紫色主题：
  - 文字颜色：`#4c1d95`（深紫色）
  - 背景颜色：`#faf9ff`（淡紫色）
  - 圆角边框设计，去除底部线条
- **图标系统升级**：
  - 页面主标题使用动态 Canvas 图标（IconTTS、IconClone、IconDesign、IconSettings）
  - 卡片标题使用静态 Ant Design 图标（FileTextOutlined、TeamOutlined、SettingOutlined 等）
  - 保持视觉层次清晰，动静结合

#### 2. 组件样式分离重构
- 遵循 CSS 样式分离规范，移除所有内联 `<style>` 标签和 `style={{}}` 属性
- 新建独立 CSS 文件：
  - `src/components/Mascot.css` - Mascot 组件样式
  - `src/components/SidebarMenu.css` - SidebarMenu 组件样式
- 类命名规范：以组件名为前缀（如 `.mascot-container`、`.sidebar-tooltip`）

#### 3. 交互细节优化
- **智能配音页面**：
  - 新增"热门推荐"分类，带火焰图标标识
  - 新增"自定义"分类选项
  - 配音员列表调整为 4 列网格布局，间距优化
- **一句话克隆页面**：
  - 简化参数设置区域，保留核心功能（语言、切割方式、语速）
  - 优化音频上传区域交互，支持拖拽和点击上传
  - 添加音频文件移除按钮（CloseCircleFilled）
- **设置页面**：
  - "恢复默认"按钮采用紫色系配色，与主题协调
  - 卡片间距调整为 15px，视觉更舒适
  - Switch 组件通过 ConfigProvider 统一为主题紫色

#### 4. 路由系统完善
- 新增 `/settings` 路由，指向 SettingsComponent
- 左侧导航菜单与路由系统集成，点击跳转对应页面
- 路由守卫：无效路径自动重定向到 `/tts`

### 📁 目录结构调整

```
src/
├── components/           # 公共组件目录（新增）
│   ├── IconTTS.tsx      # 动态 Canvas 图标
│   ├── IconClone.tsx
│   ├── IconDesign.tsx
│   ├── IconSettings.tsx # 新增设置图标
│   ├── IconTTSStatic.tsx
│   ├── IconCloneStatic.tsx
│   ├── IconDesignStatic.tsx
│   ├── Mascot.tsx       # 智能助手组件
│   ├── Mascot.css       # Mascot 样式（新增）
│   ├── SidebarMenu.tsx  # 侧边导航菜单
│   └── SidebarMenu.css  # SidebarMenu 样式（新增）
├── SettingsCompontent/  # 设置页面组件（新增）
│   ├── index.tsx
│   └── index.css
├── TTSComponent/        # 智能配音页面
├── TTSComponentBeta/    # 一句话克隆页面
├── VoiceDesign/         # 声音设计页面
└── ...
```

### 🔧 技术改进

- **Canvas 动画系统** - 实现粒子效果、轨道光环、呼吸光晕等多种动效
- **主题色统一管理** - 通过 Ant Design ConfigProvider 全局配置主题色
- **CSS 模块化** - 组件样式独立管理，避免全局污染
- **代码规范化** - 移除所有内联样式，提升可维护性
