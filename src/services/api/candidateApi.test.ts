import { describe, it, expect, vi, beforeEach } from 'vitest'
import { candidateApi } from './candidateApi'

const mockGet = vi.hoisted(() => vi.fn())
const mockPost = vi.hoisted(() => vi.fn())
const mockPut = vi.hoisted(() => vi.fn())
const mockDelete = vi.hoisted(() => vi.fn())

vi.mock('@/services/api/axios', () => ({
  apiClient: { get: mockGet, post: mockPost, put: mockPut, delete: mockDelete },
  unwrapResponseData: async (promise: Promise<unknown>) =>
    ((await promise) as { data: unknown }).data,
  unwrapEnvelopeData: async (promise: Promise<unknown>) =>
    (((await promise) as { data: { data: unknown } }).data).data,
}))

vi.mock('@/services/api/endpoints', () => ({
  apiEndpoints: {
    users: { profile: '/users/:userId', profilePhoto: '/users/:userId/profile-photo' },
    candidate: {
      dashboard: '/candidate/:userId/dashboard',
      buildMyCv: '/candidate/buildmycv',
      resumePreview: '/candidate/:resumeId/preview',
      resumeDownload: '/candidate/:resumeId/download',
      recommendedJobs: '/candidate/:candidateId/recommended-jobs',
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
      expect(mockGet).toHaveBeenCalledWith('/users/u-1')
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
  })

  describe('getDashboard', () => {
    it('calls the correct endpoint', async () => {
      const dashboardResponse = {
        data: { data: { summary: {}, applications: [], activity: {} } },
      }
      mockGet.mockResolvedValue(dashboardResponse)
      await candidateApi.getDashboard('u-1')
      expect(mockGet).toHaveBeenCalledWith('/candidate/u-1/dashboard')
    })
  })

  describe('getBuildMyCv', () => {
    it('calls GET /candidate/buildmycv and unwraps envelope', async () => {
      const cvData = {
        data: {
          data: {
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
      const result = await candidateApi.getBuildMyCv()
      expect(mockGet).toHaveBeenCalledWith('/candidate/buildmycv')
      expect((result as { personalDetails: { firstName: string } }).personalDetails.firstName).toBe('Jane')
    })
  })

  describe('saveBuildMyCv', () => {
    it('calls POST /candidate/buildmycv', async () => {
      mockPost.mockResolvedValue({ data: { data: { lastModified: '2024-01-01' } } })
      await candidateApi.saveBuildMyCv({
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
      expect(mockPost).toHaveBeenCalledWith('/candidate/buildmycv', expect.any(Object))
    })
  })

  describe('updateBuildMyCv', () => {
    it('calls PUT /candidate/buildmycv', async () => {
      mockPut.mockResolvedValue({ data: { data: { lastModified: '2024-06-01' } } })
      await candidateApi.updateBuildMyCv({
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
      expect(mockPut).toHaveBeenCalledWith('/candidate/buildmycv', expect.any(Object))
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
    it('calls PUT then re-fetches profile', async () => {
      mockPut.mockResolvedValue({ data: { data: { userId: 'u-1', updatedAt: '2024-01-01' } } })
      mockGet.mockResolvedValue(mockProfileResponse)
      const result = await candidateApi.updateById('u-1', { personalDetails: { firstName: 'Updated' } } as never)
      expect(mockPut).toHaveBeenCalledWith('/users/u-1', expect.any(Object))
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
    it('calls POST /candidate/buildmycv', async () => {
      mockPost.mockResolvedValue({ data: { lastModified: '2024-01-01' } })
      await candidateApi.buildMyCv()
      expect(mockPost).toHaveBeenCalledWith('/candidate/buildmycv')
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
      await candidateApi.getRecommendedJobs('c-1')
      expect(mockGet).toHaveBeenCalledWith('/candidate/c-1/recommended-jobs')
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
