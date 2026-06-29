import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ICPForm } from './ICPForm'

describe('ICPForm', () => {
  it('renders all form fields', () => {
    render(<ICPForm onSubmit={vi.fn()} isLoading={false} />)
    expect(screen.getByDisplayValue('AI Healthcare')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Seed')).toBeInTheDocument()
    expect(screen.getByDisplayValue('India')).toBeInTheDocument()
  })

  it('calls onSubmit with form data', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<ICPForm onSubmit={onSubmit} isLoading={false} />)

    await user.click(screen.getByRole('button', { name: /start discovery/i }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      industry: 'AI Healthcare',
      stage: 'Seed',
      location: 'India',
      tech_keywords: ['machine learning', 'diagnostic screening', 'thermal imaging'],
      target_personas: ['CEO', 'CTO', 'Founder'],
      business_triggers: ['funding', 'github_activity'],
      min_qualification_score: 75,
    })
  })

  it('disables inputs when loading', () => {
    render(<ICPForm onSubmit={vi.fn()} isLoading={true} />)
    expect(screen.getByDisplayValue('AI Healthcare')).toBeDisabled()
    expect(screen.getByText('Running Discovery...')).toBeInTheDocument()
  })

  it('adds keyword chip on Enter', async () => {
    const user = userEvent.setup()
    render(<ICPForm onSubmit={vi.fn()} isLoading={false} />)

    const input = screen.getByPlaceholderText(/type and press enter/i)
    await user.type(input, 'NLP{Enter}')

    expect(screen.getByText('NLP')).toBeInTheDocument()
  })

  it('removes keyword chip on click', async () => {
    const user = userEvent.setup()
    render(<ICPForm onSubmit={vi.fn()} isLoading={false} />)

    expect(screen.getByText('machine learning')).toBeInTheDocument()
    const removeBtn = screen.getByText('machine learning').closest('span')?.querySelector('span')
    if (removeBtn) await user.click(removeBtn)

    expect(screen.queryByText('machine learning')).not.toBeInTheDocument()
  })
})
