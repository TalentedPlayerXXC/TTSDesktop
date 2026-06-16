import { useEffect, useRef } from 'react'

function IconTTS() {
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

      const cx = 12
      const cy = 12
      const rings = [
        { r: 5, a: 0.3 + Math.sin(time * 0.003) * 0.15 },
        { r: 7.5, a: 0.4 + Math.sin(time * 0.003 + 1.2) * 0.2 },
        { r: 10, a: 0.25 + Math.sin(time * 0.003 + 2.4) * 0.12 },
      ]

      for (const ring of rings) {
        ctx!.beginPath()
        ctx!.arc(cx, cy, ring.r, Math.PI - 0.65, Math.PI + 0.65)
        ctx!.strokeStyle = `rgba(124, 58, 237, ${ring.a})`
        ctx!.lineWidth = 2
        ctx!.lineCap = 'round'
        ctx!.stroke()
      }

      ctx!.beginPath()
      ctx!.arc(cx, cy, 3, 0, Math.PI * 2)
      ctx!.fillStyle = '#7c3aed'
      ctx!.fill()

      id = requestAnimationFrame(frame)
    }

    id = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(id)
  }, [])

  return <canvas ref={ref} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
}

export default IconTTS
