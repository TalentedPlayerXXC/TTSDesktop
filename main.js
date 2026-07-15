const { app, BrowserWindow, shell, dialog, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const { spawn, fork } = require('child_process')
const http = require('http')
const https = require('https')

let mongoWorker = null

const isDev = process.env.NODE_ENV === 'development'
const SERVER_HOST = '127.0.0.1'
const STARTUP_TIMEOUT = 120000
const HEALTH_CHECK_INTERVAL = 500

let serverProcess = null
let mainWindow = null
let ACTUAL_PORT = null

// 查找空闲端口
const net = require('net')
function findFreePort(start = 8000) {
  return new Promise((resolve) => {
    const tryPort = (port) => {
      const server = net.createServer()
      server.on('error', () => {
        if (port - start < 50) tryPort(port + 1)
        else resolve(null)
      })
      server.listen(port, '127.0.0.1', () => {
        server.close(() => resolve(port))
      })
    }
    tryPort(start)
  })
}

const serverDir = app.isPackaged
  ? path.join(process.resourcesPath, 'tts_serve_mlx')
  : path.join(__dirname, 'tts_serve_mlx')

const serverExe = path.join(serverDir, 'tts_serve_mlx')
const modelsDir = path.join(serverDir, 'models')

function httpGet(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode === 200)
    })
    req.on('error', () => resolve(false))
    req.setTimeout(2000, () => { req.destroy(); resolve(false) })
  })
}

async function waitForServer() {
  const url = `http://${SERVER_HOST}:${ACTUAL_PORT}/health`
  const start = Date.now()

  while (Date.now() - start < STARTUP_TIMEOUT) {
    const ok = await httpGet(url)
    if (ok) return
    await new Promise((r) => setTimeout(r, HEALTH_CHECK_INTERVAL))
  }

  throw new Error(`TTS 服务启动超时 (${STARTUP_TIMEOUT}ms)`)
}

async function unloadTTTModel() {
  const url = `http://${SERVER_HOST}:${ACTUAL_PORT}/model/unload`
  return new Promise((resolve) => {
    const data = JSON.stringify({ model: 'tts' })
    const req = http.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, (res) => {
      resolve(res.statusCode === 200)
    })
    req.on('error', () => resolve(false))
    req.write(data)
    req.end()
  })
}

async function loadTTTModel() {
  // 先卸载当前模型再加载，防止叠模型
  await unloadTTTModel()
  const url = `http://${SERVER_HOST}:${ACTUAL_PORT}/model/load`
  return new Promise((resolve) => {
    const data = JSON.stringify({ model: 'tts' })
    const req = http.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, (res) => {
      resolve(res.statusCode === 200)
    })
    req.on('error', () => resolve(false))
    req.write(data)
    req.end()
  })
}

