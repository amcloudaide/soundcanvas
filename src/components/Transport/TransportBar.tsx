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
        {isPlaying ? '\u23F9' : '\u25B6'}
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

      <div className="transport-title">SoundCanvas</div>
    </div>
  )
}
