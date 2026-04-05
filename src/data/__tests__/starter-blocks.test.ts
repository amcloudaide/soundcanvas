import { describe, it, expect } from 'vitest'
import { starterBlocks } from '../starter-blocks'

describe('starterBlocks', () => {
  it('has at least 20 blocks', () => {
    expect(starterBlocks.length).toBeGreaterThanOrEqual(20)
  })

  it('covers all categories', () => {
    const categories = new Set(starterBlocks.map((b) => b.category))
    expect(categories).toContain('beats')
    expect(categories).toContain('bass')
    expect(categories).toContain('melody')
    expect(categories).toContain('chords')
    expect(categories).toContain('fx')
    expect(categories).toContain('vocal')
  })

  it('each block has a valid Strudel pattern string', () => {
    for (const block of starterBlocks) {
      expect(block.pattern.length).toBeGreaterThan(0)
      expect(block.name.length).toBeGreaterThan(0)
    }
  })

  it('each block has valid mood values between 0 and 1', () => {
    for (const block of starterBlocks) {
      expect(block.mood.energy).toBeGreaterThanOrEqual(0)
      expect(block.mood.energy).toBeLessThanOrEqual(1)
      expect(block.mood.brightness).toBeGreaterThanOrEqual(0)
      expect(block.mood.brightness).toBeLessThanOrEqual(1)
    }
  })
})
