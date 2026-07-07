import { useEffect, useRef, useState } from 'react'
import './SidebarMenu.css'

interface MenuItem {
  key: string
  label: string
}

const menuItems: MenuItem[] = [
  { key: '/tts', label: '智能配音' },
  { key: '/tts-beta', label: '一句话克隆' },
  { key: '/voice-design', label: '声音设计' },
  { key: '/settings', label: '偏好设置' },
]

// 粒子类
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  life: number
  maxLife: number
  color: string
}

// 旋转光环轨道
interface OrbitRing {
  radius: number
  angle: number
  speed: number
  alpha: number
  color: string
}

function drawMicrophoneIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  time: number,
  isActive: boolean,
  isHovered: boolean
) {
  const pulse = 1 + Math.sin(time * 0.004) * 0.03
  const hoverScale = isHovered ? 1.08 : 1
  const scale = size * pulse * hoverScale

  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)

  // 麦克风主体 - 圆角矩形
  const grad = ctx.createLinearGradient(0, -12, 0, 12)
  if (isActive) {
    grad.addColorStop(0, '#f59e0b')
    grad.addColorStop(1, '#d97706')
  } else {
    grad.addColorStop(0, '#c4b5fd')
    grad.addColorStop(1, '#8b5cf6')
  }

  ctx.beginPath()
  ctx.roundRect(-5, -10, 10, 16, 5)
  ctx.fillStyle = grad
  ctx.fill()

  // 麦克风支架
  ctx.strokeStyle = isActive ? '#f59e0b' : '#8b5cf6'
  ctx.lineWidth = 1.8
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(0, 6)
  ctx.lineTo(0, 12)
  ctx.stroke()

  // U型底座
  ctx.beginPath()
  ctx.arc(0, 12, 6, 0, Math.PI, false)
  ctx.stroke()

  // 两侧竖线
  ctx.beginPath()
  ctx.moveTo(-6, 8)
  ctx.lineTo(-6, 12)
  ctx.moveTo(6, 8)
  ctx.lineTo(6, 12)
  ctx.stroke()

  ctx.restore()
}

function drawDNAIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  time: number,
  isActive: boolean,
  isHovered: boolean
) {
  const pulse = 1 + Math.sin(time * 0.004) * 0.03
  const hoverScale = isHovered ? 1.08 : 1
  const scale = size * pulse * hoverScale

  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)

  const points = 8
  const amplitude = 6
  const speed = time * 0.003

  // 绘制双螺旋
  for (let strand = 0; strand < 2; strand++) {
    ctx.beginPath()
    ctx.strokeStyle = isActive ? '#f59e0b' : '#8b5cf6'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'

    for (let i = 0; i <= points; i++) {
      const t = (i / points) * Math.PI * 2
      const y = -12 + (i / points) * 24
      const phase = strand === 0 ? 0 : Math.PI
      const x = Math.sin(t + speed + phase) * amplitude

      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  // 连接横线
  for (let i = 0; i <= points; i += 2) {
    const t = (i / points) * Math.PI * 2
    const y = -12 + (i / points) * 24
    const x1 = Math.sin(t + speed) * amplitude
    const x2 = Math.sin(t + speed + Math.PI) * amplitude

    ctx.beginPath()
    ctx.strokeStyle = isActive ? 'rgba(245, 158, 11, 0.4)' : 'rgba(139, 92, 246, 0.4)'
    ctx.lineWidth = 1.2
    ctx.moveTo(x1, y)
    ctx.lineTo(x2, y)
    ctx.stroke()
  }

  ctx.restore()
}

function drawPaletteIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  time: number,
  isActive: boolean,
  isHovered: boolean
) {
  const pulse = 1 + Math.sin(time * 0.004) * 0.03
  const hoverScale = isHovered ? 1.08 : 1
  const scale = size * pulse * hoverScale

  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)

  // 调色板主体
  ctx.beginPath()
  ctx.ellipse(0, 0, 14, 11, 0, 0, Math.PI * 2)
  const grad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 14)
  if (isActive) {
    grad.addColorStop(0, '#fde68a')
    grad.addColorStop(1, '#f59e0b')
  } else {
    grad.addColorStop(0, '#c4b5fd')
    grad.addColorStop(1, '#7c3aed')
  }
  ctx.fillStyle = grad
  ctx.fill()

  // 颜料点
  const colors = isActive
    ? ['#d97706', '#dc2626', '#2563eb', '#059669']
    : ['#7c3aed', '#db2777', '#0891b2', '#ea580c']

  const paintPositions = [
    [-7, -4],
    [7, -4],
    [-7, 4],
    [7, 4],
  ]

  paintPositions.forEach(([px, py], i) => {
    const wobble = Math.sin(time * 0.005 + i) * 0.5
    ctx.beginPath()
    ctx.arc(px + wobble, py, 2.2, 0, Math.PI * 2)
    ctx.fillStyle = colors[i]
    ctx.fill()
  })

  // 拇指孔
  ctx.beginPath()
  ctx.arc(0, 0, 3, 0, Math.PI * 2)
  ctx.fillStyle = isActive ? 'rgba(245, 158, 11, 0.3)' : 'rgba(167, 139, 250, 0.3)'
  ctx.fill()

  ctx.restore()
}

function drawSettingsIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  time: number,
  isActive: boolean,
  isHovered: boolean
) {
  const pulse = 1 + Math.sin(time * 0.004) * 0.03
  const hoverScale = isHovered ? 1.08 : 1
  const scale = size * pulse * hoverScale
  const rotation = time * 0.001

  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)
  ctx.rotate(rotation)

  // 齿轮主体
  const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, 14)
  if (isActive) {
    grad.addColorStop(0, '#fde68a')
    grad.addColorStop(1, '#d97706')
  } else {
    grad.addColorStop(0, '#c4b5fd')
    grad.addColorStop(1, '#7c3aed')
  }

  // 绘制齿轮齿
  const teeth = 8
  const outerR = 13
  const innerR = 10

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
  ctx.fillStyle = grad
  ctx.fill()

  // 中心孔
  ctx.beginPath()
  ctx.arc(0, 0, 5, 0, Math.PI * 2)
  ctx.fillStyle = isActive ? 'rgba(245, 158, 11, 0.3)' : 'rgba(124, 58, 237, 0.3)'
  ctx.fill()

  ctx.restore()
}

function SidebarCanvas({
  item,
  isActive,
  onClick,
}: {
  item: MenuItem
  isActive: boolean
  onClick: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const particlesRef = useRef<Particle[]>([])
  const orbitRingsRef = useRef<OrbitRing[]>([])
  const lastSpawnTimeRef = useRef(0)

  // 初始化轨道环
  useEffect(() => {
    if (isActive) {
      orbitRingsRef.current = [
        { radius: 24, angle: 0, speed: 0.015, alpha: 0.5, color: 'rgba(245, 158, 11, 0.5)' },
        { radius: 28, angle: Math.PI / 3, speed: -0.01, alpha: 0.4, color: 'rgba(251, 191, 36, 0.4)' },
        { radius: 32, angle: (Math.PI * 2) / 3, speed: 0.008, alpha: 0.3, color: 'rgba(217, 119, 6, 0.3)' },
      ]
    } else if (item.key === '/settings') {
      // 设置按钮默认也有轨道环，但用紫色
      orbitRingsRef.current = [
        { radius: 24, angle: 0, speed: 0.012, alpha: 0.35, color: 'rgba(139, 92, 246, 0.35)' },
        { radius: 28, angle: Math.PI / 2, speed: -0.008, alpha: 0.25, color: 'rgba(167, 139, 250, 0.25)' },
      ]
    } else {
      orbitRingsRef.current = [
        { radius: 24, angle: 0, speed: 0.012, alpha: 0.35, color: 'rgba(139, 92, 246, 0.35)' },
        { radius: 28, angle: Math.PI / 2, speed: -0.008, alpha: 0.25, color: 'rgba(167, 139, 250, 0.25)' },
      ]
    }
  }, [isActive, item.key])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const size = 52
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    let animId: number

    function frame(time: number) {
      ctx.clearRect(0, 0, size, size)

      const cx = size / 2
      const cy = size / 2

      // 背景光晕
      const glowSize = 22 + Math.sin(time * 0.003) * 2
      const glowGrad = ctx.createRadialGradient(cx, cy, 8, cx, cy, glowSize)
      if (isActive) {
        glowGrad.addColorStop(0, 'rgba(245, 158, 11, 0.35)')
        glowGrad.addColorStop(0.6, 'rgba(217, 119, 6, 0.15)')
        glowGrad.addColorStop(1, 'rgba(217, 119, 6, 0)')
      } else {
        glowGrad.addColorStop(0, 'rgba(124, 58, 237, 0.3)')
        glowGrad.addColorStop(0.6, 'rgba(109, 40, 217, 0.12)')
        glowGrad.addColorStop(1, 'rgba(109, 40, 217, 0)')
      }
      ctx.beginPath()
      ctx.arc(cx, cy, glowSize, 0, Math.PI * 2)
      ctx.fillStyle = glowGrad
      ctx.fill()

      // 生成粒子
      if (time - lastSpawnTimeRef.current > (isHovered ? 80 : 200)) {
        const angle = Math.random() * Math.PI * 2
        const dist = 18 + Math.random() * 8
        particlesRef.current.push({
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3 - 0.2,
          r: Math.random() * 1.2 + 0.5,
          life: 0,
          maxLife: 40 + Math.random() * 30,
          color: isActive
            ? `rgba(245, 158, 11, ${0.5 + Math.random() * 0.3})`
            : `rgba(139, 92, 246, ${0.4 + Math.random() * 0.3})`,
        })
        lastSpawnTimeRef.current = time
      }

      // 更新和绘制粒子
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx
        p.y += p.vy
        p.life++
        const progress = p.life / p.maxLife
        const alpha = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${alpha * 0.6})`)
        ctx.fill()

        return p.life <= p.maxLife
      })

      // 绘制旋转轨道光环
      orbitRingsRef.current.forEach((ring) => {
        ring.angle += ring.speed

        // 计算椭圆轨道上的焦点位置
        const focusX = cx + Math.cos(ring.angle) * 3
        const focusY = cy + Math.sin(ring.angle) * 2

        ctx.beginPath()
        ctx.ellipse(focusX, focusY, ring.radius, ring.radius * 0.85, ring.angle * 0.3, 0, Math.PI * 2)
        ctx.strokeStyle = ring.color
        ctx.lineWidth = 1.2
        ctx.stroke()

        // 在轨道上绘制一个亮点
        const dotAngle = ring.angle * 2
        const dotX = focusX + Math.cos(dotAngle) * ring.radius
        const dotY = focusY + Math.sin(dotAngle) * ring.radius * 0.85
        ctx.beginPath()
        ctx.arc(dotX, dotY, 1.8, 0, Math.PI * 2)
        ctx.fillStyle = ring.color.replace(/[\d.]+\)$/, '0.8)')
        ctx.fill()
      })

      // 绘制图标
      switch (item.key) {
        case '/tts':
          drawMicrophoneIcon(ctx, cx, cy, 0.75, time, isActive, isHovered)
          break
        case '/tts-beta':
          drawDNAIcon(ctx, cx, cy, 0.7, time, isActive, isHovered)
          break
        case '/voice-design':
          drawPaletteIcon(ctx, cx, cy, 0.72, time, isActive, isHovered)
          break
        case '/settings':
          drawSettingsIcon(ctx, cx, cy, 0.7, time, isActive, isHovered)
          break
      }

      animId = requestAnimationFrame(frame)
    }

    animId = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(animId)
  }, [isActive, isHovered, item.key])

  return (
    <div
      className='sidebar-canvas-wrapper'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <canvas ref={canvasRef} />
      <div className='sidebar-tooltip'>{item.label}</div>
    </div>
  )
}

interface SidebarMenuProps {
  currentPath: string
  onNavigate: (path: string) => void
}

function SidebarMenu({ currentPath, onNavigate }: SidebarMenuProps) {
  return (
    <div className='sidebar-menu-container'>
      {menuItems.map((item) => (
        <SidebarCanvas
          key={item.key}
          item={item}
          isActive={currentPath === item.key}
          onClick={() => onNavigate(item.key)}
        />
      ))}
    </div>
  )
}

export default SidebarMenu
