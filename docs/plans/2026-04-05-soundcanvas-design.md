# SoundCanvas Design Document

## Vision

A mobile-first PWA where casual creators build music by dragging sound blocks onto a free-form canvas. Blocks loop and play based on proximity and connections. The system auto-hints what sounds good together (green/yellow/red compatibility). Users can generate new blocks via AI text prompts, or "listen" to real-world music to analyze its properties and find matching blocks.

**Target user:** Someone with zero music background who wants to create something that sounds cool in under 2 minutes.

**Core loop:** Browse library > drag block to canvas > hear it immediately > layer more blocks > tweak and perform live.

---

## Section 1: Canvas & Playback Model

The canvas is an infinite 2D space where blocks are free-floating objects. Each block is a visual rectangle showing its name, waveform preview, and key/BPM tags.

### Playback rules

- Every block on the canvas loops independently on a shared global clock (quantized to a master BPM)
- Blocks that are **near each other** form a "cluster" -- they sync their loop start points, creating a cohesive layer
- Dragging a block **away** from a cluster isolates it (it still plays but drifts into its own timing)
- A **mute/solo** toggle on each block lets users silence without removing
- The master BPM is auto-detected from the first block placed, but adjustable via a simple slider

### Compatibility hints

- When dragging a block, the canvas shows a color glow around existing blocks: **green** (fits well -- compatible key and rhythm), **yellow** (might clash but could be interesting), **red** (likely dissonant)
- Compatibility is calculated from musical metadata on each block: key, scale, BPM ratio, and rhythmic density
- Users can always drop anywhere regardless of color -- it's guidance, not restriction

### Mobile interaction

- Pinch to zoom the canvas, one-finger drag to pan
- Long-press a block to pick it up, drag to reposition
- Double-tap a block to open its detail panel (volume, pitch shift, effects)

---

## Section 2: Block Library & Categories

The library is a slide-out panel (bottom sheet on mobile, sidebar on desktop) that users browse and drag from.

### Block types

- **Beats** -- drum patterns, percussion loops (e.g., "Chill Hip-Hop Beat", "Four on the Floor")
- **Bass** -- basslines and low-end patterns (e.g., "Funky Slap Bass", "Sub Wobble")
- **Melody** -- melodic phrases and riffs (e.g., "Dreamy Piano", "Plucky Synth Arp")
- **Chords** -- harmonic pads and chord progressions (e.g., "Lo-fi Jazz Chords", "Ambient Wash")
- **FX** -- risers, impacts, textures, atmospheres (e.g., "Vinyl Crackle", "Reverse Cymbal")
- **Vocal** -- vocal chops, phrases, ad-libs (e.g., "Hey!", "Chopped Soul Vocal")

### Each block stores

- Audio data (short loop, typically 1-8 bars)
- Metadata: key, BPM, category, tags, mood, rhythmic density score
- A visual waveform thumbnail and color based on category
- Strudel pattern definition (the underlying code that generates/controls it)

### Browsing & discovery

- Filter by category (tabs along the top)
- Search by text ("dark", "happy", "120 bpm")
- Mood-based browsing: a simple 2D grid -- energy (low to high) on one axis, mood (dark to bright) on the other. Blocks plotted as dots, tap to preview
- "Sounds like this" -- tap a block already on canvas, library filters to compatible blocks

### Preview

Tap any block in the library to hear a 4-bar preview, synced to the current master BPM. No commitment until you drag it out.

---

## Section 3: AI-Powered Block Generation

Two entry points for AI: a text prompt and the listen feature.

### Text-to-Block (Cloud API)

- A "Create" button in the library opens a simple text input
- User types natural language: "bouncy 8-bit melody", "sad rainy piano", "hard trap hi-hats"
- Cloud API (Claude) interprets the description and generates a Strudel pattern definition + metadata (key, BPM, mood tags)
- The Strudel engine renders it to audio client-side -- no audio files sent over the wire, just pattern code
- User previews the result, can tap "Regenerate" for variations or "Save to Library" to keep it
- Generation takes 2-5 seconds, shown as a playful animation (block "assembling" itself)

### Listen & Analyze (On-device)

- User taps a mic icon, the app captures audio from the environment (music playing on a speaker, humming, tapping a rhythm)
- On-device analysis extracts: estimated BPM, key/scale, rhythmic pattern, spectral characteristics (bright/dark, dense/sparse), energy level
- These properties become a search filter applied to the existing library -- "Here are blocks that match what you just heard"
- If no good matches exist, the app offers: "Want AI to create a block inspired by this?" -- which sends the extracted properties (not the audio) to the cloud API for generation
- Privacy-friendly: raw audio never leaves the device, only abstract musical properties

