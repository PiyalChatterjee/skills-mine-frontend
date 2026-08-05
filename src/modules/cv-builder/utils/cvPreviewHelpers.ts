import type { CareerHistoryEntry, SkillEntry } from '../types/cvBuilder'

export const NOT_PROVIDED_TEXT = 'Not provided'
export const FALLBACK_WORK_DESCRIPTION = [
  'No responsibilities provided yet.',
  'No achievements provided yet.',
]

export const getValueOrFallback = (value: string, fallback = NOT_PROVIDED_TEXT) =>
  value.trim() || fallback

export const normalizeCareerHistory = (careerHistory: CareerHistoryEntry[]) =>
  careerHistory
    .map((entry) => ({
      ...entry,
      tasks: entry.tasks.map((task) => task.trim()).filter(Boolean),
      projects: entry.projects.map((project) => project.trim()).filter(Boolean),
    }))
    .filter(
      (entry) =>
        entry.companyName.trim() ||
        entry.positionHeld.trim() ||
        entry.startDate.trim() ||
        entry.endDate.trim() ||
        entry.tasks.length > 0 ||
        entry.projects.length > 0,
    )

export const normalizeSkills = (skills: SkillEntry[]) =>
  skills
    .map((entry) => entry.name.trim())
    .filter(Boolean)