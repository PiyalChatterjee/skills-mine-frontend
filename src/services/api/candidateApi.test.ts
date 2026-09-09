import { describe, it, expect, vi, beforeEach } from 'vitest'
import { candidateApi } from './candidateApi'
import { isCandidateProfileCompleteForOnboarding } from '@/modules/candidate/utils/profileCompleteness'

const mockGet = vi.hoisted(() => vi.fn())
const mockPost = vi.hoisted(() => vi.fn())
const mockPut = vi.hoisted(() => vi.fn())
const mockDelete = vi.hoisted(() => vi.fn())

vi.mock('@/services/api/axios', () => ({
  apiClient: { get: mockGet, post: mockPost, put: mockPut, delete: mockDelete },
  candidateApiClient: { get: mockGet, post: mockPost, put: mockPut, delete: mockDelete },
  documentApiClient: { get: mockGet, post: mockPost, put: mockPut, delete: mockDelete },
  unwrapResponseData: async (promise: Promise<unknown>) =>
    ((await promise) as { data: unknown }).data,
  unwrapEnvelopeData: async (promise: Promise<unknown>) =>
    (((await promise) as { data: { data: unknown } }).data).data,
}))

vi.mock('@/services/api/endpoints', () => ({
  apiEndpoints: {
    users: { profile: '/users/:userId', profilePhoto: '/users/:userId/profile-photo' },
    candidate: {
      profile: '/candidates/profile/',
      landing: '/candidates/landing',
      dashboard: '/candidates/dashboard',
      buildMyCv: '/candidates/cv-build/',
      resumePreview: '/candidate/:resumeId/preview',
      resumeDownload: '/candidate/:resumeId/download',
      recommendedJobs: '/candidates/recommended-positions',
      savedJobs: '/candidates/saved-jobs',
      applications: '/candidates/applications',
      aiActions: '/candidates/ai-actions/',
    },
    applications: {
      cvUpload: '/applications/:applicationId/cv/upload',
      stageTransition: '/applications/:applicationId/stage-transition',
    },
    skills: { search: '/skills/search', keywordParam: 'keyword' },
  },
  resolveEndpoint: (template: string, params: Record<string, string>) =>
    Object.entries(params).reduce(
      (acc, [key, val]) => acc.replace(`:${key}`, val),
      template,
    ),
}))

const mockProfileResponse = {
  data: {
    status: 'success',
    data: {
      personalDetails: {
        userId: 'u-1',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        mobileNumber: '+27821234567',
        location: 'Cape Town',
        nationality: 'South African',
        idNumber: '9001010000000',
        eeStatus: 'African',
        profileImageUrl: '',
        thumbnailUrl: '',
        linkedinUrl: '',
        portfolioUrl: '',
      },
      desiredJob: {
        jobTitle: 'Engineer',
        industry: 'Tech',
        workType: 'Remote',
        employmentType: 'Permanent',
        salaryExpectation: 50000,
        availableFrom: '1 Month',
      },
      authentication: {
        password: 'Password123',
        provider: 'LOCAL',
        accountStatus: 'ACTIVE',
      },
      education: [],
      experience: [],
      skills: ['React'],
      languages: [{ language: 'English', proficiency: 'Fluent' }],
    },
  },
}

