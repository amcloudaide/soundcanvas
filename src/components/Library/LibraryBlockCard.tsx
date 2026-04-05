import type { Block } from '../../types/block'

const CATEGORY_COLORS: Record<string, string> = {
  beats: '#FF6B6B',
  bass: '#4ECDC4',
  melody: '#45B7D1',
  chords: '#96CEB4',
  fx: '#DDA0DD',
  vocal: '#FFD93D',
}

interface LibraryBlockCardProps {
  block: Block
}

export function LibraryBlockCard({ block }: LibraryBlockCardProps) {
  const color = CATEGORY_COLORS[block.category] ?? '#999'

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('blockId', block.id)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div
      className="library-block-card"
      draggable
      onDragStart={handleDragStart}
      style={{
        background: color,
        borderRadius: '8px',
        padding: '10px 12px',
        cursor: 'grab',
        color: '#fff',
        userSelect: 'none',
      }}
    >
      <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{block.name}</div>
      <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '4px' }}>
        {block.key} | {block.bpm} BPM | {block.tags.slice(0, 2).join(', ')}
      </div>
    </div>
  )
}
