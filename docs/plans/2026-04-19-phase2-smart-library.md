# Phase 2: Smart Library Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the library panel with text search, key/BPM compatibility hints (green/yellow/red glow), a mood grid browser, "sounds like this" filtering, tap-to-preview, and expand to 50+ starter blocks.

**Architecture:** Add a compatibility utility that scores block pairs by key and BPM similarity. Wire it into LibraryBlockCard to show colored borders when dragging near canvas blocks. Add a search bar to the library, a mood grid view as an alternative to the list, and a preview system that plays a block via the audio engine without placing it on canvas.

**Tech Stack:** React, TypeScript, Zustand, @strudel/web (for preview), Vitest

---

### Task 1: Compatibility Scoring Utility

**Files:**
- Create: `src/utils/compatibility.ts`
- Test: `src/utils/__tests__/compatibility.test.ts`

**Step 1: Write the failing test**

Create `src/utils/__tests__/compatibility.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { getCompatibility, type CompatibilityLevel } from '../compatibility'

describe('getCompatibility', () => {
  it('returns green for same key', () => {
    const result = getCompatibility({ key: 'C', bpm: 120 }, { key: 'C', bpm: 120 })
    expect(result.level).toBe('green')
    expect(result.score).toBeGreaterThanOrEqual(0.8)
  })

  it('returns green for relative minor/major', () => {
    const result = getCompatibility({ key: 'C', bpm: 120 }, { key: 'Am', bpm: 120 })
    expect(result.level).toBe('green')
  })

  it('returns yellow for adjacent keys on circle of fifths', () => {
    const result = getCompatibility({ key: 'C', bpm: 120 }, { key: 'G', bpm: 120 })
    expect(result.level).toBe('yellow')
  })

  it('returns red for distant keys', () => {
    const result = getCompatibility({ key: 'C', bpm: 120 }, { key: 'F#', bpm: 120 })
    expect(result.level).toBe('red')
  })

  it('returns green for chromatic blocks (drums/fx)', () => {
    const result = getCompatibility({ key: 'chromatic', bpm: 120 }, { key: 'Cm', bpm: 120 })
    expect(result.level).toBe('green')
  })

  it('penalizes large BPM differences', () => {
    const same = getCompatibility({ key: 'C', bpm: 120 }, { key: 'C', bpm: 120 })
    const diff = getCompatibility({ key: 'C', bpm: 120 }, { key: 'C', bpm: 80 })
    expect(diff.score).toBeLessThan(same.score)
  })

  it('tolerates small BPM differences', () => {
    const result = getCompatibility({ key: 'C', bpm: 120 }, { key: 'C', bpm: 125 })
    expect(result.level).toBe('green')
  })

  it('considers double/half tempo as compatible', () => {
    const result = getCompatibility({ key: 'C', bpm: 120 }, { key: 'C', bpm: 60 })
    expect(result.level).not.toBe('red')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/__tests__/compatibility.test.ts`
Expected: FAIL - cannot find module

**Step 3: Write the implementation**

Create `src/utils/compatibility.ts`:
```typescript
export type CompatibilityLevel = 'green' | 'yellow' | 'red'

export interface CompatibilityResult {
  level: CompatibilityLevel
  score: number // 0-1
}

interface BlockInfo {
  key: string
  bpm: number
}

// Circle of fifths distance (0 = same, 1 = adjacent, etc.)
const KEY_MAP: Record<string, number> = {
  'C': 0, 'Am': 0,
  'G': 1, 'Em': 1,
  'D': 2, 'Bm': 2,
  'A': 3, 'F#m': 3,
  'E': 4, 'C#m': 4, 'Dbm': 4,
  'B': 5, 'G#m': 5, 'Abm': 5,
  'F#': 6, 'Gb': 6, 'D#m': 6, 'Ebm': 6,
  'Db': 5, 'C#': 5, 'Bbm': 5,
  'Ab': 4, 'Fm': 4,
  'Eb': 3, 'Cm': 3,
  'Bb': 2, 'Gm': 2,
  'F': 1, 'Dm': 1,
}

function getKeyDistance(key1: string, key2: string): number {
  const pos1 = KEY_MAP[key1]
  const pos2 = KEY_MAP[key2]
  if (pos1 === undefined || pos2 === undefined) return 0
  const dist = Math.abs(pos1 - pos2)
  return Math.min(dist, 7 - dist) // wrap around circle
}

function getBpmCompatibility(bpm1: number, bpm2: number): number {
  const ratio = bpm1 / bpm2
  // Check direct, double, and half tempo
  const ratios = [ratio, ratio * 2, ratio / 2]
  const bestRatio = ratios.reduce((best, r) =>
    Math.abs(r - 1) < Math.abs(best - 1) ? r : best
  )
  const deviation = Math.abs(bestRatio - 1)
  // 0% deviation = 1.0, 20% deviation = 0.5, 40%+ = 0
  return Math.max(0, 1 - deviation * 2.5)
}

export function getCompatibility(a: BlockInfo, b: BlockInfo): CompatibilityResult {
  // Chromatic blocks (drums, fx) are always compatible key-wise
  const isChromatic = a.key === 'chromatic' || b.key === 'chromatic'

  const keyDistance = isChromatic ? 0 : getKeyDistance(a.key, b.key)
  const keyScore = Math.max(0, 1 - keyDistance * 0.2)
  const bpmScore = getBpmCompatibility(a.bpm, b.bpm)

  // Weighted: key matters more than BPM (Strudel auto-syncs tempo)
  const score = keyScore * 0.7 + bpmScore * 0.3

  let level: CompatibilityLevel
  if (score >= 0.7) level = 'green'
  else if (score >= 0.4) level = 'yellow'
  else level = 'red'

  return { level, score }
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/__tests__/compatibility.test.ts`
Expected: PASS (8 tests)

