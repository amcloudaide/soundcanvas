import { describe, it, expect, vi } from 'vitest'
import { AudioEngine } from '../engine'

// Mock Web Audio API
const mockGainNode = {
  gain: { value: 1, setValueAtTime: vi.fn() },
  connect: vi.fn(),
  disconnect: vi.fn(),
}

const mockAudioContext = {
  currentTime: 0,
  destination: {},
  createGain: vi.fn(() => mockGainNode),
  resume: vi.fn().mockResolvedValue(undefined),
  suspend: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  state: 'running',
}

vi.stubGlobal('AudioContext', function(this: any) {
  Object.assign(this, mockAudioContext)
})

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
})
