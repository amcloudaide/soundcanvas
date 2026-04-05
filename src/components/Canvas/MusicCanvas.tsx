import { useRef, useCallback } from 'react'
import { Stage, Layer } from 'react-konva'
import type Konva from 'konva'
import { useCanvasStore } from '../../store/canvas-store'
import { useLibraryStore } from '../../store/library-store'
import { usePinchZoom } from '../../hooks/usePinchZoom'
import { CanvasBlock } from './CanvasBlock'

export function MusicCanvas() {
  const stageRef = useRef<Konva.Stage>(null)
  const { placedBlocks, viewport, soloId, moveBlock, toggleMute, toggleSolo, setViewport } = useCanvasStore()
  const { getBlockById } = useLibraryStore()
  const { handleTouchMove, handleTouchEnd } = usePinchZoom(stageRef)

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const stage = stageRef.current
    if (!stage) return

    const oldScale = viewport.zoom
    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const scaleBy = 1.08
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy
    const clampedScale = Math.max(0.2, Math.min(3, newScale))

    const mousePointTo = {
      x: (pointer.x - viewport.x) / oldScale,
      y: (pointer.y - viewport.y) / oldScale,
    }

    setViewport({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
      zoom: clampedScale,
    })
  }, [viewport, setViewport])

  const handleDragEnd = useCallback((id: string, x: number, y: number) => {
    moveBlock(id, { x, y })
  }, [moveBlock])

  const handleDoubleTap = useCallback((_id: string) => {
    // Will open block detail panel in later phase
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const blockId = e.dataTransfer.getData('blockId')
    if (!blockId) return

    const stage = stageRef.current
    if (!stage) return

    stage.setPointersPositions(e)
    const pointerPos = stage.getPointerPosition()
    if (!pointerPos) return

    const x = (pointerPos.x - viewport.x) / viewport.zoom
    const y = (pointerPos.y - viewport.y) / viewport.zoom

    useCanvasStore.getState().addBlock(blockId, { x, y })
  }, [viewport])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  return (
    <div
      className="music-canvas"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
    >
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        scaleX={viewport.zoom}
        scaleY={viewport.zoom}
        x={viewport.x}
        y={viewport.y}
        draggable
        onWheel={handleWheel}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDragEnd={(e) => {
          if (e.target === stageRef.current) {
            setViewport({
              ...viewport,
              x: e.target.x(),
              y: e.target.y(),
            })
          }
        }}
      >
        <Layer>
          {placedBlocks.map((placed) => {
            const block = getBlockById(placed.blockId)
            if (!block) return null
            return (
              <CanvasBlock
                key={placed.id}
                placed={placed}
                block={block}
                isSoloed={soloId === placed.id}
                onDragEnd={handleDragEnd}
                onDoubleTap={handleDoubleTap}
                onToggleMute={toggleMute}
                onToggleSolo={toggleSolo}
              />
            )
          })}
        </Layer>
      </Stage>
    </div>
  )
}