**Step 5: Commit**

```bash
git add src/utils/
git commit -m "feat: add key/BPM compatibility scoring utility"
```

---

### Task 2: Text Search in Library

**Files:**
- Modify: `src/store/library-store.ts`
- Modify: `src/components/Library/LibraryPanel.tsx`
- Modify: `src/components/Library/LibraryPanel.css`
- Test: `src/store/__tests__/library-store.test.ts` (add search tests)

**Step 1: Add search tests**

Append to `src/store/__tests__/library-store.test.ts`:
```typescript
it('searches blocks by name', () => {
  const beat = {
    id: '1', name: 'Four on the Floor', category: 'beats' as const,
    pattern: '', key: 'C', bpm: 120, bars: 1,
    mood: { energy: 0.5, brightness: 0.5 }, density: 0.5,
    tags: ['house'], source: 'preset' as const, createdAt: new Date(),
  }
  const bass = {
    id: '2', name: 'Sub Wobble', category: 'bass' as const,
    pattern: '', key: 'Cm', bpm: 120, bars: 1,
    mood: { energy: 0.5, brightness: 0.5 }, density: 0.5,
    tags: ['dark'], source: 'preset' as const, createdAt: new Date(),
  }
  useLibraryStore.getState().loadBlocks([beat, bass])
  const results = useLibraryStore.getState().searchBlocks('wobble')
  expect(results).toHaveLength(1)
  expect(results[0].name).toBe('Sub Wobble')
})

it('searches blocks by tags', () => {
  const beat = {
    id: '1', name: 'Test', category: 'beats' as const,
    pattern: '', key: 'C', bpm: 120, bars: 1,
    mood: { energy: 0.5, brightness: 0.5 }, density: 0.5,
    tags: ['house', 'dance'], source: 'preset' as const, createdAt: new Date(),
  }
  useLibraryStore.getState().loadBlocks([beat])
  const results = useLibraryStore.getState().searchBlocks('dance')
  expect(results).toHaveLength(1)
})

it('searches blocks by key', () => {
  const block = {
    id: '1', name: 'Test', category: 'bass' as const,
    pattern: '', key: 'Cm', bpm: 120, bars: 1,
    mood: { energy: 0.5, brightness: 0.5 }, density: 0.5,
    tags: [], source: 'preset' as const, createdAt: new Date(),
  }
  useLibraryStore.getState().loadBlocks([block])
  const results = useLibraryStore.getState().searchBlocks('Cm')
  expect(results).toHaveLength(1)
})
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/store/__tests__/library-store.test.ts`
Expected: FAIL - searchBlocks not found

**Step 3: Add searchBlocks to library store**

Add to `src/store/library-store.ts` interface and implementation:
```typescript
// Add to interface:
searchBlocks: (query: string) => Block[]

// Add to implementation:
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
```

**Step 4: Add search bar to LibraryPanel**

Add a search input above the tabs in `src/components/Library/LibraryPanel.tsx`:
```typescript
const [searchQuery, setSearchQuery] = useState('')
const { blocks, getBlocksByCategory, searchBlocks } = useLibraryStore()

const filteredBlocks = searchQuery
  ? searchBlocks(searchQuery)
  : (activeTab === 'all' ? blocks : getBlocksByCategory(activeTab))
```

Add the search input JSX before the tabs div:
```tsx
<div className="library-search">
  <input
    type="text"
    placeholder="Search blocks..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="library-search-input"
  />
</div>
```

