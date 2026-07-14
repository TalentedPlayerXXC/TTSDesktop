[中文](UPDATE.md) | [English](UPDATE_EN.md)

# 更新日志

## 2026-07-14

### 🔮 画大饼环节 🥮

- **多人配音交互优化** — 选人操作有点硌手，准备打磨打磨，让它用起来更顺手 ✨

### ✨ 新功能

- **💬 多人配音 → 聊天气泡** — 告别「序号+下拉框+输入框」的编辑器，改为聊天气泡风格！
  - 左栏：气泡对话列表，点击文本原地编辑，× 删除台词
  - 右栏：完整角色列表（搜索/筛选/收藏/情感标签），点角色自动填入底部
  - 底部三列输入区：【角色名称:2】【可用情感:2】【配音文字:5】【清除:1】
  - 选角色后自动默认第一个情感，情感数据跟单人模式同一来源

### 🎨 UI 整活

- **布局重构** — 多人模式下左栏放对话气泡、右栏放角色网格，告别挤在 60% 里的尴尬
- **角色名称纯文本** — 底部选中角色改为纯文字展示，不占框
- **情感 Select 高度对齐** — 跟角色名称、输入框统一 32px

### 🐛 顺手修了点东西

- **修复 emotion 标签缺失 </div>** — 情感模式 JSX 括号没闭合，导致 build 报错

---

## 2026-07-13

### 🔮 画大饼环节 🥮

- **多人配音交互优化** — 选人操作有点硌手，准备打磨打磨，让它用起来更顺手 ✨

### ✨ 新功能

- **🎛️ 声音工坊** — 全新的音频后期处理页面！上传任意音频，添加实时 DSP 效果，一键导出
- **13 种音频效果** — 音量、回声、颤音、变声、失真、混响、合唱、乒乓延迟、自动滤波、移相器、震音、立体声加宽、三段均衡器
- **12 个声音预设** — 萝莉音、大叔音、萌妹音、电音、空灵、山谷回声、电话音、鬼畜、环绕、KTV混响、低频增强、心里话
- **预设互斥 + 选中/取消** — 预设一键清空替换，效果网格点选/取消，交互直观

### 🎨 UI 整活

- **声音工坊页面** — 两栏布局（左栏 47% 上传+波形+输出音量，右栏效果/预设 Tab 切换）
- **SWPlayer 组件** — 声音工坊专用音频波形组件，静音显示+播放/下载/×清除
- **AudioPlayer 回归纯净** — 去掉 all hack（muted/onClear/onTogglePlay），TTSComponent 不受影响
- **输出音量控制** — -20~+20dB 实时调节 Tone.js 输出音量
- **波形进度同步** — Tone.now() 驱动 WaveSurfer 进度条，播放时 50ms 精准同步
- **Tone.Offline 离线导出** — 导出经过完整效果链处理的 WAV 音频

### 🐛 顺手修了点东西

- **打包签名优化** — 加入 ad-hoc codesign，从「提示文件损坏→跑修复命令」降级为「右键 app → 打开」，省去修复.command 步骤
- **修复一句话克隆** — 改用原生文件选择器（dialog.showOpenDialog）替代 Ant Design Upload，修复 Electron 下 `originFileObj.path` 为空导致合成失败的问题
- **后端端口随机化** — 启动时从 8000 开始自旋扫描空闲端口，避免端口冲突导致后端崩溃
- **修复 effect chain 断音** — disposeChain 不再断开 player，链重建后 player 状态正常
- **修复 LFO 效果不工作** — AutoFilter/Vibrato/Phaser/Chorus 全部补上 .start()
- **修复导出不带输出音量** — Tone.Offline 回调重新应用 outputVolume

---

## 2026-07-08

### 🔮 画大饼环节 🥮

- **多人配音交互优化** — 选人操作有点硌手，准备打磨打磨，让它用起来更顺手 ✨

### 🐛 顺手修了点东西

- 修了 `index_fetch.tsx` 里 `ensureModelLoaded` 卸载错模型的问题（卸载了目标模型而非当前已加载的），补齐了 `if` 守卫
- 修了 `main.js` 里 `loadTTTModel()` 启动加载前没先卸载的问题，防止叠模型漏内存
- `characters/` 加入 `extraResources`，打包后 296 个角色的参考音频可正常读取
- 重写路径逻辑：`getCharactersBase()` / `getCustomSpeakersDir()`，开发用 `__dirname`，打包后参考音频走资源目录（只读）、自定义配音员走 `userData`（可写）

### 🎨 UI 整活

- **应用改名绘声** — 项目正式命名「绘声」，所有地方同步更新
- **Logo 重绘** — 声波条 + 品牌名，STKaiti 字体系统自带无版权纠纷，画布加宽到 180px
- **聆听环头像** — 右侧头像改为同心圆扩散动画，跟左侧发声组件一唱一和
- **沙雕标语池** — 29 条程序员梗随机展示，每次打开或点击刷新，打字机逐字打出 + 闪烁光标
- **布局修复** — 三栏自适应居中，不再偏右

