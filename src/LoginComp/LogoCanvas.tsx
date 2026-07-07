import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  r: number
  alpha: number
  vx: number
  vy: number
  life: number
  maxLife: number
}

function LogoCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = 160
    const h = 44
    const dpr = window.devicePixelRatio || 1
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.scale(dpr, dpr)

    let particles: Particle[] = []
    let animId = 0

    function spawnParticle() {
      if (particles.length > 30) return
      particles.push({
        x: 10 + Math.random() * 22,
        y: 6 + Math.random() * 28,
        r: Math.random() * 1.6 + 0.4,
        alpha: 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.3 - 0.2,
        life: 0,
        maxLife: 60 + Math.random() * 80,
      })
    }

    function isDark() {
      return document.documentElement.getAttribute('data-theme') === 'dark'
    }

    function drawBackground(time: number) {
      ctx!.clearRect(0, 0, w, h)
      const ringAlpha = 0.25 + Math.sin(time * 0.002) * 0.1
      const dark = isDark()
      const accent = dark ? '196, 181, 253' : '124, 58, 237'
      const accentLight = dark ? '167, 139, 250' : '167, 139, 250'

      ctx!.beginPath()
      ctx!.arc(19, 22, 13, 0, Math.PI * 2)
      ctx!.strokeStyle = `rgba(${accent}, ${ringAlpha})`
      ctx!.lineWidth = 1
      ctx!.stroke()
      ctx!.beginPath()
      ctx!.arc(19, 22, 13, 0, Math.PI * 2)
      ctx!.fillStyle = dark ? 'rgba(42, 42, 80, 0.4)' : 'rgba(245, 243, 255, 0.35)'
      ctx!.fill()

      ctx!.beginPath()
      ctx!.arc(19, 22, 16, 0, Math.PI * 2)
      const outerAlpha = 0.12 + Math.sin(time * 0.003 + 1) * 0.06
      ctx!.strokeStyle = `rgba(${accentLight}, ${outerAlpha})`
      ctx!.stroke()
    }

    function drawBars(time: number) {
      const bars = [6, 14, 22]
      const baseY = 28
      const phase = time * 0.004
      const dark = isDark()
      const accent = '167, 139, 250'

      for (let i = 0; i < bars.length; i++) {
        const hBar = bars[i] + Math.sin(phase + i * 1.2) * 4
        const x = 13 + i * 5.5
        const y = baseY - hBar
        const grad = ctx!.createLinearGradient(x, baseY, x, y)
        grad.addColorStop(0, dark
          ? `rgba(167, 139, 250, 0.5)`
          : `rgba(124, 58, 237, 0.4)`)
        grad.addColorStop(1, dark
          ? `rgba(196, 181, 253, ${0.85 + Math.sin(phase + i * 1.2) * 0.15})`
          : `rgba(124, 58, 237, ${0.85 + Math.sin(phase + i * 1.2) * 0.15})`)
        ctx!.fillStyle = grad
        roundRect(x, y, 2.5, hBar, 1.5)
      }
    }

    function roundRect(x: number, y: number, w: number, h: number, r: number) {
      r = Math.min(r, w / 2, h / 2)
      ctx!.beginPath()
      ctx!.moveTo(x + r, y)
      ctx!.lineTo(x + w - r, y)
      ctx!.arcTo(x + w, y, x + w, y + r, r)
      ctx!.lineTo(x + w, y + h - r)
      ctx!.arcTo(x + w, y + h, x + w - r, y + h, r)
      ctx!.lineTo(x + r, y + h)
      ctx!.arcTo(x, y + h, x, y + h - r, r)
      ctx!.lineTo(x, y + r)
      ctx!.arcTo(x, y + x, x + r, y, r)
      ctx!.closePath()
      ctx!.fill()
    }

    function drawText(time: number) {
      const glow = Math.sin(time * 0.002) * 0.15 + 0.85
      const dark = isDark()

      if (dark) {
        ctx!.fillStyle = 'rgba(167, 139, 250, 0.15)'
        ctx!.font = "400 28px 'Ma Shan Zheng', cursive, sans-serif"
        ctx!.fillText('方休', 43, 32)
        ctx!.fillStyle = `rgba(196, 181, 253, ${glow})`
        ctx!.fillText('方休', 42, 31)
      } else {
        ctx!.fillStyle = 'rgba(91, 33, 182, 0.12)'
        ctx!.font = "400 28px 'Ma Shan Zheng', cursive, sans-serif"
        ctx!.fillText('方休', 43, 32)
        ctx!.fillStyle = `rgba(91, 33, 182, ${glow})`
        ctx!.fillText('方休', 42, 31)
      }
    }

    function drawParticles() {
      const dark = isDark()
      const color = dark ? '196, 181, 253' : '139, 92, 246'
      for (const p of particles) {
        const progress = p.life / p.maxLife
        const fade = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${color}, ${fade * p.alpha})`
        ctx!.fill()
      }
    }

    function updateParticles() {
      particles = particles.filter(p => {
        p.x += p.vx
        p.y += p.vy
        p.life++
        return p.life <= p.maxLife
      })
    }

    function frame(time: number) {
      drawBackground(time)
      drawBars(time)
      drawText(time)
      drawParticles()
      updateParticles()
      if (Math.random() < 0.12) spawnParticle()
      animId = requestAnimationFrame(frame)
    }

    setTimeout(() => { for (let i = 0; i < 8; i++) spawnParticle() }, 200)
    animId = requestAnimationFrame(frame)

    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <canvas ref={canvasRef} style={{ width: 120, height: 33, display: 'block' }} />
  )
}

export default LogoCanvas
