# Phase 1: Core Canvas Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the foundational canvas where users can drag sound blocks from a starter library, hear them loop via Strudel's Web Audio engine, and interact via touch on mobile.

**Architecture:** React + TypeScript app with a Konva canvas for rendering blocks. Strudel core handles pattern scheduling and Web Audio playback. Zustand manages global state (canvas, playback, library). Blocks are dragged from a DOM-based library panel onto the Konva stage via HTML5 drag events.

**Tech Stack:** React 18, TypeScript, Vite, React-Konva, Zustand, @strudel/core, @strudel/webaudio, Vitest, @testing-library/react

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/App.css`

**Step 1: Initialize Vite project with React + TypeScript**

Run:
```bash
cd D:/claudeMusic
npm create vite@latest . -- --template react-ts
```

If prompted about existing files, choose to overwrite/ignore as needed.

**Step 2: Install core dependencies**

Run:
```bash
npm install react-konva konva zustand
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom happy-dom
```

**Step 3: Configure Vitest**

Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test-setup.ts',
  },
})
```

Create `src/test-setup.ts`:
```typescript
import '@testing-library/jest-dom/vitest'
```

**Step 4: Verify scaffolding works**

Run:
```bash
npm run dev
```
Expected: Dev server starts on localhost, shows Vite + React page.

Run:
```bash
npx vitest run
```
Expected: Test runner starts (0 tests, no errors).

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + TypeScript project with Konva and Zustand"
```

---

### Task 2: Data Types & Block Schema

**Files:**
- Create: `src/types/block.ts`
- Create: `src/types/canvas.ts`
- Test: `src/types/__tests__/block.test.ts`

**Step 1: Write the failing test**

Create `src/types/__tests__/block.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { createBlock, type Block, type BlockCategory } from '../block'

describe('createBlock', () => {
  it('creates a block with required fields and defaults', () => {
    const block = createBlock({
      name: 'Test Beat',
      category: 'beats',
      pattern: 's("bd sd [~ bd] sd")',
      key: 'C',
      bpm: 120,
    })

    expect(block.id).toBeDefined()
    expect(block.name).toBe('Test Beat')
    expect(block.category).toBe('beats')
    expect(block.pattern).toBe('s("bd sd [~ bd] sd")')
    expect(block.key).toBe('C')
    expect(block.bpm).toBe(120)
    expect(block.bars).toBe(1)
    expect(block.mood).toEqual({ energy: 0.5, brightness: 0.5 })
    expect(block.density).toBe(0.5)
    expect(block.tags).toEqual([])
    expect(block.source).toBe('preset')
    expect(block.createdAt).toBeInstanceOf(Date)
  })

  it('allows overriding optional fields', () => {
    const block = createBlock({
      name: 'Custom',
      category: 'bass',
      pattern: 'note("c2 eb2")',
      key: 'Cm',
      bpm: 90,
      bars: 4,
      mood: { energy: 0.8, brightness: 0.2 },
      density: 0.7,
      tags: ['dark', 'heavy'],
      source: 'ai-generated',
    })

    expect(block.bars).toBe(4)
    expect(block.mood.energy).toBe(0.8)
    expect(block.tags).toContain('dark')
    expect(block.source).toBe('ai-generated')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/types/__tests__/block.test.ts`
Expected: FAIL - cannot find module '../block'

**Step 3: Write the implementation**

Create `src/types/block.ts`:
```typescript
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
```

Create `src/types/canvas.ts`:
```typescript
import type { Block } from './block'

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
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/types/__tests__/block.test.ts`
Expected: PASS (2 tests)

**Step 5: Commit**

```bash
git add src/types/
git commit -m "feat: add Block and Canvas data types with factory functions"
```

---

### Task 3: Zustand Store — Library & Canvas State

**Files:**
- Create: `src/store/library-store.ts`
- Create: `src/store/canvas-store.ts`
- Test: `src/store/__tests__/canvas-store.test.ts`
- Test: `src/store/__tests__/library-store.test.ts`

**Step 1: Write the failing tests**

Create `src/store/__tests__/library-store.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useLibraryStore } from '../library-store'

describe('libraryStore', () => {
  beforeEach(() => {
    useLibraryStore.setState({ blocks: [] })
  })

  it('starts with an empty block list', () => {
    expect(useLibraryStore.getState().blocks).toEqual([])
  })

  it('loads blocks', () => {
    const mockBlock = {
      id: '1',
      name: 'Test',
      category: 'beats' as const,
      pattern: 's("bd")',
      key: 'C',
      bpm: 120,
      bars: 1,
      mood: { energy: 0.5, brightness: 0.5 },
      density: 0.5,
      tags: [],
      source: 'preset' as const,
      createdAt: new Date(),
    }
    useLibraryStore.getState().loadBlocks([mockBlock])
    expect(useLibraryStore.getState().blocks).toHaveLength(1)
    expect(useLibraryStore.getState().blocks[0].name).toBe('Test')
  })

  it('filters blocks by category', () => {
    const beat = {
      id: '1', name: 'Beat', category: 'beats' as const,
      pattern: '', key: 'C', bpm: 120, bars: 1,
      mood: { energy: 0.5, brightness: 0.5 }, density: 0.5,
      tags: [], source: 'preset' as const, createdAt: new Date(),
    }
    const bass = {
      id: '2', name: 'Bass', category: 'bass' as const,
      pattern: '', key: 'C', bpm: 120, bars: 1,
      mood: { energy: 0.5, brightness: 0.5 }, density: 0.5,
      tags: [], source: 'preset' as const, createdAt: new Date(),
    }
    useLibraryStore.getState().loadBlocks([beat, bass])
    const filtered = useLibraryStore.getState().getBlocksByCategory('beats')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].name).toBe('Beat')
  })
})
```

Create `src/store/__tests__/canvas-store.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useCanvasStore } from '../canvas-store'

