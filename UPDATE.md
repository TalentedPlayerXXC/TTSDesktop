[中文](UPDATE.md) | [English](UPDATE_EN.md)

# 更新日志

## 2026-07-15

### ✨ 新功能

- **📥 模型自动下载** — 第一次启动自动弹出下载窗口，后端 `git clone` 走魔搭下载，前端每 500ms 看一眼进度。甩锅声明已备好：「由于魔搭的特殊性，不支持断点续传 🙏」
- **🗑️ 自定义配音员删除确认** — 点 × 不再手滑即删，弹个小气泡让你再想想，删了可就没了
- **🎯 单人情感默认选中** — 选完角色情感标签自动亮第一个，少点一步
- **🎭 加载文案放飞自我** — 「配音员正在赶来的路上 🏃」「调音师拧了拧旋钮 🎛️」「情感模块正在加载戏精属性 🎭」

### 🔧 功能重构

- **多人配音换 `/dialogue` API** — 后端接管角色间隔和淡入淡出，前端只管传数组，省心
- **合成接口接入 `return_raw`** — 所有合成接口支持直接返回 WAV 二进制流，省掉二次请求
- **模型卸载统一全杀** — 不传参数调 `POST /model/unload`，加载新模型前清场，不跟踪 `_currentModel`，不给 10G 内存泄漏留机会
- **下载完成直球加载** — 下载完直接 `POST /model/load {"model": "tts"}`，不绕 `ensureModelLoaded` 那套卸了再装

### 🐛 顺手修了点东西

- **弹窗关闭不卡死** — 之前 `onComplete` 等 `loadInitialModels` IPC 返回，卡了就死锁。现在直接关窗，不等了
- **模型初始化不硬加载** — 启动时先查 `/models-info`，文件不存在就跳过，不报一脸 FileNotFoundError 再让用户看
- **主进程预载 = 渲染进程知道** — 新增 IPC `get-startup-model`，渲染进程启动时同步，`_currentModel` 不落空
- **Popconfirm 代替 Modal.confirm** — 轻量确认，不弹弹窗不挡视线

---

## 2026-07-14

### ✨ 新功能

- **💬 多人配音 → 聊天气泡** — 终于把那破「序号+下拉框+输入框」编辑器给毙了，换成了聊天气泡！点一下说话，再点一下改词，跟微信聊天似的
  - 左栏：气泡列表排排坐，点词改词，× 删台词
  - 右栏：完整角色列表，搜人筛人收藏挂情感，点谁谁上车
  - 底部三列输入区：【角色名字:2】【挑个情绪:2】【写台词:5】【清空:1】
  - 点角色自动带出第一个情感，省得你多点一步

### 🎨 UI 整活

- **布局重构** — 气泡滚左边、角色列表滚右边，再也不用一群人挤在 60% 的小角落里了
- **角色名不再穿马甲** — 选中的角色就纯文字杵那儿，不占框不装逼
- **情感下拉终于对齐了** — 跟名字输入框站一排，整整齐齐 32px

### 🐛 顺手修了点东西

- **修复导出静音** — Tone.Offline 跟原生 AudioNode 八字不合，连线报错「A value with the given key could not be found」。一怒之下全换原生 OfflineAudioContext + 原生 Web Audio 节点自己搞，13 种效果一个个手动映射，导出终于噗噗出声了

---

## 2026-07-13

### 🔮 画大饼环节 🥮

- **多人配音交互优化** — 选人操作有点硌手，准备打磨打磨，让它用起来更顺手 ✨

### ✨ 新功能

- **🎛️ 声音工坊** — 全新页面！找个音频扔进去，加特效（回声/变声/失真/混响…）跟玩儿似的，点一下导出就完事
- **13 种音频效果** — 音量、回声、颤音、变声、失真、混响、合唱、乒乓延迟、自动滤波、移相器、震音、立体声加宽、三段均衡器，够你造的了
- **12 个声音预设** — 萝莉大叔萌妹电音空灵山谷回声电话鬼畜环绕KTV低音心里话，总有一款适合你
- **预设互斥 + 选中/取消** — 点预设一键替换，点效果随意叠加，点选中的再点一下取消，跟开关似的

### 🎨 UI 整活

