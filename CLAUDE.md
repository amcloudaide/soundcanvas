# SoundCanvas

Visual music creation PWA with drag-and-drop blocks on a free-form canvas.

## Quick Start

```bash
npm install
cp .env.example .env        # Add your ANTHROPIC_API_KEY
npm run dev:all              # Starts Vite (5173) + API server (3001)
```

## Architecture

- **Frontend:** React + TypeScript + Vite, Konva canvas, Zustand state
- **Audio:** @strudel/web for pattern evaluation + Web Audio playback
- **AI:** Express server proxies to Claude API for block generation
- **Analysis:** Meyda.js for on-device BPM/key/mood extraction from mic
- **Storage:** IndexedDB via idb-keyval for persistence

## Project Structure

```
src/
  audio/          # AudioEngine, usePlayback, usePreview, useListenAnalyze, analyzer
  components/
    Canvas/       # MusicCanvas (Konva), CanvasBlock, VariationDialog
    Library/      # LibraryPanel, LibraryBlockCard, MoodGrid, CreateBlockDialog, ListenDialog
    Transport/    # TransportBar (play/stop, BPM, save/load)
  data/           # starter-blocks.ts (50 preset blocks)
  hooks/          # usePinchZoom
  services/       # ai-generate.ts (fetch to /api/generate)
  store/          # canvas-store, library-store, saves-store, idb-storage
  types/          # block.ts, canvas.ts
  utils/          # compatibility.ts (key/BPM scoring)
server/           # Express API server (Claude proxy, rate limiting)
public/           # PWA manifest, service worker, icons
```

## Tests

```bash
npx vitest run    # 73 tests across 13 files
```

## Status

All 5 phases complete:
1. ✅ Core Canvas (blocks, library, transport, mobile)
2. ✅ Smart Library (search, compatibility, mood grid, preview)
3. ✅ AI Generation (text-to-block, variations via Claude API)
4. ✅ Listen & Analyze (mic capture, BPM/key detection, matching)
5. ✅ PWA Polish (offline, IndexedDB persistence, named saves)

## Key Files for Testing

- `src/audio/engine.ts` - Strudel integration, pattern stacking
- `src/audio/usePlayback.ts` - Syncs canvas blocks with audio engine
- `src/components/Canvas/MusicCanvas.tsx` - Main canvas with drop handling
- `src/components/Library/LibraryPanel.tsx` - Library with search/filter/preview
- `server/index.ts` - AI generation API endpoint

## Known Issues to Test

- Block audio: synth patterns (sawtooth, triangle, square) work; sample-based patterns (bd, sd, hh) need Strudel's default samples loaded via initStrudel()
- First play click initializes AudioContext (browser requirement)
- AI generation requires ANTHROPIC_API_KEY in .env and server running
- Mic access requires HTTPS in production (localhost works for dev)
