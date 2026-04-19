import type { StateStorage } from 'zustand/middleware'

function hasIndexedDB(): boolean {
  try {
    return typeof indexedDB !== 'undefined'
  } catch {
    return false
  }
}

/**
 * Zustand storage adapter using IndexedDB via idb-keyval.
 * Falls back to no-op when IndexedDB is unavailable (e.g., tests).
 */
export const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (!hasIndexedDB()) return null
    const { get } = await import('idb-keyval')
    const value = await get(name)
    return (value as string) ?? null
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (!hasIndexedDB()) return
    const { set } = await import('idb-keyval')
    await set(name, value)
  },
  removeItem: async (name: string): Promise<void> => {
    if (!hasIndexedDB()) return
    const { del } = await import('idb-keyval')
    await del(name)
  },
}
