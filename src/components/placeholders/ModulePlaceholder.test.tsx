import { render, screen } from '@testing-library/react'
import { ModulePlaceholder } from '@/components/placeholders/ModulePlaceholder'

describe('ModulePlaceholder', () => {
  it('renders title and description', () => {
    render(
      <ModulePlaceholder
        title="CV Builder"
        description="Placeholder for future CV experience"
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'CV Builder' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Placeholder for future CV experience'),
    ).toBeInTheDocument()
  })
})
