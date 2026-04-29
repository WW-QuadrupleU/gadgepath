'use client'
import { useEffect, useRef } from 'react'

export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      const w = (canvas.width = window.innerWidth)
      const h = (canvas.height = document.body.scrollHeight)
      ctx.clearRect(0, 0, w, h)

      // ドット密度：画面の広さに応じて自動調整
      const count = Math.min(Math.floor((w * h) / 18000), 120)
      const dots: { x: number; y: number }[] = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
      }))

      const maxDist = 180

      // 線を描画（近いドット同士をつなぐ）
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x
          const dy = dots[i].y - dots[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.18
            ctx.beginPath()
            ctx.moveTo(dots[i].x, dots[i].y)
            ctx.lineTo(dots[j].x, dots[j].y)
            ctx.strokeStyle = `rgba(132, 204, 22, ${alpha})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      // ドットを描画
      dots.forEach((dot) => {
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(132, 204, 22, 0.35)'
        ctx.fill()
      })
    }

    draw()

    const handleResize = () => draw()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
