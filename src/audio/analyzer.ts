export interface AnalysisResult {
  bpm: number
  key: string
  mood: { energy: number; brightness: number }
  density: number
}

// Krumhansl-Kessler key profiles (major and minor)
// 12 pitch classes: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]

const KEY_NAMES_MAJOR = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
const KEY_NAMES_MINOR = ['Cm', 'C#m', 'Dm', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'Bbm', 'Bm']

function correlate(chroma: number[], profile: number[]): number {
  const n = chroma.length
  let sumXY = 0, sumX = 0, sumY = 0, sumX2 = 0, sumY2 = 0
  for (let i = 0; i < n; i++) {
    sumXY += chroma[i] * profile[i]
    sumX += chroma[i]
    sumY += profile[i]
    sumX2 += chroma[i] * chroma[i]
    sumY2 += profile[i] * profile[i]
  }
  const denom = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
  if (denom === 0) return 0
  return (n * sumXY - sumX * sumY) / denom
}

function rotateArray(arr: number[], shift: number): number[] {
  const n = arr.length
  const result = new Array(n)
  for (let i = 0; i < n; i++) {
    // Rotate profile so that position 'shift' becomes the root
    result[(i + shift) % n] = arr[i]
  }
  return result
}

/**
 * Estimate musical key from a 12-bin chroma vector using Krumhansl-Kessler profiles.
 * Returns key name like "C", "Am", "F#", "Dm".
 */
export function estimateKey(chroma: number[]): string {
  if (chroma.length !== 12) return 'C'

  let bestKey = 'C'
  let bestCorr = -Infinity

  for (let shift = 0; shift < 12; shift++) {
    const rotated = rotateArray(MAJOR_PROFILE, shift)
    const corr = correlate(chroma, rotated)
    if (corr > bestCorr) {
      bestCorr = corr
      bestKey = KEY_NAMES_MAJOR[shift]
    }

    const rotatedMinor = rotateArray(MINOR_PROFILE, shift)
    const corrMinor = correlate(chroma, rotatedMinor)
    if (corrMinor > bestCorr) {
      bestCorr = corrMinor
      bestKey = KEY_NAMES_MINOR[shift]
    }
  }

  return bestKey
}

/**
 * Estimate mood (energy + brightness) from audio features.
 * rms: root mean square energy (0-1 typical range)
 * spectralCentroid: frequency centroid in Hz (200-8000 typical range)
 */
export function estimateMood(features: { rms: number; spectralCentroid: number }): { energy: number; brightness: number } {
  // Normalize RMS: typical mic RMS 0-0.5, map to 0-1
  const energy = Math.min(1, Math.max(0, features.rms * 2))

  // Normalize spectral centroid: 200 Hz = 0, 6000 Hz = 1
  const brightness = Math.min(1, Math.max(0, (features.spectralCentroid - 200) / 5800))

  return { energy, brightness }
}

/**
 * Estimate BPM from onset times (in seconds).
 * Uses median inter-onset interval for robustness.
 */
export function estimateBpm(onsetTimes: number[]): number {
  if (onsetTimes.length < 3) return 120 // default

  // Calculate inter-onset intervals
  const intervals: number[] = []
  for (let i = 1; i < onsetTimes.length; i++) {
    const interval = onsetTimes[i] - onsetTimes[i - 1]
    // Filter out very short intervals (< 0.2s = 300 BPM) and very long (> 2s = 30 BPM)
    if (interval >= 0.2 && interval <= 2.0) {
      intervals.push(interval)
    }
  }

  if (intervals.length === 0) return 120

  // Use median interval for robustness
  intervals.sort((a, b) => a - b)
  const median = intervals[Math.floor(intervals.length / 2)]

  let bpm = 60 / median

  // Normalize to 60-180 range (double or halve if outside)
  while (bpm > 180) bpm /= 2
  while (bpm < 60) bpm *= 2

  return Math.round(bpm)
}