async function startServer() {
  // 查找空闲端口
  const port = await findFreePort()
  if (!port) {
    console.error('[TTS] 无可用端口 (8000-8050 均被占用)')
    return
  }
  ACTUAL_PORT = port
  console.log('[TTS] 使用端口:', port)

  console.log('[TTS] 启动服务:', serverExe)

  serverProcess = spawn(serverExe, [], {
    cwd: serverDir,
    env: {
      ...process.env,
      TTS_SERVE_PORT: String(port),
      TTS_SERVE_HOST: SERVER_HOST,
      TTS_SERVE_LOG_LEVEL: 'warning',
      TTS_SERVE_MODELS_DIR: modelsDir,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  serverProcess.stdout.on('data', (data) => {
    console.log(`[TTS:out] ${data.toString().trim()}`)
  })
  serverProcess.stderr.on('data', (data) => {
    console.log(`[TTS:err] ${data.toString().trim()}`)
  })
  serverProcess.on('error', (err) => {
    console.error('[TTS] 进程错误:', err.message)
  })
  serverProcess.on('exit', (code) => {
    console.log(`[TTS] 进程退出, code=${code}`)
    serverProcess = null
  })
}

function stopServer() {
  if (!serverProcess) return

  console.log('[TTS] 正在关闭服务...')
  serverProcess.kill('SIGTERM')

  setTimeout(() => {
    if (serverProcess) {
      console.log('[TTS] 强制终止')
      serverProcess.kill('SIGKILL')
    }
  }, 5000)
}

// MongoDB Worker
const pendingReplies = new Map()
let replyIdCounter = 0

function startMongoWorker() {
  mongoWorker = fork(path.join(__dirname, 'mongo-worker.js'))

  mongoWorker.on('message', (data) => {
    if (data._replyId != null) {
      const resolve = pendingReplies.get(data._replyId)
      if (resolve) {
        pendingReplies.delete(data._replyId)
        resolve(data)
      }
    }
    if (data.type === 'connect') {
      console.log(`[Mongo] ${data.status === 'ok' ? '已连接' : '连接失败: ' + data.error}`)
    }
  })

  mongoWorker.on('exit', (code) => {
    console.log(`[Mongo] worker 退出, code=${code}`)
    mongoWorker = null
  })

  mongoWorker.on('error', (err) => {
    console.error('[Mongo] worker 错误:', err.message)
  })

  // 自动连接
  mongoWorker.send({ type: 'connect', uri: MONGODB_URI })
}

function stopMongoWorker() {
  if (!mongoWorker) return
  // 先发断开请求，等 1s 让 MongoDB 优雅断开
  mongoWorker.send({ type: 'disconnect' })
  setTimeout(() => {
    if (mongoWorker) {
      mongoWorker.kill()
      mongoWorker = null
    }
  }, 1000)
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: '绘声',
    width: 1400,
    height: 900,
    maxWidth: 1920,
    maxHeight: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev) {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'))
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'))
    mainWindow.setMenu(null)
  }
}

// 文件选择
ipcMain.handle('select-audio', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: '音频文件', extensions: ['mp3', 'wav', 'flac', 'ogg', 'm4a'] }],
  })
  if (result.canceled || result.filePaths.length === 0) return null
  const filePath = result.filePaths[0]
  const fileName = require('path').basename(filePath)
  return { filePath, fileName }
})

// 角色音频路径映射
const GAME_FOLDER_MAP = {
  '原神': '原神',
  '崩坏3': '崩坏3',
  '崩坏：星穹铁道': '星穹铁道',
  '绝区零': '绝区零',
  '鸣潮': '鸣潮',
  '🎨 自定义': '自定义',
}

const EMOTION_PATTERNS = [
  /^【(.+?)_.+?】/,
  /^(.+?)-/,
]

function parseEmotion(filename) {
  for (const pattern of EMOTION_PATTERNS) {
    const m = filename.match(pattern)
    if (m) return m[1]
  }
  return null
}

function getCharactersBase() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'characters')
    : path.join(__dirname, 'characters')
}

function getCustomSpeakersDir() {
  // 自定义配音员需要可写目录，打包后放 userData
  const base = app.isPackaged
    ? app.getPath('userData')
    : __dirname
  return path.join(base, 'characters', '自定义')
}

function getCharacterDir(game, name) {
  const folder = GAME_FOLDER_MAP[game]
  if (!folder) return null
  // 自定义配音员走可写目录，其他参考音频走资源目录
  if (game === '🎨 自定义') {
    return path.join(getCustomSpeakersDir(), name)
  }
  return path.join(getCharactersBase(), folder, name)
}

// ==================== 模型加载（主进程预载后通知渲染进程） ====================
let _startupModel = null

ipcMain.handle('get-startup-model', () => _startupModel)

// 暴露后端端口给渲染进程
ipcMain.handle('get-server-port', () => ACTUAL_PORT)

ipcMain.handle('get-characters-local', async () => {
  try {
    const jsonPath = app.isPackaged
      ? path.join(process.resourcesPath, 'characters.json')
      : path.join(__dirname, 'src', 'data', 'characters.json')
    const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
    // 兼容新旧格式：新格式有 { characters, tags }，旧格式是裸数组
    const data = Array.isArray(raw) ? raw : raw.characters
    const tags = Array.isArray(raw) ? [] : (raw.tags || [])
    return { status: 'ok', data, tags }
  } catch (err) {
    console.error('[TTS] 读取本地角色数据失败:', err.message)
    return { status: 'error', error: err.message }
  }
})

// 快速试听：读取角色第一个 .wav 文件返回 base64
ipcMain.handle('get-character-preview-audio', async (_event, { game, name }) => {
  const dir = getCharacterDir(game, name)
  if (!dir) return { status: 'error', error: '未知的游戏' }
  try {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.wav')).sort()
    if (files.length === 0) return { status: 'error', error: '无音频文件' }
    const filePath = path.join(dir, files[0])
    const buffer = fs.readFileSync(filePath)
    const base64 = buffer.toString('base64')
    return { status: 'ok', data: base64 }
  } catch (err) {
    return { status: 'error', error: err.message }
  }
})

