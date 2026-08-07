import { describe, it, expect } from 'vitest'
import candidateReducer, {
  setUserId,
  setSavedJobs,
  addSavedJob,
  removeSavedJob,
  setAvailableSkills,
  toggleSkill,
  setBuildMyCv,
  setBuildMyCvExists,
  setBuildMyCvLastModified,
  updateBuildMyCvPersonalDetails,
  updateBuildMyCvCareerHistory,
  updateBuildMyCvSkills,
  updateBuildMyCvEducation,
  updateBuildMyCvLanguages,
  clearCandidateState,
} from './candidateSlice'
import type { SavedJob, UserSkill, BuildMyCvState, CandidateExperience, CandidateLanguage } from '@/types/api'

const buildInitialState = () => candidateReducer(undefined, { type: '@@INIT' })

const mockSkill = (id: string, selected = false): UserSkill => ({
  skillId: id,
  skillName: `Skill ${id}`,
  selected,
})

const mockJob = (id: string): SavedJob => ({
  jobId: id,
  title: `Job ${id}`,
  company: 'Acme',
  salaryRange: 'R500k - R700k',
  workType: 'Hybrid',
  employmentType: 'Permanent',
  savedAt: '2024-01-01',
})

const emptyBuildMyCv: BuildMyCvState = {
  personalDetails: {},
  careerHistory: [],
  skills: [],
  education: { secondaryEducation: [], tertiaryEducation: [] },
  languages: [],
  validation: [],
}

