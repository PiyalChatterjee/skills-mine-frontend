export type AdvertisedPlatform = 'bizCommunity' | 'pNet' | 'Harambee' | 'Adzuna'

export type AdvertisedJobStatus = 'Live' | 'Suspended' | 'SUCCESS' | 'FAILED' | 'PENDING' | string

export type AdvertisedJob = {
  id: string
  title: string
  reference: string
  employmentType: string
  platform: AdvertisedPlatform
  location: string
  salary: string
  posted: string
  status: AdvertisedJobStatus
  jobUrl?: string
  bizJobId?: string
  harambeeOpportunityId?: string
  adzunaJobId?: string
  jobProfileIdRef?: string
  errorDetail?: string
  providerMessage?: string
}

export const ADVERTISED_PLATFORMS: AdvertisedPlatform[] = [
  'bizCommunity',
  'pNet',
  'Harambee',
  'Adzuna',
]

export const PLATFORM_META: Record<AdvertisedPlatform, { initials: string; color: string }> = {
  bizCommunity: { initials: 'bC', color: '#e0561b' },
  pNet: { initials: 'pN', color: '#0e8f7e' },
  Harambee: { initials: 'Hi', color: '#6a1fa6' },
  Adzuna: { initials: 'Az', color: '#1f9d55' },
}

export const ADVERTISED_JOBS: AdvertisedJob[] = [
  {
    id: 'adv-1',
    title: 'Project Manager',
    reference: 'HI-29262',
    employmentType: 'Permanent',
    platform: 'Harambee',
    location: 'Johannesburg, Gauteng',
    salary: 'R60 000 - R75 000 pm',
    posted: '07 Oct 2026',
    status: 'Live',
  },
  {
    id: 'adv-2',
    title: 'Senior Financial Analyst',
    reference: 'PN-48213',
    employmentType: 'Permanent',
    platform: 'pNet',
    location: 'Johannesburg, Gauteng',
    salary: 'R55 000 - R70 000 pm',
    posted: '23 Sept 2026',
    status: 'Live',
  },
  {
    id: 'adv-3',
    title: 'Senior Financial Analyst',
    reference: 'BC-27561',
    employmentType: 'Permanent',
    platform: 'bizCommunity',
    location: 'Johannesburg, Gauteng',
    salary: 'R55 000 - R70 000 pm',
    posted: '24 Sept 2026',
    status: 'Suspended',
  },
  {
    id: 'adv-4',
    title: 'Graduate Software Developer',
    reference: 'HI-60394',
    employmentType: 'Contract',
    platform: 'Harambee',
    location: 'Cape Town, Western Cape',
    salary: 'R18 000 - R24 000 pm',
    posted: '27 Sept 2026',
    status: 'Live',
  },
]
