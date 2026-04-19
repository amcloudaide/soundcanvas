import { createBlock, type Block } from '../types/block'

interface GenerateResponse {
  name: string
  category: 'beats' | 'bass' | 'melody' | 'chords' | 'fx' | 'vocal'
  pattern: string
  key: string
  bpm: number
  bars?: number
  mood?: { energy: number; brightness: number }
  density?: number
  tags?: string[]
}

export async function generateBlock(prompt: string): Promise<Block> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `Generation failed (${response.status})`)
  }

  const data: GenerateResponse = await response.json()

  return createBlock({
    ...data,
    source: 'ai-generated',
  })
}

export async function generateVariation(existingPattern: string, prompt: string): Promise<Block> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, existingPattern }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `Variation failed (${response.status})`)
  }

  const data: GenerateResponse = await response.json()

  return createBlock({
    ...data,
    source: 'ai-generated',
  })
}
