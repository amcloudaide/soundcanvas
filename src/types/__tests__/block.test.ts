import { describe, it, expect } from 'vitest'
import { createBlock, type Block, type BlockCategory } from '../block'

describe('createBlock', () => {
  it('creates a block with required fields and defaults', () => {
    const block = createBlock({
      name: 'Test Beat',
      category: 'beats',
      pattern: 's("bd sd [~ bd] sd")',
      key: 'C',
      bpm: 120,
    })

    expect(block.id).toBeDefined()
    expect(block.name).toBe('Test Beat')
    expect(block.category).toBe('beats')
    expect(block.pattern).toBe('s("bd sd [~ bd] sd")')
    expect(block.key).toBe('C')
    expect(block.bpm).toBe(120)
    expect(block.bars).toBe(1)
    expect(block.mood).toEqual({ energy: 0.5, brightness: 0.5 })
    expect(block.density).toBe(0.5)
    expect(block.tags).toEqual([])
    expect(block.source).toBe('preset')
    expect(block.createdAt).toBeInstanceOf(Date)
  })

  it('allows overriding optional fields', () => {
    const block = createBlock({
      name: 'Custom',
      category: 'bass',
      pattern: 'note("c2 eb2")',
      key: 'Cm',
      bpm: 90,
      bars: 4,
      mood: { energy: 0.8, brightness: 0.2 },
      density: 0.7,
      tags: ['dark', 'heavy'],
      source: 'ai-generated',
    })

    expect(block.bars).toBe(4)
    expect(block.mood.energy).toBe(0.8)
    expect(block.tags).toContain('dark')
    expect(block.source).toBe('ai-generated')
  })
})
