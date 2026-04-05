export interface PlacedBlock {
  id: string          // unique placement id
  blockId: string     // ref to Block.id
  position: { x: number; y: number }
  volume: number      // 0-1
  pitchShift: number  // semitones, -12 to +12
  muted: boolean
}

export interface CanvasState {
  masterBpm: number
  masterKey: string | null
  placedBlocks: PlacedBlock[]
  viewport: { x: number; y: number; zoom: number }
}

export function createPlacedBlock(blockId: string, position: { x: number; y: number }): PlacedBlock {
  return {
    id: crypto.randomUUID(),
    blockId,
    position,
    volume: 0.8,
    pitchShift: 0,
    muted: false,
  }
}
