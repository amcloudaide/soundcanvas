import { useEffect } from 'react'
import { MusicCanvas } from './components/Canvas/MusicCanvas'
import { LibraryPanel } from './components/Library/LibraryPanel'
import { TransportBar } from './components/Transport/TransportBar'
import { useLibraryStore } from './store/library-store'
import { starterBlocks } from './data/starter-blocks'
import './App.css'

function App() {
  const { loadBlocks, blocks } = useLibraryStore()

  useEffect(() => {
    if (blocks.length === 0) {
      loadBlocks(starterBlocks)
    }
  }, [loadBlocks, blocks.length])

  return (
    <div className="app">
      <TransportBar />
      <div className="canvas-area">
        <MusicCanvas />
      </div>
      <LibraryPanel />
    </div>
  )
}

export default App
