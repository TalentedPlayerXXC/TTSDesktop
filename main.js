const { app, BrowserWindow, shell } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const http = require('http')

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

function createWindow() {
  mainWindow = new BrowserWindow({
    title: '一个简单的配音工具',
    width: 1400,
    height: 900,
    maxWidth: 1920,
    maxHeight: 1080,
    webPreferences: {
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

app.whenReady().then(async () => {
  try {
    startServer()
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
  stopServer()
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  stopServer()
})

app.on('before-quit', () => {
  stopServer()
})
