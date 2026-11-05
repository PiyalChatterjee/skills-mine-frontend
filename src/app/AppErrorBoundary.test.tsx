import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AppErrorBoundary } from './AppErrorBoundary'

const BrokenPage = () => {
  throw new Error('Lazy page failed to load')
}

describe('AppErrorBoundary', () => {
  it('renders application content when no error occurs', () => {
    render(
      <AppErrorBoundary>
        <p>Application content</p>
      </AppErrorBoundary>,
    )

    expect(screen.getByText('Application content')).toBeInTheDocument()
  })

  it('shows a reload fallback when a child throws', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <AppErrorBoundary>
        <BrokenPage />
      </AppErrorBoundary>,
    )

    expect(screen.getByRole('heading', { name: "This page couldn't load" })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeInTheDocument()
    consoleError.mockRestore()
  })
})