ipcMain.handle('get-character-emotions', async (_event, { game, name }) => {
  const dir = getCharacterDir(game, name)
  if (!dir) return { status: 'error', error: '未知的游戏' }
  try {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.wav'))
    const emotions = [...new Set(files.map(f => parseEmotion(f)).filter(Boolean))]
    return { status: 'ok', data: emotions.length > 0 ? emotions : ['默认'] }
  } catch (err) {
    return { status: 'error', error: err.message }
  }
})

ipcMain.handle('get-character-path', async (_event, { game, name, emotion }) => {
  const dir = getCharacterDir(game, name)
  if (!dir) {
    console.log(`[TTS] getCharacterPath: 未知的游戏 game=${game} name=${name}`)
    return { status: 'error', error: '未知的游戏' }
  }
  try {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.wav'))
    if (files.length === 0) {
      console.log(`[TTS] getCharacterPath: 目录无文件 dir=${dir}`)
      return { status: 'error', error: '目录中没有音频文件' }
    }
    for (const f of files) {
      if (parseEmotion(f) === emotion) {
        return { status: 'ok', path: path.join(dir, f) }
      }
    }
    return { status: 'ok', path: path.join(dir, files[0]) }
  } catch (err) {
    console.log(`[TTS] getCharacterPath: 读取失败 dir=${dir} err=${err.message}`)
    return { status: 'error', error: err.message }
  }
})

// MongoDB 操作
const { MONGODB_URI } = require('./db')

function mongoCall(msg) {
  if (!mongoWorker) return Promise.resolve({ status: 'error', error: 'Mongo worker 未启动' })
  const replyId = ++replyIdCounter
  return new Promise((resolve) => {
    pendingReplies.set(replyId, resolve)
    mongoWorker.send({ ...msg, _replyId: replyId })
    setTimeout(() => {
      if (pendingReplies.delete(replyId)) {
        resolve({ status: 'error', error: '操作超时' })
      }
    }, 15000)
  })
}

ipcMain.handle('mongo-connect', async () => mongoCall({ type: 'connect', uri: MONGODB_URI }))
ipcMain.handle('mongo-get-characters', async () => mongoCall({ type: 'getCharacters' }))
ipcMain.handle('mongo-get-tags', async () => mongoCall({ type: 'getTags' }))

// 自定义配音员：迁移音频文件
ipcMain.handle('migrate-custom-speaker', async (_event, { name, sourceFilename, voiceType, temperament }) => {
  // PyInstaller 打包的二进制会把 api_output 放在 _internal/ 下
  const apiOutputDir = fs.existsSync(path.join(serverDir, 'api_output'))
    ? path.join(serverDir, 'api_output')
    : path.join(serverDir, '_internal', 'api_output')
  const src = path.join(apiOutputDir, sourceFilename)
  const destDir = path.join(getCustomSpeakersDir(), name)
  const destFile = path.join(destDir, `${name}.wav`)
  const metaFile = path.join(destDir, '.meta.json')

  try {
    if (!fs.existsSync(src)) return { status: 'error', error: '源文件不存在' }
    fs.mkdirSync(destDir, { recursive: true })
    fs.copyFileSync(src, destFile)
    // 写元数据文件，localStorage 丢了也能恢复（存绝对路径，最稳）
    fs.writeFileSync(metaFile, JSON.stringify({
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name,
      voiceType: voiceType || '',
      temperament: temperament || '',
      ref_audio: destFile,
      createdAt: new Date().toISOString(),
    }))
    return { status: 'ok', path: destFile }
  } catch (err) {
    return { status: 'error', error: err.message }
  }
})

// 自定义配音员：删除单个自定义角色（localStorage + 文件系统）
ipcMain.handle('delete-custom-speaker', async (_event, { name }) => {
  const speakerDir = path.join(getCustomSpeakersDir(), name)
  try {
    if (fs.existsSync(speakerDir)) {
      fs.rmSync(speakerDir, { recursive: true, force: true })
    }
    return { status: 'ok' }
  } catch (err) {
    return { status: 'error', error: err.message }
  }
})

