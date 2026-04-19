import { initStrudel, evaluate, hush } from '@strudel/web'

type StrudelRepl = {
  scheduler: { start: () => void; stop: () => void; setCps: (cps: number) => void }
  evaluate: (code: string, autostart?: boolean) => Promise<any>
  start: () => void
  stop: () => void
  setPattern: (pattern: any, autostart?: boolean) => Promise<any>
}

export class AudioEngine {
  private repl: StrudelRepl | null = null
  private initPromise: Promise<StrudelRepl> | null = null
  private bpm = 120
  private playing = false
  private patterns = new Map<string, { code: string; muted: boolean; volume: number }>()

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
    this.initPromise = initStrudel() as Promise<StrudelRepl>
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
    this.patterns.set(id, { code, muted: false, volume: 0.8 })
    if (this.playing) {
      this.updatePattern()
    }
  }

  removePattern(id: string): void {
    this.patterns.delete(id)
    if (this.playing) {
      this.updatePattern()
    }
  }

  mutePattern(id: string, muted: boolean): void {
    const p = this.patterns.get(id)
    if (p) {
      p.muted = muted
      if (this.playing) {
        this.updatePattern()
      }
    }
  }

  setPatternVolume(id: string, volume: number): void {
    const p = this.patterns.get(id)
    if (p) {
      p.volume = volume
      if (this.playing) {
        this.updatePattern()
      }
    }
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
      await this.repl.evaluate(combinedCode, true)
      // Set BPM after evaluation
      this.repl.scheduler.setCps(this.bpm / 60 / 4)
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
