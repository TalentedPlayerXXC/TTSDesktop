const { app, BrowserWindow } = require('electron')
const fs = require('fs')
const path = require('path')

app.whenReady().then(async () => {
  const svg = fs.readFileSync(path.join(__dirname, '..', 'src', 'assets', 'favicon.svg'), 'utf-8')
  const html = `<!DOCTYPE html><html><body style="margin:0;background:transparent">${svg}</body></html>`

  const win = new BrowserWindow({ width: 1024, height: 1024, show: false, transparent: true, frame: false })
  await win.loadURL(`data:text/html;base64,${Buffer.from(html).toString('base64')}`)
  await new Promise(r => setTimeout(r, 800))

  const image = await win.capturePage()
  // 裁剪为正方形（取左上角）
  const size = Math.min(image.getSize().width, image.getSize().height)
  const cropped = image.crop({ x: 0, y: 0, width: size, height: size })
  fs.writeFileSync(path.join(__dirname, '..', 'build', 'icon.png'), cropped.toPNG())
  console.log(`icon.png generated`)
  app.quit()
})
