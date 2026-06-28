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

    await user.click(screen.getByRole('button', { name: /trigger discovery/i }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      industry: 'AI Healthcare',
      stage: 'Seed',
      location: 'India',
      tech_keywords: ['machine learning', 'diagnostic screening', 'thermal imaging'],
    })
  })

  it('disables inputs when loading', () => {
    render(<ICPForm onSubmit={vi.fn()} isLoading={true} />)
    expect(screen.getByDisplayValue('AI Healthcare')).toBeDisabled()
    expect(screen.getByText('Analyzing...')).toBeInTheDocument()
  })

  it('updates keyword chips on input', async () => {
    const user = userEvent.setup()
    render(<ICPForm onSubmit={vi.fn()} isLoading={false} />)

    const input = screen.getByDisplayValue('machine learning, diagnostic screening, thermal imaging')
    await user.clear(input)
    await user.type(input, 'AI, NLP')

    expect(screen.getByText('AI')).toBeInTheDocument()
    expect(screen.getByText('NLP')).toBeInTheDocument()
    expect(screen.getByText((content) => content.startsWith('2'))).toBeInTheDocument()
  })

  it('removes keyword chip on click', async () => {
    const user = userEvent.setup()
    render(<ICPForm onSubmit={vi.fn()} isLoading={false} />)

    const chips = screen.getAllByText('×')
    await user.click(chips[0])

    expect(screen.queryByText('machine learning')).not.toBeInTheDocument()
  })
})
