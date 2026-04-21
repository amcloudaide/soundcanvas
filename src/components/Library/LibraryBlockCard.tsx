import type { Block } from '../../types/block'
import { getCompatibility, type CompatibilityLevel } from '../../utils/compatibility'

const CATEGORY_COLORS: Record<string, string> = {
  beats: '#FF6B6B',
  bass: '#4ECDC4',
  melody: '#45B7D1',
  chords: '#96CEB4',
  fx: '#DDA0DD',
  vocal: '#FFD93D',
}

const COMPAT_COLORS: Record<CompatibilityLevel, string> = {
  green: '#4CAF50',
  yellow: '#FFC107',
  red: '#F44336',
}

const COMPAT_LABELS: Record<CompatibilityLevel, string> = {
  green: 'Fits well with what is on the canvas',
  yellow: 'Might clash — try it and see',
  red: 'Likely dissonant with what is on the canvas',
}

interface LibraryBlockCardProps {
  block: Block
  canvasContext: { key: string; bpm: number } | null
  isPreviewing: boolean
  onPreview: () => void
}

export function LibraryBlockCard({ block, canvasContext, isPreviewing, onPreview }: LibraryBlockCardProps) {
  const color = CATEGORY_COLORS[block.category] ?? '#999'

  const compatibility = canvasContext
    ? getCompatibility(canvasContext, { key: block.key, bpm: block.bpm })
    : null

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('blockId', block.id)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div
      className={`library-block-card ${isPreviewing ? 'previewing' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onClick={onPreview}
      style={{
        background: color,
        borderRadius: '8px',
        padding: '10px 12px',
        cursor: 'grab',
        color: '#fff',
        userSelect: 'none',
        position: 'relative',
      }}
    >
      <div style={{ fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        {compatibility && (
          <span
            title={COMPAT_LABELS[compatibility.level]}
            aria-label={COMPAT_LABELS[compatibility.level]}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: COMPAT_COLORS[compatibility.level],
              boxShadow: '0 0 0 2px rgba(255,255,255,0.25)',
              flexShrink: 0,
            }}
          />
        )}
        {isPreviewing && <span style={{ fontSize: '10px' }}>&#9654;</span>}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {block.name}
        </span>
      </div>
      <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '4px' }}>
        {block.key} | {block.bpm} BPM | {block.tags.slice(0, 2).join(', ')}
      </div>
    </div>
  )
}
