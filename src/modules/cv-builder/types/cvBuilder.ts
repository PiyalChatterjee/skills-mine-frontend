export type CvBuilderView = 'launcher' | 'form' | 'review' | 'preview'

export type StepItem = {
  id: number
  label: string
}

export type PersonalDetailsFormState = {
  fullName: string
  race: string
  gender: string
  disabilityStatus: string
  nationality: string
  residentialLocation: string
  currentCompany: string
  currentPosition: string
  noticePeriod: string
}

export type CvActionCardTone = 'coral' | 'teal'

export type CvActionCard = {
  id: 'upload' | 'build'
  title: string
  description: string
  icon: string
  tone: CvActionCardTone
  onClick: () => void
}

export const CV_BUILDER_STEPS: StepItem[] = [
  { id: 1, label: 'Personal details' },
  { id: 2, label: 'Career history' },
  { id: 3, label: 'Skills' },
  { id: 4, label: 'Education' },
  { id: 5, label: 'Languages' },
]

export const PERSONAL_DETAILS_INITIAL_VALUES: PersonalDetailsFormState = {
  fullName: '',
  race: '',
  gender: '',
  disabilityStatus: '',
  nationality: '',
  residentialLocation: '',
  currentCompany: '',
  currentPosition: '',
  noticePeriod: '',
}

export const RACE_OPTIONS = ['African', 'Coloured', 'Indian', 'White', 'Other']
export const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say']
export const DISABILITY_OPTIONS = ['No', 'Yes', 'Prefer not to say']
export const LOCATION_OPTIONS = ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Remote']
export const NOTICE_PERIOD_OPTIONS = ['Immediately', '2 weeks', '1 month', '2 months', '3 months']

// ─── Career History ───────────────────────────────────────────────────────────

export type CareerHistoryEntry = {
  id: string
  companyName: string
  positionHeld: string
  startDate: string
  endDate: string
  isCurrentRole: boolean
  tasks: string[]
  projects: string[]
}

export const createCareerHistoryEntry = (index: number): CareerHistoryEntry => ({
  id: `${Date.now()}-${index}`,
  companyName: '',
  positionHeld: '',
  startDate: '',
  endDate: '',
  isCurrentRole: false,
  tasks: [''],
  projects: [''],
})

export const CAREER_HISTORY_INITIAL: CareerHistoryEntry[] = [createCareerHistoryEntry(0)]

// ─── Skills ───────────────────────────────────────────────────────────────────

export type SkillEntry = {
  id: string
  name: string
}

export const createSkillEntry = (): SkillEntry => ({
  id: `${Date.now()}-${Math.random()}`,
  name: '',
})

export const SKILLS_INITIAL: SkillEntry[] = [createSkillEntry()]

// ─── Education ────────────────────────────────────────────────────────────────

export type TertiaryEducationEntry = {
  id: string
  institutionName: string
  degreeOrCertification: string
  yearCompleted: string
}

export type SecondaryEducationEntry = {
  id: string
  institutionName: string
  highestGradePassed: string
  yearCompleted: string
}

export const createTertiaryEntry = (): TertiaryEducationEntry => ({
  id: `tertiary-${Date.now()}-${Math.random()}`,
  institutionName: '',
  degreeOrCertification: '',
  yearCompleted: '',
})

export const createSecondaryEntry = (): SecondaryEducationEntry => ({
  id: `secondary-${Date.now()}-${Math.random()}`,
  institutionName: '',
  highestGradePassed: '',
  yearCompleted: '',
})

export const TERTIARY_EDUCATION_INITIAL: TertiaryEducationEntry[] = [createTertiaryEntry()]
export const SECONDARY_EDUCATION_INITIAL: SecondaryEducationEntry[] = [createSecondaryEntry()]

// ─── Languages ────────────────────────────────────────────────────────────────

export const LANGUAGES_LIST = [
  'Afrikaans',
  'Southern Sotho',
  'Swati',
  'English',
  'Northern Sotho',
  'Ndebele',
  'Xhosa',
  'Venda',
  'Tsonga',
  'Zulu',
  'Tswana',
  'South African Sign',
  'Other',
] as const

export type Language = (typeof LANGUAGES_LIST)[number]

export const LANGUAGES_INITIAL: Set<Language> = new Set()
