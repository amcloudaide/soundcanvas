import { useRef, useCallback } from 'react'
import type Konva from 'konva'
import { useCanvasStore } from '../store/canvas-store'

function getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

function getCenter(p1: { x: number; y: number }, p2: { x: number; y: number }) {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
}

export function usePinchZoom(stageRef: React.RefObject<Konva.Stage | null>) {
  const lastCenter = useRef<{ x: number; y: number } | null>(null)
  const lastDist = useRef(0)

  const handleTouchMove = useCallback((e: Konva.KonvaEventObject<TouchEvent>) => {
    e.evt.preventDefault()
    const touch1 = e.evt.touches[0]
    const touch2 = e.evt.touches[1]

    if (!touch1 || !touch2) return

    const stage = stageRef.current
    if (!stage) return

    // Stop Konva drag when pinching
    if (stage.isDragging()) {
      stage.stopDrag()
    }

    const { viewport, setViewport } = useCanvasStore.getState()

    const rect = stage.container().getBoundingClientRect()
    const p1 = { x: touch1.clientX - rect.left, y: touch1.clientY - rect.top }
    const p2 = { x: touch2.clientX - rect.left, y: touch2.clientY - rect.top }

    if (!lastCenter.current) {
      lastCenter.current = getCenter(p1, p2)
      lastDist.current = getDistance(p1, p2)
      return
    }

    const newCenter = getCenter(p1, p2)
    const dist = getDistance(p1, p2)

    const pointTo = {
      x: (newCenter.x - viewport.x) / viewport.zoom,
      y: (newCenter.y - viewport.y) / viewport.zoom,
    }

    const scale = Math.max(0.2, Math.min(3, viewport.zoom * (dist / lastDist.current)))

    const dx = newCenter.x - lastCenter.current.x
    const dy = newCenter.y - lastCenter.current.y

    setViewport({
      x: newCenter.x - pointTo.x * scale + dx,
      y: newCenter.y - pointTo.y * scale + dy,
      zoom: scale,
    })

    lastDist.current = dist
    lastCenter.current = newCenter
  }, [stageRef])

  const handleTouchEnd = useCallback(() => {
    lastCenter.current = null
    lastDist.current = 0
  }, [])

  return { handleTouchMove, handleTouchEnd }
}
