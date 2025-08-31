import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { resolveDateRange } from '@/lib/date-range'

describe('resolveDateRange', () => {
  const realNow = Date.now
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 0, 15)) // Jan 15, 2024 (local)
  })
  afterAll(() => {
    vi.useRealTimers()
    // restore Date.now
    Date.now = realNow
  })

  it('returns all by default', () => {
    const r = resolveDateRange({})
    expect(r).toEqual({ key: 'all' })
  })

  it('resolves last7', () => {
    const r = resolveDateRange({ range: 'last7' })
    expect(r.key).toBe('last7')
    expect(r.from).toBe('2024-01-09')
    expect(r.to).toBe('2024-01-15')
  })

  it('resolves thisMonth', () => {
    const r = resolveDateRange({ range: 'thisMonth' })
    expect(r.key).toBe('thisMonth')
    expect(r.from).toBe('2024-01-01')
    expect(r.to).toBe('2024-01-15')
  })

  it('passes through custom', () => {
    const r = resolveDateRange({ range: 'custom', from: '2023-12-01', to: '2023-12-31' })
    expect(r).toEqual({ key: 'custom', from: '2023-12-01', to: '2023-12-31' })
  })
})

