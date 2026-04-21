import { Group, Rect, Text, Circle } from 'react-konva'
import type Konva from 'konva'
import type { PlacedBlock } from '../../types/canvas'
import type { Block } from '../../types/block'

const BLOCK_WIDTH = 150
const BLOCK_HEIGHT = 100

// Volume slider geometry
const SLIDER_X = 10
const SLIDER_Y = 54
const SLIDER_WIDTH = BLOCK_WIDTH - 20

const CATEGORY_COLORS: Record<string, string> = {
  beats: '#FF6B6B',
  bass: '#4ECDC4',
  melody: '#45B7D1',
  chords: '#96CEB4',
  fx: '#DDA0DD',
  vocal: '#FFD93D',
}

interface CanvasBlockProps {
  placed: PlacedBlock
  block: Block
  isSoloed: boolean
  onDragEnd: (id: string, x: number, y: number) => void
  onDoubleTap: (id: string) => void
  onToggleMute: (id: string) => void
  onToggleSolo: (id: string) => void
  onVary: (blockId: string, pattern: string) => void
  onRemove: (id: string) => void
  onVolumeChange: (id: string, volume: number) => void
}

export function CanvasBlock({
  placed,
  block,
  isSoloed,
  onDragEnd,
  onDoubleTap,
  onToggleMute,
  onToggleSolo,
  onVary,
  onRemove,
  onVolumeChange,
}: CanvasBlockProps) {
  const color = CATEGORY_COLORS[block.category] ?? '#999'
  const opacity = placed.muted ? 0.4 : 1
  const thumbX = SLIDER_X + SLIDER_WIDTH * placed.volume

  // Convert pointer position on the slider track to a 0-1 volume value
  const volumeFromTrackX = (trackLocalX: number) => {
    const clamped = Math.max(0, Math.min(SLIDER_WIDTH, trackLocalX))
    return clamped / SLIDER_WIDTH
  }

  // Click anywhere on the track to jump the thumb there
  const handleTrackClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.cancelBubble = true
    // Use the track rect's own relative pointer position — this handles
    // any parent Group transforms automatically.
    const rel = e.target.getRelativePointerPosition()
    if (!rel) return
    onVolumeChange(placed.id, volumeFromTrackX(rel.x))
  }

  return (
    <Group
      x={placed.position.x}
      y={placed.position.y}
      draggable
      opacity={opacity}
      onDragEnd={(e) => {
        onDragEnd(placed.id, e.target.x(), e.target.y())
      }}
      onDblClick={() => onDoubleTap(placed.id)}
      onDblTap={() => onDoubleTap(placed.id)}
    >
      {/* Main block body */}
      <Rect
        width={BLOCK_WIDTH}
        height={BLOCK_HEIGHT}
        fill={color}
        cornerRadius={10}
        shadowColor="black"
        shadowBlur={6}
        shadowOpacity={0.2}
        shadowOffsetY={2}
        stroke={isSoloed ? '#FFD700' : undefined}
        strokeWidth={isSoloed ? 3 : 0}
      />

      {/* Block name — leave room for X button on right */}
      <Text
        text={block.name}
        x={8}
        width={BLOCK_WIDTH - 34}
        y={8}
        align="left"
        fontSize={12}
        fontStyle="bold"
        fill="#fff"
        ellipsis={true}
        wrap="none"
      />

      {/* Key + BPM info */}
      <Text
        text={`${block.key} · ${block.bpm} BPM`}
        x={8}
        width={BLOCK_WIDTH - 16}
        y={28}
        align="left"
        fontSize={10}
        fill="rgba(255,255,255,0.75)"
      />

      {/* Volume slider — track */}
      <Rect
        x={SLIDER_X}
        y={SLIDER_Y}
        width={SLIDER_WIDTH}
        height={4}
        fill="rgba(0,0,0,0.35)"
        cornerRadius={2}
        onClick={handleTrackClick}
        onTap={handleTrackClick}
      />
      {/* Volume slider — fill */}
      <Rect
        x={SLIDER_X}
        y={SLIDER_Y}
        width={SLIDER_WIDTH * placed.volume}
        height={4}
        fill="rgba(255,255,255,0.85)"
        cornerRadius={2}
        listening={false}
      />
      {/* Volume slider — thumb (draggable) */}
      <Circle
        x={thumbX}
        y={SLIDER_Y + 2}
        radius={7}
        fill="#fff"
        stroke="rgba(0,0,0,0.3)"
        strokeWidth={1}
        draggable
        onDragMove={(e) => {
          e.cancelBubble = true
          const node = e.target
          // Clamp x/y in parent-local coordinates (node.x() is relative to Group)
          const x = Math.max(SLIDER_X, Math.min(SLIDER_X + SLIDER_WIDTH, node.x()))
          node.x(x)
          node.y(SLIDER_Y + 2)
          onVolumeChange(placed.id, volumeFromTrackX(x - SLIDER_X))
        }}
        onDragEnd={(e) => {
          e.cancelBubble = true
        }}
      />

      {/* Mute button */}
      <Group
        x={8}
        y={BLOCK_HEIGHT - 26}
        onClick={(e) => { e.cancelBubble = true; onToggleMute(placed.id) }}
        onTap={(e) => { e.cancelBubble = true; onToggleMute(placed.id) }}
      >
        <Rect
          width={26}
          height={20}
          fill={placed.muted ? '#FF4444' : 'rgba(0,0,0,0.35)'}
          cornerRadius={4}
        />
        <Text
          text="M"
          width={26}
          height={20}
          align="center"
          verticalAlign="middle"
          fontSize={11}
          fontStyle="bold"
          fill="#fff"
          listening={false}
        />
      </Group>

      {/* Solo button */}
      <Group
        x={40}
        y={BLOCK_HEIGHT - 26}
        onClick={(e) => { e.cancelBubble = true; onToggleSolo(placed.id) }}
        onTap={(e) => { e.cancelBubble = true; onToggleSolo(placed.id) }}
      >
        <Rect
          width={26}
          height={20}
          fill={isSoloed ? '#FFD700' : 'rgba(0,0,0,0.35)'}
          cornerRadius={4}
        />
        <Text
          text="S"
          width={26}
          height={20}
          align="center"
          verticalAlign="middle"
          fontSize={11}
          fontStyle="bold"
          fill={isSoloed ? '#000' : '#fff'}
          listening={false}
        />
      </Group>

      {/* Vary button — high contrast so it's readable on any category color */}
      <Group
        x={BLOCK_WIDTH - 34}
        y={BLOCK_HEIGHT - 26}
        onClick={(e) => { e.cancelBubble = true; onVary(block.id, block.pattern) }}
        onTap={(e) => { e.cancelBubble = true; onVary(block.id, block.pattern) }}
      >
        <Rect
          width={26}
          height={20}
          fill="rgba(0,0,0,0.55)"
          cornerRadius={4}
        />
        <Text
          text="V"
          width={26}
          height={20}
          align="center"
          verticalAlign="middle"
          fontSize={11}
          fontStyle="bold"
          fill="#fff"
          listening={false}
        />
      </Group>

      {/* Remove (X) button — top-right corner */}
      <Group
        x={BLOCK_WIDTH - 24}
        y={4}
        onClick={(e) => {
          e.cancelBubble = true
          onRemove(placed.id)
        }}
        onTap={(e) => {
          e.cancelBubble = true
          onRemove(placed.id)
        }}
      >
        <Rect
          width={20}
          height={20}
          fill="rgba(0,0,0,0.5)"
          cornerRadius={10}
        />
        <Text
          text="×"
          width={20}
          height={20}
          align="center"
          verticalAlign="middle"
          fontSize={16}
          fontStyle="bold"
          fill="#fff"
          listening={false}
        />
      </Group>
    </Group>
  )
}

