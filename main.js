const { app, BrowserWindow, shell, dialog, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const { spawn, fork } = require('child_process')
const http = require('http')

let mongoWorker = null

const isDev = process.env.NODE_ENV === 'development'
const SERVER_HOST = '127.0.0.1'
const SERVER_PORT = 8000
const STARTUP_TIMEOUT = 120000
const HEALTH_CHECK_INTERVAL = 500

let serverProcess = null
let mainWindow = null

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
  const url = `http://${SERVER_HOST}:${SERVER_PORT}/health`
  const start = Date.now()

  while (Date.now() - start < STARTUP_TIMEOUT) {
    const ok = await httpGet(url)
    if (ok) return
    await new Promise((r) => setTimeout(r, HEALTH_CHECK_INTERVAL))
  }

  throw new Error(`TTS 服务启动超时 (${STARTUP_TIMEOUT}ms)`)
}

async function unloadTTTModel() {
  const url = `http://${SERVER_HOST}:${SERVER_PORT}/model/unload`
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
  const url = `http://${SERVER_HOST}:${SERVER_PORT}/model/load`
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

function startServer() {
  console.log('[TTS] 启动服务:', serverExe)

  serverProcess = spawn(serverExe, [], {
    cwd: serverDir,
    env: {
      ...process.env,
      TTS_SERVE_PORT: String(SERVER_PORT),
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
  mongoWorker.send({ type: 'disconnect' })
  mongoWorker.kill()
  mongoWorker = null
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: '一个简单的配音工具',
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

function getCharacterDir(game, name) {
  const folder = GAME_FOLDER_MAP[game]
  if (!folder) return null
  return path.join(__dirname, 'characters', folder, name)
}

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
const MONGODB_URI = 'mongodb+srv://reader:ZR32pnCzJzxTq.S@cluster0.zjwm1on.mongodb.net/dubbing_chars'

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
  const destDir = path.join(__dirname, 'characters', '自定义', name)
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

// 自定义配音员：从 characters/自定义/ 恢复数据
ipcMain.handle('recover-custom-speakers', async () => {
  const customDir = path.join(__dirname, 'characters', '自定义')
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

app.whenReady().then(async () => {
  try {
    startServer()
    startMongoWorker()
    console.log('[TTS] 等待服务就绪...')
    await waitForServer()
    console.log('[TTS] 服务就绪')

    console.log('[TTS] 加载 Qwen3 TTS + ASR 模型...')
    await unloadTTTModel()
    const loaded = await loadTTTModel()
    if (!loaded) {
      console.error('[TTS] 模型加载失败')
    } else {
      console.log('[TTS] 模型加载完成')
    }
  } catch (err) {
    console.error('[TTS] 启动失败:', err.message)
  }

  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  stopServer()
  stopMongoWorker()
})
