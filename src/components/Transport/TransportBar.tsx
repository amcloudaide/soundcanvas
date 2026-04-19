import { useState, useEffect } from 'react'
import { usePlayback } from '../../audio/usePlayback'
import { useCanvasStore } from '../../store/canvas-store'
import { useSavesStore } from '../../store/saves-store'
import './TransportBar.css'

export function TransportBar() {
  const { isPlaying, togglePlayback } = usePlayback()
  const { masterBpm, setMasterBpm } = useCanvasStore()
  const { saves, loadSavesList, saveCanvas, loadCanvas, deleteSave } = useSavesStore()
  const [showSaves, setShowSaves] = useState(false)
  const [saveName, setSaveName] = useState('')

  useEffect(() => {
    loadSavesList()
  }, [loadSavesList])

  const handleSave = async () => {
    const name = saveName.trim() || `Save ${new Date().toLocaleTimeString()}`
    await saveCanvas(name)
    setSaveName('')
    setShowSaves(false)
  }

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

      <button
        className="transport-save-btn"
        onClick={() => setShowSaves(!showSaves)}
        aria-label="Save and load"
        title="Save / Load"
      >
        💾
      </button>

      <div className="transport-title">SoundCanvas</div>

      {showSaves && (
        <div className="saves-dropdown">
          <div className="saves-new">
            <input
              type="text"
              placeholder="Save name..."
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="saves-name-input"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button className="saves-action-btn primary" onClick={handleSave}>
              Save
            </button>
          </div>
          {saves.length > 0 && (
            <div className="saves-list">
              {saves.map((save) => (
                <div key={save.name} className="saves-item">
                  <button
                    className="saves-item-name"
                    onClick={() => { loadCanvas(save.name); setShowSaves(false) }}
                  >
                    {save.name}
                    <span className="saves-item-date">
                      {new Date(save.savedAt).toLocaleDateString()}
                    </span>
                  </button>
                  <button
                    className="saves-delete-btn"
                    onClick={() => deleteSave(save.name)}
                    aria-label={`Delete ${save.name}`}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
          {saves.length === 0 && (
            <div className="saves-empty">No saved canvases yet</div>
          )}
        </div>
      )}
    </div>
  )
}
