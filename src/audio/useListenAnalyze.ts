import { useState, useRef, useCallback } from 'react'
import Meyda from 'meyda'
import { estimateKey, estimateMood, estimateBpm, type AnalysisResult } from './analyzer'

const LISTEN_DURATION = 8000 // 8 seconds

export function useListenAnalyze() {
  const [isListening, setIsListening] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const analyzerRef = useRef<ReturnType<typeof Meyda.createMeydaAnalyzer> | null>(null)
  const contextRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const featuresRef = useRef({
    chromas: [] as number[][],
    rmsList: [] as number[],
    centroidList: [] as number[],
    onsetTimes: [] as number[],
    lastRms: 0,
  })

  const stopListening = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (analyzerRef.current) {
      analyzerRef.current.stop()
      analyzerRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }

    const f = featuresRef.current
    if (f.rmsList.length > 0) {
      // Average chroma across frames
      const avgChroma = new Array(12).fill(0)
      for (const c of f.chromas) {
        for (let i = 0; i < 12; i++) avgChroma[i] += c[i]
      }
      if (f.chromas.length > 0) {
        for (let i = 0; i < 12; i++) avgChroma[i] /= f.chromas.length
      }

      const avgRms = f.rmsList.reduce((a, b) => a + b, 0) / f.rmsList.length
      const avgCentroid = f.centroidList.length > 0
        ? f.centroidList.reduce((a, b) => a + b, 0) / f.centroidList.length
        : 1000

      const analysis: AnalysisResult = {
        bpm: estimateBpm(f.onsetTimes),
        key: estimateKey(avgChroma),
        mood: estimateMood({ rms: avgRms, spectralCentroid: avgCentroid }),
        density: Math.min(1, f.onsetTimes.length / 30),
      }

      setResult(analysis)
    }

    if (contextRef.current) {
      contextRef.current.close()
      contextRef.current = null
    }

    setIsListening(false)
  }, [])

  const startListening = useCallback(async () => {
    try {
      setError(null)
      setResult(null)

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const ctx = new AudioContext()
      contextRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)

      featuresRef.current = {
        chromas: [],
        rmsList: [],
        centroidList: [],
        onsetTimes: [],
        lastRms: 0,
      }

      const analyzer = Meyda.createMeydaAnalyzer({
        audioContext: ctx,
        source,
        bufferSize: 2048,
        featureExtractors: ['rms', 'spectralCentroid', 'chroma'],
        callback: (features: any) => {
          if (!features) return
          const f = featuresRef.current

          if (features.rms != null) f.rmsList.push(features.rms)
          if (features.spectralCentroid != null) f.centroidList.push(features.spectralCentroid)
          if (features.chroma) f.chromas.push([...features.chroma])

          // Simple onset detection: RMS spike above threshold
          if (features.rms > 0.1 && features.rms > f.lastRms * 1.5 && f.rmsList.length > 2) {
            f.onsetTimes.push(ctx.currentTime)
          }
          f.lastRms = features.rms ?? 0
        },
      })

      analyzer.start()
      analyzerRef.current = analyzer
      setIsListening(true)

      // Auto-stop after LISTEN_DURATION
      timerRef.current = setTimeout(() => stopListening(), LISTEN_DURATION)
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow mic access in your browser settings.')
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone.')
      } else {
        setError(err.message || 'Failed to access microphone')
      }
    }
  }, [stopListening])

  const clearResult = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { isListening, result, error, startListening, stopListening, clearResult }
}
