import { describe, it, expect } from 'vitest'
import { getCompatibility } from '../compatibility'

describe('getCompatibility', () => {
  it('returns green for same key', () => {
    const result = getCompatibility({ key: 'C', bpm: 120 }, { key: 'C', bpm: 120 })
    expect(result.level).toBe('green')
    expect(result.score).toBeGreaterThanOrEqual(0.8)
  })

  it('returns green for relative minor/major', () => {
    const result = getCompatibility({ key: 'C', bpm: 120 }, { key: 'Am', bpm: 120 })
    expect(result.level).toBe('green')
  })

  it('returns yellow for adjacent keys on circle of fifths', () => {
    const result = getCompatibility({ key: 'C', bpm: 120 }, { key: 'G', bpm: 120 })
    expect(result.level).toBe('yellow')
  })

  it('returns red for distant keys', () => {
    const result = getCompatibility({ key: 'C', bpm: 120 }, { key: 'F#', bpm: 120 })
    expect(result.level).toBe('red')
  })

  it('returns green for chromatic blocks (drums/fx)', () => {
    const result = getCompatibility({ key: 'chromatic', bpm: 120 }, { key: 'Cm', bpm: 120 })
    expect(result.level).toBe('green')
  })

  it('penalizes large BPM differences', () => {
    const same = getCompatibility({ key: 'C', bpm: 120 }, { key: 'C', bpm: 120 })
    const diff = getCompatibility({ key: 'C', bpm: 120 }, { key: 'C', bpm: 80 })
    expect(diff.score).toBeLessThan(same.score)
  })

  it('tolerates small BPM differences', () => {
    const result = getCompatibility({ key: 'C', bpm: 120 }, { key: 'C', bpm: 125 })
    expect(result.level).toBe('green')
  })

  it('considers double/half tempo as compatible', () => {
    const result = getCompatibility({ key: 'C', bpm: 120 }, { key: 'C', bpm: 60 })
    expect(result.level).not.toBe('red')
  })
})