Add CSS for the search bar in `LibraryPanel.css`:
```css
.library-search {
  padding: 8px 8px 0;
}

.library-search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #444;
  border-radius: 6px;
  background: #2a2a3e;
  color: #fff;
  font-size: 13px;
  outline: none;
}

.library-search-input:focus {
  border-color: #4ECDC4;
}

.library-search-input::placeholder {
  color: #666;
}
```

**Step 5: Run tests**

Run: `npx vitest run src/store/__tests__/library-store.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/store/ src/components/Library/
git commit -m "feat: add text search to library panel"
```

---

### Task 3: Compatibility Glow on Library Cards

**Files:**
- Modify: `src/components/Library/LibraryBlockCard.tsx`
- Modify: `src/components/Library/LibraryPanel.tsx`
- Test: `src/components/Library/__tests__/LibraryPanel.test.tsx` (update)

**Step 1: Add canvas context to LibraryPanel**

Modify `LibraryPanel.tsx` to read placed blocks from canvas store and compute a "dominant key/BPM" from blocks on the canvas. Pass this to each LibraryBlockCard.

```typescript
import { useCanvasStore } from '../../store/canvas-store'
import { getCompatibility } from '../../utils/compatibility'

// Inside component:
const { placedBlocks } = useCanvasStore()
const { getBlockById } = useLibraryStore()

// Compute dominant key/BPM from canvas blocks
const canvasContext = useMemo(() => {
  if (placedBlocks.length === 0) return null
  const canvasBlocks = placedBlocks
    .map((pb) => getBlockById(pb.blockId))
    .filter(Boolean) as Block[]
  if (canvasBlocks.length === 0) return null
  // Use the most recent block's key/BPM as reference
  const last = canvasBlocks[canvasBlocks.length - 1]
  return { key: last.key, bpm: last.bpm }
}, [placedBlocks, getBlockById])
```

Pass `canvasContext` to each `LibraryBlockCard`.

**Step 2: Add compatibility indicator to LibraryBlockCard**

```typescript
interface LibraryBlockCardProps {
  block: Block
  canvasContext: { key: string; bpm: number } | null
}

// Inside component:
const compatibility = canvasContext
  ? getCompatibility(canvasContext, { key: block.key, bpm: block.bpm })
  : null

const borderColor = compatibility
  ? { green: '#4CAF50', yellow: '#FFC107', red: '#F44336' }[compatibility.level]
  : 'transparent'
```

Add a 2px left border to the card with the compatibility color.

**Step 3: Run tests**

Run: `npx vitest run`
Expected: All pass

**Step 4: Commit**

```bash
git add src/components/Library/
git commit -m "feat: add compatibility color hints to library cards"
```

---

### Task 4: Tap-to-Preview in Library

**Files:**
- Create: `src/audio/usePreview.ts`
- Modify: `src/components/Library/LibraryBlockCard.tsx`
- Test: `src/audio/__tests__/usePreview.test.ts`

**Step 1: Write the preview hook**

Create `src/audio/usePreview.ts`:
```typescript
import { useState, useCallback, useRef } from 'react'
import { audioEngine } from './engine'

const PREVIEW_ID = '__preview__'

export function usePreview() {
  const [previewingId, setPreviewingId] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const preview = useCallback(async (blockId: string, pattern: string) => {
    // Stop any current preview
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    audioEngine.removePattern(PREVIEW_ID)

    // If tapping same block, toggle off
    if (previewingId === blockId) {
      setPreviewingId(null)
      return
    }

    // Ensure engine is initialized
    await audioEngine.init()

    // Play preview pattern
    audioEngine.addPattern(PREVIEW_ID, pattern)
    setPreviewingId(blockId)

    // Auto-stop after 4 bars (~8 seconds at 120 BPM)
    timeoutRef.current = setTimeout(() => {
      audioEngine.removePattern(PREVIEW_ID)
      setPreviewingId(null)
    }, 8000)
  }, [previewingId])

  const stopPreview = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    audioEngine.removePattern(PREVIEW_ID)
    setPreviewingId(null)
  }, [])

  return { preview, stopPreview, previewingId }
}
```

**Step 2: Wire preview into LibraryBlockCard**

Add an `onClick` handler to LibraryBlockCard that calls `preview(block.id, block.pattern)`. Show a visual indicator (pulsing border or play icon) when the block is being previewed.

Pass `preview` and `previewingId` from LibraryPanel down to each card.

**Step 3: Add preview indicator CSS**

