import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { OpportunityJobCard } from './OpportunityJobCard'
import { jobMatchConfig } from './jobMatch.config'

const renderCard = (overrides: Partial<React.ComponentProps<typeof OpportunityJobCard>> = {}) =>
  render(
    <OpportunityJobCard
      title="Frontend Engineer"
      description="Build product UI."
      tags={["Technology", "Cape Town"]}
      actionLabel="View job"
      onAction={vi.fn()}
      showSaveButton
      isSaved={false}
      isSaving={false}
      onToggleSave={vi.fn()}
      saveLabel="Save Frontend Engineer"
      matchScore={105}
      {...overrides}
    />,
  )

describe('OpportunityJobCard', () => {
  it.each([
    [jobMatchConfig.high.threshold, jobMatchConfig.high],
    [jobMatchConfig.high.threshold - 1, jobMatchConfig.medium],
    [jobMatchConfig.medium.threshold, jobMatchConfig.medium],
    [jobMatchConfig.medium.threshold - 1, jobMatchConfig.low],
  ])('uses the configured appearance for a score of %s', (matchScore, appearance) => {
    renderCard({ matchScore })

    const badge = screen.getByLabelText(`${matchScore}% match`)
    expect(badge.style.getPropertyValue('--ring-fill')).toBe(appearance.color)
    expect(badge.style.getPropertyValue('--ring-bg')).toBe(appearance.backgroundColor)
  })

  it('uses updated threshold configuration', () => {
    const originalThresholds = {
      high: jobMatchConfig.high.threshold,
      medium: jobMatchConfig.medium.threshold,
    }

    try {
      jobMatchConfig.high.threshold = 90
      jobMatchConfig.medium.threshold = 70
      const { rerender } = renderCard({ matchScore: 80 })

      expect(screen.getByLabelText('80% match').style.getPropertyValue('--ring-fill'))
        .toBe(jobMatchConfig.medium.color)

      rerender(<OpportunityJobCard title="Frontend Engineer" description="Build product UI." tags={[]} actionLabel="View job" onAction={vi.fn()} matchScore={65} />)

      expect(screen.getByLabelText('65% match').style.getPropertyValue('--ring-fill'))
        .toBe(jobMatchConfig.low.color)
    } finally {
      jobMatchConfig.high.threshold = originalThresholds.high
      jobMatchConfig.medium.threshold = originalThresholds.medium
    }
  })

  it('renders job content and clamps an out-of-range match score', () => {
    renderCard()

    expect(screen.getByRole('article')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Frontend Engineer' })).toBeInTheDocument()
    expect(screen.getByText('Technology')).toBeInTheDocument()
    expect(screen.getByLabelText('100% match')).toBeInTheDocument()
  })

  it.each([
    [jobMatchConfig.high.threshold, 'a great'],
    [jobMatchConfig.high.threshold - 1, 'a good'],
    [jobMatchConfig.medium.threshold, 'a good'],
    [jobMatchConfig.medium.threshold - 1, 'an ok'],
  ])('describes a score of %s as a %s match', async (matchScore, description) => {
    const user = userEvent.setup()
    renderCard({ matchScore })
    const badge = screen.getByRole('button', { name: `${matchScore}% match` })
    await user.click(badge)
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent(`Based on your CV, this job is ${description} match for you.`)
    expect(badge).toHaveAttribute('aria-describedby', tooltip.id)
  })

  it('toggles the tooltip and dismisses it on outside click', async () => {
    const user = userEvent.setup()
    renderCard({ matchScore: 33 })
    const badge = screen.getByRole('button', { name: '33% match' })

    await user.click(badge)
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent('Based on your CV, this job is an ok match for you.')
    expect(badge).toHaveAttribute('aria-describedby', tooltip.id)
    expect(badge).toHaveAttribute('aria-expanded', 'true')

    await user.click(badge)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    await user.click(badge)
    await user.click(screen.getByRole('heading', { name: 'Frontend Engineer' }))
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('opens the tooltip with the keyboard and dismisses it with Escape', async () => {
    const user = userEvent.setup()
    renderCard({ matchScore: 80 })
    await user.tab()
    expect(screen.getByRole('button', { name: '80% match' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('tooltip')).toHaveTextContent('great match')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '80% match' })).toHaveFocus()
  })

  it('exposes accessible save and action controls', () => {
    const onAction = vi.fn()
    const onToggleSave = vi.fn()
    renderCard({ onAction, onToggleSave, isSaved: true, saveLabel: 'Unsave Frontend Engineer' })

    fireEvent.click(screen.getByRole('button', { name: 'Unsave Frontend Engineer' }))
    fireEvent.click(screen.getByRole('button', { name: 'View job' }))

    expect(onToggleSave).toHaveBeenCalledTimes(1)
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('disables save while a save mutation is in flight', () => {
    renderCard({ isSaving: true })

    expect(screen.getByRole('button', { name: 'Save Frontend Engineer' })).toBeDisabled()
  })
})
