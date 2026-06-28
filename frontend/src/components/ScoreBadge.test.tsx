import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ScoreBadge } from './ScoreBadge'

describe('ScoreBadge', () => {
  it('renders High tier', () => {
    render(<ScoreBadge tier="High" />)
    const badge = screen.getByText('High')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('badge-high')
  })

  it('renders Medium tier', () => {
    render(<ScoreBadge tier="Medium" />)
    const badge = screen.getByText('Medium')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('badge-medium')
  })

  it('renders Low tier', () => {
    render(<ScoreBadge tier="Low" />)
    const badge = screen.getByText('Low')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('badge-low')
  })

  it('applies custom className', () => {
    render(<ScoreBadge tier="High" className="extra-class" />)
    const badge = screen.getByText('High')
    expect(badge.className).toContain('extra-class')
  })
})
