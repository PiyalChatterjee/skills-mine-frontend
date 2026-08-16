import { describe, it, expect } from 'vitest'
import { mapQueryError } from './queryErrorHandler'

describe('mapQueryError', () => {
  it('extracts message from an Error object', () => {
    const result = mapQueryError(new Error('something went wrong'))
    expect(result.message).toBe('something went wrong')
    expect(result.details).toBeNull()
  })

  it('extracts message from a plain object with message property', () => {
    const result = mapQueryError({ message: 'API error', code: 404 })
    expect(result.message).toBe('API error')
  })

  it('falls back to "Unexpected query error" for non-object', () => {
    const result = mapQueryError('just a string')
    expect(result.message).toBe('Unexpected query error')
    expect(result.details).toBeNull()
  })

  it('falls back to "Unexpected query error" for null', () => {
    const result = mapQueryError(null)
    expect(result.message).toBe('Unexpected query error')
  })

  it('falls back to "Unexpected query error" for undefined', () => {
    const result = mapQueryError(undefined)
    expect(result.message).toBe('Unexpected query error')
  })

  it('uses "Unknown error" when object has no message property', () => {
    const result = mapQueryError({ code: 500 })
    expect(result.message).toBe('Unknown error')
  })

  it('falls back to "Unexpected query error" for numbers', () => {
    const result = mapQueryError(42)
    expect(result.message).toBe('Unexpected query error')
  })

  it('extracts HTTP status and response data from Axios-shaped errors', () => {
    const result = mapQueryError({
      message: 'Request failed with status code 401',
      response: { status: 401, data: { error: 'Unauthorized' } },
    })
    expect(result.message).toBe('Request failed with status code 401')
    expect(result.status).toBe(401)
    expect(result.details).toEqual({ error: 'Unauthorized' })
  })
})
