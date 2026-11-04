import type { PropsWithChildren } from 'react'
import { configureStore } from '@reduxjs/toolkit'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'
import { locationApi } from '@/services/api'
import { apiSlice } from '@/store/api/apiSlice'
import { toPreferredLocationEnum, toPreferredLocationLabel } from '@/modules/candidate/utils/profileEnums'
import { useWorkTypeOptions } from './useWorkTypeOptions'

describe('useWorkTypeOptions', () => {
  it('uses only master work options and shares the cached request', async () => {
    const workOptions = ['Remote', 'Hybrid', 'On-site', 'Nationwide (South Africa)', 'Africa-wide', 'International']
    const request = vi.spyOn(locationApi, 'getMasterLocations').mockResolvedValue([
      { locationId: 'city', name: 'Cape Town', type: 'CITY' },
      { locationId: 'country', name: 'Botswana', type: 'COUNTRY' },
      ...workOptions.map((name) => ({ locationId: name, name, type: 'WORK_OPTION' as const })),
    ])
    const store = configureStore({
      reducer: { [apiSlice.reducerPath]: apiSlice.reducer },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
    })
    const wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>
    const first = renderHook(() => useWorkTypeOptions(), { wrapper })
    const second = renderHook(() => useWorkTypeOptions(), { wrapper })

    expect(first.result.current).toEqual([])
    await waitFor(() => expect(first.result.current).toEqual(workOptions))
    expect(second.result.current).toEqual(workOptions)
    expect(request).toHaveBeenCalledTimes(1)

    first.unmount()
    second.unmount()
    store.dispatch(apiSlice.util.resetApiState())
    request.mockRestore()
  })

  it.each(['Remote', 'Hybrid', 'On-site', 'Nationwide (South Africa)', 'Africa-wide', 'International'])(
    'restores the saved label for %s',
    (label) => {
      expect(toPreferredLocationLabel(toPreferredLocationEnum(label), [label])).toBe(label)
    },
  )

  it('resolves API labels without a hardcoded work-option list', () => {
    expect(toPreferredLocationLabel('FLEXIBLE_WORK', ['Flexible work'])).toBe('Flexible work')
    expect(toPreferredLocationLabel('ON_SITE', ['On-site'])).toBe('On-site')
    expect(toPreferredLocationLabel('NATIONWIDE_SOUTH_AFRICA', ['Nationwide (South Africa)'])).toBe('Nationwide (South Africa)')
    expect(toPreferredLocationLabel('UNKNOWN')).toBe('UNKNOWN')
  })
})