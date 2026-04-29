'use client'
import { useEffect, useRef } from 'react'

interface Point { x: number; y: number }

// 左端から右端まで横断するパスを1本生成
// 水平に進みながら、途中で垂直にジョグする（回路トレース風）
function makePath(w: number, h: number): Point[] {
  const pts: Point[] = []
  let x = 0
  let y = 40 + Math.random() * (h - 80)
  pts.push({ x, y })

  while (x < w) {
    // 水平セグメント
    x = Math.min(w, x + 100 + Math.random() * 200)
    pts.push({ x, y })

    // 途中でランダムに垂直ジョグ（折れ曲がり）
    if (x < w && Math.random() > 0.45) {
      const jog = (Math.random() - 0.5) * 220
      y = Math.max(30, Math.min(h - 30, y + jog))
      pts.push({ x, y })
    }
  }
  return pts
}

// 上端から下端まで縦断するパスを1本生成
function makeVerticalPath(w: number, h: number): Point[] {
  const pts: Point[] = []
  let x = 40 + Math.random() * (w - 80)
  let y = 0
  pts.push({ x, y })

  while (y < h) {
    y = Math.min(h, y + 120 + Math.random() * 200)
    pts.push({ x, y })

    if (y < h && Math.random() > 0.5) {
      const jog = (Math.random() - 0.5) * 200
      x = Math.max(30, Math.min(w - 30, x + jog))
      pts.push({ x, y })
    }
  }
  return pts
}

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

      // 横断パス 5〜7本、縦断パス 2〜3本
      const hPaths = Array.from({ length: 5 + Math.floor(Math.random() * 3) }, () => makePath(w, h))
      const vPaths = Array.from({ length: 2 + Math.floor(Math.random() * 2) }, () => makeVerticalPath(w, h))
      const allPaths = [...hPaths, ...vPaths]

      allPaths.forEach(pts => {
        // ライン
        ctx.beginPath()
        ctx.moveTo(pts[0].x, pts[0].y)
        pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y))
        ctx.strokeStyle = 'rgba(132, 204, 22, 0.14)'
        ctx.lineWidth = 1
        ctx.stroke()

        // 折れ曲がり地点（中間ノード）に小さいドット
        pts.forEach((p, i) => {
          const isEndpoint = i === 0 || i === pts.length - 1
          ctx.beginPath()
          ctx.arc(p.x, p.y, isEndpoint ? 1.5 : 2.5, 0, Math.PI * 2)
          ctx.fillStyle = isEndpoint
            ? 'rgba(132, 204, 22, 0.25)'
            : 'rgba(132, 204, 22, 0.45)'
          ctx.fill()
        })
      })
    }

    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
