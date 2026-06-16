import { useEffect, useRef } from 'react'

function IconSettings() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const s = 24
    c.width = s * dpr
    c.height = s * dpr
    c.style.width = `${s}px`
    c.style.height = `${s}px`
    ctx.scale(dpr, dpr)

    let id = 0

    function frame(time: number) {
      ctx.clearRect(0, 0, s, s)

      const cx = s / 2
      const cy = s / 2
      const rotation = time * 0.002

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(rotation)

      // 绘制齿轮齿
      const teeth = 6
      const outerR = 9
      const innerR = 7

      ctx.beginPath()
      for (let i = 0; i < teeth * 2; i++) {
        const angle = (i / (teeth * 2)) * Math.PI * 2
        const r = i % 2 === 0 ? outerR : innerR
        const x = Math.cos(angle) * r
        const y = Math.sin(angle) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()

      const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, outerR)
      grad.addColorStop(0, 'rgba(167, 139, 250, 0.9)')
      grad.addColorStop(1, 'rgba(124, 58, 237, 0.7)')
      ctx.fillStyle = grad
      ctx.fill()

      // 中心孔
      ctx.beginPath()
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(124, 58, 237, 0.2)'
      ctx.fill()

      ctx.restore()

      id = requestAnimationFrame(frame)
    }

    id = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(id)
  }, [])

  return <canvas ref={ref} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
}

export default IconSettings
