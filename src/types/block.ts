export type BlockCategory = 'beats' | 'bass' | 'melody' | 'chords' | 'fx' | 'vocal'
export type BlockSource = 'preset' | 'ai-generated' | 'listen-inspired'

export interface Mood {
  energy: number   // 0-1
  brightness: number // 0-1
}

export interface Block {
  id: string
  name: string
  category: BlockCategory
  pattern: string
  key: string
  bpm: number
  bars: number
  mood: Mood
  density: number
  tags: string[]
  source: BlockSource
  createdAt: Date
}

export interface CreateBlockInput {
  name: string
  category: BlockCategory
  pattern: string
  key: string
  bpm: number
  bars?: number
  mood?: Mood
  density?: number
  tags?: string[]
  source?: BlockSource
}

export function createBlock(input: CreateBlockInput): Block {
  return {
    id: crypto.randomUUID(),
    name: input.name,
    category: input.category,
    pattern: input.pattern,
    key: input.key,
    bpm: input.bpm,
    bars: input.bars ?? 1,
    mood: input.mood ?? { energy: 0.5, brightness: 0.5 },
    density: input.density ?? 0.5,
    tags: input.tags ?? [],
    source: input.source ?? 'preset',
    createdAt: new Date(),
  }
}
