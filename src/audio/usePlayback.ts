import { useEffect, useCallback, useState } from 'react'
import { audioEngine } from './engine'
import { useCanvasStore } from '../store/canvas-store'
import { useLibraryStore } from '../store/library-store'

export function usePlayback() {
  const [isPlaying, setIsPlaying] = useState(false)
  const { masterBpm, placedBlocks, soloId } = useCanvasStore()
  const { getBlockById } = useLibraryStore()
  // Sync BPM
  useEffect(() => {
    audioEngine.setBpm(masterBpm)
  }, [masterBpm])

  // Sync placed blocks with audio engine
  // Re-run when blocks change, solo changes, OR playback state changes
  useEffect(() => {
    const currentIds = new Set(placedBlocks.map((b) => b.id))
    const enginePatterns = new Set(audioEngine.getActivePatterns())

    // Remove patterns that are no longer on canvas
    for (const id of enginePatterns) {
      if (!currentIds.has(id)) {
        audioEngine.removePattern(id)
      }
    }

    // Add/update patterns for all placed blocks
    for (const placed of placedBlocks) {
      const block = getBlockById(placed.blockId)
      if (!block) continue

      // Always register pattern (addPattern is idempotent if same code)
      if (!enginePatterns.has(placed.id)) {
        audioEngine.addPattern(placed.id, block.pattern)
      }

      // Update mute state (account for solo)
      const effectiveMute = soloId
        ? placed.id !== soloId  // if solo active, mute everything except soloed
        : placed.muted

      audioEngine.mutePattern(placed.id, effectiveMute)
      audioEngine.setPatternVolume(placed.id, placed.volume)
    }
  }, [placedBlocks, soloId, getBlockById, isPlaying])

  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      audioEngine.stop()
      setIsPlaying(false)
    } else {
      await audioEngine.start()
      setIsPlaying(true)
    }
  }, [isPlaying])

  return { isPlaying, togglePlayback }
}
