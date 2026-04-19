import { useState, useMemo } from 'react'
import { useLibraryStore } from '../../store/library-store'
import { useCanvasStore } from '../../store/canvas-store'
import { usePreview } from '../../audio/usePreview'
import { LibraryBlockCard } from './LibraryBlockCard'
import type { Block, BlockCategory } from '../../types/block'
import './LibraryPanel.css'

const TABS: { label: string; value: BlockCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Beats', value: 'beats' },
  { label: 'Bass', value: 'bass' },
  { label: 'Melody', value: 'melody' },
  { label: 'Chords', value: 'chords' },
  { label: 'FX', value: 'fx' },
  { label: 'Vocal', value: 'vocal' },
]

export function LibraryPanel() {
  const [activeTab, setActiveTab] = useState<BlockCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { blocks, getBlocksByCategory, searchBlocks, getBlockById } = useLibraryStore()
  const { placedBlocks } = useCanvasStore()
  const { preview, previewingId } = usePreview()

  const displayedBlocks = searchQuery
    ? searchBlocks(searchQuery)
    : (activeTab === 'all' ? blocks : getBlocksByCategory(activeTab))

  // Compute dominant key/BPM from canvas blocks for compatibility hints
  const canvasContext = useMemo(() => {
    if (placedBlocks.length === 0) return null
    const canvasBlocks = placedBlocks
      .map((pb) => getBlockById(pb.blockId))
      .filter(Boolean) as Block[]
    if (canvasBlocks.length === 0) return null
    const keyBlock = [...canvasBlocks].reverse().find((b) => b.key !== 'chromatic') || canvasBlocks[canvasBlocks.length - 1]
    return { key: keyBlock.key, bpm: keyBlock.bpm }
  }, [placedBlocks, getBlockById])

  return (
    <div className="library-panel">
      <div className="library-search">
        <input
          type="text"
          placeholder="Search blocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="library-search-input"
        />
      </div>
      <div className="library-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            className={`library-tab ${activeTab === tab.value && !searchQuery ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.value)
              setSearchQuery('')
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="library-blocks">
        {displayedBlocks.map((block) => (
          <LibraryBlockCard
            key={block.id}
            block={block}
            canvasContext={canvasContext}
            isPreviewing={previewingId === block.id}
            onPreview={() => preview(block.id, block.pattern)}
          />
        ))}
        {displayedBlocks.length === 0 && (
          <div className="library-empty">
            {searchQuery ? `No blocks matching "${searchQuery}"` : 'No blocks in this category'}
          </div>
        )}
      </div>
    </div>
  )
}
