# 绘声 v1.1 代码审查报告

**审查日期：** 2026-07-16  
**总体评分：C — 可用但存在结构性问题**

---

## 🔴 严重

### S1 — MongoDB 凭据硬编码

**文件：** `db.js:1`

```js
const MONGODB_URI = 'mongodb+srv://reader:***@cluster0.zjwm1on.mongodb.net/dubbing_chars'
```

生产环境的 MongoDB Atlas URI 编码在源代码中。虽然 `.gitignore` 排除了 `db.js`，但凭据暴露在打包后的 Electron 应用中（二进制可提取）。

### S2 — 生产环境 DevTools 可能暴露

**文件：** `main.js:208`

```js
if (isDev) {
    mainWindow.loadFile(...)
    mainWindow.webContents.openDevTools()
} else {
    mainWindow.loadFile(...)
    mainWindow.setMenu(null)
}
```

两分支都执行 `loadFile`，但 `isDev` 的判断只依赖 `NODE_ENV` 环境变量。攻击者可以通过启动时设置 `NODE_ENV=development` 开启 DevTools。

---

## 🟡 警告

### W1 — TTSComponent 组件过大

**文件：** `TTSComponent/index.tsx`（1051 行）

单人配音、多人配音、情感配音三种模式全部塞在一个组件里，包含大量重复的 JSX（角色列表在单人模式和多人模式下几乎完全相同）。建议拆分为 `SingleMode`、`MultiMode`、`EmotionMode` 子组件。

### W2 — 重复的 Service 层文件

| 文件 | 用途 |
|------|------|
| `services/index.tsx` | 基于 `fetch_request.tsx` 的 `qwens`（fetch 实现） |
| `services/index_fetch.tsx` | 几乎与 `index.tsx` 相同，使用自己的 `qwens` |
| `services/request.tsx` | 基于 Axios 的 `qwens` 实例 |
| `services/fetch_request.tsx` | 基于 `fetch()` 的 `qwens` 工厂 |

**问题：** 四个文件定义了 2–3 个名叫 `qwens` 的不同 HTTP 客户端。动态端口更新仅影响 Axios 版（`request.tsx`），却从未应用到实际使用的 fetch 客户端。`getOutputUrl()` 在 `index.tsx` 中动态取端口，但在 `index_fetch.tsx` 中硬编码 `localhost:8000`。

### W3 — 大量 `any` 类型滥用

**文件：** 全项目，以 `TTSComponent/index.tsx` 为最

- 所有 `electronAPI` 调用的返回类型都是 `any`
- `vite-env.d.ts` 虽声明了 `ElectronAPI` 和 `Window` 接口，但并未被引用——代码全部使用 `(window as any).electronAPI`
- 类型系统形同虚设，重构时无编译时检查

### W4 — index.html 引用错误的入口文件

**文件：** `index.html`

```html
<script type="module" src="/src/main.jsx"></script>
```

实际文件是 `/src/main.tsx`（`.tsx` 扩展名）。虽因 Vite 的智能解析可能正常工作，但不规范。

### W5 — 过期文档与实际实现不符

**文件：** `ELECTRON_INTEGRATION.md`

- 文档使用单端口 8000，实际代码动态分配端口（`findFreePort()`）
- 文档直接 `loadModel('tts')`，实际代码先查 `/models-info` 再决定是否加载
- 文档窗口 `1200×800`，实际代码 `1400×900`

### W6 — useEffect 依赖数组不完整

**文件：** `TTSComponent/index.tsx:262`

```tsx
useEffect(() => {
    // 大量副作用，引用了 characters、tags 等外部变量
}, [])  // ← 空依赖数组
```

组件挂载后不会重新获取数据，某些场景下可能无法正确刷新。

### W7 — will-quit 事件处理有风险

**文件：** `main.js:will-quit`

`event.preventDefault()` 取消默认退出，但 500ms 后直接 `app.exit()` 强制终止。如果优雅关闭需要更长时间，500ms 不够。

### W8 — 文件名规范问题

- `src/SettingsCompontent/` — 「Compontent」拼写错误（应为「Component」）
- `src/AudioRecorder/` — 组件未在任何地方导入
- `react.svg` — 存在于根目录但未使用

### W9 — 拖拽上传存在安全风险

**文件：** `SoundWorkshop/index.tsx:320`

仅检查后缀名和 MIME 类型中的 "audio" 字样，未验证文件签名，可能被绕过。

### W10 — 字体/代理配置

- `index.html` 引用 Google Fonts，若用户无法访问则字体不显示
- `vite.config.js` 中代理端口（9880, 8000）与实际运行时动态端口不一致

---

## 🔵 建议

### N1 — AudioRecorder 组件被遗弃

`src/AudioRecorder/index.tsx` 未被任何模块引用，只有一个空壳，建议清理或完成实现。

### N2 — 服务索引重复

`services/index_fetch.tsx` 和 `services/fetch_request.tsx` 如果未被使用，应删除。

### N3 — util.tsx 中 base64ToBlob 可能未使用

搜索未发现导入引用，可能是上轮重构的遗留产物。

### N4 — 角色数据获取链过于复杂

数据流：本地 JSON → MongoDB（两种来源）→ 自定义 localStorage → 文件系统恢复，在多个嵌套 `setTimeout` 和 `.catch()` 中处理。建议使用 `useReducer` 或 React Query 统一管理。

### N5 — 用户代理嗅探不推荐

在 4 个服务文件中重复出现：
```tsx
const isElectron = navigator.userAgent.toLowerCase().includes('electron')
```
Electron 32+ 可能修改了 UA 字符串。建议使用 `window.electronAPI` 的存在性检测替代。

### N6 — Canvas 动画清理不完整

`LoginAvatar.tsx`、`LogoCanvas.tsx`、`SidebarMenu.tsx` 的 `particles` 和 `rings` 数组在 unmount 后仍存在于闭包中，快速挂载/卸载时可能多个动画帧同时运行。

### N7 — preload.js 暴露了过多 IPC

暴露了 12 个方法，其中 `mongo` 相关方法、`migrateCustomSpeaker`、`recoverCustomSpeakers` 可能更适合在主进程侧处理。

### N8 — SoundWorkshop AudioContext 未关闭

每次上传新文件时调用 `Tone.start()`，但组件 unmount 时 AudioContext 没有被显式关闭。

### N9 — electron-builder 配置

`files` 数组未显式包含 `node_modules`，如果依赖需要原生模块可能会失败。

### N10 — 拼写错误

- `unloadTTTModel()` / `loadTTTModel()` — 「TTT」应为「TTS」
- `SettingsCompontent` 文件夹名拼错
- `Mascot.tsx` 中部分命名混乱

---

## 总体评估

| 维度 | 评分 | 说明 |
|:-----|:----:|:------|
| **安全性** | C | MongoDB 凭据硬编码；凭据暴露在打包的二进制文件中 |
| **架构** | C | 重复的服务层、1051 行超大组件、数据流复杂难追踪 |
| **TypeScript 质量** | C- | 大量 `any`、声明的接口未使用、实类型形同虚设 |
| **React 质量** | B- | 未 split 的大组件、useEffect 依赖管理不佳 |
| **Electron 集成** | B | 子进程管理合理、动态端口正确、killProcessTree 设计良好 |
| **代码维护性** | D | 重复代码多、未使用文件残留、文档过期、拼写错误 |
| **构建** | B- | 配置基本正确，但 index.html 入口引用有误 |

**一句话总结：** 核心功能能用，但藏着不少屎山——重复的服务层、1051 行的大组件、硬编码凭据、`any` 满天飞。功能迭代前建议来一轮中度重构 🚀
