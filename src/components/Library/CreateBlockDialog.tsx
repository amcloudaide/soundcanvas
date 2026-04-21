import { useState } from 'react'
import { generateBlock } from '../../services/ai-generate'
import { useLibraryStore } from '../../store/library-store'
import { usePreview } from '../../audio/usePreview'
import { createBlock, type Block, type BlockCategory } from '../../types/block'
import './CreateBlockDialog.css'

interface CreateBlockDialogProps {
  onClose: () => void
}

type Mode = 'ai' | 'manual'
type AiDialogState = 'input' | 'loading' | 'preview' | 'error'

const CATEGORIES: BlockCategory[] = ['beats', 'bass', 'melody', 'chords', 'fx', 'vocal']

const MANUAL_TEMPLATE = `s("bd sd [~ bd] sd, hh*8")`

export function CreateBlockDialog({ onClose }: CreateBlockDialogProps) {
  const [mode, setMode] = useState<Mode>('ai')
  const { addBlock } = useLibraryStore()
  const { preview, stopPreview, previewingId } = usePreview()

  // --- AI mode state ---
  const [prompt, setPrompt] = useState('')
  const [aiState, setAiState] = useState<AiDialogState>('input')
  const [generatedBlock, setGeneratedBlock] = useState<Block | null>(null)
  const [aiError, setAiError] = useState('')

  // --- Manual mode state ---
  const [manualName, setManualName] = useState('')
  const [manualCategory, setManualCategory] = useState<BlockCategory>('beats')
  const [manualPattern, setManualPattern] = useState(MANUAL_TEMPLATE)
  const [manualKey, setManualKey] = useState('chromatic')
  const [manualBpm, setManualBpm] = useState(120)
  const [manualBars, setManualBars] = useState(1)
  const [manualTags, setManualTags] = useState('')
  const [manualPreviewId] = useState(() => `__manual-preview-${Math.random().toString(36).slice(2)}`)

  // --- AI handlers ---
  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setAiState('loading')
    setAiError('')
    try {
      const block = await generateBlock(prompt.trim())
      setGeneratedBlock(block)
      setAiState('preview')
    } catch (err: any) {
      setAiError(err.message || 'Generation failed')
      setAiState('error')
    }
  }

  const handleRegenerate = () => {
    stopPreview()
    setGeneratedBlock(null)
    setAiState('input')
  }

  const handleAiSave = () => {
    if (generatedBlock) {
      stopPreview()
      addBlock(generatedBlock)
      onClose()
    }
  }

  const handleAiPreview = () => {
    if (generatedBlock) {
      preview(generatedBlock.id, generatedBlock.pattern)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  // --- Manual handlers ---
  const manualValid = manualName.trim().length > 0 && manualPattern.trim().length > 0

  const handleManualPreview = () => {
    if (!manualPattern.trim()) return
    preview(manualPreviewId, manualPattern.trim())
  }

  const handleManualSave = () => {
    if (!manualValid) return
    stopPreview()
    const block = createBlock({
      name: manualName.trim(),
      category: manualCategory,
      pattern: manualPattern.trim(),
      key: manualKey.trim() || 'chromatic',
      bpm: manualBpm,
      bars: manualBars,
      tags: manualTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      source: 'manual',
    })
    addBlock(block)
    onClose()
  }

  const handleSwitchMode = (m: Mode) => {
    stopPreview()
    setMode(m)
  }

  return (
    <div className="create-dialog-overlay" onClick={onClose}>
      <div className="create-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="create-dialog-header">
          <h3>Create Block</h3>
          <button className="create-dialog-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        {/* Mode tabs */}
        <div className="create-dialog-tabs">
          <button
            className={`create-dialog-tab ${mode === 'ai' ? 'active' : ''}`}
            onClick={() => handleSwitchMode('ai')}
          >
            ✨ AI
          </button>
          <button
            className={`create-dialog-tab ${mode === 'manual' ? 'active' : ''}`}
            onClick={() => handleSwitchMode('manual')}
          >
            ✏️ Manual
          </button>
        </div>

        {/* AI MODE */}
        {mode === 'ai' && aiState === 'input' && (
          <div className="create-dialog-body">
            <textarea
              className="create-dialog-input"
              placeholder='Describe the sound you want...&#10;e.g., "bouncy 8-bit melody" or "dark trap hi-hats"'
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
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

        {mode === 'ai' && aiState === 'loading' && (
          <div className="create-dialog-body">
            <div className="create-dialog-loading">
              <div className="create-dialog-spinner" />
              <p>Creating your block...</p>
            </div>
          </div>
        )}

        {mode === 'ai' && aiState === 'preview' && generatedBlock && (
          <div className="create-dialog-body">
            <div className="create-dialog-preview">
              <div className="create-dialog-preview-name">{generatedBlock.name}</div>
              <div className="create-dialog-preview-meta">
                {generatedBlock.category} &middot; {generatedBlock.key} &middot; {generatedBlock.bpm} BPM
              </div>
              <div className="create-dialog-preview-tags">
                {generatedBlock.tags.map((t) => (
                  <span key={t} className="create-dialog-tag">{t}</span>
                ))}
              </div>
              <code className="create-dialog-preview-pattern">{generatedBlock.pattern}</code>
            </div>
            <div className="create-dialog-actions">
              <button className="create-dialog-btn" onClick={handleAiPreview}>
                {previewingId === generatedBlock.id ? '⏹ Stop' : '▶ Preview'}
              </button>
              <button className="create-dialog-btn" onClick={handleRegenerate}>
                Regenerate
              </button>
              <button className="create-dialog-btn primary" onClick={handleAiSave}>
                Save to Library
              </button>
            </div>
          </div>
        )}

        {mode === 'ai' && aiState === 'error' && (
          <div className="create-dialog-body">
            <div className="create-dialog-error">{aiError}</div>
            <button className="create-dialog-btn" onClick={handleRegenerate}>
              Try Again
            </button>
          </div>
        )}

        {/* MANUAL MODE */}
        {mode === 'manual' && (
          <div className="create-dialog-body">
            <div className="manual-form">
              <label className="manual-field">
                <span className="manual-label">Name</span>
                <input
                  type="text"
                  className="manual-input"
                  placeholder="e.g. My Funky Beat"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  autoFocus
                />
              </label>

              <label className="manual-field">
                <span className="manual-label">Category</span>
                <select
                  className="manual-input"
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value as BlockCategory)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label className="manual-field">
                <span className="manual-label">Pattern (Strudel mini-notation)</span>
                <textarea
                  className="manual-input manual-pattern"
                  value={manualPattern}
                  onChange={(e) => setManualPattern(e.target.value)}
                  rows={3}
                  spellCheck={false}
                />
              </label>

              <div className="manual-row">
                <label className="manual-field">
                  <span className="manual-label">Key</span>
                  <input
                    type="text"
                    className="manual-input"
                    placeholder="C, Am, Cm, F#..."
                    value={manualKey}
                    onChange={(e) => setManualKey(e.target.value)}
                  />
                </label>
                <label className="manual-field">
                  <span className="manual-label">BPM</span>
                  <input
                    type="number"
                    className="manual-input"
                    min={40}
                    max={300}
                    value={manualBpm}
                    onChange={(e) => setManualBpm(Number(e.target.value) || 120)}
                  />
                </label>
                <label className="manual-field">
                  <span className="manual-label">Bars</span>
                  <input
                    type="number"
                    className="manual-input"
                    min={1}
                    max={16}
                    value={manualBars}
                    onChange={(e) => setManualBars(Number(e.target.value) || 1)}
                  />
                </label>
              </div>

              <label className="manual-field">
                <span className="manual-label">Tags (comma-separated)</span>
                <input
                  type="text"
                  className="manual-input"
                  placeholder="e.g. funky, groove, house"
                  value={manualTags}
                  onChange={(e) => setManualTags(e.target.value)}
                />
              </label>
            </div>

            <div className="create-dialog-actions">
              <button
                className="create-dialog-btn"
                onClick={handleManualPreview}
                disabled={!manualPattern.trim()}
              >
                {previewingId === manualPreviewId ? '⏹ Stop' : '▶ Preview'}
              </button>
              <button
                className="create-dialog-btn primary"
                onClick={handleManualSave}
                disabled={!manualValid}
              >
                Save to Library
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
