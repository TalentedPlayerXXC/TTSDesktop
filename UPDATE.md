[中文](UPDATE.md) | [English](UPDATE_EN.md)

# 更新日志

## 2025-07-03

### ✨ 新功能

#### 1. 多人对话配音
- 智能配音新增**多人对话模式**，支持添加多个角色行
- 每行可独立选择配音员、输入台词，想加几行加几行
- 右侧实时显示角色概览，演员阵容一目了然

#### 2. 情感配音模式
- 新增**情感配音模式**，内置 12 种情感标签：开心、悲伤、愤怒、温柔、沉稳、活泼、治愈、深沉、元气、性感、严肃、慵懒
- 支持多选情感组合，让声音更有戏

#### 3. 崩溃测试页面
- 新增 `/crash-test` 页面，方便开发者测试错误边界
- 提供三种崩溃方式：普通异常、异步错误、React 渲染崩坏

#### 4. ErrorBoundary 全局保护
- 全局错误边界组件，捕获渲染异常不会白屏
- 显示错误详情和堆栈信息，支持一键"重新来过"

#### 5. CyberpunkLoading 全屏加载
- 赛博朋克风格的全屏加载动画组件
- 支持自定义加载信息和模型名称

### 🔧 功能重构

#### 1. 一句话克隆（TTSComponentBeta）大改
- 砍掉了语言选择、文本切割方式、语速滑块 —— 那些交给 AI 自己操心
- 从传 FormData 改为传文件路径，接入真实后端 API
- 新增模型加载流程（`ensureModelLoaded`），先卸载旧模型再加载，保证干净
- 配合 CyberpunkLoading 显示"正在加载模型..."的实时状态
- 文本上限从 300 提升到 **5000 字**

#### 2. 声音设计（VoiceDesign）大改
- 移除语速、音量滑块和重置按钮 —— 不再需要手调参数
- 新增**配音文本输入框**，文本上限 5000 字
- 提示词上限从 200 提升到 **500 字**
- 接入真实后端 API（`voxDesign`），合成后可在线播放
- 同样加入 CyberpunkLoading 加载动效

#### 3. 服务层全面 TS 化
- 新增 `src/services/types.ts`，所有 API 请求/响应都有完整 TypeScript 类型
- 统一 API 规范：`clone` / `batchClone` / `dialogue` / `voxDesign` / `voxClone` / `stt` / `getFilesList`
- 废弃旧接口：`getTTS` / `qwen` / `getModels` / `getSpks` / `getFileLink` / `getEmotionList`
- 新增模型生命周期管理函数 `ensureModelLoaded`
- Electron 和浏览器模式自动切换 API 基地址
- `index_fetch.tsx` 同步更新，纯 fetch 版同样享受所有新接口

### 🎨 UI/UX 优化

- 智能配音页面新增**模式切换标签**（单人 / 多人 / 情感），清晰直观
- 配音文本上限统一提升至 **5000 字**，长文本福音
- GitHub Issues 链接更新到新仓库地址
- Mascot 反馈表单的文本域增加 `autoSize`

### 📁 新增文件

```
src/
├── services/
│   └── types.ts               # 全量 API 类型定义（新增）
├── components/
│   ├── CrashTest.tsx           # 崩溃测试页面（新增）
│   ├── CyberpunkLoading.tsx    # 赛博朋克加载组件（新增）
│   ├── CyberpunkLoading.css    # 加载组件样式（新增）
│   ├── ErrorBoundary.tsx       # 错误边界组件（新增）
│   └── ErrorBoundary.css       # 错误边界样式（新增）
tts_serve_mlx/                  # Python 后端服务目录（新增）
ELECTRON_INTEGRATION.md         # Electron 集成文档（新增）
api.md                          # API 接口文档（新增）
```

### 🔧 其他调整

- `.gitignore` 新增 `tts_serve_mlx` 保留目录规则（只留目录，不提交模型文件）
- SidebarMenu 新增 `/crash-test` 路由入口
- 路由系统新增 `/crash-test` 页面注册
- `package.json` 依赖版本微调

---

## 2025-06-17

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
