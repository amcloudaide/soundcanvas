import { useState } from 'react'
import { generateBlock } from '../../services/ai-generate'
import { useLibraryStore } from '../../store/library-store'
import { usePreview } from '../../audio/usePreview'
import type { Block } from '../../types/block'
import './CreateBlockDialog.css'

interface CreateBlockDialogProps {
  onClose: () => void
}

type DialogState = 'input' | 'loading' | 'preview' | 'error'

export function CreateBlockDialog({ onClose }: CreateBlockDialogProps) {
  const [prompt, setPrompt] = useState('')
  const [state, setState] = useState<DialogState>('input')
  const [generatedBlock, setGeneratedBlock] = useState<Block | null>(null)
  const [error, setError] = useState('')
  const { addBlock } = useLibraryStore()
  const { preview, stopPreview, previewingId } = usePreview()

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setState('loading')
    setError('')
    try {
      const block = await generateBlock(prompt.trim())
      setGeneratedBlock(block)
      setState('preview')
    } catch (err: any) {
      setError(err.message || 'Generation failed')
      setState('error')
    }
  }

  const handleRegenerate = () => {
    stopPreview()
    setGeneratedBlock(null)
    setState('input')
  }

  const handleSave = () => {
    if (generatedBlock) {
      stopPreview()
      addBlock(generatedBlock)
      onClose()
    }
  }

  const handlePreview = () => {
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

  return (
    <div className="create-dialog-overlay" onClick={onClose}>
      <div className="create-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="create-dialog-header">
          <h3>Create with AI</h3>
          <button className="create-dialog-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        {state === 'input' && (
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

        {state === 'loading' && (
          <div className="create-dialog-body">
            <div className="create-dialog-loading">
              <div className="create-dialog-spinner" />
              <p>Creating your block...</p>
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
              <div className="create-dialog-preview-tags">
                {generatedBlock.tags.map((t) => (
                  <span key={t} className="create-dialog-tag">{t}</span>
                ))}
              </div>
              <code className="create-dialog-preview-pattern">{generatedBlock.pattern}</code>
            </div>
            <div className="create-dialog-actions">
              <button
                className="create-dialog-btn"
                onClick={handlePreview}
              >
                {previewingId === generatedBlock.id ? '⏹ Stop' : '▶ Preview'}
              </button>
              <button className="create-dialog-btn" onClick={handleRegenerate}>
                Regenerate
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
            <button className="create-dialog-btn" onClick={handleRegenerate}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