- **声音工坊页面** — 左栏 47% 上传调音波形输出音量，右栏切效果/预设两个 Tab，布局舒服
- **SWPlayer 组件** — 声音工坊专用波形播放器，不发声只显示波，带播放/下载/叉叉清除
- **AudioPlayer 回归纯净** — 把之前加的各种 hack 属性（muted/onClear/onTogglePlay）全甩了，TTSComponent 那边岁月静好
- **输出音量控制** — -20~+20dB 随便拧，实时调 Tone.js 输出大小
- **波形进度同步** — Tone.now() 驱动 WaveSurfer 进度条，50ms 一刷，精准跟嘴
- **Tone.Offline 离线导出** — 点导出时离线渲染整个效果链，不带丢数据的

### 🐛 顺手修了点东西

- **打包签名优化** — 加上 ad-hoc codesign，从「提示文件损坏→跑修复命令」降级为「右键 app → 打开」，省一个步骤
- **修复一句话克隆** — 不用 Ant Design Upload 那破控件了，改用原生文件选择器，修复 Electron 下路径为空合成失败的问题
- **后端端口随机化** — 启动时从 8000 开始自己找空端口，省得跟别的程序打架
- **修复 effect chain 断音** — disposeChain 不再把 player 踢下线，链重建后声音不断
- **修复 LFO 效果不工作** — AutoFilter/Vibrato/Phaser/Chorus 全部手动补上 .start()，之前偷懒没调
- **修复导出不带输出音量** — Tone.Offline 回调里重新应用 outputVolume，导出音量跟着走

---

## 2026-07-08

### 🔮 画大饼环节 🥮

- **多人配音交互优化** — 选人操作有点硌手，准备打磨打磨，让它用起来更顺手 ✨

### 🐛 顺手修了点东西

- 修了 `index_fetch.tsx` 里 `ensureModelLoaded` 卸错模型的问题（卸的是目标模型不是当前已加载的），`if` 守卫补上
- 修了 `main.js` 里 `loadTTTModel()` 启动时没先卸载的问题，防止模型叠叠乐漏内存
- `characters/` 加入 `extraResources`，打包后 296 个角色的参考音频终于读得到了
- 重写路径逻辑：`getCharactersBase()` / `getCustomSpeakersDir()`，开发走 `__dirname`，打包后参考音频走资源目录（只读）、自定义配音员走 `userData`（可写）

### 🎨 UI 整活

- **应用改名绘声** — 终于有个正式名字了，所有地方同步更新
- **Logo 重绘** — 声波条 + 品牌名，STKaiti 字体系统自带不用操心版权，画布加宽到 180px
- **聆听环头像** — 右侧头像改同心圆扩散动画，跟左侧发声一唱一和
- **沙雕标语池** — 29 条程序员梗随机掉落，打字机逐字打出 + 闪烁光标，每次打开都是盲盒
- **布局修复** — 三栏自适应居中，再也不用看偏右的歪门邪道了

---

## 2026-07-07

### ✨ 新功能

#### 1. 自定义配音员系统
- 声音设计合成的音频可一键「加入配音员列表」，从此自定义角色也能跟原生角色平起平坐
- 音频文件自动搬家到 `characters/自定义/`，删了文件夹还能自动从列表消失
- localStorage + 文件系统双向同步，增删改查一条龙

#### 2. 情感标签动态解析
- 点配音员后，自动从他文件夹里的音频文件名猜情感（`开心-xxx.wav` → 开心），不用手动配
- 单人/情感模式都能看，支持选单个标签
- 自定义配音员没标签？自动跳过不废话

#### 3. 智能配音全面接入后端 API
- 单人：`ensureModelLoaded('tts')` → `clone()`
- 多人：`ensureModelLoaded('tts')` → `batchClone({ merge: true })`
- 情感：`ensureModelLoaded('voxcpm2')` → `voxClone(instruct)`
- 切模式自动卸旧模型、装新模型，保证不串台
- 合成完自动播放，不用手动点

#### 4. 角色数据缓存（SessionCache）
- 内存缓存，关了就没了，不占硬盘
- 首次开从 MongoDB 加载，同会话内切页面秒开
- 骨架屏 + 赛博朋克全屏加载动效，等数据时也不无聊

#### 5. MongoDB 角色数据接入
- 从 MongoDB Atlas 拉 296+ 角色数据（带声线/气质标签）
- 筛选栏动态：全部 / 男声 / 女声 / 声线 / 气质，搜人方便
- 支持搜索 + 收藏

### 🔧 功能重构

#### 1. 智能配音（TTSComponent）大改
- 从 MOCK_SPEAKERS 假数据换成了 MongoDB 真家伙
- 新增 sessionCache 内存缓存，切页面不用重新加载
- 自定义配音员混入角色列表
- 文件系统双向同步，增删联动
- CSS 全面改用全局变量，暗色/亮色随意切
- 骨架屏占位，加载不空洞

