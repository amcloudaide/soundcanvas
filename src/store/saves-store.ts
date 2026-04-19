import { create } from 'zustand'
import { useCanvasStore } from './canvas-store'
import { idbStorage } from './idb-storage'

export interface SavedCanvas {
  name: string
  savedAt: string // ISO date
  data: {
    masterBpm: number
    masterKey: string | null
    placedBlocks: any[]
    viewport: { x: number; y: number; zoom: number }
  }
}

interface SavesState {
  saves: SavedCanvas[]
  loadSavesList: () => Promise<void>
  saveCanvas: (name: string) => Promise<void>
  loadCanvas: (name: string) => Promise<void>
  deleteSave: (name: string) => Promise<void>
}

const SAVES_KEY = 'soundcanvas-saves'

export const useSavesStore = create<SavesState>((set, get) => ({
  saves: [],

  loadSavesList: async () => {
    const raw = await idbStorage.getItem(SAVES_KEY)
    if (raw) {
      try {
        const saves: SavedCanvas[] = JSON.parse(raw)
        set({ saves })
      } catch {
        set({ saves: [] })
      }
    }
  },

  saveCanvas: async (name: string) => {
    const canvas = useCanvasStore.getState()
    const save: SavedCanvas = {
      name,
      savedAt: new Date().toISOString(),
      data: {
        masterBpm: canvas.masterBpm,
        masterKey: canvas.masterKey,
        placedBlocks: canvas.placedBlocks,
        viewport: canvas.viewport,
      },
    }

    const saves = get().saves.filter((s) => s.name !== name) // overwrite if exists
    saves.unshift(save)
    set({ saves })
    await idbStorage.setItem(SAVES_KEY, JSON.stringify(saves))
  },

  loadCanvas: async (name: string) => {
    const save = get().saves.find((s) => s.name === name)
    if (!save) return

    useCanvasStore.setState({
      masterBpm: save.data.masterBpm,
      masterKey: save.data.masterKey,
      placedBlocks: save.data.placedBlocks,
      viewport: save.data.viewport,
    })
  },

  deleteSave: async (name: string) => {
    const saves = get().saves.filter((s) => s.name !== name)
    set({ saves })
    await idbStorage.setItem(SAVES_KEY, JSON.stringify(saves))
  },
}))
