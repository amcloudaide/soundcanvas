# Phase 4: Listen & Analyze Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let users tap a mic icon, capture ambient audio, extract BPM/key/mood on-device, and match results against the library — with an AI fallback to generate a block if no good matches exist.

**Architecture:** Uses `getUserMedia()` for mic access, Web Audio `AnalyserNode` + Meyda.js for real-time feature extraction (spectral centroid for brightness, RMS for energy, chroma for key, onset detection for BPM). Extracted properties become a search filter on the library. If no matches, the properties are sent to the existing `/api/generate` endpoint as a structured prompt. Raw audio never leaves the device.

**Tech Stack:** Web Audio API, Meyda.js, getUserMedia, React, TypeScript, Vitest

---

### Task 1: Audio Analyzer Service

**Files:**
- Create: `src/audio/analyzer.ts`
- Test: `src/audio/__tests__/analyzer.test.ts`

**Step 1: Write the failing test**

Create `src/audio/__tests__/analyzer.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { estimateKey, estimateMood, type AnalysisResult } from '../analyzer'

describe('analyzer utilities', () => {
  it('estimates key from chroma features', () => {
    // Strong C major chroma: C peak at index 0
    const chroma = [1, 0, 0, 0, 0.8, 0, 0, 0.9, 0, 0, 0, 0] // C, E, G strong
    const key = estimateKey(chroma)
    expect(key).toBe('C')
  })

  it('estimates Am from A-minor chroma', () => {
    // A minor: A, C, E strong (indices 9, 0, 4)
    const chroma = [0.8, 0, 0, 0, 0.7, 0, 0, 0, 0, 1, 0, 0]
    const key = estimateKey(chroma)
    expect(key).toBe('Am')
  })

  it('estimates mood from spectral features', () => {
    const mood = estimateMood({
      rms: 0.8,           // high energy
      spectralCentroid: 5000, // bright
    })
    expect(mood.energy).toBeGreaterThan(0.5)
    expect(mood.brightness).toBeGreaterThan(0.5)
  })

  it('estimates low mood from quiet dark audio', () => {
    const mood = estimateMood({
      rms: 0.1,
      spectralCentroid: 500,
    })
    expect(mood.energy).toBeLessThan(0.4)
    expect(mood.brightness).toBeLessThan(0.4)
  })
})
```

**Step 2: Run test to verify it fails**

**Step 3: Write the implementation**

Create `src/audio/analyzer.ts`:
- `estimateKey(chroma: number[]): string` — maps 12-bin chroma to closest major/minor key using Krumhansl-Kessler key profiles
- `estimateMood(features: { rms: number; spectralCentroid: number }): { energy: number; brightness: number }` — normalizes RMS (0-1 energy) and spectral centroid (mapped to 0-1 brightness, assuming range 200-8000 Hz)
- `estimateBpm(onsetTimes: number[]): number` — calculates BPM from inter-onset intervals
- `type AnalysisResult = { bpm: number; key: string; mood: { energy: number; brightness: number }; density: number }`

**Step 4: Run tests, commit**

---

### Task 2: Mic Capture & Real-Time Analysis Hook

**Files:**
- Create: `src/audio/useListenAnalyze.ts`

**Step 1: Create the hook**

