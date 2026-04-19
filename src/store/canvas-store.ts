import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PlacedBlock } from '../types/canvas'
import { createPlacedBlock } from '../types/canvas'
import { idbStorage } from './idb-storage'

interface CanvasStoreState {
  masterBpm: number
  masterKey: string | null
  placedBlocks: PlacedBlock[]
  viewport: { x: number; y: number; zoom: number }
  soloId: string | null
  selectedBlockId: string | null

  addBlock: (blockId: string, position: { x: number; y: number }) => void
  removeBlock: (placedId: string) => void
  moveBlock: (placedId: string, position: { x: number; y: number }) => void
  toggleMute: (placedId: string) => void
  toggleSolo: (placedId: string) => void
  setVolume: (placedId: string, volume: number) => void
  setMasterBpm: (bpm: number) => void
  setViewport: (viewport: { x: number; y: number; zoom: number }) => void
  selectBlock: (placedId: string | null) => void
}

export const useCanvasStore = create<CanvasStoreState>()(
  persist(
    (set) => ({
      masterBpm: 120,
      masterKey: null,
      placedBlocks: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      soloId: null,
      selectedBlockId: null,

      addBlock: (blockId, position) => set((state) => ({
        placedBlocks: [...state.placedBlocks, createPlacedBlock(blockId, position)],
      })),

      removeBlock: (placedId) => set((state) => ({
        placedBlocks: state.placedBlocks.filter((b) => b.id !== placedId),
      })),

      moveBlock: (placedId, position) => set((state) => ({
        placedBlocks: state.placedBlocks.map((b) =>
          b.id === placedId ? { ...b, position } : b
        ),
      })),

      toggleMute: (placedId) => set((state) => ({
        placedBlocks: state.placedBlocks.map((b) =>
          b.id === placedId ? { ...b, muted: !b.muted } : b
        ),
      })),

      toggleSolo: (placedId) => set((state) => ({
        soloId: state.soloId === placedId ? null : placedId,
      })),

      setVolume: (placedId, volume) => set((state) => ({
        placedBlocks: state.placedBlocks.map((b) =>
          b.id === placedId ? { ...b, volume } : b
        ),
      })),

      setMasterBpm: (bpm) => set({ masterBpm: bpm }),

      setViewport: (viewport) => set({ viewport }),

      selectBlock: (placedId) => set({ selectedBlockId: placedId }),
    }),
    {
      name: 'soundcanvas-canvas',
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
      // Don't persist transient UI state
      partialize: (state) => ({
        masterBpm: state.masterBpm,
        masterKey: state.masterKey,
        placedBlocks: state.placedBlocks,
        viewport: state.viewport,
      }),
    }
  )
)
