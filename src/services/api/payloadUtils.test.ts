import { describe, expect, it } from 'vitest'
import { omitEmptyValues } from './payloadUtils'

describe('omitEmptyValues', () => {
  it('omits empty values while preserving zero and false', () => {
    expect(omitEmptyValues({
      missing: undefined, empty: '', absent: null, count: 0, enabled: false,
    })).toEqual({ count: 0, enabled: false })
  })
})
