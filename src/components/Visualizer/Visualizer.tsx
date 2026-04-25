import { useEffect, useRef } from 'react'
import { audioEngine } from '../../audio/engine'
import './Visualizer.css'

const HEIGHT = 70
const WAVE_COLOR = '#4ECDC4'
const PLAYHEAD_COLOR = '#fff'
const CENTER_LINE_COLOR = '#2a2a3e'
const BG_COLOR = '#0f0f23'

interface PeakSample {
  min: number // -1..0
  max: number // 0..1
}

/**
 * Scrolling waveform timeline (Audacity/Premiere style).
 *
 * Each animation frame, sample the master analyser, compute min/max amplitude
 * across the current buffer, and append to a circular history buffer. The
 * history buffer's length tracks the canvas width in pixels — one peak per
 * pixel column. New samples appear at the right (under the playhead); old
 * samples scroll off the left.
 */
export function Visualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const historyRef = useRef<PeakSample[]>([])
  const sampleBufRef = useRef<Float32Array | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      const cssW = Math.max(1, Math.floor(rect.width))
      const cssH = Math.max(1, Math.floor(rect.height))
      canvas.width = cssW * dpr
      canvas.height = cssH * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Resize history buffer to match canvas width (1 sample per pixel)
      const target = cssW
      const current = historyRef.current
      if (current.length === 0) {
        historyRef.current = new Array(target).fill(null).map(() => ({ min: 0, max: 0 }))
      } else if (current.length < target) {
        // Pad on the left with zeros so history stays right-aligned
        const padding: PeakSample[] = new Array(target - current.length)
          .fill(null)
          .map(() => ({ min: 0, max: 0 }))
        historyRef.current = padding.concat(current)
      } else if (current.length > target) {
        // Trim oldest (leftmost) samples
        historyRef.current = current.slice(current.length - target)
      }
    }
    resize()

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)

    const tick = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      const center = h / 2

      // Pull a fresh peak sample from the analyser
      const analyser = audioEngine.getMasterAnalyser()
      let sample: PeakSample = { min: 0, max: 0 }
      if (analyser) {
        const size = analyser.fftSize
        if (!sampleBufRef.current || sampleBufRef.current.length !== size) {
          sampleBufRef.current = new Float32Array(size)
        }
        const buf = sampleBufRef.current
        analyser.getFloatTimeDomainData(buf)
        let min = 0
        let max = 0
        for (let i = 0; i < buf.length; i++) {
          const v = buf[i]
          if (v < min) min = v
          else if (v > max) max = v
        }
        sample = { min, max }
      }

      // Append + scroll: drop oldest (leftmost), push new (rightmost)
      const history = historyRef.current
      if (history.length > 0) {
        history.shift()
        history.push(sample)
      }

      // Draw
      ctx.fillStyle = BG_COLOR
      ctx.fillRect(0, 0, w, h)

      // Center line — visible during silence
      ctx.strokeStyle = CENTER_LINE_COLOR
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, center)
      ctx.lineTo(w, center)
      ctx.stroke()

      // Waveform: vertical bar per pixel column from min to max
      ctx.fillStyle = WAVE_COLOR
      const amp = center * 0.92
      for (let i = 0; i < history.length; i++) {
        const { min, max } = history[i]
        if (min === 0 && max === 0) continue
        const top = center + min * amp
        const bottom = center + max * amp
        ctx.fillRect(i, top, 1, Math.max(1, bottom - top))
      }

      // Playhead on the right edge — new audio appears here
      ctx.strokeStyle = PLAYHEAD_COLOR
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(w - 0.5, 0)
      ctx.lineTo(w - 0.5, h)
      ctx.stroke()

      rafRef.current = requestAnimationFrame(tick)
    }

    tick()

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
