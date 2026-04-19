import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MoodGrid } from '../MoodGrid'
import { useLibraryStore } from '../../../store/library-store'
import { starterBlocks } from '../../../data/starter-blocks'

describe('MoodGrid', () => {
  beforeEach(() => {
    useLibraryStore.getState().loadBlocks(starterBlocks)
  })

  it('renders the mood grid with axis labels', () => {
    render(<MoodGrid onSelectBlock={() => {}} />)
    expect(screen.getByText('Dark')).toBeInTheDocument()
    expect(screen.getByText('Bright')).toBeInTheDocument()
    expect(screen.getByText('Chill')).toBeInTheDocument()
    expect(screen.getByText('Energy')).toBeInTheDocument()
  })

  it('renders block dots', () => {
    const { container } = render(<MoodGrid onSelectBlock={() => {}} />)
    const dots = container.querySelectorAll('.mood-dot')
    expect(dots.length).toBeGreaterThan(0)
  })
})
