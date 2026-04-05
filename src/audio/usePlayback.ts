import { useEffect, useCallback, useState } from 'react'
import { audioEngine } from './engine'
import { useCanvasStore } from '../store/canvas-store'

export function usePlayback() {
  const [isPlaying, setIsPlaying] = useState(false)
  const { masterBpm, placedBlocks } = useCanvasStore()

  useEffect(() => {
    audioEngine.setBpm(masterBpm)
  }, [masterBpm])

  // Sync placed blocks with audio engine
  useEffect(() => {
    const activePatterns = audioEngine.getActivePatterns()
    const placedIds = new Set(placedBlocks.map((b) => b.id))

    // Remove patterns that are no longer on canvas
    for (const id of activePatterns) {
      if (!placedIds.has(id)) {
        audioEngine.removePattern(id)
      }
    }

    // Update mute state for placed blocks
    for (const placed of placedBlocks) {
      audioEngine.mutePattern(placed.id, placed.muted)
    }
  }, [placedBlocks])

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
