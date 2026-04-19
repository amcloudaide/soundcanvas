import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'

// Mock react-konva before importing component
vi.mock('react-konva', () => ({
  Stage: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div data-testid="stage" ref={ref} {...props}>{children}</div>
  )),
  Layer: ({ children }: any) => <div data-testid="layer">{children}</div>,
  Group: ({ children }: any) => <div>{children}</div>,
  Rect: () => <div />,
  Text: ({ text }: any) => <span>{text}</span>,
}))

import { MusicCanvas } from '../MusicCanvas'

describe('MusicCanvas', () => {
  it('renders a canvas container', () => {
    const { container } = render(<MusicCanvas />)
    const canvasEl = container.querySelector('.music-canvas')
    expect(canvasEl).toBeInTheDocument()
  })
})
