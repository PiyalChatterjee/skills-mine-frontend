import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AuthHero from './AuthHero'

vi.mock('@/assets/login-face-img.jpg', () => ({ default: 'login-face.jpg' }))
vi.mock('@/assets/login-vector.svg', () => ({ default: 'login-vector.svg' }))

describe('AuthHero', () => {
  it('renders the headline text', () => {
    render(<AuthHero headline="Where talent meets opportunity." />)
    expect(screen.getByText('Where talent meets opportunity.')).toBeInTheDocument()
  })

  it('applies headlineClassName when provided', () => {
    render(
      <AuthHero
        headline="Test headline"
        headlineClassName="custom-class"
      />,
    )
    const headline = screen.getByText('Test headline')
    expect(headline.className).toContain('custom-class')
  })

  it('renders without headlineClassName without error', () => {
    render(<AuthHero headline="Simple headline" />)
    expect(screen.getByText('Simple headline')).toBeInTheDocument()
  })

  it('renders two decorative images', () => {
    render(<AuthHero headline="Test" />)
    const images = document.querySelectorAll('img')
    expect(images.length).toBeGreaterThanOrEqual(2)
  })
})
