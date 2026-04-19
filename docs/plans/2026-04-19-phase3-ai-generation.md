# Phase 3: AI Block Generation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let users type natural language descriptions (e.g., "funky bassline in E minor") and get AI-generated Strudel pattern blocks, plus "create variation" from existing blocks.

**Architecture:** A lightweight Express API server proxies requests to the Anthropic Claude API with a specialized system prompt that generates valid Strudel patterns + block metadata as JSON. The frontend adds a "Create" dialog in the library panel and a "Vary" option on canvas blocks. API key is stored in a `.env` file, never sent to the browser.

**Tech Stack:** Express, @anthropic-ai/sdk, dotenv, Vite proxy, React, TypeScript, Vitest

---

### Task 1: Backend API Server Setup

**Files:**
- Create: `server/index.ts`
- Create: `server/tsconfig.json`
- Create: `.env.example`
- Modify: `package.json` (add server scripts and dependencies)
- Modify: `vite.config.ts` (add proxy)

**Step 1: Install server dependencies**

```bash
npm install express cors dotenv @anthropic-ai/sdk
npm install -D @types/express @types/cors tsx
```

**Step 2: Create server tsconfig**

Create `server/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist",
    "rootDir": "."
  },
  "include": ["./**/*.ts"]
}
```

**Step 3: Create the API server**

