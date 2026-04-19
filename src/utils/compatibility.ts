export type CompatibilityLevel = 'green' | 'yellow' | 'red'

export interface CompatibilityResult {
  level: CompatibilityLevel
  score: number // 0-1
}

interface BlockInfo {
  key: string
  bpm: number
}

// Circle of fifths: 12 positions (0-11), wrapping
// Relative minor/major share the same position
const KEY_MAP: Record<string, number> = {
  'C': 0, 'Am': 0,
  'G': 1, 'Em': 1,
  'D': 2, 'Bm': 2,
  'A': 3, 'F#m': 3,
  'E': 4, 'C#m': 4, 'Dbm': 4,
  'B': 5, 'G#m': 5, 'Abm': 5,
  'F#': 6, 'Gb': 6, 'D#m': 6, 'Ebm': 6,
  'Db': 7, 'C#': 7, 'Bbm': 7,
  'Ab': 8, 'Fm': 8,
  'Eb': 9, 'Cm': 9,
  'Bb': 10, 'Gm': 10,
  'F': 11, 'Dm': 11,
}

function getKeyDistance(key1: string, key2: string): number {
  const pos1 = KEY_MAP[key1]
  const pos2 = KEY_MAP[key2]
  if (pos1 === undefined || pos2 === undefined) return 0
  const dist = Math.abs(pos1 - pos2)
  return Math.min(dist, 12 - dist) // wrap around circle of fifths
}

function getBpmCompatibility(bpm1: number, bpm2: number): number {
  const ratio = bpm1 / bpm2
  // Check direct, double, and half tempo
  const ratios = [ratio, ratio * 2, ratio / 2]
  const bestRatio = ratios.reduce((best, r) =>
    Math.abs(r - 1) < Math.abs(best - 1) ? r : best
  )
  const deviation = Math.abs(bestRatio - 1)
  // 0% deviation = 1.0, 20% deviation = 0.5, 40%+ = 0
  return Math.max(0, 1 - deviation * 2.5)
}

export function getCompatibility(a: BlockInfo, b: BlockInfo): CompatibilityResult {
  // Chromatic blocks (drums, fx) are always compatible key-wise
  const isChromatic = a.key === 'chromatic' || b.key === 'chromatic'

  const keyDistance = isChromatic ? 0 : getKeyDistance(a.key, b.key)
  // keyDistance 0 = 1.0, 1 = 0.7, 2 = 0.5, 3 = 0.3, 4+ = low
  const keyScore = Math.max(0, 1 - keyDistance * 0.3)
  const bpmScore = getBpmCompatibility(a.bpm, b.bpm)

  // Weighted: key matters more than BPM (Strudel auto-syncs tempo)
  const score = keyScore * 0.7 + bpmScore * 0.3

  let level: CompatibilityLevel
  if (score >= 0.8) level = 'green'
  else if (score >= 0.4) level = 'yellow'
  else level = 'red'

  return { level, score }
}