#### 2. 模型生命周期管理
- 新增 `getCurrentModel()` 导出，随时知道当前加载的是哪个模型
- `ensureModelLoaded` 有跳过逻辑：模型已经加载了就直接返回，不重复请求
- 切模式下在后台预加载对应模型
- 加载模型时弹出 CyberpunkLoading 动画，赛博感拉满
- 一句话克隆 / 声音设计也吃到了模型管理的红利

#### 3. Electron 主进程生命周期重写
- 启动时删除多余的 `unloadTTTModel()` 调用
- `stopMongoWorker` 先发断开请求等 1s 再杀，不给数据库甩脸色
- `will-quit` 用 `event.preventDefault()` + 异步清理 + `app.exit()` 确保子进程都死透
- macOS 关窗停后端，点 Dock 图标自动重启
- MongoDB 连接地址独立到 `db.js`（已 gitignore），给了 `db.example.js` 模板照着填

#### 4. 声音设计（VoiceDesign）修复
- 修了 `handleAddToSpeaker` 里变量作用域的 bug（`migrateRes` 娶不到老婆）
- 真正调用了 `voxDesign` API（之前只是个空壳）
- 高级参数（推理步数、CFG 值）现在真能传过去了

### 🎨 UI/UX 优化

- 取消全局 `user-select: none`，终于能选文字了
- 配音员筛选栏支持展开/收起声线气质标签
- 合成按钮显示「合成中…」而不是在那装死
- 暗色模式适配所有新增 UI（包括一句话克隆）
- 删除 saveHistory 及其所有辣鸡代码
- 情感标签从右侧挪到左侧配音文本下面，流程更顺：写词 → 选情感 → 选人 → 合成
- 修复点配音员时情感标签闪烁（不再先清空再加载）

### 📁 新增文件

```
src/
├── services/
│   ├── sessionCache.ts          # 内存缓存（新增）
│   └── customSpeaker.ts         # 自定义配音员 CRUD（新增）
db.example.js                    # MongoDB 连接模板（可以提交）
db.js                            # MongoDB 实际连接（已 gitignore）
.gitignore 加入 db.js + characters/
mongoose 加入依赖
```

### 🔧 其他调整

- main.js：新增 MongoDB Worker、修 GAME_FOLDER_MAP、migrate/recover IPC、删 saveHistory
- preload.js：新增自定义配音员 IPC 桥、删 saveHistory
- mongo-worker.js：删 history 模型
- SettingsComponent：缓存管理（getCacheStatus / cleanupCache）
- 删了 `src/backup.tsx`、`src/components/CrashTest.tsx`

---

## 2025-07-03

### ✨ 新功能

#### 1. 多人对话配音
- 智能配音新增**多人对话模式**，一个角色一行，想加几条加几条
- 每行独立选配音员、写台词，演员阵容右边实时展示

#### 2. 情感配音模式
- 新增**情感配音模式**，内置 12 种情感：开心、悲伤、愤怒、温柔、沉稳、活泼、治愈、深沉、元气、性感、严肃、慵懒
- 支持多选情感组合，声音有戏

#### 3. 崩溃测试页面
- 新增 `/crash-test` 页面，开发者可以故意搞崩玩玩
- 三种崩溃姿势：普通异常、异步错误、React 渲染崩坏

#### 4. ErrorBoundary 全局保护
- 全局错误边界，渲染炸了也不白屏
- 显示错误详情 + 堆栈信息，点一下「重新来过」就活过来了

#### 5. CyberpunkLoading 全屏加载
- 赛博朋克风格全屏加载动画
- 支持自定义加载信息和模型名称

### 🔧 功能重构

#### 1. 一句话克隆（TTSComponentBeta）大改
- 砍掉了语言选择、文本切割方式、语速滑块——那些交给 AI 自己操心
- 从 FormData 改成传文件路径，接入真后端 API
- 新增模型加载流程（`ensureModelLoaded`），先卸载旧模型再加载
- 配合 CyberpunkLoading 显示「正在加载模型…」
- 文本上限从 300 提到 **5000 字**

#### 2. 声音设计（VoiceDesign）大改
- 移除语速、音量滑块和重置按钮，不再需要手调参数
- 新增配音文本输入框，文本上限 5000 字
- 提示词上限从 200 提到 **500 字**
- 接入真实后端 API（`voxDesign`），合成后在线播放
- 同样加入 CyberpunkLoading 加载动效

