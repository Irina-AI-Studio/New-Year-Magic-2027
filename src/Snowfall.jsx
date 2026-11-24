import { memo, useEffect, useRef } from 'react'

export const Snowfall = memo(function Snowfall({ burst, reduced }) {
  const canvas = useRef(null)

  useEffect(() => {
    const surface = canvas.current
    const ctx = surface.getContext('2d')
    if (!ctx) return
    let width, height, frame, last
    let snow = []
    let sparks = []
    const sprite = document.createElement('canvas')
    sprite.width = sprite.height = 32
    const brush = sprite.getContext('2d')
    const gradient = brush.createRadialGradient(16, 16, 0, 16, 16, 16)
    gradient.addColorStop(0, '#fff8eb')
    gradient.addColorStop(.35, 'rgba(230,239,255,.68)')
    gradient.addColorStop(1, 'rgba(230,239,255,0)')
    brush.fillStyle = gradient
    brush.fillRect(0, 0, 32, 32)

    function resize() {
      width = surface.clientWidth
      height = surface.clientHeight
      const dpr = Math.min(devicePixelRatio || 1, 2)
      surface.width = width * dpr
      surface.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      snow = Array.from({ length: width < 600 ? 58 : 135 }, (_, index) => {
        const layer = index % 3
        return {
          x: Math.random() * width, y: Math.random() * height, phase: Math.random() * Math.PI * 2,
          layer, radius: ([.65, 1.3, 4][layer]) * (.55 + Math.random() * .75),
          speed: [12, 23, 37][layer] * (.75 + Math.random() * .65),
          opacity: [.37, .65, .44][layer] * (.35 + Math.random() * .65),
        }
      })
      draw(0)
    }

    function draw(dt) {
      ctx.clearRect(0, 0, width, height)
      for (const flake of snow) {
        flake.phase += dt * .65
        flake.x += (5 + Math.sin(flake.phase) * 13) * dt
        flake.y += flake.speed * dt
        if (flake.y > height + 8) { flake.y = -8; flake.x = Math.random() * width }
        if (flake.x > width + 8) flake.x = -8
        if (flake.x < -8) flake.x = width + 8
        const r = flake.radius
        ctx.globalAlpha = flake.opacity
        if (flake.layer === 2) ctx.drawImage(sprite, flake.x - r, flake.y - r, r * 2, r * 2)
        else {
          ctx.fillStyle = '#f6f3ec'
          ctx.beginPath()
          ctx.arc(flake.x, flake.y, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      sparks = sparks.filter(particle => particle.life > 0)
      for (const particle of sparks) {
        particle.life -= dt
        particle.x += particle.vx * dt
        particle.y += particle.vy * dt
        particle.vy += 31 * dt
        ctx.globalAlpha = Math.max(0, Math.min(1, particle.life * 1.15))
        ctx.fillStyle = particle.color
        ctx.shadowColor = '#fab955'
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
    }

    function tick(now) {
      draw(last ? Math.min((now - last) / 1000, .04) : 0)
      last = now
      frame = requestAnimationFrame(tick)
    }

    function sync() {
      cancelAnimationFrame(frame)
      last = 0
      if (!document.hidden && !reduced) frame = requestAnimationFrame(tick)
    }

    burst.current = (x, y, count, spread = 0) => {
      if (reduced) return
      const bounds = surface.getBoundingClientRect()
      x -= bounds.left
      y -= bounds.top
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 16 + Math.random() * 91
        sparks.push({
          x: x + (Math.random() - .5) * spread, y: y + (Math.random() - .5) * spread * 1.3,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 12,
          r: .65 + Math.random() * 1.35, life: 1 + Math.random() * .85,
          color: i % 3 ? '#e8b85d' : '#fff0c4',
        })
      }
      sparks = sparks.slice(-350)
    }

    resize()
    sync()
    const observer = new ResizeObserver(resize)
    observer.observe(surface)
    document.addEventListener('visibilitychange', sync)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
      burst.current = null
    }
  }, [burst, reduced])

  return <canvas ref={canvas} className="snowfall" aria-hidden="true" />
})
