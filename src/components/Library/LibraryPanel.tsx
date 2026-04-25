import { useState, useMemo } from 'react'
import { useLibraryStore } from '../../store/library-store'
import { useCanvasStore } from '../../store/canvas-store'
import { usePreview } from '../../audio/usePreview'
import { LibraryBlockCard } from './LibraryBlockCard'
import { MoodGrid } from './MoodGrid'
import { CreateBlockDialog } from './CreateBlockDialog'
import { Visualizer } from '../Visualizer/Visualizer'
import { ListenDialog } from './ListenDialog'
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

type ViewMode = 'list' | 'grid'

export function LibraryPanel() {
  const [activeTab, setActiveTab] = useState<BlockCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showListenDialog, setShowListenDialog] = useState(false)
  const { blocks, getBlocksByCategory, searchBlocks, getBlockById, findCompatible } = useLibraryStore()
  const { placedBlocks, selectedBlockId, selectBlock } = useCanvasStore()
  const { preview, previewingId } = usePreview()

  // Get the selected block's source block ID for "sounds like" filtering
  const selectedPlaced = selectedBlockId
    ? placedBlocks.find((pb) => pb.id === selectedBlockId)
    : null
  const selectedBlock = selectedPlaced
    ? getBlockById(selectedPlaced.blockId)
    : null

  // Determine displayed blocks
  const displayedBlocks = useMemo(() => {
    if (selectedBlock) {
      return findCompatible(selectedBlock.id)
    }
    if (searchQuery) {
      return searchBlocks(searchQuery)
    }
    return activeTab === 'all' ? blocks : getBlocksByCategory(activeTab)
  }, [selectedBlock, searchQuery, activeTab, blocks, findCompatible, searchBlocks, getBlocksByCategory])

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

  const handleMoodGridSelect = (block: Block) => {
    preview(block.id, block.pattern)
  }

  return (
    <div className="library-panel">
      <Visualizer />
      {selectedBlock ? (
        <div className="library-sounds-like">
          <span>Sounds like: <strong>{selectedBlock.name}</strong></span>
          <button
            className="library-sounds-like-clear"
            onClick={() => selectBlock(null)}
          >
            Clear
          </button>
        </div>
      ) : (
        <div className="library-header">
          <div className="library-search">
            <input
              type="text"
              placeholder="Search blocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="library-search-input"
            />
          </div>
          <button
            className="library-view-toggle"
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            aria-label={viewMode === 'list' ? 'Mood grid view' : 'List view'}
            title={viewMode === 'list' ? 'Mood grid' : 'List view'}
          >
            {viewMode === 'list' ? '◉' : '☰'}
          </button>
          <button
            className="library-listen-btn"
            onClick={() => setShowListenDialog(true)}
            aria-label="Listen and analyze"
            title="Listen & Analyze"
          >
            🎙
          </button>
          <button
            className="library-create-btn"
            onClick={() => setShowCreateDialog(true)}
            aria-label="Create with AI"
            title="Create with AI"
          >
            +
          </button>
        </div>
      )}
      {showCreateDialog && (
        <CreateBlockDialog onClose={() => setShowCreateDialog(false)} />
      )}
      {showListenDialog && (
        <ListenDialog onClose={() => setShowListenDialog(false)} />
      )}
      {viewMode === 'list' && (
        <>
          <div className="library-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                className={`library-tab ${activeTab === tab.value && !searchQuery && !selectedBlock ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.value)
                  setSearchQuery('')
                  selectBlock(null)
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
        </>
      )}
      {viewMode === 'grid' && (
        <MoodGrid onSelectBlock={handleMoodGridSelect} />
      )}
    </div>
  )
}
