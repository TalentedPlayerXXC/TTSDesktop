import { useEffect, useRef } from 'react'

function IconClone() {
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

      const lx = 6
      const rx = 18
      const y = 12

      ctx!.beginPath()
      ctx!.arc(lx, y, 3.5, 0, Math.PI * 2)
      ctx!.fillStyle = '#7c3aed'
      ctx!.fill()

      ctx!.beginPath()
      ctx!.arc(rx, y, 3.5, 0, Math.PI * 2)
      const flash = Math.sin(time * 0.004) * 0.25 + 0.5
      ctx!.fillStyle = `rgba(124, 58, 237, ${flash})`
      ctx!.strokeStyle = `rgba(124, 58, 237, ${0.3 + flash * 0.5})`
      ctx!.lineWidth = 1.5
      ctx!.stroke()
      ctx!.fill()

      const cx = lx + 4.5
      const waveOffset = (time * 0.06) % 7

      for (let i = 0; i < 3; i++) {
        const wx = cx + i * 1.8 + waveOffset
        if (wx > rx - 4) continue
        const waveAlpha = 0.15 + Math.sin(wx * 2 + time * 0.01) * 0.1
        ctx!.fillStyle = `rgba(124, 58, 237, ${waveAlpha})`
        ctx!.fillRect(wx, y - 1, 1.2, 2)
      }

      id = requestAnimationFrame(frame)
    }

    id = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(id)
  }, [])

  return <canvas ref={ref} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
}

export default IconClone