describe('candidateApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getById', () => {
    it('fetches and maps candidate profile', async () => {
      mockGet.mockResolvedValue(mockProfileResponse)
      const profile = await candidateApi.getById('u-1')
      expect(profile.userId).toBe('u-1')
      expect(profile.personalDetails.firstName).toBe('Jane')
      expect(profile.skills).toEqual(['React'])
      expect(profile.languages).toEqual([{ language: 'English', proficiency: 'Fluent' }])
      expect(profile.authentication?.provider).toBe('LOCAL')
      expect(mockGet).toHaveBeenCalledWith('/candidates/profile/')
    })

    it('maps desiredJob when API returns jobType/industries/locations fields', async () => {
      const nextResponse = {
        data: {
          status: 'success',
          data: {
            ...mockProfileResponse.data.data,
            desiredJob: {
              jobTitle: 'Senior Software Engineer',
              jobType: 'Permanent',
              workType: 'Hybrid',
              salaryExpectation: 85000,
              currency: 'ZAR',
              availableFrom: '2025-02-01',
              industries: ['Technology', 'Financial Services'],
              locations: ['Johannesburg', 'Remote'],
            },
          },
        },
      }

      mockGet.mockResolvedValue(nextResponse)
      const profile = await candidateApi.getById('u-1')

      expect(profile.desiredJob.employmentType).toBe('Permanent')
      expect(profile.desiredJob.industry).toBe('Technology, Financial Services')
      expect(profile.desiredJob.workType).toBe('Hybrid')
      expect(profile.desiredJob.currency).toBe('ZAR')
    })

    it('maps Michael Smith profile as complete for onboarding', async () => {
      mockGet.mockResolvedValue({
        data: {
          success: true,
          data: {
            candidateId: 'CAND100001',
            userId: 'USR100001',
            personalDetails: {
              firstName: 'Michael',
              lastName: 'Smith',
              email: 'michael.smith@email.com',
              mobileNumber: '+27821234567',
              location: 'Johannesburg',
            },
            desiredJob: {
              jobTitle: 'Senior Software Engineer',
              jobType: 'Permanent',
              workType: 'Hybrid',
              availableFrom: '2025-02-01',
              industries: ['Technology', 'Banking'],
              locations: ['Johannesburg', 'Remote'],
            },
            education: {
              secondaryEducation: [],
              tertiaryEducation: [],
            },
            experience: [],
            skills: [],
            languages: [],
          },
        },
      })

      const profile = await candidateApi.getById('USR100001')

      expect(isCandidateProfileCompleteForOnboarding(profile)).toBe(true)
    })

    it('defaults skills and languages to empty arrays when absent', async () => {
      const noSkillsResponse = {
        data: {
          status: 'success',
          data: {
            ...mockProfileResponse.data.data,
            skills: undefined,
            languages: undefined,
          },
        },
      }
      mockGet.mockResolvedValue(noSkillsResponse)
      const profile = await candidateApi.getById('u-1')
      expect(profile.skills).toEqual([])
      expect(profile.languages).toEqual([])
    })

    it('maps canonical saved job profile references to string IDs', async () => {
      mockGet.mockResolvedValue({
        data: {
          status: 'success',
          data: {
            ...mockProfileResponse.data.data,
            savedJobs: [
              { jobProfileId: '00000003-0000-4000-8000-000000000002', savedAt: '2026-09-01T08:00:00Z' },
            ],
          },
        },
      })

      const profile = await candidateApi.getById('u-1')

      expect(profile.savedJobs).toEqual([
        '00000003-0000-4000-8000-000000000002',
      ])
    })
  })

  describe('getDashboard', () => {
    it('calls the correct endpoint', async () => {
      const dashboardResponse = {
        data: { data: { summary: {}, applications: [], activity: {} } },
      }
      mockGet.mockResolvedValue(dashboardResponse)
      await candidateApi.getDashboard()
      expect(mockGet).toHaveBeenCalledWith('/candidates/dashboard', { params: {} })
    })

    it('maps candidate-service v2 dashboard fields', async () => {
      mockGet.mockResolvedValue({
        data: {
          candidate_id: 'CAND100001',
          applications: [{
            application_id: 'APP-1',
            job_profile_id_ref: 'JOB-1',
            job_title: 'Engineer',
            current_stage_code: 'SCREENING',
            stage_progress: [{ stage_code: 'APPLIED' }, { stage_code: 'SCREENING' }],
          }],
          pagination: { current_page: 1, page_size: 10, total_items: 1, total_pages: 1 },
        },
      })

      const result = await candidateApi.getDashboard()

      expect(result.id).toBe('CAND100001')
      expect(result.candidateId).toBe('CAND100001')
      expect(result.applications[0]).toMatchObject({
        id: 'APP-1',
        stage: 'SCREENING',
        job: { id: 'JOB-1', title: 'Engineer' },
        pipeline: ['APPLIED', 'SCREENING'],
      })
    })
  })

  describe('applyToJob', () => {
    it('submits a canonical jobProfileId to the candidate application endpoint', async () => {
      mockPost.mockResolvedValue({
        data: {
          application_id: '70000000-0000-4000-8000-000000000001',
          candidate_id: 'CAND100001',
          job_profile_id: '00000003-0000-4000-8000-000000000008',
          application_party_id: '80000000-0000-4000-8000-000000000001',
          current_stage_code: 'INBOUND',
          match_score_latest: 82,
          created_at: '2026-08-31T10:30:00Z',
          message: 'Application submitted successfully',
        },
      })

      const result = await candidateApi.applyToJob(
        '00000003-0000-4000-8000-000000000008',
      )

      expect(mockPost).toHaveBeenCalledWith('/candidates/applications', {
        job_profile_id: '00000003-0000-4000-8000-000000000008',
      })
      expect(result.currentStageCode).toBe('INBOUND')
    })
  })

  describe('candidate job collections', () => {
    it('maps canonical saved jobs and preserves its candidate-scoped request', async () => {
      mockGet.mockResolvedValue({
        data: {
          candidate_id: 'CAND100001',
          saved_jobs: [{ job_profile_id: 'JOB-1', job_title: 'Engineer' }],
          pagination: { total_items: 1 },
        },
      })

      const result = await candidateApi.getSavedJobs('CAND100001')

      expect(mockGet).toHaveBeenCalledWith('/candidates/saved-jobs')
      expect(result).toMatchObject({
        candidateId: 'CAND100001',
        jobs: [{ jobId: 'JOB-1', title: 'Engineer' }],
        total: 1,
      })
    })

    it('maps canonical recommended positions and preserves its candidate-scoped request', async () => {
      mockGet.mockResolvedValue({
        data: {
          candidate_id: 'CAND100001',
          recommended_positions: [{ job_profile_id: 'JOB-2', job_title: 'Designer' }],
          pagination: { total_items: 1 },
        },
      })

      const result = await candidateApi.getRecommendedPositions('CAND100001')

      expect(mockGet).toHaveBeenCalledWith('/candidates/recommended-positions')
      expect(result).toMatchObject({
        candidateId: 'CAND100001',
        jobs: [{ jobId: 'JOB-2', title: 'Designer' }],
        total: 1,
      })
    })
  })

  describe('getBuildMyCv', () => {
    it('calls GET /candidates/cv-build/ and unwraps envelope', async () => {
      const cvData = {
        data: {
          success: true,
          statusCode: 200,
          message: 'CV builder data retrieved.',
          data: {
            userId: 'u-1',
            source: 'BuildCV',
            extractionStatus: 'NOT_STARTED',
            lastModified: '2024-11-01T14:30:00Z',
            personalDetails: { firstName: 'Jane' },
            careerHistory: [],
            skills: [],
            education: { secondaryEducation: [], tertiaryEducation: [] },
            languages: [],
            validation: [],
          },
        },
      }
      mockGet.mockResolvedValue(cvData)
      const result = await candidateApi.getBuildMyCv('candidate-1')
      expect(mockGet).toHaveBeenCalledWith('/candidates/cv-build/')
      expect((result as { personalDetails: { firstName: string } }).personalDetails.firstName).toBe('Jane')
      expect((result as { lastModified?: string }).lastModified).toBe('2024-11-01T14:30:00Z')
    })

    it('maps candidate-service v2 array education', async () => {
      mockGet.mockResolvedValue({
        data: {
          candidate_id: 'CAND100001',
          personal_details: { first_name: 'Jane', last_name: 'Doe' },
          career_history: [],
          skills: [],
          education: [
            { institution_name: 'High School', level_code: 'SECONDARY' },
            { institution_name: 'University', level_code: 'TERTIARY' },
          ],
          languages: [],
        },
      })

      const result = await candidateApi.getBuildMyCv('CAND100001')

      expect(result.education.secondaryEducation).toHaveLength(1)
      expect(result.education.tertiaryEducation).toHaveLength(1)
    })

    it('normalizes object-shaped skills to names', async () => {
      mockGet.mockResolvedValue({
        data: {
          personal_details: {},
          career_history: [],
          skills: [
            { skill_name: 'React' },
            { skillName: 'TypeScript' },
            { name: 'CSS' },
          ],
          education: [],
          languages: [],
        },
      })

      const result = await candidateApi.getBuildMyCv('CAND100001')

      expect(result.skills).toEqual(['React', 'TypeScript', 'CSS'])
    })
  })

  describe('saveBuildMyCv', () => {
    it('calls POST /candidates/cv-build/', async () => {
      mockPost.mockResolvedValue({ data: { success: true, data: { lastModified: '2024-01-01' } } })
      const result = await candidateApi.saveBuildMyCv('candidate-1', {
        personalDetails: {
          firstName: 'Jane',
          lastName: 'Doe',
          race: '',
          gender: '',
          disabilityStatus: '',
          nationality: 'SA',
          location: 'CT',
          currentCompany: '',
          currentPosition: '',
          noticePeriod: '',
        },
        careerHistory: [],
        skills: [],
        education: { tertiaryEducation: [], secondaryEducation: [] },
        languages: [],
      })
      expect(mockPost).toHaveBeenCalledWith('/candidates/cv-build/', expect.any(Object))
      expect(result.lastModified).toBe('2024-01-01')
    })
  })

  describe('updateBuildMyCv', () => {
    it('calls PUT /candidates/cv-build/', async () => {
      mockPut.mockResolvedValue({ data: { success: true, data: { lastModified: '2024-06-01' } } })
      const result = await candidateApi.updateBuildMyCv('candidate-1', {
        personalDetails: {
          firstName: 'Jane',
          lastName: 'Doe',
          race: '',
          gender: '',
          disabilityStatus: '',
          nationality: 'SA',
          location: 'CT',
          currentCompany: '',
          currentPosition: '',
          noticePeriod: '',
        },
        careerHistory: [],
        skills: [],
        education: { tertiaryEducation: [], secondaryEducation: [] },
        languages: [],
      })
      expect(mockPut).toHaveBeenCalledWith('/candidates/cv-build/', expect.any(Object))
      expect(result.lastModified).toBe('2024-06-01')
    })
  })

  describe('searchSkills', () => {
    it('normalizes array response', async () => {
      mockGet.mockResolvedValue({
        data: [
          { skillId: 's1', skillName: 'React', selected: false },
          { skillId: 's2', skillName: 'TypeScript', selected: true },
        ],
      })
      const result = await candidateApi.searchSkills('react')
      expect(result).toHaveLength(2)
      expect(result[0].skillId).toBe('s1')
      expect(mockGet).toHaveBeenCalledWith(
        '/skills/search',
        expect.objectContaining({ params: { keyword: 'react' } }),
      )
    })

    it('normalizes envelope { data: [...] } response', async () => {
      mockGet.mockResolvedValue({
        data: {
          data: [{ skillId: 's3', skillName: 'Vue', selected: false }],
        },
      })
      const result = await candidateApi.searchSkills('vue')
      expect(result).toHaveLength(1)
      expect(result[0].skillName).toBe('Vue')
    })

    it('returns empty array for unexpected shape', async () => {
      mockGet.mockResolvedValue({ data: { message: 'not found' } })
      const result = await candidateApi.searchSkills('xyz')
      expect(result).toEqual([])
    })

    it('passes userId when provided', async () => {
      mockGet.mockResolvedValue({ data: [] })
      await candidateApi.searchSkills('react', 'u-1')
      expect(mockGet).toHaveBeenCalledWith(
        '/skills/search',
        expect.objectContaining({ params: { keyword: 'react', userId: 'u-1' } }),
      )
    })
  })

  describe('getUserProfile', () => {
    it('calls GET /users/:userId and unwraps envelope data', async () => {
      const userProfileData = {
        data: {
          data: {
            userId: 'u-1',
            savedJobs: [],
            recommendedJobs: ['job-2', 'job-4'],
          },
        },
      }
      mockGet.mockResolvedValue(userProfileData)
      const result = await candidateApi.getUserProfile('u-1')
      expect(result).toEqual({
        userId: 'u-1',
        savedJobs: [],
        recommendedJobs: ['job-2', 'job-4'],
      })
    })
  })

  describe('uploadProfilePhoto', () => {
    it('posts form data with file', async () => {
      mockPost.mockResolvedValue({
        data: { data: { profileImageUrl: 'url', thumbnailUrl: 'thumb' } },
      })
      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
      await candidateApi.uploadProfilePhoto('u-1', file)
      expect(mockPost).toHaveBeenCalledWith(
        '/users/u-1/profile-photo',
        expect.any(FormData),
      )
    })
  })

  describe('updateById', () => {
    it('creates the profile then re-fetches it', async () => {
      mockPut.mockResolvedValue({ data: {} })
      mockGet.mockResolvedValue(mockProfileResponse)
      const result = await candidateApi.updateById('u-1', { personalDetails: { firstName: 'Updated' } } as never)
      expect(mockPut).toHaveBeenCalledWith('/candidates/profile/', expect.any(Object))
      expect(mockGet).toHaveBeenCalledWith('/candidates/profile/')
      expect(mockPost).not.toHaveBeenCalled()
      expect(result.personalDetails.firstName).toBe('Jane')
    })
  })

  describe('previewResume', () => {
    it('calls GET preview endpoint', async () => {
      mockGet.mockResolvedValue({ data: { previewUrl: 'http://example.com/preview' } })
      await candidateApi.previewResume('r-1')
      expect(mockGet).toHaveBeenCalledWith('/candidate/r-1/preview')
    })
  })

  describe('downloadResume', () => {
    it('calls GET download endpoint', async () => {
      mockGet.mockResolvedValue({ data: { downloadUrl: 'http://example.com/download' } })
      await candidateApi.downloadResume('r-1')
      expect(mockGet).toHaveBeenCalledWith('/candidate/r-1/download')
    })
  })

  describe('buildMyCv (legacy POST)', () => {
    it('calls POST /candidates/cv-build/', async () => {
      mockPost.mockResolvedValue({ data: { lastModified: '2024-01-01' } })
      await candidateApi.buildMyCv()
      expect(mockPost).toHaveBeenCalledWith('/candidates/cv-build/')
    })
  })

  describe('deleteProfilePhoto', () => {
    it('calls DELETE on the profile photo endpoint', async () => {
      mockDelete.mockResolvedValue({ data: { data: null } })
      await candidateApi.deleteProfilePhoto('u-1')
      expect(mockDelete).toHaveBeenCalledWith('/users/u-1/profile-photo')
    })
  })

  describe('getRecommendedJobs', () => {
    it('calls GET recommended-jobs endpoint', async () => {
      const data = { jobs: [] }
      mockGet.mockResolvedValue({ data: { data } })
      await candidateApi.getRecommendedJobs()
      expect(mockGet).toHaveBeenCalledWith('/candidates/recommended-positions')
    })
  })

  describe('uploadApplicationCv', () => {
    it('calls POST cv upload endpoint with form data', async () => {
      mockPost.mockResolvedValue({ data: { data: { cvId: 'cv-1' } } })
      const file = new File(['cv'], 'resume.pdf', { type: 'application/pdf' })
      await candidateApi.uploadApplicationCv('app-1', file)
      expect(mockPost).toHaveBeenCalledWith(
        '/applications/app-1/cv/upload',
        expect.any(FormData),
      )
    })
  })

  describe('getApplicationById', () => {
    it('returns application when response is a valid CandidateApplication', async () => {
      const app = {
        applicationId: 'a-1',
        candidateId: 'c-1',
        jobId: 'j-1',
        jobTitle: 'Engineer',
        company: 'Acme',
        currentStage: 'applied',
        appliedDate: '2024-01-01',
        matchScore: 85,
        isGuest: false,
      }
      mockGet.mockResolvedValue({ data: app })
      const result = await candidateApi.getApplicationById('a-1')
      expect(result.applicationId).toBe('a-1')
    })

    it('unwraps envelope when response is wrapped in data', async () => {
      const app = {
        applicationId: 'a-2',
        candidateId: 'c-2',
        jobId: 'j-2',
        jobTitle: 'Designer',
        company: 'Beta',
        currentStage: 'interviewed',
        appliedDate: '2024-02-01',
        matchScore: 72,
        isGuest: false,
      }
      mockGet.mockResolvedValue({ data: { data: app } })
      const result = await candidateApi.getApplicationById('a-2')
      expect(result.applicationId).toBe('a-2')
    })

    it('throws for unexpected response shape', async () => {
      mockGet.mockResolvedValue({ data: { message: 'unexpected' } })
      await expect(candidateApi.getApplicationById('a-3')).rejects.toThrow(
        'Unexpected application response shape',
      )
    })
  })

  describe('searchSkills - additional normalization paths', () => {
    it('normalizes { skills: [...] } envelope', async () => {
      mockGet.mockResolvedValue({
        data: { skills: [{ skillId: 's10', skillName: 'CSS', selected: true }] },
      })
      const result = await candidateApi.searchSkills('css')
      expect(result[0].skillId).toBe('s10')
    })

    it('normalizes { results: [...] } envelope', async () => {
      mockGet.mockResolvedValue({
        data: { results: [{ skillId: 's11', skillName: 'HTML', selected: false }] },
      })
      const result = await candidateApi.searchSkills('html')
      expect(result[0].skillName).toBe('HTML')
    })

    it('normalizes { items: [...] } envelope', async () => {
      mockGet.mockResolvedValue({
        data: { items: [{ skillId: 's12', skillName: 'SCSS', selected: false }] },
      })
      const result = await candidateApi.searchSkills('scss')
      expect(result[0].skillId).toBe('s12')
    })

    it('filters out invalid skill objects', async () => {
      mockGet.mockResolvedValue({
        data: [
          { skillId: 's13', skillName: 'Valid', selected: false },
          { skillId: 123, skillName: 'Bad' }, // invalid - skillId not string
          { skillName: 'No id' }, // invalid - no skillId
        ],
      })
      const result = await candidateApi.searchSkills('valid')
      expect(result).toHaveLength(1)
      expect(result[0].skillId).toBe('s13')
    })
  })
})
