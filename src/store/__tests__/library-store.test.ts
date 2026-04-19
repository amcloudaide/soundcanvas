import { describe, it, expect, beforeEach } from 'vitest'
import { useLibraryStore } from '../library-store'

describe('libraryStore', () => {
  beforeEach(() => {
    useLibraryStore.setState({ blocks: [] })
  })

  it('starts with an empty block list', () => {
    expect(useLibraryStore.getState().blocks).toEqual([])
  })

  it('loads blocks', () => {
    const mockBlock = {
      id: '1',
      name: 'Test',
      category: 'beats' as const,
      pattern: 's("bd")',
      key: 'C',
      bpm: 120,
      bars: 1,
      mood: { energy: 0.5, brightness: 0.5 },
      density: 0.5,
      tags: [],
      source: 'preset' as const,
      createdAt: new Date(),
    }
    useLibraryStore.getState().loadBlocks([mockBlock])
    expect(useLibraryStore.getState().blocks).toHaveLength(1)
    expect(useLibraryStore.getState().blocks[0].name).toBe('Test')
  })

  it('filters blocks by category', () => {
    const beat = {
      id: '1', name: 'Beat', category: 'beats' as const,
      pattern: '', key: 'C', bpm: 120, bars: 1,
      mood: { energy: 0.5, brightness: 0.5 }, density: 0.5,
      tags: [], source: 'preset' as const, createdAt: new Date(),
    }
    const bass = {
      id: '2', name: 'Bass', category: 'bass' as const,
      pattern: '', key: 'C', bpm: 120, bars: 1,
      mood: { energy: 0.5, brightness: 0.5 }, density: 0.5,
      tags: [], source: 'preset' as const, createdAt: new Date(),
    }
    useLibraryStore.getState().loadBlocks([beat, bass])
    const filtered = useLibraryStore.getState().getBlocksByCategory('beats')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].name).toBe('Beat')
  })
})
