import { create } from 'zustand'
import type { Block, BlockCategory } from '../types/block'

interface LibraryState {
  blocks: Block[]
  loadBlocks: (blocks: Block[]) => void
  addBlock: (block: Block) => void
  getBlocksByCategory: (category: BlockCategory) => Block[]
  getBlockById: (id: string) => Block | undefined
  searchBlocks: (query: string) => Block[]
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