### Block evolution

- Any block on the canvas can be long-pressed then "Create variation" -- AI generates a sibling block with subtle changes (different rhythm, shifted notes, altered timbre)
- This lets users build a library organically as they create

---

## Section 4: Technical Architecture

### Frontend stack

- **React + TypeScript** -- component-based UI, strong typing for complex audio/block data
- **Vite** -- fast dev server, good PWA plugin support
- **Zustand** -- lightweight state management for canvas state, playback, library
- **dnd-kit** -- drag-and-drop library with excellent touch/mobile support
- **Pixi.js or React-Konva** -- for the canvas rendering (smooth pan/zoom/animation with many blocks, better than DOM for this)

### Audio engine

- **Strudel core** (`@strudel/core`, `@strudel/webaudio`) -- pattern scheduling and Web Audio output
- Each block's pattern definition is a Strudel mini-notation string or JS pattern object
- Global clock managed by Strudel's scheduler, all blocks sync to it
- Volume, pitch shift, and effects handled via Web Audio nodes chained per block

### On-device AI

- **Meyda.js** or **Essentia.js** -- real-time audio feature extraction (BPM, spectral centroid, RMS energy, chroma)
- Runs on mic input stream via Web Audio AnalyserNode + MediaStream
- Key detection via chroma feature analysis
- BPM detection via onset detection + autocorrelation

### Cloud AI

- REST API endpoint (simple Node/Express or serverless function)
- Calls Claude API with a system prompt specialized for Strudel pattern generation
- Returns: pattern code + metadata JSON
- Rate-limited per user session for cost control

### PWA

- Service worker for offline caching of the UI and local block library
- App manifest for install-to-homescreen
- IndexedDB for storing user-created blocks and canvas state locally

---

## Section 5: Data Model & Storage

### Block schema

```
Block {
  id: string (uuid)
  name: string ("Funky Slap Bass")
  category: beats | bass | melody | chords | fx | vocal
  pattern: string (Strudel mini-notation or JS pattern)
  key: string ("Cm", "F#", "chromatic")
  bpm: number (original tempo)
  bars: number (loop length, 1-8)
  mood: { energy: 0-1, brightness: 0-1 }
  density: number (0-1, rhythmic density)
  tags: string[] (["funky", "slap", "groovy"])
  source: "preset" | "ai-generated" | "listen-inspired"
  waveformData: number[] (pre-rendered for thumbnail)
  createdAt: timestamp
}
```

### Canvas state

```
CanvasState {
  masterBpm: number
  masterKey: string | null
  blocks: PlacedBlock[] {
    blockId: string (ref to Block)
    position: { x, y }
    volume: 0-1
    pitchShift: number (semitones, -12 to +12)
    muted: boolean
    effects: Effect[]
  }
  viewport: { x, y, zoom }
}
```

### Storage strategy

- **Built-in library** -- ships as a JSON bundle with the app (~50-100 starter blocks), audio rendered on-demand by Strudel (no large audio files to download)
- **User library** -- saved to IndexedDB, syncs across sessions on same device
- **Canvas autosave** -- every change auto-persists to IndexedDB, user can also name and save multiple canvases
- **No backend database for MVP** -- everything local-first. Cloud is only used for AI generation calls

---

## Section 6: MVP Scope & Build Phases

### Phase 1 -- Core Canvas (week 1-2)

- Canvas with pan/zoom (Pixi.js or React-Konva)
- Drag blocks from a hardcoded starter library (~20 blocks)
- Blocks loop and play via Strudel engine on a shared clock
- Proximity-based clustering (blocks near each other sync)
- Mute/solo per block
- Master BPM slider
- Mobile touch support (pinch, long-press, drag)

### Phase 2 -- Smart Library (week 3)

- Slide-out library panel with categories and search
- Compatibility glow system (green/yellow/red) based on key + BPM
- Mood grid browser (energy x brightness)
- "Sounds like this" filter from canvas blocks
- Tap-to-preview in library
- Expand to ~50-100 starter blocks

### Phase 3 -- AI Generation (week 4-5)

- Cloud API endpoint for text-to-block
- "Create" button with text prompt input
- Regenerate / save flow
- "Create variation" from existing block
- Rate limiting and error handling

### Phase 4 -- Listen & Analyze (week 6-7)

- Mic capture via getUserMedia
- On-device BPM, key, and mood extraction
- Match results against library
- "Create from analysis" fallback to cloud AI

### Phase 5 -- PWA Polish (week 8)

- Service worker, offline support, install prompt
- IndexedDB persistence (library + canvas autosave)
- Named canvas saves
- Responsive polish for various screen sizes
