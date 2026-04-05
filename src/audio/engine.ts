export class AudioEngine {
  private ctx: AudioContext | null = null
  private bpm = 120
  private playing = false
  private patterns = new Map<string, string>()
  private masterGain: GainNode | null = null

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
  }

  removePattern(id: string) {
    this.patterns.delete(id)
  }

  mutePattern(_id: string, _muted: boolean) {
    // Per-pattern gain control — will be wired to Strudel scheduler
  }

  setPatternVolume(_id: string, _volume: number) {
    // Per-pattern volume — will be wired to Strudel scheduler
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