describe('candidateSlice', () => {
  it('returns the initial state', () => {
    const state = buildInitialState()
    expect(state.userId).toBeNull()
    expect(state.savedJobs).toEqual([])
    expect(state.availableSkills).toEqual([])
    expect(state.selectedSkillIds).toEqual([])
    expect(state.buildMyCvExists).toBe(false)
    expect(state.buildMyCvLastModified).toBeNull()
    expect(state.buildMyCvLoaded).toBe(false)
  })

  describe('setUserId', () => {
    it('sets the userId', () => {
      const state = candidateReducer(buildInitialState(), setUserId('u-42'))
      expect(state.userId).toBe('u-42')
    })
  })

  describe('setSavedJobs', () => {
    it('replaces saved jobs list', () => {
      const jobs = [mockJob('j1'), mockJob('j2')]
      const state = candidateReducer(buildInitialState(), setSavedJobs(jobs))
      expect(state.savedJobs).toEqual(jobs)
    })
  })

  describe('addSavedJob', () => {
    it('adds a job to the list', () => {
      const state = candidateReducer(buildInitialState(), addSavedJob(mockJob('j1')))
      expect(state.savedJobs).toHaveLength(1)
      expect(state.savedJobs[0].jobId).toBe('j1')
    })

    it('does not add duplicate job', () => {
      let state = candidateReducer(buildInitialState(), addSavedJob(mockJob('j1')))
      state = candidateReducer(state, addSavedJob(mockJob('j1')))
      expect(state.savedJobs).toHaveLength(1)
    })
  })

  describe('removeSavedJob', () => {
    it('removes a job by jobId', () => {
      let state = candidateReducer(buildInitialState(), setSavedJobs([mockJob('j1'), mockJob('j2')]))
      state = candidateReducer(state, removeSavedJob('j1'))
      expect(state.savedJobs).toHaveLength(1)
      expect(state.savedJobs[0].jobId).toBe('j2')
    })
  })

  describe('setAvailableSkills', () => {
    it('sets availableSkills and derives selectedSkillIds from selected=true skills', () => {
      const skills = [mockSkill('s1', true), mockSkill('s2', false), mockSkill('s3', true)]
      const state = candidateReducer(buildInitialState(), setAvailableSkills(skills))
      expect(state.availableSkills).toHaveLength(3)
      expect(state.selectedSkillIds).toEqual(['s1', 's3'])
    })

    it('handles non-array payload gracefully', () => {
      const state = candidateReducer(
        buildInitialState(),
        setAvailableSkills(null as unknown as UserSkill[]),
      )
      expect(state.availableSkills).toEqual([])
      expect(state.selectedSkillIds).toEqual([])
    })
  })

  describe('toggleSkill', () => {
    it('adds a skill to selectedSkillIds when not selected', () => {
      let state = candidateReducer(
        buildInitialState(),
        setAvailableSkills([mockSkill('s1'), mockSkill('s2')]),
      )
      state = candidateReducer(state, toggleSkill('s1'))
      expect(state.selectedSkillIds).toContain('s1')
      const skill = state.availableSkills.find((s) => s.skillId === 's1')
      expect(skill?.selected).toBe(true)
    })

    it('removes a skill from selectedSkillIds when already selected', () => {
      let state = candidateReducer(
        buildInitialState(),
        setAvailableSkills([mockSkill('s1', true)]),
      )
      state = candidateReducer(state, toggleSkill('s1'))
      expect(state.selectedSkillIds).not.toContain('s1')
      const skill = state.availableSkills.find((s) => s.skillId === 's1')
      expect(skill?.selected).toBe(false)
    })
  })

  describe('setBuildMyCv', () => {
    it('stores buildMyCv data and sets buildMyCvLoaded to true', () => {
      const cv = { ...emptyBuildMyCv, skills: ['React'] }
      const state = candidateReducer(buildInitialState(), setBuildMyCv(cv))
      expect(state.buildMyCv.skills).toEqual(['React'])
      expect(state.buildMyCvLoaded).toBe(true)
    })
  })

  describe('setBuildMyCvExists', () => {
    it('sets buildMyCvExists', () => {
      const state = candidateReducer(buildInitialState(), setBuildMyCvExists(true))
      expect(state.buildMyCvExists).toBe(true)
    })
  })

  describe('setBuildMyCvLastModified', () => {
    it('sets the last modified timestamp', () => {
      const ts = '2024-06-01T12:00:00Z'
      const state = candidateReducer(buildInitialState(), setBuildMyCvLastModified(ts))
      expect(state.buildMyCvLastModified).toBe(ts)
    })

    it('sets null', () => {
      const state = candidateReducer(buildInitialState(), setBuildMyCvLastModified(null))
      expect(state.buildMyCvLastModified).toBeNull()
    })
  })

  describe('updateBuildMyCvPersonalDetails', () => {
    it('merges partial personal details', () => {
      const state = candidateReducer(
        buildInitialState(),
        updateBuildMyCvPersonalDetails({ firstName: 'Jane', lastName: 'Doe' }),
      )
      expect(state.buildMyCv.personalDetails.firstName).toBe('Jane')
      expect(state.buildMyCv.personalDetails.lastName).toBe('Doe')
    })

    it('does not overwrite untouched fields', () => {
      let state = candidateReducer(
        buildInitialState(),
        updateBuildMyCvPersonalDetails({ firstName: 'Jane' }),
      )
      state = candidateReducer(state, updateBuildMyCvPersonalDetails({ lastName: 'Doe' }))
      expect(state.buildMyCv.personalDetails.firstName).toBe('Jane')
      expect(state.buildMyCv.personalDetails.lastName).toBe('Doe')
    })
  })

  describe('updateBuildMyCvCareerHistory', () => {
    it('replaces career history', () => {
      const entry: CandidateExperience = {
        company: 'Acme',
        jobTitle: 'Engineer',
        startDate: '2020-01',
        endDate: '2022-01',
      }
      const state = candidateReducer(buildInitialState(), updateBuildMyCvCareerHistory([entry]))
      expect(state.buildMyCv.careerHistory).toHaveLength(1)
      expect(state.buildMyCv.careerHistory[0].company).toBe('Acme')
    })
  })

  describe('updateBuildMyCvSkills', () => {
    it('replaces skills array', () => {
      const state = candidateReducer(buildInitialState(), updateBuildMyCvSkills(['React', 'TypeScript']))
      expect(state.buildMyCv.skills).toEqual(['React', 'TypeScript'])
    })
  })

  describe('updateBuildMyCvEducation', () => {
    it('replaces education data', () => {
      const education = {
        secondaryEducation: [],
        tertiaryEducation: [{ institution: 'UCT', qualification: 'BSc', yearCompleted: 2018 }],
      }
      const state = candidateReducer(buildInitialState(), updateBuildMyCvEducation(education))
      expect(state.buildMyCv.education.tertiaryEducation).toHaveLength(1)
    })
  })

  describe('updateBuildMyCvLanguages', () => {
    it('replaces languages array', () => {
      const langs: CandidateLanguage[] = [{ language: 'English', proficiency: 'Fluent' }]
      const state = candidateReducer(buildInitialState(), updateBuildMyCvLanguages(langs))
      expect(state.buildMyCv.languages).toEqual(langs)
    })
  })

  describe('clearCandidateState', () => {
    it('resets to initial state', () => {
      let state = candidateReducer(buildInitialState(), setUserId('u-1'))
      state = candidateReducer(state, setBuildMyCvExists(true))
      state = candidateReducer(state, clearCandidateState())
      expect(state.userId).toBeNull()
      expect(state.buildMyCvExists).toBe(false)
      expect(state.savedJobs).toEqual([])
    })
  })
})
