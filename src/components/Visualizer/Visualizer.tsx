import { useEffect, useRef } from 'react'
import { audioEngine } from '../../audio/engine'
import './Visualizer.css'

const HEIGHT = 60
const LINE_COLOR = '#4ECDC4'
const FALLBACK_COLOR = '#2a2a3e'
const BG_COLOR = '#0f0f23'

/**
 * Continuous oscilloscope-style waveform showing the master audio output.
 * Reads time-domain data from a Strudel-managed AnalyserNode and draws it
 * to an HTML canvas via requestAnimationFrame.
 */
export function Visualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const bufferRef = useRef<Uint8Array | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Resize the canvas to match its CSS size with device pixel ratio for crisp lines
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)

    const draw = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight

      ctx.fillStyle = BG_COLOR
      ctx.fillRect(0, 0, w, h)

      // Subtle center line so silence still shows something
      ctx.strokeStyle = FALLBACK_COLOR
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, h / 2)
      ctx.lineTo(w, h / 2)
      ctx.stroke()

      const analyser = audioEngine.getMasterAnalyser()
      if (analyser) {
        // Allocate buffer once per analyser size
        const size = analyser.fftSize
        if (!bufferRef.current || bufferRef.current.length !== size) {
          bufferRef.current = new Uint8Array(size)
        }
        const buf = bufferRef.current
        analyser.getByteTimeDomainData(buf)

        ctx.strokeStyle = LINE_COLOR
        ctx.lineWidth = 2
        ctx.beginPath()
        for (let i = 0; i < buf.length; i++) {
          const x = (i / (buf.length - 1)) * w
          // 128 = silence; 0 and 255 = full negative/positive
          const v = buf[i] / 128 - 1
          const y = h / 2 + v * (h / 2) * 0.9
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div className="visualizer" style={{ height: HEIGHT }}>
      <canvas ref={canvasRef} className="visualizer-canvas" aria-hidden="true" />
    </div>
  )
}
