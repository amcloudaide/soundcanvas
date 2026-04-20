import { initStrudel, hush } from '@strudel/web'

type StrudelRepl = {
  scheduler: { start: () => void; stop: () => void; setCps: (cps: number) => void }
  evaluate: (code: string, autostart?: boolean) => Promise<any>
  start: () => void
  stop: () => void
  setPattern: (pattern: any, autostart?: boolean) => Promise<any>
}

// URLs for Strudel's default sample banks (drum machines, mouth sounds, etc.)
const DIRT_SAMPLES_URL = 'github:tidalcycles/dirt-samples'

/**
 * Load default drum/sample banks so patterns like s("bd sd hh") work out of the box.
 * Strudel's window.samples() is made available globally after initStrudel().
 */
async function loadDefaultSamples() {
  // samples() is attached to window by initStrudel's globals
  const samplesFn = (window as any).samples
  if (typeof samplesFn !== 'function') {
    console.warn('[AudioEngine] samples() not available yet')
    return
  }
  try {
    await samplesFn(DIRT_SAMPLES_URL)
    console.log('[AudioEngine] default samples loaded')
  } catch (err) {
    console.error('[AudioEngine] failed to load samples:', err)
  }
}

export class AudioEngine {
  private repl: StrudelRepl | null = null
  private initPromise: Promise<StrudelRepl> | null = null
  private bpm = 120
  private playing = false
  private patterns = new Map<string, { code: string; muted: boolean; volume: number }>()
  private updateTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * Initialize Strudel on first user gesture.
   * Must be called from a click/tap handler.
   */
  async init(): Promise<void> {
    if (this.repl) return
    if (this.initPromise) {
      await this.initPromise
      return
    }
    // prebake runs after core packages load but before any evaluate() is allowed
    this.initPromise = initStrudel({
      prebake: loadDefaultSamples,
    }) as Promise<StrudelRepl>
    this.repl = await this.initPromise
  }

  async start(): Promise<void> {
    await this.init()
    if (!this.repl) return
    this.playing = true
    await this.updatePattern()
  }

  stop(): void {
    this.playing = false
    try {
      hush()
    } catch {
      // hush may throw if not initialized
    }
  }

  isPlaying(): boolean {
    return this.playing
  }

  setBpm(bpm: number): void {
    this.bpm = Math.max(40, Math.min(300, bpm))
    if (this.repl) {
      // Strudel uses cycles per second (cps), convert BPM to cps
      // In 4/4 time: 1 cycle = 1 bar = 4 beats, so cps = bpm / 60 / 4
      this.repl.scheduler.setCps(this.bpm / 60 / 4)
    }
  }

  getBpm(): number {
    return this.bpm
  }

  addPattern(id: string, code: string): void {
    const existing = this.patterns.get(id)
    if (existing && existing.code === code) return // no change
    this.patterns.set(id, { code, muted: existing?.muted ?? false, volume: existing?.volume ?? 0.8 })
    this.scheduleUpdate()
  }

  removePattern(id: string): void {
    this.patterns.delete(id)
    this.scheduleUpdate()
  }

  mutePattern(id: string, muted: boolean): void {
    const p = this.patterns.get(id)
    if (p && p.muted !== muted) {
      p.muted = muted
      this.scheduleUpdate()
    }
  }

  setPatternVolume(id: string, volume: number): void {
    const p = this.patterns.get(id)
    if (p && p.volume !== volume) {
      p.volume = volume
      this.scheduleUpdate()
    }
  }

  /**
   * Debounce updatePattern to batch rapid changes (e.g. multiple blocks added in one effect)
   */
  private scheduleUpdate(): void {
    if (!this.playing) return
    if (this.updateTimer) clearTimeout(this.updateTimer)
    this.updateTimer = setTimeout(() => {
      this.updateTimer = null
      this.updatePattern()
    }, 50)
  }

  getActivePatterns(): string[] {
    return Array.from(this.patterns.keys())
  }

  /**
   * Combine all unmuted patterns into a single stacked pattern
   * and send it to the Strudel scheduler.
   */
  private async updatePattern(): Promise<void> {
    if (!this.repl) return

    const activePatterns = Array.from(this.patterns.entries())
      .filter(([_, p]) => !p.muted)
      .map(([_, p]) => {
        // Wrap each pattern with gain control
        const gainStr = `.gain(${p.volume.toFixed(2)})`
        // Wrap in parentheses to ensure correct chaining
        return `(${p.code})${gainStr}`
      })

    if (activePatterns.length === 0) {
      hush()
      return
    }

    // Stack all patterns together
    const combinedCode = activePatterns.length === 1
      ? activePatterns[0]
      : `stack(${activePatterns.join(', ')})`

    try {
      console.log('[AudioEngine] evaluating:', combinedCode.slice(0, 200))
      await this.repl.evaluate(combinedCode, true)
      // Set BPM after evaluation
      this.repl.scheduler.setCps(this.bpm / 60 / 4)
      console.log('[AudioEngine] playing', activePatterns.length, 'patterns at', this.bpm, 'BPM')
    } catch (err) {
      console.error('[AudioEngine] pattern evaluation error:', err)
    }
  }

  dispose(): void {
    this.stop()
    this.patterns.clear()
    this.repl = null
    this.initPromise = null
  }
}

// Singleton instance
export const audioEngine = new AudioEngine()
