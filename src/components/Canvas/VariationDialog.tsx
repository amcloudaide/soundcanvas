import { useState } from 'react'
import { generateVariation } from '../../services/ai-generate'
import { useLibraryStore } from '../../store/library-store'
import { usePreview } from '../../audio/usePreview'
import type { Block } from '../../types/block'
import '../../components/Library/CreateBlockDialog.css'

interface VariationDialogProps {
  sourcePattern: string
  onClose: () => void
}

type DialogState = 'input' | 'loading' | 'preview' | 'error'

export function VariationDialog({ sourcePattern, onClose }: VariationDialogProps) {
  const [prompt, setPrompt] = useState('')
  const [state, setState] = useState<DialogState>('input')
  const [generatedBlock, setGeneratedBlock] = useState<Block | null>(null)
  const [error, setError] = useState('')
  const { addBlock } = useLibraryStore()
  const { preview, stopPreview, previewingId } = usePreview()

  const handleGenerate = async () => {
    const desc = prompt.trim() || 'create a subtle variation'
    setState('loading')
    setError('')
    try {
      const block = await generateVariation(sourcePattern, desc)
      setGeneratedBlock(block)
      setState('preview')
    } catch (err: any) {
      setError(err.message || 'Variation failed')
      setState('error')
    }
  }

  const handleSave = () => {
    if (generatedBlock) {
      stopPreview()
      addBlock(generatedBlock)
      onClose()
    }
  }

  return (
    <div className="create-dialog-overlay" onClick={onClose}>
      <div className="create-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="create-dialog-header">
          <h3>Create Variation</h3>
          <button className="create-dialog-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        {state === 'input' && (
          <div className="create-dialog-body">
            <code className="create-dialog-preview-pattern" style={{ marginBottom: '12px' }}>
              {sourcePattern}
            </code>
            <textarea
              className="create-dialog-input"
              placeholder='How should it differ? (optional)&#10;e.g., "make it darker" or "add more swing"'
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              autoFocus
            />
            <button className="create-dialog-btn primary" onClick={handleGenerate}>
              Generate Variation
            </button>
          </div>
        )}

        {state === 'loading' && (
          <div className="create-dialog-body">
            <div className="create-dialog-loading">
              <div className="create-dialog-spinner" />
              <p>Creating variation...</p>
            </div>
          </div>
        )}

        {state === 'preview' && generatedBlock && (
          <div className="create-dialog-body">
            <div className="create-dialog-preview">
              <div className="create-dialog-preview-name">{generatedBlock.name}</div>
              <div className="create-dialog-preview-meta">
                {generatedBlock.category} &middot; {generatedBlock.key} &middot; {generatedBlock.bpm} BPM
              </div>
              <code className="create-dialog-preview-pattern">{generatedBlock.pattern}</code>
            </div>
            <div className="create-dialog-actions">
              <button
                className="create-dialog-btn"
                onClick={() => generatedBlock && preview(generatedBlock.id, generatedBlock.pattern)}
              >
                {previewingId === generatedBlock?.id ? '⏹ Stop' : '▶ Preview'}
              </button>
              <button className="create-dialog-btn" onClick={() => { stopPreview(); setState('input'); setGeneratedBlock(null) }}>
                Retry
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
            <button className="create-dialog-btn" onClick={() => setState('input')}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
