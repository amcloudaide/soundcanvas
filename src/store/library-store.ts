import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Block, BlockCategory } from '../types/block'
import { getCompatibility } from '../utils/compatibility'
import { idbStorage } from './idb-storage'

interface LibraryState {
  blocks: Block[]
  userBlocks: Block[]  // persisted user-created blocks
  loadBlocks: (blocks: Block[]) => void
  addBlock: (block: Block) => void
  getBlocksByCategory: (category: BlockCategory) => Block[]
  getBlockById: (id: string) => Block | undefined
  searchBlocks: (query: string) => Block[]
  findCompatible: (blockId: string) => Block[]
  findByAnalysis: (analysis: { key: string; bpm: number; mood: { energy: number; brightness: number } }) => Block[]
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      blocks: [],
      userBlocks: [],

      loadBlocks: (presetBlocks) => set((state) => ({
        // Merge preset blocks with persisted user blocks
        blocks: [...presetBlocks, ...state.userBlocks],
      })),

      addBlock: (block) => set((state) => ({
        blocks: [...state.blocks, block],
        userBlocks: block.source !== 'preset'
          ? [...state.userBlocks, block]
          : state.userBlocks,
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
            const moodDist = Math.sqrt(
              Math.pow(analysis.mood.energy - b.mood.energy, 2) +
              Math.pow(analysis.mood.brightness - b.mood.brightness, 2)
            )
            const moodScore = Math.max(0, 1 - moodDist)
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
    }),
    {
      name: 'soundcanvas-library',
      storage: {
        getItem: async (name) => {
          const str = await idbStorage.getItem(name)
          return str ? JSON.parse(str) : null
        },
        setItem: async (name, value) => {
          await idbStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: async (name) => {
          await idbStorage.removeItem(name)
        },
      },
      // Only persist user-created blocks, not the full block list
      partialize: (state) => ({
        userBlocks: state.userBlocks,
      }),
    }
  )
)