```css
.library-block-card.previewing {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

**Step 4: Run tests**

Run: `npx vitest run`
Expected: All pass

**Step 5: Commit**

```bash
git add src/audio/usePreview.ts src/components/Library/
git commit -m "feat: add tap-to-preview for library blocks"
```

---

### Task 5: "Sounds Like This" Filter

**Files:**
- Modify: `src/store/library-store.ts`
- Modify: `src/components/Library/LibraryPanel.tsx`
- Test: `src/store/__tests__/library-store.test.ts` (add test)

**Step 1: Add test**

```typescript
it('finds compatible blocks for a reference block', () => {
  const ref = {
    id: '1', name: 'Ref', category: 'melody' as const,
    pattern: '', key: 'C', bpm: 120, bars: 1,
    mood: { energy: 0.5, brightness: 0.5 }, density: 0.5,
    tags: [], source: 'preset' as const, createdAt: new Date(),
  }
  const compat = {
    id: '2', name: 'Compatible', category: 'bass' as const,
    pattern: '', key: 'Am', bpm: 120, bars: 1,
    mood: { energy: 0.5, brightness: 0.5 }, density: 0.5,
    tags: [], source: 'preset' as const, createdAt: new Date(),
  }
  const incompat = {
    id: '3', name: 'Incompat', category: 'bass' as const,
    pattern: '', key: 'F#', bpm: 75, bars: 1,
    mood: { energy: 0.5, brightness: 0.5 }, density: 0.5,
    tags: [], source: 'preset' as const, createdAt: new Date(),
  }
  useLibraryStore.getState().loadBlocks([ref, compat, incompat])
  const results = useLibraryStore.getState().findCompatible('1')
  // Should return compat first, incompat last, and exclude ref itself
  expect(results[0].id).toBe('2')
  expect(results.find(r => r.id === '1')).toBeUndefined()
})
```

**Step 2: Add findCompatible to library store**

```typescript
// Add to interface:
findCompatible: (blockId: string) => Block[]

// Add to implementation:
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
```

**Step 3: Add "Sounds like this" button to canvas blocks**

In `LibraryPanel.tsx`, add a state `soundsLikeBlockId: string | null`. When set, filter the library to show only compatible blocks sorted by compatibility score.

Add a way to trigger this — either from a context menu on canvas blocks or a button in the library panel header that says "Find similar to [block name]". The simplest approach: when user selects a block on canvas, show a "Sounds like this" filter button in the library panel.

**Step 4: Run tests**

Run: `npx vitest run`
Expected: All pass

**Step 5: Commit**

```bash
git add src/store/ src/components/Library/
git commit -m "feat: add 'sounds like this' compatible block filter"
```

---

### Task 6: Mood Grid Browser

**Files:**
- Create: `src/components/Library/MoodGrid.tsx`
- Create: `src/components/Library/MoodGrid.css`
- Modify: `src/components/Library/LibraryPanel.tsx`
- Test: `src/components/Library/__tests__/MoodGrid.test.tsx`

**Step 1: Write the test**

Create `src/components/Library/__tests__/MoodGrid.test.tsx`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MoodGrid } from '../MoodGrid'
import { useLibraryStore } from '../../../store/library-store'
import { starterBlocks } from '../../../data/starter-blocks'

describe('MoodGrid', () => {
  beforeEach(() => {
    useLibraryStore.getState().loadBlocks(starterBlocks)
  })

  it('renders the mood grid with axis labels', () => {
    render(<MoodGrid onSelectBlock={() => {}} />)
    expect(screen.getByText('Dark')).toBeInTheDocument()
    expect(screen.getByText('Bright')).toBeInTheDocument()
    expect(screen.getByText('Chill')).toBeInTheDocument()
    expect(screen.getByText('Energy')).toBeInTheDocument()
  })

  it('renders block dots', () => {
    const { container } = render(<MoodGrid onSelectBlock={() => {}} />)
    const dots = container.querySelectorAll('.mood-dot')
    expect(dots.length).toBeGreaterThan(0)
  })
})
```

**Step 2: Write MoodGrid component**

Create `src/components/Library/MoodGrid.tsx`:
```typescript
import { useLibraryStore } from '../../store/library-store'
import type { Block } from '../../types/block'
import './MoodGrid.css'

const CATEGORY_COLORS: Record<string, string> = {
  beats: '#FF6B6B',
  bass: '#4ECDC4',
  melody: '#45B7D1',
  chords: '#96CEB4',
  fx: '#DDA0DD',
  vocal: '#FFD93D',
}

interface MoodGridProps {
  onSelectBlock: (block: Block) => void
}

export function MoodGrid({ onSelectBlock }: MoodGridProps) {
  const { blocks } = useLibraryStore()

  return (
    <div className="mood-grid">
      <div className="mood-grid-area">
        {blocks.map((block) => (
          <button
            key={block.id}
            className="mood-dot"
            title={block.name}
            style={{
              left: `${block.mood.brightness * 100}%`,
              bottom: `${block.mood.energy * 100}%`,
              background: CATEGORY_COLORS[block.category] ?? '#999',
            }}
            onClick={() => onSelectBlock(block)}
          />
        ))}
      </div>
      <div className="mood-labels">
        <span className="mood-label left">Dark</span>
        <span className="mood-label right">Bright</span>
        <span className="mood-label bottom">Chill</span>
        <span className="mood-label top">Energy</span>
      </div>
    </div>
  )
}
```

