import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TransportBar } from '../TransportBar'

vi.mock('../../../audio/usePlayback', () => ({
  usePlayback: () => ({
    isPlaying: false,
    togglePlayback: vi.fn(),
  }),
}))

describe('TransportBar', () => {
  it('renders play button', () => {
    render(<TransportBar />)
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
  })

  it('renders BPM slider', () => {
    render(<TransportBar />)
    expect(screen.getByLabelText(/bpm/i)).toBeInTheDocument()
  })

  it('displays current BPM value', () => {
    render(<TransportBar />)
    expect(screen.getByText('120')).toBeInTheDocument()
  })
})