// 自定义配音员：从 characters/自定义/ 恢复数据
ipcMain.handle('recover-custom-speakers', async () => {
  const customDir = getCustomSpeakersDir()
  try {
    if (!fs.existsSync(customDir)) return { status: 'ok', data: [] }
    const speakers = fs.readdirSync(customDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => {
        // 优先读 .meta.json
        const metaPath = path.join(customDir, d.name, '.meta.json')
        try {
          return JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
        } catch {
          // 没有 .meta.json 也兜个底（旧版迁移的配音员）——用绝对路径
          const wavPath = path.join(customDir, d.name, `${d.name}.wav`)
          return {
            id: `custom_recovered_${Date.now()}_${d.name}`,
            name: d.name,
            voiceType: '',
            temperament: '',
            ref_audio: wavPath,
            createdAt: new Date().toISOString(),
          }
        }
      })
      .filter(Boolean)
    return { status: 'ok', data: speakers }
  } catch (err) {
    return { status: 'error', error: err.message }
  }
})

// ==================== 模型下载（后端代理） ====================

ipcMain.handle('start-model-download', async (event, modelKey) => {
  try {
    const res = await fetch(`http://${SERVER_HOST}:${ACTUAL_PORT}/model/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelKey, source: 'modelscope' }),
    })
    return await res.json()
  } catch (e) {
    return { status: 'error', error: e.message }
  }
})

ipcMain.handle('get-download-status', async (event, modelKey) => {
  try {
    const res = await fetch(`http://${SERVER_HOST}:${ACTUAL_PORT}/model/download/status/${modelKey}`)
    return await res.json()
  } catch (e) {
    return { status: 'error', error: e.message }
  }
})

app.whenReady().then(async () => {
  try {
    await startServer()
    startMongoWorker()
    console.log('[TTS] 等待服务就绪...')
    await waitForServer()
    console.log('[TTS] 服务就绪')

    // 检查模型文件是否存在，不存在就跳过加载，交给 ModelDownload
    try {
      const infoRes = await fetch(`http://${SERVER_HOST}:${ACTUAL_PORT}/models-info`)
      const allInfo = await infoRes.json()
      const qwen = allInfo['qwenTTS_0.6B_MLX']
      if (qwen && qwen.downloaded) {
        console.log('[TTS] 模型文件已存在，加载 Qwen3 TTS 模型...')
        const loaded = await loadTTTModel()
        if (!loaded) {
          console.error('[TTS] 模型加载失败，渲染进程会按需重试')
        } else {
          console.log('[TTS] 模型加载完成')
          _startupModel = 'tts'
        }
      } else {
        console.log('[TTS] 模型文件不存在，跳过初始加载，等待 ModelDownload')
      }
    } catch (e) {
      console.error('[TTS] 检查模型状态失败，跳过初始加载:', e.message)
    }
  } catch (err) {
    console.error('[TTS] 服务启动失败:', err.message)
    console.log('[TTS] 渲染进程将以离线模式启动')
  }

  createWindow()
})

// macOS 关窗口 → 停掉后端服务，但保留进程（标准 macOS 行为）
// 其他平台 → 直接退出
app.on('window-all-closed', () => {
  stopServer()
  stopMongoWorker()
  if (process.platform !== 'darwin') app.quit()
})

// macOS 点击 Dock 图标 → 重启服务 + 重建窗口
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    startServer()
    startMongoWorker()
    createWindow()
  }
})

// 递归杀整个进程树（含 Python multiprocessing 子进程）
const { execSync } = require('child_process')
function killProcessTree(pid, signal = 'SIGKILL') {
  try {
    const out = execSync(`pgrep -P ${pid}`, { encoding: 'utf-8', timeout: 2000 }).trim()
    if (out) out.split('\n').filter(Boolean).forEach(c => killProcessTree(parseInt(c), signal))
  } catch (e) {
    if (e.status !== 1) console.error('[TTS] pgrep error:', e.message)
  }
  try { process.kill(pid, signal) } catch { /* 已死 */ }
}

// 应用退出——先 SIGTERM 让 Python 进程树优雅释放资源，再递归 SIGKILL
app.on('will-quit', (event) => {
  event.preventDefault()

  if (serverProcess) {
    serverProcess.kill('SIGTERM')
  }
  if (mongoWorker) {
    mongoWorker.kill('SIGTERM')
  }

  setTimeout(() => {
    if (serverProcess) {
      killProcessTree(serverProcess.pid)
      serverProcess = null
    }
    if (mongoWorker) {
      mongoWorker.kill('SIGKILL')
      mongoWorker = null
    }
    app.exit()
  }, 500)
})
