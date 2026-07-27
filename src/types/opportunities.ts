export interface Opportunity {
  id: string
  title: string
  tags: string[]
  description: string
  employerName: string
  employerOrbColor: string
  employerOrbGlow: string
  blurredEmployer?: boolean
  tallCard?: boolean
}
