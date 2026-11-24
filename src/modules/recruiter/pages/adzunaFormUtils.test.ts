import { describe, expect, it } from 'vitest'
import {
  applyAdzunaPrefill,
  buildAdzunaPublishRequest,
  initialAdzunaFormValues,
  toAdzunaFormValues,
} from './adzunaFormUtils'
import type { AdzunaPrefillResponse } from '@/services/api/adzunaApi'
import type { JobPost } from '@/types/api'

const jobPost: JobPost = {
  mandateId: 'profile-1',
  jobId: 'job-1',
  title: 'Backend Developer',
  client: 'SkillsMine',
  clientId: 'client-1',
  recruiterId: 'recruiter-1',
  recruiterName: '',
  industry: '',
  industries: [],
  status: 'OPEN',
  priority: 'HIGH',
  openDate: '',
  targetCloseDate: '',
  salaryBand: '',
  salaryMin: 500000,
  salaryMax: 700000,
  location: 'Johannesburg',
  workType: 'Hybrid',
  employmentType: 'Full Time',
  experienceLevel: 'Senior',
  eeTarget: false,
  eeRequirement: '',
  jobDescription: 'Build APIs.',
  requirements: [],
  responsibilities: [],
  benefits: [],
  skills: [],
  jobBoards: [],
  applicantCount: 0,
  shortlistedCount: 0,
  interviewCount: 0,
  pipeline: {},
}

const response: AdzunaPrefillResponse = {
  job_profile_id: 'profile-1',
  missing_fields: [],
  warnings: [],
  prefill: {
    id: 'job-1',
    title: 'Backend Developer',
    description: 'Build APIs.',
    url: 'https://skillsmine.example/jobs/profile-1',
    location: { city: 'Johannesburg', state: 'Gauteng', country: 'South Africa' },
    country: 'ZA',
    company: 'SkillsMine',
    category: 2,
    salary_min: 500000,
    salary_max: 700000,
    salary_currency: 'ZAR',
    salary_frequency: 'year',
    contract_type: 'permanent',
    contract_time: 'full_time',
  },
}

describe('Adzuna form API mapping', () => {
  it.each(['Remote', 'Hybrid', 'On-site', 'Nationwide', 'Africa Wide', 'International', ''])(
    'prefills Working Model from job work type "%s" without mixing employment type',
    (workType) => {
      const base = toAdzunaFormValues({ ...jobPost, workType })
      expect(base.workingModel).toBe(workType)
      expect(base.employmentType).toBe('Full Time')

      const values = applyAdzunaPrefill(base, response)
      expect(values.workingModel).toBe(workType)
      expect(values.employmentType).toBe('Full Time')
    },
  )

  it('applies nested Adzuna prefill values to the existing form fields', () => {
    const values = applyAdzunaPrefill(initialAdzunaFormValues, response)

    expect(values).toMatchObject({
      jobTitle: 'Backend Developer',
      jobLocation: 'Johannesburg, Gauteng',
      category: 'IT & Software',
      contractTypes: ['Permanent'],
      employmentType: 'Full Time',
      minSalary: 'R 500 000',
      maxSalary: 'R 700 000',
      currency: 'ZAR (R)',
      frequency: 'Per Year',
      applicationUrl: 'https://skillsmine.example/jobs/profile-1',
      companyName: 'SkillsMine',
    })
  })

  it('builds the publish payload in the Adzuna API shape', () => {
    const values = applyAdzunaPrefill(initialAdzunaFormValues, response)
    values.requirements = 'Experience with Node.js'
    values.perks = 'Medical aid'
    values.applicationUrl = 'https://apply.example/jobs/1'

    expect(buildAdzunaPublishRequest(
      values,
      response.prefill,
      response.job_profile_id,
      'https://skillsmine.example/jobs/profile-1',
    )).toMatchObject({
      id: 'job-1',
      title: 'Backend Developer',
      description: 'Build APIs.\n\nRequirements:\nExperience with Node.js\n\nBenefits:\nMedical aid',
      url: 'https://apply.example/jobs/1',
      location: { city: 'Johannesburg', state: 'Gauteng', country: 'South Africa' },
      country: 'ZA',
      company: 'SkillsMine',
      category: 2,
      contract_type: 'permanent',
      contract_time: 'full_time',
      salary_min: 500000,
      salary_max: 700000,
      salary_currency: 'ZAR',
      salary_frequency: 'year',
      job_profile_id_ref: 'profile-1',
    })
  })

  it('omits salary values when salary display is hidden', () => {
    const values = {
      ...initialAdzunaFormValues,
      jobTitle: 'Backend Developer',
      jobLocation: 'Johannesburg',
      description: 'Build APIs.',
      salaryDisplay: 'hide' as const,
      minSalary: 'R 500 000',
      maxSalary: 'R 700 000',
    }

    const request = buildAdzunaPublishRequest(
      values,
      response.prefill,
      response.job_profile_id,
      'https://skillsmine.example/jobs/profile-1',
    )

    expect(request.salary_min).toBeUndefined()
    expect(request.salary_max).toBeUndefined()
    expect(request.salary_currency).toBeUndefined()
    expect(request.salary_frequency).toBeUndefined()
  })

  it('keeps the existing Adzuna ID in the update request body', () => {
    const values = applyAdzunaPrefill(initialAdzunaFormValues, response)
    const request = buildAdzunaPublishRequest(
      values,
      response.prefill,
      response.job_profile_id,
      'https://skillsmine.example/jobs/profile-1',
      'JOB-2026-1234',
    )

    expect(request.id).toBe('JOB-2026-1234')
    expect(request.job_profile_id_ref).toBe('profile-1')
  })

  it('retains the job details company when Adzuna prefill has no company', () => {
    const values = applyAdzunaPrefill(
      { ...initialAdzunaFormValues, companyName: 'Job Details Company' },
      { ...response, prefill: { ...response.prefill, company: undefined } },
    )

    expect(values.companyName).toBe('Job Details Company')
    expect(buildAdzunaPublishRequest(
      values,
      { ...response.prefill, company: undefined },
      response.job_profile_id,
      'https://skillsmine.example/jobs/profile-1',
    ).company).toBe('Job Details Company')
  })

  it('uses the edited company instead of the API prefill company', () => {
    const values = applyAdzunaPrefill(initialAdzunaFormValues, response)
    values.companyName = '  Updated Company  '

    expect(buildAdzunaPublishRequest(
      values,
      response.prefill,
      response.job_profile_id,
      'https://skillsmine.example/jobs/profile-1',
      'job-1',
    ).company).toBe('Updated Company')
  })
})
