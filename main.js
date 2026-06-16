const { app, BrowserWindow } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
// import { app, BrowserWindow } from 'electron';
// import path from 'path';
// import { spawn } from 'child_process';

const isDev = process.env.NODE_ENV === 'development';
let serverProcess = null;

const serverPath = app.isPackaged
  ? path.join(process.resourcesPath, 'qwen_tts_server', 'qwen_tts_server')
  : path.join(__dirname, 'qwen_tts_server', 'qwen_tts_server');

function startServer() {
  serverProcess = spawn(serverPath, [], {
    stdio: 'ignore',
    env: { ...process.env },
  });
  serverProcess.on('error', (err) => {
    console.error('Failed to start QwenTTS server:', err.message);
  });
  serverProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.warn(`QwenTTS server exited with code ${code}`);
    }
  });
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    title: '一个简单的配音工具',
    width: 1400,
    height: 900,
    maxWidth: 1920,
    maxHeight: 1080,
    webPreferences: {
      nodeIntegration: false, 
      contextIsolation: true,
    },
  });

  if (isDev) {
    // 开发环境可以局域网访问，方便调试
    // win.loadURL('http://localhost:5173');
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
    win.webContents.openDevTools(); // 打开开发者工具
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
    win.setMenu(null); // 生产环境去掉菜单栏

  }
}

app.whenReady().then(() => {
  startServer();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  stopServer();
});

app.on('before-quit', () => {
  stopServer();
});
