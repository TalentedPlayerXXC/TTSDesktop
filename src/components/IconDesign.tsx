import { useEffect, useRef } from 'react'

function IconDesign() {
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
      ctx!.clearRect(0, 0, s, s)

      const barW = 2.4
      const gap = 1.6
      const x0 = 4
      const baseY = 20
      const minH = 4
      const maxH = 16
      const count = 5

      for (let i = 0; i < count; i++) {
        const phase = time * 0.003 + i * 0.9
        const h = minH + ((Math.sin(phase) + 1) / 2) * (maxH - minH)
        const x = x0 + i * (barW + gap)
        const y = baseY - h
        const grad = ctx!.createLinearGradient(x, baseY, x, y)
        const alpha = 0.45 + (h / maxH) * 0.55
        grad.addColorStop(0, `rgba(124, 58, 237, ${alpha * 0.3})`)
        grad.addColorStop(1, `rgba(124, 58, 237, ${alpha})`)
        ctx!.fillStyle = grad
        roundRect(ctx!, x, y, barW, h, 1.2)

        ctx!.beginPath()
        ctx!.arc(x + barW / 2, y + 1, 1.6, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(167, 139, 250, ${alpha})`
        ctx!.fill()
      }

      id = requestAnimationFrame(frame)
    }

    function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
      r = Math.min(r, w / 2, h / 2)
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y)
      ctx.arcTo(x + w, y, x + w, y + r, r)
      ctx.lineTo(x + w, y + h - r)
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
      ctx.lineTo(x + r, y + h)
      ctx.arcTo(x, y + h, x, y + h - r, r)
      ctx.lineTo(x, y + r)
      ctx.arcTo(x, y, x + r, y, r)
      ctx.closePath()
      ctx.fill()
    }

    id = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(id)
  }, [])

  return <canvas ref={ref} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
}

export default IconDesign
