import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { HITLPanel } from './HITLPanel'
import type { Company } from '../types'

vi.mock('../api/client', () => ({
  approveCompany: vi.fn().mockResolvedValue({ status: 'recorded' }),
}))

const mockCompany: Company = {
  id: 'co-1',
  name: 'TestCo',
  url: 'https://testco.com',
  industry: 'AI',
  stage: 'Seed',
  location: 'India',
  description: 'AI company',
  founders: [],
  github: { repo_count: 0, total_stars: 0, total_forks: 0, last_commit_date: null, primary_languages: [], github_org_url: null, source: 'mock' },
  news: { articles: [], sentiment: 'neutral', momentum_signals: [], summary: '' },
  market: { competitors: [], tam_estimate: '', market_growth_rate: '', key_trends: [], market_stage: '' },
  score: 75,
  tier: 'High',
  rationale: 'Strong',
  score_breakdown: { team: 70, technology: 80, traction: 60, market: 90 },
  report: '# Report',
  created_at: '2024-01-01',
}

describe('HITLPanel', () => {
  it('renders notes textarea and decision buttons', () => {
    render(<HITLPanel company={mockCompany} onDecisionSubmitted={vi.fn()} />)
    expect(screen.getByPlaceholderText(/investment rationale/i)).toBeInTheDocument()
    expect(screen.getByText('✓ Approve Pipeline')).toBeInTheDocument()
    expect(screen.getByText('❓ Request Info')).toBeInTheDocument()
    expect(screen.getByText('✕ Reject')).toBeInTheDocument()
  })

  it('shows success message after approve click', async () => {
    const user = userEvent.setup()
    render(<HITLPanel company={mockCompany} onDecisionSubmitted={vi.fn()} />)

    await user.click(screen.getByText('✓ Approve Pipeline'))
    expect(await screen.findByText(/recorded successfully/i)).toBeInTheDocument()
  })

  it('calls onDecisionSubmitted after approve', async () => {
    const onDecision = vi.fn()
    const user = userEvent.setup()
    render(<HITLPanel company={mockCompany} onDecisionSubmitted={onDecision} />)

    await user.click(screen.getByText('✓ Approve Pipeline'))
    await screen.findByText(/recorded successfully/i)
    expect(onDecision).toHaveBeenCalledTimes(1)
  })
})
