import { useMemo } from 'react'
import { useListenAnalyze } from '../../audio/useListenAnalyze'
import { useLibraryStore } from '../../store/library-store'
import { usePreview } from '../../audio/usePreview'
import { generateBlock } from '../../services/ai-generate'
import type { Block } from '../../types/block'
import './ListenDialog.css'

interface ListenDialogProps {
  onClose: () => void
}

export function ListenDialog({ onClose }: ListenDialogProps) {
  const { isListening, result, error, startListening, stopListening, clearResult } = useListenAnalyze()
  const { findByAnalysis, addBlock } = useLibraryStore()
  const { preview, previewingId } = usePreview()

  const matches = useMemo(() => {
    if (!result) return []
    return findByAnalysis({
      key: result.key,
      bpm: result.bpm,
      mood: result.mood,
    }).slice(0, 8) // top 8 matches
  }, [result, findByAnalysis])

  const handleCreateFromAnalysis = async () => {
    if (!result) return
    try {
      const prompt = `Create a ${result.key} pattern at ${result.bpm} BPM with energy level ${result.mood.energy.toFixed(1)} and brightness ${result.mood.brightness.toFixed(1)}. Density: ${result.density.toFixed(1)}.`
      const block = await generateBlock(prompt)
      addBlock(block)
      onClose()
    } catch (err) {
      console.error('AI generation from analysis failed:', err)
    }
  }

  return (
    <div className="create-dialog-overlay" onClick={onClose}>
      <div className="create-dialog listen-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="create-dialog-header">
          <h3>Listen & Analyze</h3>
          <button className="create-dialog-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="create-dialog-body">
          {!isListening && !result && !error && (
            <div className="listen-ready">
              <p className="listen-hint">Play music near your device or hum a melody</p>
              <button className="listen-mic-btn" onClick={startListening} aria-label="Start listening">
                <span className="listen-mic-icon">🎙</span>
              </button>
              <p className="listen-hint">Tap to listen (8 seconds)</p>
            </div>
          )}

          {isListening && (
            <div className="listen-active">
              <div className="listen-pulse" />
              <p>Listening...</p>
              <button className="create-dialog-btn" onClick={stopListening}>
                Stop Early
              </button>
            </div>
          )}

          {error && (
            <div>
              <div className="create-dialog-error">{error}</div>
              <button className="create-dialog-btn" onClick={clearResult}>
                Try Again
              </button>
            </div>
          )}

          {result && (
            <div className="listen-results">
              <div className="listen-analysis">
                <h4>Detected</h4>
                <div className="listen-analysis-grid">
                  <div className="listen-stat">
                    <span className="listen-stat-label">BPM</span>
                    <span className="listen-stat-value">{result.bpm}</span>
                  </div>
                  <div className="listen-stat">
                    <span className="listen-stat-label">Key</span>
                    <span className="listen-stat-value">{result.key}</span>
                  </div>
                  <div className="listen-stat">
                    <span className="listen-stat-label">Energy</span>
                    <span className="listen-stat-value">{(result.mood.energy * 100).toFixed(0)}%</span>
                  </div>
                  <div className="listen-stat">
                    <span className="listen-stat-label">Brightness</span>
                    <span className="listen-stat-value">{(result.mood.brightness * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {matches.length > 0 && (
                <div className="listen-matches">
                  <h4>Matching blocks</h4>
                  <div className="listen-match-list">
                    {matches.map((block: Block) => (
                      <button
                        key={block.id}
                        className={`listen-match-item ${previewingId === block.id ? 'active' : ''}`}
                        onClick={() => preview(block.id, block.pattern)}
                      >
                        <span className="listen-match-name">{block.name}</span>
                        <span className="listen-match-meta">{block.key} · {block.bpm}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="listen-actions">
                <button className="create-dialog-btn" onClick={clearResult}>
                  Listen Again
                </button>
                <button className="create-dialog-btn primary" onClick={handleCreateFromAnalysis}>
                  Create with AI
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
