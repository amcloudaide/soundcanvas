import { useState } from 'react'
import { useLibraryStore } from '../../store/library-store'
import { LibraryBlockCard } from './LibraryBlockCard'
import type { BlockCategory } from '../../types/block'
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
  const { blocks, getBlocksByCategory } = useLibraryStore()

  const displayedBlocks = activeTab === 'all' ? blocks : getBlocksByCategory(activeTab)

  return (
    <div className="library-panel">
      <div className="library-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            className={`library-tab ${activeTab === tab.value ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="library-blocks">
        {displayedBlocks.map((block) => (
          <LibraryBlockCard key={block.id} block={block} />
        ))}
        {displayedBlocks.length === 0 && (
          <div className="library-empty">No blocks in this category</div>
        )}
      </div>
    </div>
  )
}