#### 3. 服务层全面 TS 化
- 新增 `src/services/types.ts`，所有 API 都有完整 TypeScript 类型
- 统一 API 规范：`clone` / `batchClone` / `dialogue` / `voxDesign` / `voxClone` / `stt` / `getFilesList`
- 废弃旧接口：`getTTS` / `qwen` / `getModels` / `getSpks` / `getFileLink` / `getEmotionList`
- 新增模型生命周期管理 `ensureModelLoaded`
- Electron 和浏览器模式自动切 API 基地址
- `index_fetch.tsx` 同步更新，纯 fetch 版也能用新接口

### 🎨 UI/UX 优化

- 智能配音页面新增**模式切换标签**（单人 / 多人 / 情感），清晰直观
- 配音文本上限统一提到 **5000 字**
- GitHub Issues 链接更新到新仓库
- Mascot 反馈表单文本域加 `autoSize`

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

- `.gitignore` 新增 `tts_serve_mlx` 保留目录规则（只留目录不提交模型文件）
- SidebarMenu 新增 `/crash-test` 路由
- 路由系统注册 `/crash-test`
- `package.json` 依赖版本微调

---

## 2025-06-17

### ✨ 新功能

#### 1. 左侧圆弧导航菜单 (SidebarMenu)
- Canvas 动效画的弧形导航菜单，看着挺唬人
- 4 个功能入口：智能配音、一句话克隆、声音设计、偏好设置
- 每个按钮都有动画图标：
  - **智能配音** — 麦克风呼吸光晕粒子效果
  - **一句话克隆** — DNA 双螺旋转圈圈
  - **声音设计** — 调色板颜料微动
  - **偏好设置** — 齿轮一直转
- 悬停弹 Tooltip，选中变金色，视觉反馈到位

#### 2. 右下角智能助手 (Mascot)
- Canvas 画的可爱角色，会眨眼会呼吸，星光粒子在飘
- 点开可以：去 GitHub 提 Issue、填反馈表单
- 气泡提示框引导你反馈问题

#### 3. 偏好设置页面 (SettingsComponent)
- 独立组件，在 `src/SettingsCompontent/`
- ConfigProvider 统一主题色紫色 (#7c3aed)
- 两大功能：外观设置（主题/语言）+ 通知与隐私
- 底部有恢复默认和保存按钮

### 🎨 UI/UX 优化

#### 1. 统一的视觉风格
- **卡片标题统一** — 深紫色文字 + 淡紫背景 + 圆角边框，所有页面一个味儿
- **图标系统** — 页面标题用动态 Canvas 图标，卡片标题用 Ant Design 静态图标，动静分开不打架

#### 2. 组件样式分离
- 删掉所有内联 `<style>` 和 `style={{}}`，CSS 分离到独立文件
- 类名统一前缀：`.mascot-*`、`.sidebar-*`

#### 3. 交互细节优化
- **智能配音**：新增「热门推荐」分类带火焰图标、「自定义」分类
- **一句话克隆**：简化参数区，拖拽上传，加了移除按钮
- **设置页面**：「恢复默认」紫色按钮，Switch 组件统一紫色主题

#### 4. 路由系统
- 新增 `/settings` 路由
- 导航菜单和路由联动，点了就跳
- 无效路径自动重定向到 `/tts`

### 📁 目录结构调整

```
src/
├── components/           # 公共组件目录（新增）
│   ├── IconTTS.tsx      # 动态 Canvas 图标
│   ├── IconClone.tsx
│   ├── IconDesign.tsx
│   ├── IconSettings.tsx
│   ├── IconTTSStatic.tsx
│   ├── IconCloneStatic.tsx
│   ├── IconDesignStatic.tsx
│   ├── Mascot.tsx       # 智能助手
│   ├── Mascot.css
│   ├── SidebarMenu.tsx  # 侧边导航
│   └── SidebarMenu.css
├── SettingsCompontent/  # 设置页面（新增）
│   ├── index.tsx
│   └── index.css
├── TTSComponent/        # 智能配音
├── TTSComponentBeta/    # 一句话克隆
├── VoiceDesign/         # 声音设计
└── ...
```

### 🔧 技术改进

- **Canvas 动画系统** — 粒子、轨道光环、呼吸光晕，炫就完事了
- **主题色统一** — ConfigProvider 一把梭全紫
- **CSS 模块化** — 各管各的样式，不打架
- **代码规范化** — 删除所有内联样式，看着顺眼
