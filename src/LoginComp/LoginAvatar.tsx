import { useEffect, useRef } from 'react'

function LoginAvatar() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 44
    const cx = size / 2
    const cy = size / 2
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    let particles: { x: number; y: number; r: number; alpha: number; vx: number; vy: number; life: number; maxLife: number }[] = []
    let rings: { radius: number; alpha: number; speed: number }[] = []
    let animId = 0

    function isDark() {
      return document.documentElement.getAttribute('data-theme') === 'dark'
    }

    function drawBackground(time: number) {
      ctx!.clearRect(0, 0, size, size)
      const dark = isDark()
      const accent = dark ? '196, 181, 253' : '124, 58, 237'
      const accentLight = dark ? '167, 139, 250' : '167, 139, 250'

      // 中心发光点
      const pulse = 0.5 + Math.sin(time * 0.004) * 0.3
      const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 8)
      grad.addColorStop(0, dark ? 'rgba(196, 181, 253, 0.6)' : 'rgba(124, 58, 237, 0.5)')
      grad.addColorStop(0.5, `rgba(${accentLight}, ${0.15 * pulse})`)
      grad.addColorStop(1, `rgba(${accent}, 0)`)
      ctx!.fillStyle = grad
      ctx!.beginPath()
      ctx!.arc(cx, cy, 8, 0, Math.PI * 2)
      ctx!.fill()

      // 外圈
      const ringAlpha = 0.2 + Math.sin(time * 0.002) * 0.08
      ctx!.beginPath()
      ctx!.arc(cx, cy, 18, 0, Math.PI * 2)
      ctx!.strokeStyle = `rgba(${accent}, ${ringAlpha})`
      ctx!.lineWidth = 1
      ctx!.stroke()

      // 外外圈
      const outerAlpha = 0.1 + Math.sin(time * 0.003 + 1) * 0.05
      ctx!.beginPath()
      ctx!.arc(cx, cy, 21, 0, Math.PI * 2)
      ctx!.strokeStyle = `rgba(${accentLight}, ${outerAlpha})`
      ctx!.stroke()
    }

    function drawRings(time: number) {
      const dark = isDark()
      const accent = dark ? '167, 139, 250' : '124, 58, 237'

      // 定期生成新声波环
      if (Math.random() < 0.03) {
        rings.push({ radius: 4, alpha: 0.8, speed: 0.4 + Math.random() * 0.3 })
      }
      if (rings.length > 10) rings.shift()

      for (const ring of rings) {
        ring.radius += ring.speed
        ring.alpha -= 0.008
        if (ring.alpha <= 0) continue

        ctx!.beginPath()
        ctx!.arc(cx, cy, ring.radius, 0, Math.PI * 2)
        ctx!.strokeStyle = `rgba(${accent}, ${ring.alpha * 0.5})`
        ctx!.lineWidth = 1.5
        ctx!.stroke()
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
      if (Math.random() < 0.1) {
        // 粒子从中心向外扩散
        const angle = Math.random() * Math.PI * 2
        const speed = 0.2 + Math.random() * 0.4
        particles.push({
          x: cx + (Math.random() - 0.5) * 4,
          y: cy + (Math.random() - 0.5) * 4,
          r: Math.random() * 1.6 + 0.4,
          alpha: 1,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 40 + Math.random() * 60,
        })
      }
    }

    function frame(time: number) {
      drawBackground(time)
      drawRings(time)
      drawParticles()
      updateParticles()
      animId = requestAnimationFrame(frame)
    }

    animId = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <canvas ref={canvasRef} style={{ width: 44, height: 44, display: 'block', borderRadius: '50%' }} />
  )
}

export default LoginAvatar