Create `src/components/Library/MoodGrid.css`:
```css
.mood-grid {
  position: relative;
  padding: 20px;
  height: 200px;
}

.mood-grid-area {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 100%);
  border: 1px solid #444;
  border-radius: 8px;
}

.mood-dot {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.5);
  cursor: pointer;
  transform: translate(-50%, 50%);
  transition: transform 0.15s;
  padding: 0;
}

.mood-dot:hover {
  transform: translate(-50%, 50%) scale(1.5);
  z-index: 10;
}

.mood-labels {
  pointer-events: none;
}

.mood-label {
  position: absolute;
  font-size: 10px;
  color: #666;
  text-transform: uppercase;
}

.mood-label.left { left: 24px; top: 50%; transform: translateY(-50%); }
.mood-label.right { right: 24px; top: 50%; transform: translateY(-50%); }
.mood-label.bottom { bottom: 4px; left: 50%; transform: translateX(-50%); }
.mood-label.top { top: 4px; left: 50%; transform: translateX(-50%); }
```

**Step 3: Add mood grid toggle to LibraryPanel**

Add a view toggle button (list view vs. mood grid view) in the library panel header. When mood grid is selected, show `<MoodGrid />` instead of the block list. Clicking a dot in the grid opens that block's detail or starts preview.

**Step 4: Run tests**

Run: `npx vitest run`
Expected: All pass

**Step 5: Commit**

```bash
git add src/components/Library/
git commit -m "feat: add mood grid browser with energy x brightness axes"
```

---

### Task 7: Expand Starter Block Library to 50+

**Files:**
- Modify: `src/data/starter-blocks.ts`
- Modify: `src/data/__tests__/starter-blocks.test.ts`

**Step 1: Update test threshold**

Change the test in `src/data/__tests__/starter-blocks.test.ts`:
```typescript
it('has at least 50 blocks', () => {
  expect(starterBlocks.length).toBeGreaterThanOrEqual(50)
})
```

**Step 2: Add ~30 more blocks across all categories**

Add to `src/data/starter-blocks.ts` — more beats, bass, melody, chords, fx, and vocal blocks with varied keys, BPMs, moods, and tags to make the mood grid and compatibility system useful. Ensure:
- Keys span the circle of fifths (C, G, D, A, F, Bb, Eb, Am, Em, Dm, etc.)
- BPMs span 70-150
- Moods cover all four quadrants of the energy×brightness grid
- Tags are descriptive and searchable

**Step 3: Run tests**

Run: `npx vitest run src/data/__tests__/starter-blocks.test.ts`
Expected: PASS

**Step 4: Commit**

```bash
git add src/data/
git commit -m "feat: expand starter block library to 50+ blocks"
```

---

### Task 8: Integration & Polish

**Files:**
- Modify: `src/__tests__/app-integration.test.tsx`
- Modify: `src/components/Library/LibraryPanel.css`

**Step 1: Add integration tests**

Add to `src/__tests__/app-integration.test.tsx`:
```typescript
it('renders search input in library', () => {
  render(<App />)
  expect(screen.getByPlaceholderText('Search blocks...')).toBeInTheDocument()
})

it('renders view toggle button', () => {
  render(<App />)
  expect(screen.getByRole('button', { name: /grid/i })).toBeInTheDocument()
})
```

**Step 2: Polish CSS for mobile**

Ensure the search bar, mood grid, and compatibility indicators look good on small screens. Add responsive adjustments to `LibraryPanel.css`.

**Step 3: Run all tests**

Run: `npx vitest run`
Expected: All pass

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: complete Phase 2 - smart library with search, compatibility, mood grid, and preview"
```

---

## Summary

Phase 2 delivers: text search across name/tags/key/BPM, green/yellow/red compatibility hints based on circle-of-fifths key distance and BPM ratio, mood grid browser with energy×brightness axes, "sounds like this" filter from canvas blocks, tap-to-preview in library, and 50+ starter blocks. All backed by tests.
