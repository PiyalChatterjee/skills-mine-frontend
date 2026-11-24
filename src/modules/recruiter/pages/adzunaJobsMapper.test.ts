import { describe, expect, it } from 'vitest'
import { mapAdzunaRecordToAdvertisedJob } from './adzunaJobsMapper'
import type { AdzunaJobJsonRecord } from '@/services/api/adzunaApi'

describe('mapAdzunaRecordToAdvertisedJob', () => {
  it('maps a published Adzuna JSON record into the advertised-jobs table shape', () => {
    const record: AdzunaJobJsonRecord = {
      publish_id: 'publish-1',
      job_id: 'job-1',
      is_active: true,
      job_data: {
        id: 'JOB-2026-1234',
        title: 'Senior Developer',
        url: 'https://skillsmine.example/jobs/job-1',
        location: { city: 'Johannesburg', state: 'Gauteng', country: 'South Africa' },
        salary_min: 500000,
        salary_max: 700000,
        salary_currency: 'ZAR',
        salary_frequency: 'year',
        contract_type: 'permanent',
        contract_time: 'full_time',
        job_profile_id_ref: 'profile-1',
      },
      created_at: '2026-11-23T10:30:00Z',
      updated_at: '2026-11-23T10:30:00Z',
    }

    expect(mapAdzunaRecordToAdvertisedJob(record)).toMatchObject({
      id: 'publish-1',
      title: 'Senior Developer',
      reference: 'JOB-2026-1234',
      employmentType: 'Permanent · Full Time',
      platform: 'Adzuna',
      location: 'Johannesburg, Gauteng',
      posted: '23 Nov 2026',
      status: 'Live',
      jobUrl: 'https://skillsmine.example/jobs/job-1',
      jobProfileIdRef: 'profile-1',
      adzunaJobId: 'JOB-2026-1234',
      salary: expect.stringMatching(/^R.*500.*-.*R.*700.*pa$/),
    })
  })

  it('marks inactive Adzuna records as deleted', () => {
    const record: AdzunaJobJsonRecord = {
      publish_id: 'publish-2',
      job_id: 'job-2',
      is_active: false,
      job_data: {},
      created_at: 'not-a-date',
      updated_at: 'not-a-date',
    }

    expect(mapAdzunaRecordToAdvertisedJob(record)).toMatchObject({
      title: 'Untitled Job',
      reference: 'job-2',
      location: '—',
      salary: 'Market Related',
      posted: '—',
      status: 'Deleted',
      jobProfileIdRef: 'job-2',
    })
  })
})
