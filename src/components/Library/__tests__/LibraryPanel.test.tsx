import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LibraryPanel } from '../LibraryPanel'
import { useLibraryStore } from '../../../store/library-store'
import { starterBlocks } from '../../../data/starter-blocks'

describe('LibraryPanel', () => {
  beforeEach(() => {
    useLibraryStore.getState().loadBlocks(starterBlocks)
  })

  it('renders category tabs', () => {
    render(<LibraryPanel />)
    expect(screen.getByText('Beats')).toBeInTheDocument()
    expect(screen.getByText('Bass')).toBeInTheDocument()
    expect(screen.getByText('Melody')).toBeInTheDocument()
  })

  it('shows blocks for the default (All) category', () => {
    render(<LibraryPanel />)
    expect(screen.getByText('Four on the Floor')).toBeInTheDocument()
  })
})
