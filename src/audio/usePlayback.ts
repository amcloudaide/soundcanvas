import { useEffect, useCallback, useState, useRef } from 'react'
import { audioEngine } from './engine'
import { useCanvasStore } from '../store/canvas-store'
import { useLibraryStore } from '../store/library-store'

export function usePlayback() {
  const [isPlaying, setIsPlaying] = useState(false)
  const { masterBpm, placedBlocks, soloId } = useCanvasStore()
  const { getBlockById } = useLibraryStore()
  const prevBlockIdsRef = useRef<Set<string>>(new Set())

  // Sync BPM
  useEffect(() => {
    audioEngine.setBpm(masterBpm)
  }, [masterBpm])

  // Sync placed blocks with audio engine
  useEffect(() => {
    const currentIds = new Set(placedBlocks.map((b) => b.id))
    const prevIds = prevBlockIdsRef.current

    // Remove patterns that are no longer on canvas
    for (const id of prevIds) {
      if (!currentIds.has(id)) {
        audioEngine.removePattern(id)
      }
    }

    // Add new patterns / update existing
    for (const placed of placedBlocks) {
      const block = getBlockById(placed.blockId)
      if (!block) continue

      if (!prevIds.has(placed.id)) {
        // New block on canvas — register its pattern
        audioEngine.addPattern(placed.id, block.pattern)
      }

      // Update mute state (account for solo)
      const effectiveMute = soloId
        ? placed.id !== soloId  // if solo active, mute everything except soloed
        : placed.muted

      audioEngine.mutePattern(placed.id, effectiveMute)
      audioEngine.setPatternVolume(placed.id, placed.volume)
    }

    prevBlockIdsRef.current = currentIds
  }, [placedBlocks, soloId, getBlockById])

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
