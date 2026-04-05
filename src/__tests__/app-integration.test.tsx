import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock react-konva before importing App
vi.mock('react-konva', () => ({
  Stage: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div data-testid="stage" ref={ref} {...props}>{children}</div>
  )),
  Layer: ({ children }: any) => <div data-testid="layer">{children}</div>,
  Group: ({ children }: any) => <div>{children}</div>,
  Rect: () => <div />,
  Text: ({ text }: any) => <span>{text}</span>,
}))

import App from '../App'

describe('App Integration', () => {
  it('renders the full app without crashing', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Beats')).toBeInTheDocument()
  })

  it('loads starter blocks into the library', () => {
    render(<App />)
    expect(screen.getByText('Four on the Floor')).toBeInTheDocument()
    expect(screen.getByText('Sub Wobble')).toBeInTheDocument()
  })

  it('renders the SoundCanvas title', () => {
    render(<App />)
    expect(screen.getByText('SoundCanvas')).toBeInTheDocument()
  })

  it('renders BPM slider at 120', () => {
    render(<App />)
    expect(screen.getByText('120')).toBeInTheDocument()
  })
})