Create `server/index.ts`:
```typescript
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Anthropic from '@anthropic-ai/sdk'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are a music pattern generator for Strudel, a JavaScript music live coding environment.

Given a text description of a sound, generate a valid Strudel pattern and metadata.

RULES:
- Use Strudel mini-notation syntax
- For drums/percussion: use s() with sample names: bd, sd, hh, cp, cb, tom, rim, oh, ch
- For melodic/bass: use note() with note names (e.g., "c2", "eb4") and .s() for sound source
- Available sound sources for .s(): "sawtooth", "square", "triangle", "sine", "piano"
- Available effects: .lpf(freq), .hpf(freq), .gain(0-1), .speed(rate), .slow(factor), .fast(factor)
- Keep patterns to 1-8 bars, musically interesting but not overly complex
- For chords use comma-separated notes in brackets: [c3,e3,g3]
- Use angle brackets for alternation: <pattern1 pattern2>

RESPOND WITH ONLY valid JSON (no markdown, no code fences):
{
  "name": "short descriptive name",
  "category": "beats"|"bass"|"melody"|"chords"|"fx"|"vocal",
  "pattern": "valid strudel pattern code",
  "key": "musical key (e.g., C, Am, Cm, F#, chromatic)",
  "bpm": suggested_bpm_number,
  "bars": number_of_bars,
  "mood": { "energy": 0.0_to_1.0, "brightness": 0.0_to_1.0 },
  "density": 0.0_to_1.0,
  "tags": ["tag1", "tag2", "tag3"]
}`

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, existingPattern } = req.body

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'prompt is required' })
    }

    const userMessage = existingPattern
      ? `Create a variation of this pattern: ${existingPattern}\n\nVariation request: ${prompt}`
      : prompt

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return res.status(500).json({ error: 'Unexpected response type' })
    }

    // Parse the JSON response
    const blockData = JSON.parse(content.text)

    // Validate required fields
    const required = ['name', 'category', 'pattern', 'key', 'bpm']
    for (const field of required) {
      if (!(field in blockData)) {
        return res.status(500).json({ error: `Missing field: ${field}` })
      }
    }

    res.json(blockData)
  } catch (error: any) {
    console.error('[API] Generation error:', error.message)
    res.status(500).json({ error: error.message || 'Generation failed' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`[API] Server running on port ${PORT}`)
})
```

**Step 4: Create .env.example**

Create `.env.example`:
```
ANTHROPIC_API_KEY=your-api-key-here
PORT=3001
```

Add `.env` to `.gitignore`.

**Step 5: Add server scripts to package.json**

Add to `package.json` scripts:
```json
"server": "tsx server/index.ts",
"dev:all": "concurrently \"npm run dev\" \"npm run server\""
```

Install concurrently:
```bash
npm install -D concurrently
```

**Step 6: Configure Vite proxy**

Add proxy to `vite.config.ts` so the frontend can call `/api/*` without CORS issues:
```typescript
server: {
  proxy: {
    '/api': 'http://localhost:3001',
  },
},
```

**Step 7: Test the server starts**

```bash
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
npm run server
```

Expected: Server starts on port 3001.

**Step 8: Commit**

```bash
git add server/ .env.example vite.config.ts package.json package-lock.json .gitignore
git commit -m "feat: add Express API server for AI block generation"
```

---

### Task 2: AI Generation Service (Frontend)

**Files:**
- Create: `src/services/ai-generate.ts`
- Test: `src/services/__tests__/ai-generate.test.ts`

**Step 1: Write the failing test**

Create `src/services/__tests__/ai-generate.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateBlock, generateVariation } from '../ai-generate'

// Mock fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('ai-generate', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('generates a block from a text prompt', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        name: 'Funky Bass',
        category: 'bass',
        pattern: 'note("e2 g2 a2 b2").s("sawtooth")',
        key: 'Em',
        bpm: 110,
        bars: 1,
        mood: { energy: 0.6, brightness: 0.4 },
        density: 0.5,
        tags: ['funky', 'groove'],
      }),
    })

    const result = await generateBlock('funky bassline in E minor')
    expect(result.name).toBe('Funky Bass')
    expect(result.category).toBe('bass')
    expect(result.pattern).toContain('note(')
    expect(result.source).toBe('ai-generated')
  })

  it('generates a variation from an existing pattern', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        name: 'Funky Bass v2',
        category: 'bass',
        pattern: 'note("e2 a2 b2 d3").s("sawtooth")',
        key: 'Em',
        bpm: 110,
        bars: 1,
        mood: { energy: 0.7, brightness: 0.4 },
        density: 0.6,
        tags: ['funky', 'variation'],
      }),
    })

    const result = await generateVariation('note("e2 g2 a2 b2").s("sawtooth")', 'make it more energetic')
    expect(result.name).toBe('Funky Bass v2')
    expect(result.source).toBe('ai-generated')
  })

  it('throws on API error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'API key invalid' }),
    })

    await expect(generateBlock('test')).rejects.toThrow()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/services/__tests__/ai-generate.test.ts`
Expected: FAIL

**Step 3: Write the implementation**

Create `src/services/ai-generate.ts`:
```typescript
import { createBlock, type Block } from '../types/block'

interface GenerateResponse {
  name: string
  category: 'beats' | 'bass' | 'melody' | 'chords' | 'fx' | 'vocal'
  pattern: string
  key: string
  bpm: number
  bars?: number
  mood?: { energy: number; brightness: number }
  density?: number
  tags?: string[]
}

export async function generateBlock(prompt: string): Promise<Block> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `Generation failed (${response.status})`)
  }

  const data: GenerateResponse = await response.json()

  return createBlock({
    ...data,
    source: 'ai-generated',
  })
}

export async function generateVariation(existingPattern: string, prompt: string): Promise<Block> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, existingPattern }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `Variation failed (${response.status})`)
  }

  const data: GenerateResponse = await response.json()

  return createBlock({
    ...data,
    source: 'ai-generated',
  })
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/services/__tests__/ai-generate.test.ts`
Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add src/services/
git commit -m "feat: add AI generation service for text-to-block and variations"
```

---

### Task 3: Create Block Dialog UI

**Files:**
- Create: `src/components/Library/CreateBlockDialog.tsx`
- Create: `src/components/Library/CreateBlockDialog.css`
- Modify: `src/components/Library/LibraryPanel.tsx`

**Step 1: Create the dialog component**

Create `src/components/Library/CreateBlockDialog.tsx`:
```typescript
import { useState } from 'react'
import { generateBlock } from '../../services/ai-generate'
import { useLibraryStore } from '../../store/library-store'
import type { Block } from '../../types/block'
import './CreateBlockDialog.css'

interface CreateBlockDialogProps {
  onClose: () => void
}

type DialogState = 'input' | 'loading' | 'preview' | 'error'

export function CreateBlockDialog({ onClose }: CreateBlockDialogProps) {
  const [prompt, setPrompt] = useState('')
  const [state, setState] = useState<DialogState>('input')
  const [generatedBlock, setGeneratedBlock] = useState<Block | null>(null)
  const [error, setError] = useState('')
  const { addBlock } = useLibraryStore()

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setState('loading')
    setError('')
    try {
      const block = await generateBlock(prompt.trim())
      setGeneratedBlock(block)
      setState('preview')
    } catch (err: any) {
      setError(err.message || 'Generation failed')
      setState('error')
    }
  }

  const handleRegenerate = () => {
    setGeneratedBlock(null)
    setState('input')
  }

  const handleSave = () => {
    if (generatedBlock) {
      addBlock(generatedBlock)
      onClose()
    }
  }

  return (
    <div className="create-dialog-overlay" onClick={onClose}>
      <div className="create-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="create-dialog-header">
          <h3>Create with AI</h3>
          <button className="create-dialog-close" onClick={onClose}>×</button>
        </div>

        {state === 'input' && (
          <div className="create-dialog-body">
            <textarea
              className="create-dialog-input"
              placeholder='Describe the sound you want... e.g., "bouncy 8-bit melody" or "dark trap hi-hats"'
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              autoFocus
            />
            <button
              className="create-dialog-btn primary"
              onClick={handleGenerate}
              disabled={!prompt.trim()}
            >
              Generate
            </button>
          </div>
        )}

        {state === 'loading' && (
          <div className="create-dialog-body">
            <div className="create-dialog-loading">
              <div className="create-dialog-spinner" />
              <p>Creating your block...</p>
            </div>
          </div>
        )}

        {state === 'preview' && generatedBlock && (
          <div className="create-dialog-body">
            <div className="create-dialog-preview">
              <div className="create-dialog-preview-name">{generatedBlock.name}</div>
              <div className="create-dialog-preview-meta">
                {generatedBlock.category} | {generatedBlock.key} | {generatedBlock.bpm} BPM
              </div>
              <div className="create-dialog-preview-tags">
                {generatedBlock.tags.map((t) => (
                  <span key={t} className="create-dialog-tag">{t}</span>
                ))}
              </div>
              <code className="create-dialog-preview-pattern">{generatedBlock.pattern}</code>
            </div>
            <div className="create-dialog-actions">
              <button className="create-dialog-btn" onClick={handleRegenerate}>
                Regenerate
              </button>
              <button className="create-dialog-btn primary" onClick={handleSave}>
                Save to Library
              </button>
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="create-dialog-body">
            <div className="create-dialog-error">{error}</div>
            <button className="create-dialog-btn" onClick={handleRegenerate}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Create the dialog CSS**

Create `src/components/Library/CreateBlockDialog.css` with overlay, modal, loading spinner, preview card, and button styles. Dark theme consistent with the app.

**Step 3: Add "Create" button to LibraryPanel**

Add a "+" button next to the search bar. When clicked, open `<CreateBlockDialog />`.

In `LibraryPanel.tsx`, add state:
```typescript
const [showCreateDialog, setShowCreateDialog] = useState(false)
```

Add button in the header area and render dialog conditionally:
```tsx
{showCreateDialog && <CreateBlockDialog onClose={() => setShowCreateDialog(false)} />}
```

**Step 4: Run all tests**

Run: `npx vitest run`
Expected: All pass

**Step 5: Commit**

```bash
git add src/components/Library/
git commit -m "feat: add AI Create Block dialog with generate/regenerate/save flow"
```

---

### Task 4: Create Variation from Canvas Block

**Files:**
- Modify: `src/components/Canvas/CanvasBlock.tsx`
- Modify: `src/components/Canvas/MusicCanvas.tsx`
- Create: `src/components/Canvas/BlockContextMenu.tsx`

**Step 1: Create a simple context menu component**

Create `src/components/Canvas/BlockContextMenu.tsx` — a small popup that appears when a canvas block is long-pressed or right-clicked, with options: "Create Variation", "Remove".

**Step 2: Wire "Create Variation" to the AI service**

When "Create Variation" is clicked:
1. Get the block's pattern code
2. Open a small prompt input: "How should the variation differ?"
3. Call `generateVariation(pattern, userPrompt)`
4. Add the result to the library store

**Step 3: Add long-press handler to CanvasBlock**

Wire `onContextMenu` on the Group to show the context menu.

**Step 4: Run all tests**

Run: `npx vitest run`
Expected: All pass

**Step 5: Commit**

```bash
git add src/components/Canvas/
git commit -m "feat: add Create Variation from canvas blocks via AI"
```

---

### Task 5: Integration & Error Handling

**Files:**
- Modify: `src/__tests__/app-integration.test.tsx`
- Modify: `server/index.ts` (add rate limiting)

**Step 1: Add simple rate limiting to server**

Add a simple in-memory rate limiter: max 10 requests per minute per IP.

**Step 2: Add integration tests**

Add to app integration test:
```typescript
it('renders the Create button in library', () => {
  render(<App />)
  expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
})
```

**Step 3: Run all tests**

Run: `npx vitest run`
Expected: All pass

**Step 4: Commit and push**

```bash
git add -A
git commit -m "feat: complete Phase 3 - AI block generation with rate limiting"
git push origin main
```

---

## Summary

Phase 3 delivers: Express API server proxying to Claude API, text-to-block generation dialog, regenerate/save flow, "Create Variation" from canvas blocks, and basic rate limiting. The AI generates valid Strudel patterns with full metadata (key, BPM, mood, tags) that integrate seamlessly into the existing library and compatibility system.
