import { create } from 'zustand'
import type { Block, BlockCategory } from '../types/block'
import { getCompatibility } from '../utils/compatibility'

interface LibraryState {
  blocks: Block[]
  loadBlocks: (blocks: Block[]) => void
  addBlock: (block: Block) => void
  getBlocksByCategory: (category: BlockCategory) => Block[]
  getBlockById: (id: string) => Block | undefined
  searchBlocks: (query: string) => Block[]
  findCompatible: (blockId: string) => Block[]
  findByAnalysis: (analysis: { key: string; bpm: number; mood: { energy: number; brightness: number } }) => Block[]
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  blocks: [],

  loadBlocks: (blocks) => set({ blocks }),

  addBlock: (block) => set((state) => ({
    blocks: [...state.blocks, block],
  })),

  getBlocksByCategory: (category) => {
    return get().blocks.filter((b) => b.category === category)
  },

  getBlockById: (id) => {
    return get().blocks.find((b) => b.id === id)
  },

  findCompatible: (blockId) => {
    const ref = get().getBlockById(blockId)
    if (!ref) return []
    return get().blocks
      .filter((b) => b.id !== blockId)
      .map((b) => ({
        block: b,
        compat: getCompatibility({ key: ref.key, bpm: ref.bpm }, { key: b.key, bpm: b.bpm }),
      }))
      .sort((a, b) => b.compat.score - a.compat.score)
      .map((item) => item.block)
  },

  findByAnalysis: (analysis) => {
    return get().blocks
      .map((b) => {
        const keyCompat = getCompatibility(
          { key: analysis.key, bpm: analysis.bpm },
          { key: b.key, bpm: b.bpm }
        )
        // Mood similarity: Euclidean distance in 2D mood space
        const moodDist = Math.sqrt(
          Math.pow(analysis.mood.energy - b.mood.energy, 2) +
          Math.pow(analysis.mood.brightness - b.mood.brightness, 2)
        )
        const moodScore = Math.max(0, 1 - moodDist)
        // Combined: key/BPM compatibility weighted 60%, mood 40%
        const score = keyCompat.score * 0.6 + moodScore * 0.4
        return { block: b, score }
      })
      .sort((a, b) => b.score - a.score)
      .map((item) => item.block)
  },

  searchBlocks: (query) => {
    const q = query.toLowerCase().trim()
    if (!q) return get().blocks
    return get().blocks.filter((b) =>
      b.name.toLowerCase().includes(q) ||
      b.tags.some((t) => t.toLowerCase().includes(q)) ||
      b.key.toLowerCase().includes(q) ||
      b.category.includes(q) ||
      String(b.bpm).includes(q)
    )
  },
}))
