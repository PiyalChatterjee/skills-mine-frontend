import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import LandingPage from './LandingPage'

const mocks = vi.hoisted(() => ({ navigate: vi.fn(), dispatch: vi.fn(), openSignUpDrawer: vi.fn() }))

vi.mock('react-redux', () => ({ useDispatch: () => mocks.dispatch }))
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/', state: { visitorId: 'visitor-1', matchScore: 80, email: 'jane@example.com' } }),
  useNavigate: () => mocks.navigate,
  useOutletContext: () => ({ openSignUpDrawer: mocks.openSignUpDrawer }),
}))
vi.mock('@/hooks/usePageTitle', () => ({ usePageTitle: vi.fn() }))
vi.mock('@/modules/public/hooks/useJobsSearch', () => ({
  useJobsSearch: () => ({ allJobs: [], visibleJobs: [], isJobsLoading: false }),
}))
vi.mock('@/hooks/useSearchQueryState', () => ({
  useSearchQueryState: () => ({ inputValue: '', handleInputChange: vi.fn(), clear: vi.fn() }),
}))

describe('LandingPage visitor retention confirmation', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('shows the Figma confirmation for ten seconds then restores the standard landing hero', () => {
    vi.useFakeTimers()
    render(<LandingPage />)
    expect(screen.getByText('Application submitted.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'No thanks' }))
    expect(screen.getByRole('heading', { name: 'Thanks For Applying' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Redirecting you back home...')
    expect(screen.getByText('We hope to see you again soon, and good luck!')).toBeInTheDocument()
    expect(screen.queryByText('Application submitted.')).not.toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(9999) })
    expect(screen.getByRole('heading', { name: 'Thanks For Applying' })).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(1) })
    expect(screen.queryByRole('heading', { name: 'Thanks For Applying' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'No thanks' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign up and Browse Jobs' })).toBeInTheDocument()
  })

  it('keeps Yes please opening signup without showing the decline confirmation', () => {
    render(<LandingPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Yes please' }))
    expect(mocks.openSignUpDrawer).toHaveBeenCalledWith('jane@example.com')
    expect(screen.queryByText('Thanks For Applying')).not.toBeInTheDocument()
  })

  it('cleans up the confirmation timer when the page unmounts', () => {
    vi.useFakeTimers()
    const { unmount } = render(<LandingPage />)
    fireEvent.click(screen.getByRole('button', { name: 'No thanks' }))
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})