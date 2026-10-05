import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { OpportunityJobCard } from './OpportunityJobCard'

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
  it('renders job content and clamps an out-of-range match score', () => {
    renderCard()

    expect(screen.getByRole('article')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Frontend Engineer' })).toBeInTheDocument()
    expect(screen.getByText('Technology')).toBeInTheDocument()
    expect(screen.getByLabelText('100% match')).toBeInTheDocument()
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