Create `src/audio/useListenAnalyze.ts`:
```typescript
import { useState, useRef, useCallback } from 'react'
import Meyda from 'meyda'
import { estimateKey, estimateMood, estimateBpm, type AnalysisResult } from './analyzer'

export function useListenAnalyze() {
  const [isListening, setIsListening] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const analyzerRef = useRef<any>(null)
  const contextRef = useRef<AudioContext | null>(null)

  // Accumulate features over the listening period
  const featuresRef = useRef<{
    chromas: number[][]
    rmsList: number[]
    centroidList: number[]
    onsetTimes: number[]
    lastRms: number
  }>({ chromas: [], rmsList: [], centroidList: [], onsetTimes: [], lastRms: 0 })

  const startListening = useCallback(async () => {
    try {
      setError(null)
      setResult(null)

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const ctx = new AudioContext()
      contextRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)

      featuresRef.current = { chromas: [], rmsList: [], centroidList: [], onsetTimes: [], lastRms: 0 }

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

          // Simple onset detection: RMS spike
          if (features.rms > 0.15 && features.rms > f.lastRms * 1.5 && f.rmsList.length > 2) {
            f.onsetTimes.push(ctx.currentTime)
          }
          f.lastRms = features.rms ?? 0
        },
      })

      analyzer.start()
      analyzerRef.current = analyzer
      setIsListening(true)

      // Auto-stop after 8 seconds
      setTimeout(() => stopListening(), 8000)
    } catch (err: any) {
      setError(err.message || 'Mic access denied')
    }
  }, [])

  const stopListening = useCallback(() => {
    if (analyzerRef.current) {
      analyzerRef.current.stop()
      analyzerRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (contextRef.current) {
      contextRef.current.close()
      contextRef.current = null
    }

    const f = featuresRef.current
    if (f.rmsList.length === 0) {
      setIsListening(false)
      return
    }

    // Average chroma across frames
    const avgChroma = new Array(12).fill(0)
    for (const c of f.chromas) {
      for (let i = 0; i < 12; i++) avgChroma[i] += c[i]
    }
    if (f.chromas.length > 0) {
      for (let i = 0; i < 12; i++) avgChroma[i] /= f.chromas.length
    }

    const avgRms = f.rmsList.reduce((a, b) => a + b, 0) / f.rmsList.length
    const avgCentroid = f.centroidList.reduce((a, b) => a + b, 0) / (f.centroidList.length || 1)

    const analysis: AnalysisResult = {
      bpm: estimateBpm(f.onsetTimes),
      key: estimateKey(avgChroma),
      mood: estimateMood({ rms: avgRms, spectralCentroid: avgCentroid }),
      density: Math.min(1, f.onsetTimes.length / 30), // normalize onset count
    }

    setResult(analysis)
    setIsListening(false)
  }, [])

  return { isListening, result, error, startListening, stopListening, clearResult: () => setResult(null) }
}
```

**Step 2: Commit**

---

### Task 3: Listen Dialog UI

**Files:**
- Create: `src/components/Library/ListenDialog.tsx`
- Create: `src/components/Library/ListenDialog.css`
- Modify: `src/components/Library/LibraryPanel.tsx`

**Step 1: Create the ListenDialog component**

Shows three states:
1. **Ready** — "Tap to listen" button with mic icon
2. **Listening** — animated mic indicator with countdown (8s), live level meter
3. **Results** — shows detected BPM, key, mood; lists matching library blocks; offers "Create with AI" if no good matches

**Step 2: Add mic button to LibraryPanel header**

Add a mic icon button next to the "+" create button. Opens `<ListenDialog />`.

**Step 3: Wire library matching**

Use the existing `findCompatible` and compatibility utilities to match the analysis result against library blocks. Sort by compatibility score.

**Step 4: Add "Create from analysis" AI fallback**

If no green-level matches, show a button "Create block inspired by this". This calls `generateBlock()` with a structured prompt like: `"Create a [key] block at [bpm] BPM with [energy] energy and [brightness] brightness"`.

**Step 5: Run all tests, commit**

---

### Task 4: Library Matching Logic

**Files:**
- Modify: `src/store/library-store.ts`
- Test: `src/store/__tests__/library-store.test.ts`

**Step 1: Add findByAnalysis to library store**

```typescript
findByAnalysis: (analysis: { key: string; bpm: number; mood: { energy: number; brightness: number } }) => Block[]
```

This filters and sorts blocks by combined compatibility score (key + BPM + mood similarity). Mood similarity is calculated as Euclidean distance in the energy×brightness space.

**Step 2: Write test, implement, verify, commit**

---

### Task 5: Integration & Polish

**Files:**
- Modify: `src/__tests__/app-integration.test.tsx`

**Step 1: Add integration test for mic button**

**Step 2: Run all tests**

**Step 3: Commit and push**

---

## Summary

Phase 4 delivers: mic capture via getUserMedia, on-device audio analysis (BPM via onset detection, key via chroma/Krumhansl profiles, mood via RMS + spectral centroid), library matching by analysis results, and AI fallback for generating blocks from extracted properties. Privacy-preserving: raw audio stays on-device.
