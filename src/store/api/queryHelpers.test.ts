import { describe, it, expect, vi } from 'vitest'
import { withMappedApiError } from './queryHelpers'

vi.mock('@/app/queryErrorHandler', () => ({
  mapQueryError: (error: unknown) => ({
    message: error instanceof Error ? error.message : 'Mapped error',
    details: error,
  }),
}))

describe('withMappedApiError', () => {
  it('returns { data } on successful operation', async () => {
    const result = await withMappedApiError(async () => ({ id: '1', name: 'Test' }))
    expect(result).toEqual({ data: { id: '1', name: 'Test' } })
  })

  it('returns { error } with mapped error when operation throws', async () => {
    const result = await withMappedApiError(async () => {
      throw new Error('Network failure')
    })
    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error.message).toBe('Network failure')
    }
  })

  it('handles non-Error throws', async () => {
    const result = await withMappedApiError(async () => {
      throw 'string error'
    })
    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error).toBeDefined()
    }
  })

  it('returns primitive data values', async () => {
    const result = await withMappedApiError(async () => 42)
    expect(result).toEqual({ data: 42 })
  })

  it('returns null data when operation resolves to null', async () => {
    const result = await withMappedApiError(async () => null)
    expect(result).toEqual({ data: null })
  })
})
