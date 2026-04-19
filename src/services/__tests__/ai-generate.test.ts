import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateBlock, generateVariation } from '../ai-generate'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('ai-generate', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('generates a block from a text prompt', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        name: 'Funky Bass',
        category: 'bass',
        pattern: 'note("e2 g2 a2 b2").s("sawtooth")',
        key: 'Em',
        bpm: 110,
        bars: 1,
        mood: { energy: 0.6, brightness: 0.4 },
        density: 0.5,
        tags: ['funky', 'groove'],
      }),
    })

    const result = await generateBlock('funky bassline in E minor')
    expect(result.name).toBe('Funky Bass')
    expect(result.category).toBe('bass')
    expect(result.pattern).toContain('note(')
    expect(result.source).toBe('ai-generated')
    expect(result.id).toBeDefined()
  })

  it('generates a variation from an existing pattern', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        name: 'Funky Bass v2',
        category: 'bass',
        pattern: 'note("e2 a2 b2 d3").s("sawtooth")',
        key: 'Em',
        bpm: 110,
        bars: 1,
        mood: { energy: 0.7, brightness: 0.4 },
        density: 0.6,
        tags: ['funky', 'variation'],
      }),
    })

    const result = await generateVariation('note("e2 g2 a2 b2").s("sawtooth")', 'make it more energetic')
    expect(result.name).toBe('Funky Bass v2')
    expect(result.source).toBe('ai-generated')
  })

  it('sends correct request body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        name: 'Test', category: 'beats', pattern: 's("bd")',
        key: 'C', bpm: 120,
      }),
    })

    await generateBlock('test prompt')
    expect(mockFetch).toHaveBeenCalledWith('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'test prompt' }),
    })
  })

  it('throws on API error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'API key invalid' }),
    })

    await expect(generateBlock('test')).rejects.toThrow('API key invalid')
  })
})
