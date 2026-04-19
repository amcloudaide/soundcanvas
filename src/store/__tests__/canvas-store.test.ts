import { describe, it, expect, beforeEach } from 'vitest'
import { useCanvasStore } from '../canvas-store'

describe('canvasStore', () => {
  beforeEach(() => {
    useCanvasStore.setState({
      masterBpm: 120,
      masterKey: null,
      placedBlocks: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      soloId: null,
    })
  })

  it('starts with default state', () => {
    const state = useCanvasStore.getState()
    expect(state.masterBpm).toBe(120)
    expect(state.placedBlocks).toEqual([])
    expect(state.viewport.zoom).toBe(1)
  })

  it('adds a placed block', () => {
    useCanvasStore.getState().addBlock('block-1', { x: 100, y: 200 })
    const placed = useCanvasStore.getState().placedBlocks
    expect(placed).toHaveLength(1)
    expect(placed[0].blockId).toBe('block-1')
    expect(placed[0].position).toEqual({ x: 100, y: 200 })
  })

  it('moves a placed block', () => {
    useCanvasStore.getState().addBlock('block-1', { x: 100, y: 200 })
    const id = useCanvasStore.getState().placedBlocks[0].id
    useCanvasStore.getState().moveBlock(id, { x: 300, y: 400 })
    expect(useCanvasStore.getState().placedBlocks[0].position).toEqual({ x: 300, y: 400 })
  })

  it('removes a placed block', () => {
    useCanvasStore.getState().addBlock('block-1', { x: 100, y: 200 })
    const id = useCanvasStore.getState().placedBlocks[0].id
    useCanvasStore.getState().removeBlock(id)
    expect(useCanvasStore.getState().placedBlocks).toHaveLength(0)
  })

  it('toggles mute on a placed block', () => {
    useCanvasStore.getState().addBlock('block-1', { x: 0, y: 0 })
    const id = useCanvasStore.getState().placedBlocks[0].id
    expect(useCanvasStore.getState().placedBlocks[0].muted).toBe(false)
    useCanvasStore.getState().toggleMute(id)
    expect(useCanvasStore.getState().placedBlocks[0].muted).toBe(true)
  })

  it('sets master BPM', () => {
    useCanvasStore.getState().setMasterBpm(140)
    expect(useCanvasStore.getState().masterBpm).toBe(140)
  })

  it('updates viewport', () => {
    useCanvasStore.getState().setViewport({ x: 50, y: 50, zoom: 1.5 })
    expect(useCanvasStore.getState().viewport).toEqual({ x: 50, y: 50, zoom: 1.5 })
  })

  it('toggles solo on a placed block', () => {
    useCanvasStore.getState().addBlock('block-1', { x: 0, y: 0 })
    const id = useCanvasStore.getState().placedBlocks[0].id
    useCanvasStore.getState().toggleSolo(id)
    expect(useCanvasStore.getState().soloId).toBe(id)
    useCanvasStore.getState().toggleSolo(id)
    expect(useCanvasStore.getState().soloId).toBeNull()
  })

  it('solo switches to a different block', () => {
    useCanvasStore.getState().addBlock('block-1', { x: 0, y: 0 })
    useCanvasStore.getState().addBlock('block-2', { x: 100, y: 0 })
    const id1 = useCanvasStore.getState().placedBlocks[0].id
    const id2 = useCanvasStore.getState().placedBlocks[1].id
    useCanvasStore.getState().toggleSolo(id1)
    expect(useCanvasStore.getState().soloId).toBe(id1)
    useCanvasStore.getState().toggleSolo(id2)
    expect(useCanvasStore.getState().soloId).toBe(id2)
  })
})
