import { Group, Rect, Text } from 'react-konva'
import type { PlacedBlock } from '../../types/canvas'
import type { Block } from '../../types/block'

const BLOCK_WIDTH = 140
const BLOCK_HEIGHT = 80

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
}

export function CanvasBlock({ placed, block, isSoloed, onDragEnd, onDoubleTap, onToggleMute, onToggleSolo }: CanvasBlockProps) {
  const color = CATEGORY_COLORS[block.category] ?? '#999'
  const opacity = placed.muted ? 0.4 : 1

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
      {/* Block name */}
      <Text
        text={block.name}
        width={BLOCK_WIDTH}
        height={BLOCK_HEIGHT * 0.5}
        y={6}
        align="center"
        verticalAlign="middle"
        fontSize={13}
        fontStyle="bold"
        fill="#fff"
      />
      {/* Key + BPM info */}
      <Text
        text={`${block.key} | ${block.bpm} BPM`}
        width={BLOCK_WIDTH}
        height={20}
        y={BLOCK_HEIGHT * 0.45}
        align="center"
        fontSize={10}
        fill="rgba(255,255,255,0.7)"
      />
      {/* Mute button */}
      <Group
        x={8}
        y={BLOCK_HEIGHT - 24}
        onClick={() => onToggleMute(placed.id)}
        onTap={() => onToggleMute(placed.id)}
      >
        <Rect
          width={24}
          height={18}
          fill={placed.muted ? '#FF4444' : 'rgba(0,0,0,0.3)'}
          cornerRadius={4}
        />
        <Text
          text="M"
          width={24}
          height={18}
          align="center"
          verticalAlign="middle"
          fontSize={10}
          fontStyle="bold"
          fill="#fff"
        />
      </Group>
      {/* Solo button */}
      <Group
        x={38}
        y={BLOCK_HEIGHT - 24}
        onClick={() => onToggleSolo(placed.id)}
        onTap={() => onToggleSolo(placed.id)}
      >
        <Rect
          width={24}
          height={18}
          fill={isSoloed ? '#FFD700' : 'rgba(0,0,0,0.3)'}
          cornerRadius={4}
        />
        <Text
          text="S"
          width={24}
          height={18}
          align="center"
          verticalAlign="middle"
          fontSize={10}
          fontStyle="bold"
          fill={isSoloed ? '#000' : '#fff'}
        />
      </Group>
    </Group>
  )
}
