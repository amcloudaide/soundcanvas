import { useState } from 'react'
import { useLibraryStore } from '../../store/library-store'
import type { Block } from '../../types/block'
import './MoodGrid.css'

const CATEGORY_COLORS: Record<string, string> = {
  beats: '#FF6B6B',
  bass: '#4ECDC4',
  melody: '#45B7D1',
  chords: '#96CEB4',
  fx: '#DDA0DD',
  vocal: '#FFD93D',
}

interface MoodGridProps {
  onSelectBlock: (block: Block) => void
}

export function MoodGrid({ onSelectBlock }: MoodGridProps) {
  const { blocks } = useLibraryStore()
  const [hoveredBlock, setHoveredBlock] = useState<Block | null>(null)

  return (
    <div className="mood-grid">
      <div className="mood-grid-area">
        {blocks.map((block) => (
          <button
            key={block.id}
            className="mood-dot"
            title={block.name}
            style={{
              left: `${block.mood.brightness * 100}%`,
              bottom: `${block.mood.energy * 100}%`,
              background: CATEGORY_COLORS[block.category] ?? '#999',
            }}
            onClick={() => onSelectBlock(block)}
            onMouseEnter={() => setHoveredBlock(block)}
            onMouseLeave={() => setHoveredBlock(null)}
          />
        ))}
        {hoveredBlock && (
          <div
            className="mood-tooltip"
            style={{
              left: `${hoveredBlock.mood.brightness * 100}%`,
              bottom: `${hoveredBlock.mood.energy * 100 + 8}%`,
            }}
          >
            {hoveredBlock.name}
          </div>
        )}
        <span className="mood-label left">Dark</span>
        <span className="mood-label right">Bright</span>
        <span className="mood-label bottom">Chill</span>
        <span className="mood-label top">Energy</span>
      </div>
    </div>
  )
}
