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

  it('searches blocks by name', () => {
    const beat = {
      id: '1', name: 'Four on the Floor', category: 'beats' as const,
      pattern: '', key: 'C', bpm: 120, bars: 1,
      mood: { energy: 0.5, brightness: 0.5 }, density: 0.5,
      tags: ['house'], source: 'preset' as const, createdAt: new Date(),
    }
    const bass = {
      id: '2', name: 'Sub Wobble', category: 'bass' as const,
      pattern: '', key: 'Cm', bpm: 120, bars: 1,
      mood: { energy: 0.5, brightness: 0.5 }, density: 0.5,
      tags: ['dark'], source: 'preset' as const, createdAt: new Date(),
    }
    useLibraryStore.getState().loadBlocks([beat, bass])
    const results = useLibraryStore.getState().searchBlocks('wobble')
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('Sub Wobble')
  })

  it('searches blocks by tags', () => {
    const beat = {
      id: '1', name: 'Test', category: 'beats' as const,
      pattern: '', key: 'C', bpm: 120, bars: 1,
      mood: { energy: 0.5, brightness: 0.5 }, density: 0.5,
      tags: ['house', 'dance'], source: 'preset' as const, createdAt: new Date(),
    }
    useLibraryStore.getState().loadBlocks([beat])
    const results = useLibraryStore.getState().searchBlocks('dance')
    expect(results).toHaveLength(1)
  })

  it('searches blocks by key', () => {
    const block = {
      id: '1', name: 'Test', category: 'bass' as const,
      pattern: '', key: 'Cm', bpm: 120, bars: 1,
      mood: { energy: 0.5, brightness: 0.5 }, density: 0.5,
      tags: [], source: 'preset' as const, createdAt: new Date(),
    }
    useLibraryStore.getState().loadBlocks([block])
    const results = useLibraryStore.getState().searchBlocks('Cm')
    expect(results).toHaveLength(1)
  })

  it('finds compatible blocks sorted by score', () => {
    const ref = {
      id: '1', name: 'Ref', category: 'melody' as const,
      pattern: '', key: 'C', bpm: 120, bars: 1,
      mood: { energy: 0.5, brightness: 0.5 }, density: 0.5,
      tags: [], source: 'preset' as const, createdAt: new Date(),
    }
    const compat = {
      id: '2', name: 'Compatible', category: 'bass' as const,
      pattern: '', key: 'Am', bpm: 120, bars: 1,
      mood: { energy: 0.5, brightness: 0.5 }, density: 0.5,
      tags: [], source: 'preset' as const, createdAt: new Date(),
    }
    const incompat = {
      id: '3', name: 'Incompat', category: 'bass' as const,
      pattern: '', key: 'F#', bpm: 75, bars: 1,
      mood: { energy: 0.5, brightness: 0.5 }, density: 0.5,
      tags: [], source: 'preset' as const, createdAt: new Date(),
    }
    useLibraryStore.getState().loadBlocks([ref, compat, incompat])
    const results = useLibraryStore.getState().findCompatible('1')
    expect(results[0].id).toBe('2')
    expect(results.find(r => r.id === '1')).toBeUndefined()
  })

  it('finds blocks by analysis result', () => {
    const cBlock = {
      id: '1', name: 'C Block', category: 'melody' as const,
      pattern: '', key: 'C', bpm: 120, bars: 1,
      mood: { energy: 0.5, brightness: 0.7 }, density: 0.5,
      tags: [], source: 'preset' as const, createdAt: new Date(),
    }
    const fSharpBlock = {
      id: '2', name: 'F# Block', category: 'melody' as const,
      pattern: '', key: 'F#', bpm: 75, bars: 1,
      mood: { energy: 0.9, brightness: 0.1 }, density: 0.5,
      tags: [], source: 'preset' as const, createdAt: new Date(),
    }
    useLibraryStore.getState().loadBlocks([cBlock, fSharpBlock])
    const results = useLibraryStore.getState().findByAnalysis({
      key: 'C', bpm: 120, mood: { energy: 0.5, brightness: 0.7 },
    })
    // C block should rank higher (same key, BPM, similar mood)
    expect(results[0].id).toBe('1')
  })

  it('returns all blocks for empty search', () => {
    const block = {
      id: '1', name: 'Test', category: 'beats' as const,
      pattern: '', key: 'C', bpm: 120, bars: 1,
      mood: { energy: 0.5, brightness: 0.5 }, density: 0.5,
      tags: [], source: 'preset' as const, createdAt: new Date(),
    }
    useLibraryStore.getState().loadBlocks([block])
    const results = useLibraryStore.getState().searchBlocks('')
    expect(results).toHaveLength(1)
  })
})
