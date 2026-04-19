import { useState, useCallback, useRef } from 'react'
import { audioEngine } from './engine'

const PREVIEW_ID = '__preview__'
const PREVIEW_DURATION = 8000 // ~4 bars at 120 BPM

export function usePreview() {
  const [previewingId, setPreviewingId] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const preview = useCallback(async (blockId: string, pattern: string) => {
    // Stop any current preview
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    audioEngine.removePattern(PREVIEW_ID)

    // If tapping same block, toggle off
    if (previewingId === blockId) {
      setPreviewingId(null)
      return
    }

    // Ensure engine is initialized
    await audioEngine.init()

    // Play preview pattern
    audioEngine.addPattern(PREVIEW_ID, pattern)
    setPreviewingId(blockId)

    // Auto-stop after ~4 bars
    timeoutRef.current = setTimeout(() => {
      audioEngine.removePattern(PREVIEW_ID)
      setPreviewingId(null)
    }, PREVIEW_DURATION)
  }, [previewingId])

  const stopPreview = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    audioEngine.removePattern(PREVIEW_ID)
    setPreviewingId(null)
  }, [])

  return { preview, stopPreview, previewingId }
}
