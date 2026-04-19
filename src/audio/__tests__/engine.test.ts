import { describe, it, expect, vi } from 'vitest'

// Mock @strudel/web before importing engine
vi.mock('@strudel/web', () => ({
  initStrudel: vi.fn().mockResolvedValue({
    scheduler: {
      start: vi.fn(),
      stop: vi.fn(),
      setCps: vi.fn(),
    },
    evaluate: vi.fn().mockResolvedValue({}),
    start: vi.fn(),
    stop: vi.fn(),
    setPattern: vi.fn().mockResolvedValue({}),
  }),
  evaluate: vi.fn().mockResolvedValue({}),
  hush: vi.fn(),
}))

import { AudioEngine } from '../engine'

describe('AudioEngine', () => {
  it('creates an instance', () => {
    const engine = new AudioEngine()
    expect(engine).toBeDefined()
  })

  it('can set BPM', () => {
    const engine = new AudioEngine()
    engine.setBpm(140)
    expect(engine.getBpm()).toBe(140)
  })

  it('clamps BPM to valid range', () => {
    const engine = new AudioEngine()
    engine.setBpm(10)
    expect(engine.getBpm()).toBe(40)
    engine.setBpm(500)
    expect(engine.getBpm()).toBe(300)
  })

  it('can start and stop', async () => {
    const engine = new AudioEngine()
    await engine.start()
    expect(engine.isPlaying()).toBe(true)
    engine.stop()
    expect(engine.isPlaying()).toBe(false)
  })

  it('can add and remove a pattern', async () => {
    const engine = new AudioEngine()
    await engine.start()
    engine.addPattern('test-id', 's("bd sd")')
    expect(engine.getActivePatterns()).toContain('test-id')
    engine.removePattern('test-id')
    expect(engine.getActivePatterns()).not.toContain('test-id')
  })

  it('tracks mute state', async () => {
    const engine = new AudioEngine()
    await engine.start()
    engine.addPattern('test-id', 's("bd sd")')
    engine.mutePattern('test-id', true)
    // Pattern is still tracked, just muted
    expect(engine.getActivePatterns()).toContain('test-id')
  })
})