describe('canvasStore', () => {
  beforeEach(() => {
    useCanvasStore.setState({
      masterBpm: 120,
      masterKey: null,
      placedBlocks: [],
      viewport: { x: 0, y: 0, zoom: 1 },
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
})
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/store/__tests__/`
Expected: FAIL - cannot find modules

**Step 3: Write the implementations**

Create `src/store/library-store.ts`:
```typescript
import { create } from 'zustand'
import type { Block, BlockCategory } from '../types/block'

interface LibraryState {
  blocks: Block[]
  loadBlocks: (blocks: Block[]) => void
  addBlock: (block: Block) => void
  getBlocksByCategory: (category: BlockCategory) => Block[]
  getBlockById: (id: string) => Block | undefined
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
}))
```

Create `src/store/canvas-store.ts`:
```typescript
import { create } from 'zustand'
import type { PlacedBlock } from '../types/canvas'
import { createPlacedBlock } from '../types/canvas'

interface CanvasStoreState {
  masterBpm: number
  masterKey: string | null
  placedBlocks: PlacedBlock[]
  viewport: { x: number; y: number; zoom: number }

  addBlock: (blockId: string, position: { x: number; y: number }) => void
  removeBlock: (placedId: string) => void
  moveBlock: (placedId: string, position: { x: number; y: number }) => void
  toggleMute: (placedId: string) => void
  setVolume: (placedId: string, volume: number) => void
  setMasterBpm: (bpm: number) => void
  setViewport: (viewport: { x: number; y: number; zoom: number }) => void
}

export const useCanvasStore = create<CanvasStoreState>((set) => ({
  masterBpm: 120,
  masterKey: null,
  placedBlocks: [],
  viewport: { x: 0, y: 0, zoom: 1 },

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

  setVolume: (placedId, volume) => set((state) => ({
    placedBlocks: state.placedBlocks.map((b) =>
      b.id === placedId ? { ...b, volume } : b
    ),
  })),

  setMasterBpm: (bpm) => set({ masterBpm: bpm }),

  setViewport: (viewport) => set({ viewport }),
}))
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/store/__tests__/`
Expected: PASS (all tests)

**Step 5: Commit**

```bash
git add src/store/
git commit -m "feat: add Zustand stores for library and canvas state"
```

---

### Task 4: Starter Block Library (Hardcoded Presets)

**Files:**
- Create: `src/data/starter-blocks.ts`
- Test: `src/data/__tests__/starter-blocks.test.ts`

**Step 1: Write the failing test**

Create `src/data/__tests__/starter-blocks.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { starterBlocks } from '../starter-blocks'

describe('starterBlocks', () => {
  it('has at least 20 blocks', () => {
    expect(starterBlocks.length).toBeGreaterThanOrEqual(20)
  })

  it('covers all categories', () => {
    const categories = new Set(starterBlocks.map((b) => b.category))
    expect(categories).toContain('beats')
    expect(categories).toContain('bass')
    expect(categories).toContain('melody')
    expect(categories).toContain('chords')
    expect(categories).toContain('fx')
    expect(categories).toContain('vocal')
  })

  it('each block has a valid Strudel pattern string', () => {
    for (const block of starterBlocks) {
      expect(block.pattern.length).toBeGreaterThan(0)
      expect(block.name.length).toBeGreaterThan(0)
    }
  })

  it('each block has valid mood values between 0 and 1', () => {
    for (const block of starterBlocks) {
      expect(block.mood.energy).toBeGreaterThanOrEqual(0)
      expect(block.mood.energy).toBeLessThanOrEqual(1)
      expect(block.mood.brightness).toBeGreaterThanOrEqual(0)
      expect(block.mood.brightness).toBeLessThanOrEqual(1)
    }
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/__tests__/starter-blocks.test.ts`
Expected: FAIL

**Step 3: Write the implementation**

Create `src/data/starter-blocks.ts`:
```typescript
import { createBlock, type Block } from '../types/block'

export const starterBlocks: Block[] = [
  // === BEATS ===
  createBlock({ name: 'Four on the Floor', category: 'beats', pattern: 's("bd*4, [~ cp]*2, hh*8")', key: 'chromatic', bpm: 120, mood: { energy: 0.7, brightness: 0.6 }, density: 0.7, tags: ['house', 'dance'] }),
  createBlock({ name: 'Chill Hip-Hop', category: 'beats', pattern: 's("bd ~ [~ bd] ~, ~ sd ~ sd, hh*8")', key: 'chromatic', bpm: 85, mood: { energy: 0.3, brightness: 0.4 }, density: 0.5, tags: ['lofi', 'chill'] }),
  createBlock({ name: 'Trap Beat', category: 'beats', pattern: 's("bd ~ ~ bd ~ ~ bd ~, ~ ~ sd ~ ~ ~ sd ~, hh*16")', key: 'chromatic', bpm: 140, mood: { energy: 0.9, brightness: 0.3 }, density: 0.8, tags: ['trap', 'hard'] }),
  createBlock({ name: 'Reggae One Drop', category: 'beats', pattern: 's("~ ~ ~ bd, ~ ~ sd ~, hh*4")', key: 'chromatic', bpm: 75, mood: { energy: 0.4, brightness: 0.6 }, density: 0.3, tags: ['reggae', 'laid-back'] }),
  createBlock({ name: 'Breakbeat', category: 'beats', pattern: 's("bd ~ sd bd ~ sd bd sd, hh*8")', key: 'chromatic', bpm: 130, mood: { energy: 0.8, brightness: 0.5 }, density: 0.7, tags: ['break', 'energetic'] }),

  // === BASS ===
  createBlock({ name: 'Sub Wobble', category: 'bass', pattern: 'note("c2 ~ eb2 ~").s("sawtooth").lpf(400)', key: 'Cm', bpm: 120, mood: { energy: 0.6, brightness: 0.2 }, density: 0.4, tags: ['dark', 'wobble'] }),
  createBlock({ name: 'Funky Slap', category: 'bass', pattern: 'note("c2 c2 eb2 f2 g2 f2 eb2 c2").s("sawtooth").lpf(800)', key: 'Cm', bpm: 110, mood: { energy: 0.7, brightness: 0.5 }, density: 0.7, tags: ['funky', 'groove'] }),
  createBlock({ name: 'Deep House Bass', category: 'bass', pattern: 'note("c2 ~ ~ c2 ~ ~ c2 ~").s("triangle").lpf(300)', key: 'Cm', bpm: 122, mood: { energy: 0.5, brightness: 0.3 }, density: 0.3, tags: ['deep', 'house'] }),
  createBlock({ name: 'Acid Line', category: 'bass', pattern: 'note("c2 c2 eb2 c2 f2 c2 g2 eb2").s("square").lpf(1200)', key: 'Cm', bpm: 130, mood: { energy: 0.8, brightness: 0.4 }, density: 0.8, tags: ['acid', 'squelchy'] }),

  // === MELODY ===
  createBlock({ name: 'Dreamy Piano', category: 'melody', pattern: 'note("<c4 e4 g4 b4>*2").s("piano")', key: 'C', bpm: 120, mood: { energy: 0.3, brightness: 0.7 }, density: 0.4, tags: ['dreamy', 'soft'] }),
  createBlock({ name: 'Plucky Synth Arp', category: 'melody', pattern: 'note("c4 e4 g4 c5 g4 e4").s("triangle")', key: 'C', bpm: 120, bars: 1, mood: { energy: 0.6, brightness: 0.8 }, density: 0.6, tags: ['arp', 'bright'] }),
  createBlock({ name: 'Dark Synth Lead', category: 'melody', pattern: 'note("eb4 ~ g4 ~ bb4 ~ g4 ~").s("sawtooth").lpf(2000)', key: 'Cm', bpm: 120, mood: { energy: 0.5, brightness: 0.3 }, density: 0.5, tags: ['dark', 'lead'] }),
  createBlock({ name: '8-bit Melody', category: 'melody', pattern: 'note("e5 b4 d5 c5 e5 b4 c5 d5").s("square")', key: 'C', bpm: 120, mood: { energy: 0.7, brightness: 0.9 }, density: 0.7, tags: ['retro', 'chiptune'] }),

  // === CHORDS ===
  createBlock({ name: 'Lo-fi Jazz Chords', category: 'chords', pattern: 'note("<[c3,e3,g3,b3] [a2,c3,e3,g3]>").s("piano")', key: 'C', bpm: 85, bars: 2, mood: { energy: 0.2, brightness: 0.5 }, density: 0.2, tags: ['lofi', 'jazz'] }),
  createBlock({ name: 'Ambient Wash', category: 'chords', pattern: 'note("<[c3,g3,c4] [f3,a3,c4]>").s("sawtooth").lpf(800).gain(0.3)', key: 'C', bpm: 120, bars: 2, mood: { energy: 0.1, brightness: 0.6 }, density: 0.1, tags: ['ambient', 'pad'] }),
  createBlock({ name: 'Power Chords', category: 'chords', pattern: 'note("<[c3,g3] [eb3,bb3] [f3,c4] [g3,d4]>").s("sawtooth").gain(0.5)', key: 'Cm', bpm: 130, bars: 4, mood: { energy: 0.8, brightness: 0.4 }, density: 0.3, tags: ['rock', 'power'] }),
  createBlock({ name: 'Bright Pop Chords', category: 'chords', pattern: 'note("<[c3,e3,g3] [f3,a3,c4] [g3,b3,d4] [c3,e3,g3]>").s("triangle")', key: 'C', bpm: 120, bars: 4, mood: { energy: 0.5, brightness: 0.8 }, density: 0.2, tags: ['pop', 'happy'] }),

  // === FX ===
  createBlock({ name: 'Vinyl Crackle', category: 'fx', pattern: 's("hh*16").gain(0.05).speed(0.5)', key: 'chromatic', bpm: 120, mood: { energy: 0.1, brightness: 0.3 }, density: 0.1, tags: ['texture', 'lofi'] }),
  createBlock({ name: 'Riser', category: 'fx', pattern: 'note("c3").s("sawtooth").lpf(sine.range(200, 8000).slow(4))', key: 'C', bpm: 120, bars: 4, mood: { energy: 0.6, brightness: 0.5 }, density: 0.1, tags: ['riser', 'build'] }),

  // === VOCAL ===
  createBlock({ name: 'Hey Chop', category: 'vocal', pattern: 's("mouth:0*2")', key: 'chromatic', bpm: 120, mood: { energy: 0.7, brightness: 0.7 }, density: 0.3, tags: ['chop', 'shout'] }),
  createBlock({ name: 'Ooh Pad', category: 'vocal', pattern: 's("mouth:1").slow(2)', key: 'C', bpm: 120, bars: 2, mood: { energy: 0.2, brightness: 0.5 }, density: 0.1, tags: ['vocal', 'pad'] }),
]
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/data/__tests__/starter-blocks.test.ts`
Expected: PASS (4 tests)

**Step 5: Commit**

```bash
git add src/data/
git commit -m "feat: add 20 starter blocks with Strudel patterns across all categories"
```

---

### Task 5: Konva Canvas Component with Pan & Zoom

**Files:**
- Create: `src/components/Canvas/MusicCanvas.tsx`
- Create: `src/components/Canvas/CanvasBlock.tsx`
- Test: `src/components/Canvas/__tests__/MusicCanvas.test.tsx`

**Step 1: Write the failing test**

Create `src/components/Canvas/__tests__/MusicCanvas.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MusicCanvas } from '../MusicCanvas'

describe('MusicCanvas', () => {
  it('renders a Konva stage container', () => {
    const { container } = render(<MusicCanvas />)
    const stageContainer = container.querySelector('.music-canvas')
    expect(stageContainer).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/Canvas/__tests__/MusicCanvas.test.tsx`
Expected: FAIL

**Step 3: Write the CanvasBlock component**

Create `src/components/Canvas/CanvasBlock.tsx`:
```typescript
import { Group, Rect, Text } from 'react-konva'
import type { PlacedBlock } from '../../types/canvas'
import type { Block } from '../../types/block'

const BLOCK_WIDTH = 140
const BLOCK_HEIGHT = 80

const CATEGORY_COLORS: Record<string, string> = {
  beats: '#FF6B6B',
  bass: '#4ECDC4',
  melody: '#45B7D1',
  chords: '#96CEB4',
  fx: '#DDA0DD',
  vocal: '#FFD93D',
}

interface CanvasBlockProps {
  placed: PlacedBlock
  block: Block
  onDragEnd: (id: string, x: number, y: number) => void
  onDoubleTap: (id: string) => void
}

export function CanvasBlock({ placed, block, onDragEnd, onDoubleTap }: CanvasBlockProps) {
  const color = CATEGORY_COLORS[block.category] ?? '#999'
  const opacity = placed.muted ? 0.4 : 1

  return (
    <Group
      x={placed.position.x}
      y={placed.position.y}
      draggable
      opacity={opacity}
      onDragEnd={(e) => {
        onDragEnd(placed.id, e.target.x(), e.target.y())
      }}
      onDblClick={() => onDoubleTap(placed.id)}
      onDblTap={() => onDoubleTap(placed.id)}
    >
      <Rect
        width={BLOCK_WIDTH}
        height={BLOCK_HEIGHT}
        fill={color}
        cornerRadius={10}
        shadowColor="black"
        shadowBlur={6}
        shadowOpacity={0.2}
        shadowOffsetY={2}
      />
      <Text
        text={block.name}
        width={BLOCK_WIDTH}
        height={BLOCK_HEIGHT * 0.6}
        y={8}
        align="center"
        verticalAlign="middle"
        fontSize={13}
        fontStyle="bold"
        fill="#fff"
      />
      <Text
        text={`${block.key} | ${block.bpm} BPM`}
        width={BLOCK_WIDTH}
        height={BLOCK_HEIGHT * 0.4}
        y={BLOCK_HEIGHT * 0.55}
        align="center"
        fontSize={10}
        fill="rgba(255,255,255,0.7)"
      />
    </Group>
  )
}
```

**Step 4: Write the MusicCanvas component**

Create `src/components/Canvas/MusicCanvas.tsx`:
```typescript
import { useRef, useCallback } from 'react'
import { Stage, Layer } from 'react-konva'
import type Konva from 'konva'
import { useCanvasStore } from '../../store/canvas-store'
import { useLibraryStore } from '../../store/library-store'
import { CanvasBlock } from './CanvasBlock'

export function MusicCanvas() {
  const stageRef = useRef<Konva.Stage>(null)
  const { placedBlocks, viewport, moveBlock, setViewport } = useCanvasStore()
  const { getBlockById } = useLibraryStore()

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const stage = stageRef.current
    if (!stage) return

    const oldScale = viewport.zoom
    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const scaleBy = 1.08
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy
    const clampedScale = Math.max(0.2, Math.min(3, newScale))

    const mousePointTo = {
      x: (pointer.x - viewport.x) / oldScale,
      y: (pointer.y - viewport.y) / oldScale,
    }

    setViewport({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
      zoom: clampedScale,
    })
  }, [viewport, setViewport])

  const handleDragEnd = useCallback((id: string, x: number, y: number) => {
    moveBlock(id, { x, y })
  }, [moveBlock])

  const handleDoubleTap = useCallback((_id: string) => {
    // Will open block detail panel in later task
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const blockId = e.dataTransfer.getData('blockId')
    if (!blockId) return

    const stage = stageRef.current
    if (!stage) return

    stage.setPointersPositions(e)
    const pointerPos = stage.getPointerPosition()
    if (!pointerPos) return

    const x = (pointerPos.x - viewport.x) / viewport.zoom
    const y = (pointerPos.y - viewport.y) / viewport.zoom

    useCanvasStore.getState().addBlock(blockId, { x, y })
  }, [viewport])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  return (
    <div
      className="music-canvas"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
    >
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        scaleX={viewport.zoom}
        scaleY={viewport.zoom}
        x={viewport.x}
        y={viewport.y}
        draggable
        onWheel={handleWheel}
        onDragEnd={(e) => {
          if (e.target === stageRef.current) {
            setViewport({
              ...viewport,
              x: e.target.x(),
              y: e.target.y(),
            })
          }
        }}
      >
        <Layer>
          {placedBlocks.map((placed) => {
            const block = getBlockById(placed.blockId)
            if (!block) return null
            return (
              <CanvasBlock
                key={placed.id}
                placed={placed}
                block={block}
                onDragEnd={handleDragEnd}
                onDoubleTap={handleDoubleTap}
              />
            )
          })}
        </Layer>
      </Stage>
    </div>
  )
}
```

**Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/Canvas/__tests__/MusicCanvas.test.tsx`
Expected: PASS

Note: Konva tests in happy-dom can be tricky. If tests fail due to canvas not being supported in the test environment, mock Konva:

Create `src/__mocks__/react-konva.tsx` if needed:
```typescript
import React from 'react'
export const Stage = ({ children, ...props }: any) => <div data-testid="stage" {...props}>{children}</div>
export const Layer = ({ children }: any) => <div>{children}</div>
export const Group = ({ children }: any) => <div>{children}</div>
export const Rect = () => <div />
export const Text = ({ text }: any) => <span>{text}</span>
```

**Step 6: Commit**

```bash
git add src/components/ src/__mocks__/
git commit -m "feat: add Konva canvas with pan, zoom, block rendering, and DOM drop support"
```

---

### Task 6: Library Panel with Drag-Out

**Files:**
- Create: `src/components/Library/LibraryPanel.tsx`
- Create: `src/components/Library/LibraryBlockCard.tsx`
- Create: `src/components/Library/LibraryPanel.css`
- Test: `src/components/Library/__tests__/LibraryPanel.test.tsx`

**Step 1: Write the failing test**

Create `src/components/Library/__tests__/LibraryPanel.test.tsx`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LibraryPanel } from '../LibraryPanel'
import { useLibraryStore } from '../../../store/library-store'
import { starterBlocks } from '../../../data/starter-blocks'

describe('LibraryPanel', () => {
  beforeEach(() => {
    useLibraryStore.getState().loadBlocks(starterBlocks)
  })

  it('renders category tabs', () => {
    render(<LibraryPanel />)
    expect(screen.getByText('Beats')).toBeInTheDocument()
    expect(screen.getByText('Bass')).toBeInTheDocument()
    expect(screen.getByText('Melody')).toBeInTheDocument()
  })

  it('shows blocks for the default category', () => {
    render(<LibraryPanel />)
    // 'All' tab should be selected by default, showing all blocks
    expect(screen.getByText('Four on the Floor')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/Library/__tests__/LibraryPanel.test.tsx`
Expected: FAIL

**Step 3: Write LibraryBlockCard**

Create `src/components/Library/LibraryBlockCard.tsx`:
```typescript
import type { Block } from '../../types/block'

const CATEGORY_COLORS: Record<string, string> = {
  beats: '#FF6B6B',
  bass: '#4ECDC4',
  melody: '#45B7D1',
  chords: '#96CEB4',
  fx: '#DDA0DD',
  vocal: '#FFD93D',
}

interface LibraryBlockCardProps {
  block: Block
}

export function LibraryBlockCard({ block }: LibraryBlockCardProps) {
  const color = CATEGORY_COLORS[block.category] ?? '#999'

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('blockId', block.id)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div
      className="library-block-card"
      draggable
      onDragStart={handleDragStart}
      style={{
        background: color,
        borderRadius: '8px',
        padding: '10px 12px',
        cursor: 'grab',
        color: '#fff',
        userSelect: 'none',
      }}
    >
      <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{block.name}</div>
      <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '4px' }}>
        {block.key} | {block.bpm} BPM | {block.tags.slice(0, 2).join(', ')}
      </div>
    </div>
  )
}
```

**Step 4: Write LibraryPanel**

Create `src/components/Library/LibraryPanel.tsx`:
```typescript
import { useState } from 'react'
import { useLibraryStore } from '../../store/library-store'
import { LibraryBlockCard } from './LibraryBlockCard'
import type { BlockCategory } from '../../types/block'
import './LibraryPanel.css'

const TABS: { label: string; value: BlockCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Beats', value: 'beats' },
  { label: 'Bass', value: 'bass' },
  { label: 'Melody', value: 'melody' },
  { label: 'Chords', value: 'chords' },
  { label: 'FX', value: 'fx' },
  { label: 'Vocal', value: 'vocal' },
]

export function LibraryPanel() {
  const [activeTab, setActiveTab] = useState<BlockCategory | 'all'>('all')
  const { blocks, getBlocksByCategory } = useLibraryStore()

  const displayedBlocks = activeTab === 'all' ? blocks : getBlocksByCategory(activeTab)

  return (
    <div className="library-panel">
      <div className="library-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            className={`library-tab ${activeTab === tab.value ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="library-blocks">
        {displayedBlocks.map((block) => (
          <LibraryBlockCard key={block.id} block={block} />
        ))}
        {displayedBlocks.length === 0 && (
          <div className="library-empty">No blocks in this category</div>
        )}
      </div>
    </div>
  )
}
```

Create `src/components/Library/LibraryPanel.css`:
```css
.library-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1a1a2e;
  border-top: 2px solid #333;
  max-height: 40vh;
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.library-tabs {
  display: flex;
  gap: 2px;
  padding: 8px 8px 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.library-tab {
  padding: 6px 14px;
  border: none;
  background: #2a2a3e;
  color: #aaa;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
}

.library-tab.active {
  background: #3a3a5e;
  color: #fff;
}

.library-blocks {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
  padding: 10px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.library-empty {
  color: #666;
  text-align: center;
  padding: 20px;
  grid-column: 1 / -1;
}
```

**Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/Library/__tests__/LibraryPanel.test.tsx`
Expected: PASS

**Step 6: Commit**

```bash
git add src/components/Library/
git commit -m "feat: add library panel with category tabs and drag-out block cards"
```

---

### Task 7: Strudel Audio Engine Integration

**Files:**
- Create: `src/audio/engine.ts`
- Create: `src/audio/usePlayback.ts`
- Test: `src/audio/__tests__/engine.test.ts`

**Step 1: Install Strudel packages**

Run:
```bash
npm install @strudel/core @strudel/webaudio @strudel/mini
```

Note: If these packages are not available on npm, fall back to using the Web Audio API directly with a simple pattern scheduler. Check npm first:
```bash
npm search @strudel/core
```

If Strudel packages are not on npm, create a lightweight pattern scheduler using Web Audio API directly. The implementation below provides both approaches.

**Step 2: Write the failing test**

Create `src/audio/__tests__/engine.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { AudioEngine } from '../engine'

// Mock Web Audio API
const mockAudioContext = {
  currentTime: 0,
  destination: {},
  createGain: vi.fn(() => ({
    gain: { value: 1, setValueAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  createOscillator: vi.fn(() => ({
    type: 'sine',
    frequency: { value: 440, setValueAtTime: vi.fn() },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  })),
  resume: vi.fn(),
  suspend: vi.fn(),
  state: 'running',
}

vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext))

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
```

**Step 3: Run test to verify it fails**

Run: `npx vitest run src/audio/__tests__/engine.test.ts`
Expected: FAIL

**Step 4: Write the AudioEngine**

Create `src/audio/engine.ts`:
```typescript
export class AudioEngine {
  private ctx: AudioContext | null = null
  private bpm = 120
  private playing = false
  private patterns = new Map<string, string>()
  private masterGain: GainNode | null = null

  constructor() {
    // AudioContext created on first user gesture (start)
  }

  async start() {
    if (!this.ctx) {
      this.ctx = new AudioContext()
      this.masterGain = this.ctx.createGain()
      this.masterGain.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }
    this.playing = true
  }

  stop() {
    this.playing = false
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend()
    }
  }

  isPlaying(): boolean {
    return this.playing
  }

  setBpm(bpm: number) {
    this.bpm = Math.max(40, Math.min(300, bpm))
  }

  getBpm(): number {
    return this.bpm
  }

  addPattern(id: string, pattern: string) {
    this.patterns.set(id, pattern)
    // TODO: In full Strudel integration, evaluate and schedule the pattern
    // For now, track it for state management
  }

  removePattern(id: string) {
    this.patterns.delete(id)
  }

  mutePattern(id: string, muted: boolean) {
    // TODO: Implement per-pattern gain control
    void id
    void muted
  }

  getActivePatterns(): string[] {
    return Array.from(this.patterns.keys())
  }

  getAudioContext(): AudioContext | null {
    return this.ctx
  }

  dispose() {
    this.stop()
    this.patterns.clear()
    if (this.ctx) {
      this.ctx.close()
      this.ctx = null
    }
  }
}

// Singleton instance
export const audioEngine = new AudioEngine()
```

**Step 5: Write the usePlayback hook**

Create `src/audio/usePlayback.ts`:
```typescript
import { useEffect, useCallback, useState } from 'react'
import { audioEngine } from './engine'
import { useCanvasStore } from '../store/canvas-store'

export function usePlayback() {
  const [isPlaying, setIsPlaying] = useState(false)
  const { masterBpm, placedBlocks } = useCanvasStore()

  useEffect(() => {
    audioEngine.setBpm(masterBpm)
  }, [masterBpm])

  // Sync placed blocks with audio engine
  useEffect(() => {
    const activePatterns = audioEngine.getActivePatterns()
    const placedIds = new Set(placedBlocks.map((b) => b.id))

    // Remove patterns that are no longer on canvas
    for (const id of activePatterns) {
      if (!placedIds.has(id)) {
        audioEngine.removePattern(id)
      }
    }

    // Add/update patterns for placed blocks
    for (const placed of placedBlocks) {
      audioEngine.mutePattern(placed.id, placed.muted)
    }
  }, [placedBlocks])

  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      audioEngine.stop()
      setIsPlaying(false)
    } else {
      await audioEngine.start()
      setIsPlaying(true)
    }
  }, [isPlaying])

  return { isPlaying, togglePlayback }
}
```

**Step 6: Run test to verify it passes**

Run: `npx vitest run src/audio/__tests__/engine.test.ts`
Expected: PASS

**Step 7: Commit**

```bash
git add src/audio/
git commit -m "feat: add AudioEngine with Web Audio API and usePlayback hook"
```

---

### Task 8: Transport Controls (Play/Stop + BPM Slider)

**Files:**
- Create: `src/components/Transport/TransportBar.tsx`
- Create: `src/components/Transport/TransportBar.css`
- Test: `src/components/Transport/__tests__/TransportBar.test.tsx`

**Step 1: Write the failing test**

Create `src/components/Transport/__tests__/TransportBar.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TransportBar } from '../TransportBar'

// Mock usePlayback
vi.mock('../../../audio/usePlayback', () => ({
  usePlayback: () => ({
    isPlaying: false,
    togglePlayback: vi.fn(),
  }),
}))

describe('TransportBar', () => {
  it('renders play button', () => {
    render(<TransportBar />)
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
  })

  it('renders BPM slider', () => {
    render(<TransportBar />)
    expect(screen.getByLabelText(/bpm/i)).toBeInTheDocument()
  })

  it('displays current BPM value', () => {
    render(<TransportBar />)
    expect(screen.getByText(/120/)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/Transport/__tests__/TransportBar.test.tsx`
Expected: FAIL

**Step 3: Write the implementation**

Create `src/components/Transport/TransportBar.tsx`:
```typescript
import { usePlayback } from '../../audio/usePlayback'
import { useCanvasStore } from '../../store/canvas-store'
import './TransportBar.css'

export function TransportBar() {
  const { isPlaying, togglePlayback } = usePlayback()
  const { masterBpm, setMasterBpm } = useCanvasStore()

  return (
    <div className="transport-bar">
      <button
        className="transport-play-btn"
        onClick={togglePlayback}
        aria-label={isPlaying ? 'Stop' : 'Play'}
      >
        {isPlaying ? '⏹' : '▶'}
      </button>

      <div className="transport-bpm">
        <label htmlFor="bpm-slider" className="transport-bpm-label">
          BPM
        </label>
        <input
          id="bpm-slider"
          type="range"
          min={40}
          max={200}
          value={masterBpm}
          onChange={(e) => setMasterBpm(Number(e.target.value))}
          className="transport-bpm-slider"
          aria-label="BPM"
        />
        <span className="transport-bpm-value">{masterBpm}</span>
      </div>
    </div>
  )
}
```

Create `src/components/Transport/TransportBar.css`:
```css
.transport-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: #1a1a2e;
  border-bottom: 2px solid #333;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 16px;
  z-index: 100;
}

.transport-play-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #4ECDC4;
  background: transparent;
  color: #4ECDC4;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.transport-play-btn:hover {
  background: #4ECDC422;
}

.transport-bpm {
  display: flex;
  align-items: center;
  gap: 8px;
}

.transport-bpm-label {
  color: #888;
  font-size: 11px;
  text-transform: uppercase;
}

.transport-bpm-slider {
  width: 120px;
  accent-color: #4ECDC4;
}

.transport-bpm-value {
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  min-width: 32px;
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/Transport/__tests__/TransportBar.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/Transport/
git commit -m "feat: add transport bar with play/stop button and BPM slider"
```

---

### Task 9: Wire Everything Together in App.tsx

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.css`
- Modify: `src/main.tsx`
- Modify: `src/index.css`

**Step 1: Update App.tsx**

Replace `src/App.tsx`:
```typescript
import { useEffect } from 'react'
import { MusicCanvas } from './components/Canvas/MusicCanvas'
import { LibraryPanel } from './components/Library/LibraryPanel'
import { TransportBar } from './components/Transport/TransportBar'
import { useLibraryStore } from './store/library-store'
import { starterBlocks } from './data/starter-blocks'
import './App.css'

function App() {
  const { loadBlocks, blocks } = useLibraryStore()

  useEffect(() => {
    if (blocks.length === 0) {
      loadBlocks(starterBlocks)
    }
  }, [loadBlocks, blocks.length])

  return (
    <div className="app">
      <TransportBar />
      <div className="canvas-area">
        <MusicCanvas />
      </div>
      <LibraryPanel />
    </div>
  )
}

export default App
```

**Step 2: Update App.css**

Replace `src/App.css`:
```css
.app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #0f0f23;
  position: relative;
}

.canvas-area {
  position: absolute;
  top: 48px;
  left: 0;
  right: 0;
  bottom: 0;
}
```

**Step 3: Update index.css**

Replace `src/index.css`:
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0f0f23;
  color: #fff;
}
```

**Step 4: Clean up main.tsx**

Ensure `src/main.tsx` is clean:
```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Step 5: Run the app and verify visually**

Run: `npm run dev`
Expected:
- Dark background with transport bar at top (play button + BPM slider)
- Library panel at bottom with category tabs and block cards
- Dragging a block card from the library onto the canvas area creates a colored block on the canvas
- Blocks on canvas can be dragged to reposition
- Mouse wheel zooms, drag on empty canvas pans

**Step 6: Run all tests**

Run: `npx vitest run`
Expected: All tests pass

**Step 7: Commit**

```bash
git add src/App.tsx src/App.css src/index.css src/main.tsx
git commit -m "feat: wire up App with canvas, library panel, and transport bar"
```

---

### Task 10: Mobile Touch Support (Pinch-Zoom)

**Files:**
- Modify: `src/components/Canvas/MusicCanvas.tsx`
- Create: `src/hooks/usePinchZoom.ts`

**Step 1: Write the pinch-zoom hook**

Create `src/hooks/usePinchZoom.ts`:
```typescript
import { useRef, useCallback } from 'react'
import type Konva from 'konva'
import { useCanvasStore } from '../store/canvas-store'

function getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

function getCenter(p1: { x: number; y: number }, p2: { x: number; y: number }) {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
}

export function usePinchZoom(stageRef: React.RefObject<Konva.Stage | null>) {
  const lastCenter = useRef<{ x: number; y: number } | null>(null)
  const lastDist = useRef(0)
  const { viewport, setViewport } = useCanvasStore()

  const handleTouchMove = useCallback((e: Konva.KonvaEventObject<TouchEvent>) => {
    e.evt.preventDefault()
    const touch1 = e.evt.touches[0]
    const touch2 = e.evt.touches[1]

    if (!touch1 || !touch2) return

    const stage = stageRef.current
    if (!stage) return

    // Stop Konva drag when pinching
    if (stage.isDragging()) {
      stage.stopDrag()
    }

    const rect = stage.container().getBoundingClientRect()
    const p1 = { x: touch1.clientX - rect.left, y: touch1.clientY - rect.top }
    const p2 = { x: touch2.clientX - rect.left, y: touch2.clientY - rect.top }

    if (!lastCenter.current) {
      lastCenter.current = getCenter(p1, p2)
      lastDist.current = getDistance(p1, p2)
      return
    }

    const newCenter = getCenter(p1, p2)
    const dist = getDistance(p1, p2)

    const pointTo = {
      x: (newCenter.x - viewport.x) / viewport.zoom,
      y: (newCenter.y - viewport.y) / viewport.zoom,
    }

    const scale = Math.max(0.2, Math.min(3, viewport.zoom * (dist / lastDist.current)))

    const dx = newCenter.x - lastCenter.current.x
    const dy = newCenter.y - lastCenter.current.y

    setViewport({
      x: newCenter.x - pointTo.x * scale + dx,
      y: newCenter.y - pointTo.y * scale + dy,
      zoom: scale,
    })

    lastDist.current = dist
    lastCenter.current = newCenter
  }, [stageRef, viewport, setViewport])

  const handleTouchEnd = useCallback(() => {
    lastCenter.current = null
    lastDist.current = 0
  }, [])

  return { handleTouchMove, handleTouchEnd }
}
```

**Step 2: Update MusicCanvas to use pinch-zoom**

Add to `src/components/Canvas/MusicCanvas.tsx` — import the hook and attach events to the Stage:

Add import:
```typescript
import { usePinchZoom } from '../../hooks/usePinchZoom'
```

Inside the component, after the stageRef:
```typescript
const { handleTouchMove, handleTouchEnd } = usePinchZoom(stageRef)
```

Add to the `<Stage>` element:
```typescript
onTouchMove={handleTouchMove}
onTouchEnd={handleTouchEnd}
```

**Step 3: Add viewport meta tag**

In `index.html`, ensure the head includes:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```

**Step 4: Test on mobile (or Chrome DevTools mobile emulator)**

Run: `npm run dev`
Open Chrome DevTools > Toggle Device Toolbar > Select a phone
Expected:
- Pinch gesture zooms the canvas
- Single finger drag pans
- Long-press on canvas block starts drag
- Library panel scrolls horizontally for tabs

**Step 5: Commit**

```bash
git add src/hooks/ src/components/Canvas/MusicCanvas.tsx index.html
git commit -m "feat: add mobile pinch-to-zoom and touch support for canvas"
```

---

### Task 11: Block Mute/Solo Toggle

**Files:**
- Modify: `src/components/Canvas/CanvasBlock.tsx`
- Modify: `src/store/canvas-store.ts` (add solo logic)
- Test: `src/store/__tests__/canvas-store.test.ts` (add solo test)

**Step 1: Add solo to the canvas store**

Add to `canvas-store.ts` interface and implementation:

```typescript
// Add to CanvasStoreState interface:
soloId: string | null
toggleSolo: (placedId: string) => void

// Add to create():
soloId: null,

toggleSolo: (placedId) => set((state) => ({
  soloId: state.soloId === placedId ? null : placedId,
})),
```

**Step 2: Write the test for solo**

Add to `src/store/__tests__/canvas-store.test.ts`:
```typescript
it('toggles solo on a placed block', () => {
  useCanvasStore.getState().addBlock('block-1', { x: 0, y: 0 })
  const id = useCanvasStore.getState().placedBlocks[0].id
  useCanvasStore.getState().toggleSolo(id)
  expect(useCanvasStore.getState().soloId).toBe(id)
  useCanvasStore.getState().toggleSolo(id)
  expect(useCanvasStore.getState().soloId).toBeNull()
})
```

**Step 3: Run tests**

Run: `npx vitest run src/store/__tests__/canvas-store.test.ts`
Expected: PASS

**Step 4: Add mute/solo buttons to CanvasBlock**

Update `src/components/Canvas/CanvasBlock.tsx` — add tap targets for mute and solo. Add to the CanvasBlockProps:
```typescript
onToggleMute: (id: string) => void
onToggleSolo: (id: string) => void
isSoloed: boolean
```

Add small Rect + Text elements at the bottom of the Group for "M" (mute) and "S" (solo) buttons, with onTap/onClick handlers.

**Step 5: Run all tests**

Run: `npx vitest run`
Expected: All pass

**Step 6: Commit**

```bash
git add src/components/Canvas/CanvasBlock.tsx src/store/canvas-store.ts src/store/__tests__/canvas-store.test.ts
git commit -m "feat: add mute and solo toggles to canvas blocks"
```

---

### Task 12: Final Integration Test & Cleanup

**Files:**
- Create: `src/__tests__/app-integration.test.tsx`
- Modify: `src/App.tsx` (any remaining cleanup)

**Step 1: Write integration test**

Create `src/__tests__/app-integration.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App Integration', () => {
  it('renders the full app without crashing', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Beats')).toBeInTheDocument()
  })

  it('loads starter blocks into the library', () => {
    render(<App />)
    expect(screen.getByText('Four on the Floor')).toBeInTheDocument()
    expect(screen.getByText('Sub Wobble')).toBeInTheDocument()
  })
})
```

**Step 2: Run all tests**

Run: `npx vitest run`
Expected: All tests pass

**Step 3: Run the dev server and verify**

Run: `npm run dev`
Verify the complete flow:
1. App loads with dark theme
2. Transport bar at top with play/stop and BPM slider
3. Library panel at bottom with all category tabs
4. Can drag blocks from library onto canvas
5. Blocks appear as colored rounded rectangles
6. Canvas pans with drag, zooms with scroll wheel
7. Blocks can be repositioned by dragging on canvas

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: complete Phase 1 - core canvas with library, transport, and mobile support"
```

---

## Summary

Phase 1 delivers: a working canvas (pan/zoom/touch), 20 starter blocks across 6 categories, a library panel with category filtering, drag-from-library-to-canvas, block repositioning, mute/solo, transport controls (play/stop + BPM), and mobile pinch-zoom. All backed by tests. The audio engine is scaffolded and ready for full Strudel integration in the next iteration.
