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

      // グリッド間隔・ノードのズレ幅
      const spacing = 150
      const jitter = 35
      const cols = Math.ceil(w / spacing) + 1
      const rows = Math.ceil(h / spacing) + 1

      // ノード生成（グリッドをベースにランダムにズラす）
      const nodes: { x: number; y: number }[][] = []
      for (let r = 0; r < rows; r++) {
        nodes[r] = []
        for (let c = 0; c < cols; c++) {
          nodes[r][c] = {
            x: Math.max(0, Math.min(w, c * spacing + (Math.random() - 0.5) * jitter * 2)),
            y: Math.max(0, Math.min(h, r * spacing + (Math.random() - 0.5) * jitter * 2)),
          }
        }
      }

      // ラインを描画（端から端まで続く接続）
      ctx.lineWidth = 1

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const a = nodes[r][c]

          // 横方向（高確率でつなぐ → 画面を横断する流れを作る）
          if (c < cols - 1 && Math.random() > 0.15) {
            const b = nodes[r][c + 1]
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = 'rgba(132, 204, 22, 0.13)'
            ctx.stroke()
          }

          // 縦方向（やや間引く）
          if (r < rows - 1 && Math.random() > 0.3) {
            const b = nodes[r + 1][c]
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = 'rgba(132, 204, 22, 0.10)'
            ctx.stroke()
          }

          // 斜め方向（まばらに入れてルート感を出す）
          if (r < rows - 1 && c < cols - 1 && Math.random() > 0.78) {
            const b = nodes[r + 1][c + 1]
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = 'rgba(132, 204, 22, 0.08)'
            ctx.stroke()
          }
        }
      }

      // ノード（小さいドット）を描画
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const { x, y } = nodes[r][c]
          ctx.beginPath()
          ctx.arc(x, y, 1.8, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(132, 204, 22, 0.38)'
          ctx.fill()
        }
      }
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
