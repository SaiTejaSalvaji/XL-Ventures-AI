import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPost = vi.fn()
const mockGet = vi.fn()

vi.mock('axios', () => ({
  default: {
    create: () => ({
      post: mockPost,
      get: mockGet,
    }),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('API client', () => {
  it('startAnalysis posts to /analyze', async () => {
    mockPost.mockResolvedValue({ data: { job_id: 'abc', status: 'running' } })
    const { startAnalysis } = await import('./client')
    const result = await startAnalysis({ industry: 'AI', stage: 'Seed', location: 'India', tech_keywords: [] })
    expect(mockPost).toHaveBeenCalledWith('/analyze', {
      industry: 'AI', stage: 'Seed', location: 'India', tech_keywords: [],
    })
    expect(result).toEqual({ job_id: 'abc', status: 'running' })
  })

  it('getResults fetches job status', async () => {
    mockGet.mockResolvedValue({ data: { job_id: 'abc', status: 'done', current_step: null, companies: [] } })
    const { getResults } = await import('./client')
    const result = await getResults('abc')
    expect(mockGet).toHaveBeenCalledWith('/results/abc')
    expect(result.status).toBe('done')
  })

  it('getAllCompanies returns company list', async () => {
    mockGet.mockResolvedValue({ data: { companies: [{ name: 'TestCo' }], total: 1 } })
    const { getAllCompanies } = await import('./client')
    const result = await getAllCompanies()
    expect(mockGet).toHaveBeenCalledWith('/companies')
    expect(result.total).toBe(1)
  })

  it('approveCompany posts decision', async () => {
    mockPost.mockResolvedValue({ data: { status: 'recorded' } })
    const { approveCompany } = await import('./client')
    const result = await approveCompany('co-1', 'approve', 'Looks good')
    expect(mockPost).toHaveBeenCalledWith('/approve/co-1', { decision: 'approve', notes: 'Looks good' })
    expect(result.status).toBe('recorded')
  })

  it('getReport fetches company report', async () => {
    mockGet.mockResolvedValue({ data: { report: '# DD Report' } })
    const { getReport } = await import('./client')
    const result = await getReport('co-1')
    expect(mockGet).toHaveBeenCalledWith('/company/co-1/report')
    expect(result.report).toBe('# DD Report')
  })

  it('checkHealth returns true on success', async () => {
    mockGet.mockResolvedValue({ data: {} })
    const { checkHealth } = await import('./client')
    const result = await checkHealth()
    expect(result).toBe(true)
  })

  it('checkHealth returns false on error', async () => {
    mockGet.mockRejectedValue(new Error('Network error'))
    const { checkHealth } = await import('./client')
    const result = await checkHealth()
    expect(result).toBe(false)
  })
})
