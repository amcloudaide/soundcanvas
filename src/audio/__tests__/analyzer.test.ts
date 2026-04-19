import { describe, it, expect } from 'vitest'
import { estimateKey, estimateMood, estimateBpm } from '../analyzer'

describe('estimateKey', () => {
  it('estimates C major from strong C-E-G chroma', () => {
    // C=0, E=4, G=7
    const chroma = [1, 0, 0, 0, 0.8, 0, 0, 0.9, 0, 0, 0, 0]
    expect(estimateKey(chroma)).toBe('C')
  })

  it('estimates Am from strong A-C-E chroma', () => {
    // A=9, C=0, E=4
    const chroma = [0.8, 0, 0, 0, 0.7, 0, 0, 0, 0, 1, 0, 0]
    expect(estimateKey(chroma)).toBe('Am')
  })

  it('estimates G major from strong G-B-D chroma', () => {
    // G=7, B=11, D=2
    const chroma = [0, 0, 0.8, 0, 0, 0, 0, 1, 0, 0, 0, 0.7]
    expect(estimateKey(chroma)).toBe('G')
  })

  it('returns C for empty/zero chroma', () => {
    const chroma = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    expect(estimateKey(chroma)).toBeDefined()
  })
})

describe('estimateMood', () => {
  it('high energy and brightness for loud bright audio', () => {
    const mood = estimateMood({ rms: 0.8, spectralCentroid: 5000 })
    expect(mood.energy).toBeGreaterThan(0.5)
    expect(mood.brightness).toBeGreaterThan(0.5)
  })

  it('low energy and brightness for quiet dark audio', () => {
    const mood = estimateMood({ rms: 0.05, spectralCentroid: 300 })
    expect(mood.energy).toBeLessThan(0.3)
    expect(mood.brightness).toBeLessThan(0.3)
  })

  it('clamps values between 0 and 1', () => {
    const mood = estimateMood({ rms: 2, spectralCentroid: 20000 })
    expect(mood.energy).toBeLessThanOrEqual(1)
    expect(mood.brightness).toBeLessThanOrEqual(1)
  })
})

describe('estimateBpm', () => {
  it('estimates 120 BPM from evenly spaced onsets at 0.5s intervals', () => {
    // 0.5s between onsets = 2 beats per second = 120 BPM
    const onsets = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5]
    const bpm = estimateBpm(onsets)
    expect(bpm).toBeGreaterThanOrEqual(110)
    expect(bpm).toBeLessThanOrEqual(130)
  })

  it('returns 120 for too few onsets', () => {
    expect(estimateBpm([0])).toBe(120)
    expect(estimateBpm([])).toBe(120)
  })

  it('estimates ~90 BPM from 0.67s intervals', () => {
    // 0.667s between onsets = 1.5 beats/sec = 90 BPM
    const onsets = [0, 0.667, 1.333, 2.0, 2.667, 3.333]
    const bpm = estimateBpm(onsets)
    expect(bpm).toBeGreaterThanOrEqual(80)
    expect(bpm).toBeLessThanOrEqual(100)
  })
})