---

## 2026-07-07

### ✨ 新功能

#### 1. 自定义配音员系统
- 声音设计页面合成的音频可一键「加入配音员列表」，像普通角色一样在智能配音中使用
- 音频文件自动迁移到 `characters/自定义/` 目录，支持文件系统恢复
- localStorage + 文件系统双向同步：增删自定义角色自动同步，删除文件夹则自动从列表移除

#### 2. 情感标签动态解析
- 点击配音员后，从角色文件夹的音频文件名自动解析情感标签（`开心-xxx.wav` → 开心）
- 单人模式与情感模式均可展示，支持单标签选择
- 自定义配音员没有情感标签，自动跳过

#### 3. 智能配音全面接入后端 API
- 单人模式：`ensureModelLoaded('tts')` → `clone()`
- 多人模式：`ensureModelLoaded('tts')` → `batchClone({ merge: true })`
- 情感模式：`ensureModelLoaded('voxcpm2')` → `voxClone(instruct)`
- 切换模式自动卸载旧模型加载新模型，保证干净状态
- 合成完成后自动播放音频

#### 4. 角色数据缓存（SessionCache）
- 应用生命周期内的内存缓存，关闭即销毁
- 首次打开从 MongoDB 加载，同会话内切页面秒开，不重复请求
- 骨架屏加载动画 + 赛博朋克全屏加载动效

#### 5. MongoDB 角色数据接入
- 从 MongoDB Atlas 加载 296+ 角色数据（含声线/气质标签）
- 筛选栏动态生成：全部 / 男声 / 女声 / 声线标签 / 气质标签
- 支持搜索、收藏

### 🔧 功能重构

#### 1. 智能配音（TTSComponent）大改
- 从 MOCK_SPEAKERS 改为 MongoDB 真实数据加载
- 新增 sessionCache 内存缓存机制
- 自定义配音员注入角色列表
- 文件系统恢复双向同步（增删联动）
- CSS 全面采用全局变量，支持明暗主题
- 骨架屏加载占位

#### 2. 模型生命周期管理
- 新增 `getCurrentModel()` 导出，全局追踪当前加载的模型状态
- `ensureModelLoaded` 保留跳过逻辑：模型已匹配时直接返回，不重复请求
- 智能配音模式切换（单人/多人/情感）时在后台预加载对应模型
- 加载模型时弹出 CyberpunkLoading 动画
- 一句话克隆 / 声音设计页面同样受益于全局模型状态追踪

#### 3. Electron 主进程生命周期重写
- 启动时移除冗余的 `unloadTTTModel()` 调用
- `stopMongoWorker` 先发断开请求，等 1s 再 kill，避免连接中断
- `will-quit` 使用 `event.preventDefault()` + 异步清理 + `app.exit()` 确保全部子进程终止
- macOS 关窗口时停掉后端服务，点 Dock 图标时自动重启
- MongoDB 连接地址独立到 `db.js`（已 gitignore），提供 `db.example.js` 模板

#### 4. 声音设计（VoiceDesign）修复
- 修复 `handleAddToSpeaker` 中变量作用域导致的 bug（`migrateRes` 访问不到）
- 实际调用 `voxDesign` API（之前是 stub）
- 高级参数（推理步数、CFG 值）实际传入请求

### 🎨 UI/UX 优化

- 全局取消 `user-select: none`，恢复文本可选
- 配音员筛选栏支持展开/收起声线气质标签
- 合成按钮改为「合成中...」文字反馈
- 暗色模式适配全部新增 UI 元素（含一句话克隆页面）
- 删除 saveHistory 相关所有代码
- 情感标签从右侧移至左侧配音文本下方，操作流更顺畅：写词 → 选情感 → 选人 → 合成
- 修复点击配音员时情感标签闪烁问题（不再先清空再加载）

### 📁 新增文件

```
src/
├── services/
│   ├── sessionCache.ts          # 内存缓存（新增）
│   └── customSpeaker.ts         # 自定义配音员 CRUD（新增）
db.example.js                    # MongoDB 连接模板（新增，提交到仓库）
db.js                            # MongoDB 实际连接（新增，已 gitignore）
.gitignore 加入 db.js + characters/ 目录
mongoose 加入依赖
```

### 🔧 其他调整

- main.js：新增 MongoDB Worker、GAME_FOLDER_MAP 修复、migrate/recover IPC、移除 saveHistory
- preload.js：新增自定义配音员 IPC 桥、移除 saveHistory
- mongo-worker.js：移除 history 模型
- SettingsComponent：缓存管理（getCacheStatus / cleanupCache）
- 删除 `src/backup.tsx`、`src/components/CrashTest.tsx`

---

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
