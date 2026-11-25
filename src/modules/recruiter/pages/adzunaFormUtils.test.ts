import { describe, expect, it } from 'vitest'
import {
  applyAdzunaPrefill,
  buildAdzunaPublishRequest,
  getAdzunaCategoryWarning,
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
  it('loads published values without appending duplicate requirements or benefits on update', () => {
    const saved = {
      ...response,
      prefill: {
        ...response.prefill,
        title: 'API Integration Specialist',
        description: 'Connect enterprise systems.\n\nRequirements:\n• REST APIs\n• GraphQL\n\nBenefits:\n• Collaborative environment.',
        location: { city: 'Durban', country: 'South Africa' },
        country: 'South Africa',
        company: 'Accenture',
        category: 29,
        salary_min: 270000,
        salary_max: 350000,
        remote: 0,
        date: '2026-10-16',
      },
    }
    const values = applyAdzunaPrefill(toAdzunaFormValues({
      ...jobPost,
      requirements: ['Outdated requirement'],
      benefits: ['Outdated benefit'],
    }), saved, true)

    expect(values).toMatchObject({
      jobTitle: 'API Integration Specialist',
      jobLocation: 'Durban',
      country: 'South Africa',
      publicationDate: '2026-10-16',
      workingModel: 'On-site',
      companyName: 'Accenture',
      category: 'Other/General Jobs',
      minSalary: 'R 270 000',
      maxSalary: 'R 350 000',
      description: 'Connect enterprise systems.',
      requirements: '• REST APIs\n• GraphQL',
      perks: '• Collaborative environment.',
    })
    const request = buildAdzunaPublishRequest(values, saved.prefill, 'profile-1', 'https://example.test', 'job-1')
    expect(request).toMatchObject({
      description: saved.prefill.description,
      remote: 0,
      date: '2026-10-16',
      country: 'ZA',
      location: saved.prefill.location,
      url: saved.prefill.url,
    })
  })

  it('does not reintroduce job-profile sections absent from a saved description', () => {
    const values = applyAdzunaPrefill({
      ...initialAdzunaFormValues,
      requirements: 'Old requirements',
      perks: 'Old benefits',
    }, response, true)
    expect(values.description).toBe('Build APIs.')
    expect(values.requirements).toBe('')
    expect(values.perks).toBe('')
  })

  it('maps remote work and publication date both ways', () => {
    const saved = { ...response, prefill: { ...response.prefill, remote: 1, date: '2026-10-16' } }
    const values = applyAdzunaPrefill(initialAdzunaFormValues, saved, true)
    expect(values.workingModel).toBe('Remote')
    expect(values.publicationDate).toBe('2026-10-16')
    values.publicationDate = '2026-10-17'
    expect(buildAdzunaPublishRequest(values, saved.prefill, 'profile-1', 'https://example.test'))
      .toMatchObject({ remote: 1, date: '2026-10-17' })
    values.workingModel = 'On-site'
    expect(buildAdzunaPublishRequest(values, saved.prefill, 'profile-1', 'https://example.test').remote).toBe(0)
  })

  it.each([
    ['Technology', 'IT Jobs', 2],
    [' banking ', 'Accounting & Finance Jobs', 1],
    ['Healthcare', 'Healthcare & Nursing Jobs', 7],
    ['Education', 'Teaching Jobs', 11],
    ['Retail', 'Retail Jobs', 17],
    ['Manufacturing', 'Manufacturing Jobs', 19],
    ['Logistics & Supply Chain', 'Logistics & Warehouse Jobs', 10],
    ['Consulting', 'Consultancy Jobs', 18],
    ['Legal', 'Legal Jobs', 14],
    ['Unrecognized industry', 'Other/General Jobs', 29],
    ['', 'Other/General Jobs', 29],
  ])('suggests a category for industry "%s" when Adzuna has no category', (industry, label, id) => {
    const base = toAdzunaFormValues({ ...jobPost, industry })
    const values = applyAdzunaPrefill(base, {
      ...response,
      prefill: { ...response.prefill, category: undefined },
    })
    expect(values.category).toBe(label)
    expect(buildAdzunaPublishRequest(values, response.prefill, 'profile-1', 'https://example.test').category).toBe(id)
  })

  it('prefers a supported Adzuna category over the job industry and permits manual changes', () => {
    const base = toAdzunaFormValues({ ...jobPost, industry: 'Retail' })
    const values = applyAdzunaPrefill(base, response)
    expect(values.category).toBe('IT Jobs')
    values.category = 'Engineering Jobs'
    expect(buildAdzunaPublishRequest(values, response.prefill, 'profile-1', 'https://example.test').category).toBe(5)
  })

  it('uses the industry fallback for an unsupported prefill category', () => {
    const base = toAdzunaFormValues({ ...jobPost, industry: 'Unknown' })
    const values = applyAdzunaPrefill(base, {
      ...response,
      prefill: { ...response.prefill, category: 99 },
    })
    expect(values.category).toBe('Other/General Jobs')
    expect(buildAdzunaPublishRequest(values, response.prefill, 'profile-1', 'https://example.test').category).toBe(29)
  })

  it('uses the industry fallback for category zero without a redundant warning', () => {
    const base = toAdzunaFormValues({ ...jobPost, industry: 'Unknown' })
    const values = applyAdzunaPrefill(base, {
      ...response,
      prefill: { ...response.prefill, category: 0 },
    })
    expect(values.category).toBe('Other/General Jobs')
    expect(getAdzunaCategoryWarning(0, values.category)).toBeUndefined()
    expect(buildAdzunaPublishRequest(values, { ...response.prefill, category: 0 }, 'profile-1', 'https://example.test').category).toBe(29)
  })

  it('retains warnings when no fallback exists or another category ID is unsupported', () => {
    expect(getAdzunaCategoryWarning(0, '')).toContain('Select a valid category.')
    expect(getAdzunaCategoryWarning(99, 'Other/General Jobs')).toContain('Unsupported Adzuna category ID: 99.')
  })

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
      category: 'IT Jobs',
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
      category: 'IT Jobs',
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

  it.each([
    [1, 'Accounting & Finance Jobs'],
    [2, 'IT Jobs'],
    [3, 'Sales Jobs'],
    [4, 'Customer Services Jobs'],
    [5, 'Engineering Jobs'],
    [6, 'HR & Recruitment Jobs'],
    [7, 'Healthcare & Nursing Jobs'],
    [8, 'Hospitality & Catering Jobs'],
    [9, 'PR, Advertising & Marketing Jobs'],
    [10, 'Logistics & Warehouse Jobs'],
    [11, 'Teaching Jobs'],
    [12, 'Trade & Construction Jobs'],
    [13, 'Admin Jobs'],
    [14, 'Legal Jobs'],
    [15, 'Creative & Design Jobs'],
    [16, 'Graduate Jobs'],
    [17, 'Retail Jobs'],
    [18, 'Consultancy Jobs'],
    [19, 'Manufacturing Jobs'],
    [20, 'Scientific & QA Jobs'],
    [21, 'Social work Jobs'],
    [22, 'Travel Jobs'],
    [23, 'Energy, Oil & Gas Jobs'],
    [24, 'Property Jobs'],
    [25, 'Charity & Voluntary Jobs'],
    [26, 'Domestic help & Cleaning Jobs'],
    [27, 'Maintenance Jobs'],
    [28, 'Part time Jobs'],
    [29, 'Other/General Jobs'],
  ])('prefills category %i and sends its numeric ID for publish and update', (id, label) => {
    const values = applyAdzunaPrefill(initialAdzunaFormValues, {
      ...response,
      prefill: { ...response.prefill, category: id },
    })
    expect(values.category).toBe(label)
    expect(buildAdzunaPublishRequest(values, response.prefill, 'profile-1', 'https://example.test').category).toBe(id)
    expect(buildAdzunaPublishRequest(values, response.prefill, 'profile-1', 'https://example.test', 'job-1').category).toBe(id)
  })

  it('requires an explicit valid category when prefill is absent or unsupported', () => {
    const missing = applyAdzunaPrefill(initialAdzunaFormValues, {
      ...response,
      prefill: { ...response.prefill, category: undefined },
    })
    const unsupported = applyAdzunaPrefill(initialAdzunaFormValues, {
      ...response,
      prefill: { ...response.prefill, category: 99 },
    })
    expect(missing.category).toBe('')
    expect(unsupported.category).toBe('')
    expect(() => buildAdzunaPublishRequest(unsupported, response.prefill, 'profile-1', 'https://example.test'))
      .toThrow('Select a valid Adzuna category.')
  })
})
