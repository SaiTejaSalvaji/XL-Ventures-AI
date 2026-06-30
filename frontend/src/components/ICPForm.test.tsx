import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ICPForm } from './ICPForm'

describe('ICPForm', () => {
  it('renders all form fields', () => {
    render(<ICPForm onSubmit={vi.fn()} isLoading={false} />)
    expect(screen.getByPlaceholderText('ex: Fintech, HealthTech, AI Infrastructure')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Seed')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('ex: India, United States, Europe, Global')).toBeInTheDocument()
  })

  it('calls onSubmit with form data', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<ICPForm onSubmit={onSubmit} isLoading={false} />)

    // Fill Industry
    const industryInput = screen.getByPlaceholderText('ex: Fintech, HealthTech, AI Infrastructure')
    fireEvent.change(industryInput, { target: { value: 'AI Healthcare' } })
    
    // Fill Geography
    const geoInput = screen.getByPlaceholderText('ex: India, United States, Europe, Global')
    fireEvent.change(geoInput, { target: { value: 'India' } })

    // Add tech keywords
    const keywordInput = screen.getByPlaceholderText(/ex: NLP, computer vision/i)
    
    fireEvent.change(keywordInput, { target: { value: 'machine learning' } })
    fireEvent.keyDown(keywordInput, { key: 'Enter', code: 'Enter', charCode: 13 })
    
    fireEvent.change(keywordInput, { target: { value: 'diagnostic screening' } })
    fireEvent.keyDown(keywordInput, { key: 'Enter', code: 'Enter', charCode: 13 })

    fireEvent.change(keywordInput, { target: { value: 'thermal imaging' } })
    fireEvent.keyDown(keywordInput, { key: 'Enter', code: 'Enter', charCode: 13 })

    // Open Advanced Section
    const advancedToggle = screen.getByText('Advanced Qualification')
    await user.click(advancedToggle)

    // Fill Target Personas
    const personasInput = screen.getByPlaceholderText('ex: CEO, CTO, VP Engineering, Founder')
    fireEvent.change(personasInput, { target: { value: 'CEO, CTO, Founder' } })

    // Check triggers
    await user.click(screen.getByText(/Funding Announcements/))
    await user.click(screen.getByText(/GitHub Repository Activity/))

    // Set slider value
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: 75 } })

    // Submit form
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
  }, 10000)

  it('disables inputs when loading', () => {
    render(<ICPForm onSubmit={vi.fn()} isLoading={true} />)
    expect(screen.getByPlaceholderText('ex: Fintech, HealthTech, AI Infrastructure')).toBeDisabled()
    expect(screen.getByText('Running Discovery...')).toBeInTheDocument()
  })

  it('adds keyword chip on Enter', async () => {
    render(<ICPForm onSubmit={vi.fn()} isLoading={false} />)

    const input = screen.getByPlaceholderText(/ex: NLP, computer vision/i)
    fireEvent.change(input, { target: { value: 'NLP' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 })

    expect(screen.getByText('NLP')).toBeInTheDocument()
  })

  it('removes keyword chip on click', async () => {
    const user = userEvent.setup()
    render(<ICPForm onSubmit={vi.fn()} isLoading={false} />)

    const input = screen.getByPlaceholderText(/ex: NLP, computer vision/i)
    fireEvent.change(input, { target: { value: 'machine learning' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 })

    expect(screen.getByText('machine learning')).toBeInTheDocument()
    const removeBtn = screen.getByText('machine learning').closest('span')?.querySelector('span')
    if (removeBtn) await user.click(removeBtn)

    expect(screen.queryByText('machine learning')).not.toBeInTheDocument()
  })
})


