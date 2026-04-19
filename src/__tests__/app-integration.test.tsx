import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock react-konva
vi.mock('react-konva', () => ({
  Stage: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div data-testid="stage" ref={ref} {...props}>{children}</div>
  )),
  Layer: ({ children }: any) => <div data-testid="layer">{children}</div>,
  Group: ({ children }: any) => <div>{children}</div>,
  Rect: () => <div />,
  Text: ({ text }: any) => <span>{text}</span>,
}))

// Mock audio preview
vi.mock('../audio/usePreview', () => ({
  usePreview: () => ({
    preview: vi.fn(),
    stopPreview: vi.fn(),
    previewingId: null,
  }),
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

  it('renders search input in library', () => {
    render(<App />)
    expect(screen.getByPlaceholderText('Search blocks...')).toBeInTheDocument()
  })

  it('renders view toggle button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /mood grid/i })).toBeInTheDocument()
  })

  it('renders the AI Create button in library', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /create with ai/i })).toBeInTheDocument()
  })

  it('renders the Listen button in library', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /listen and analyze/i })).toBeInTheDocument()
  })

  it('renders the Save/Load button in transport', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /save and load/i })).toBeInTheDocument()
  })
})
