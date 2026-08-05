import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useUpdateCandidateProfileMutation } from '@/modules/candidate/hooks/useCandidateQueries'
import type { CandidateProfile } from '@/modules/candidate/types'
import { ROUTE_PATHS } from '@/routes/routePaths'
import type { CandidateProfileUpdatePayload } from '@/services/api/candidateApi'
import type { AppDispatch } from '@/store'
import { pushNotification } from '@/store/slices/notificationSlice'
import type { CvBuilderView, Language } from '../types/cvBuilder'
import type { CvBuilderFormValues } from '../types/cvBuilderSchema'

const KNOWN_LANGUAGES: Language[] = [
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
]

const isKnownLanguage = (value: string): value is Language =>
  KNOWN_LANGUAGES.includes(value as Language)

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

const isoYearMonthPattern = /^(19|20)\d{2}-(0[1-9]|1[0-2])$/

const normalizeCareerDateValue = (value: string): string => {
  const normalized = value.trim()
  const isoMatch = normalized.match(isoYearMonthPattern)

  if (!isoMatch) {
    return value
  }

  const year = normalized.slice(0, 4)
  const monthIndex = Number(normalized.slice(5, 7)) - 1
  const monthName = monthNames[monthIndex]

  if (!monthName) {
    return value
  }

  return `${monthName},${year}`
}

export const buildCvBuilderPrefillData = (profile: CandidateProfile | undefined): Partial<CvBuilderFormValues> | undefined => {
  if (!profile) {
    return undefined
  }

  const profileLanguages = profile.languages ?? []
  const knownLanguages = profileLanguages.filter(isKnownLanguage)
  const customOtherLanguage = profileLanguages.find((language) => !isKnownLanguage(language))

  return {
    personalDetails: {
      fullName: profile.fullName ?? '',
      race: profile.race ?? '',
      gender: profile.gender ?? '',
      disabilityStatus: profile.disabilityStatus ?? '',
      nationality: profile.nationality ?? '',
      residentialLocation: profile.location ?? '',
      currentCompany: profile.currentCompany ?? '',
      currentPosition: profile.currentTitle ?? '',
      noticePeriod: profile.noticePeriod ?? '',
    },
    careerHistory: (profile.experience ?? []).map((entry) => ({
      companyName: entry.company ?? '',
      positionHeld: entry.title ?? '',
      startDate: normalizeCareerDateValue(entry.from ?? ''),
      endDate: normalizeCareerDateValue(entry.to ?? ''),
      isCurrentRole: (entry.to ?? '').toLowerCase() === 'current',
      tasks: [''],
      projects: [''],
    })),
    skills: (profile.skills ?? []).map((skill) => ({ name: skill })),
    tertiaryEducation: (profile.education ?? [])
      .filter((entry) => entry.educationLevel !== 'secondary')
      .map((entry) => ({
        institutionName: entry.institution ?? '',
        degreeOrCertification: entry.qualification ?? '',
        yearCompleted: String(entry.year ?? ''),
      })),
    secondaryEducation: (profile.education ?? [])
      .filter((entry) => entry.educationLevel === 'secondary')
      .map((entry) => ({
        institutionName: entry.institution ?? '',
        highestGradePassed: entry.qualification ?? '',
        yearCompleted: String(entry.year ?? ''),
      })),
    languages: [...knownLanguages, ...(customOtherLanguage ? (['Other'] as Language[]) : [])],
    otherLanguage: customOtherLanguage ?? '',
  }
}

type UseCvBuilderDoneArgs = {
  activeView: CvBuilderView
  goNext: () => void
  candidateId?: string
  candidateProfile?: CandidateProfile
  getFormValues: () => CvBuilderFormValues
  selectedLanguageEntries: string[]
}

const yearFromText = (value: string): number | null => {
  const match = value.match(/\b(19|20)\d{2}\b/)
  return match ? Number(match[0]) : null
}

const calculateExperienceYears = (careerHistory: CvBuilderFormValues['careerHistory']): number => {
  const years = careerHistory
    .map((entry) => yearFromText(entry.startDate))
    .filter((value): value is number => value !== null)

  if (years.length === 0) {
    return 0
  }

  const earliestYear = Math.min(...years)
  return Math.max(new Date().getFullYear() - earliestYear, 0)
}

const mapEducationEntriesForPayload = (
  tertiaryEducation: CvBuilderFormValues['tertiaryEducation'],
  secondaryEducation: CvBuilderFormValues['secondaryEducation'],
): CandidateProfile['education'] => {
  const tertiary = tertiaryEducation
    .filter((entry) =>
      [entry.institutionName, entry.degreeOrCertification, entry.yearCompleted]
        .some((fieldValue) => fieldValue.trim().length > 0),
    )
    .map((entry) => ({
      institution: entry.institutionName.trim(),
      qualification: entry.degreeOrCertification.trim(),
      year: Number(entry.yearCompleted.trim()),
      educationLevel: 'tertiary' as const,
    }))

  const secondary = secondaryEducation
    .filter((entry) =>
      [entry.institutionName, entry.highestGradePassed, entry.yearCompleted]
        .some((fieldValue) => fieldValue.trim().length > 0),
    )
    .map((entry) => ({
      institution: entry.institutionName.trim(),
      qualification: entry.highestGradePassed.trim(),
      year: Number(entry.yearCompleted.trim()),
      educationLevel: 'secondary' as const,
    }))

  return [...tertiary, ...secondary].filter((entry) => Number.isFinite(entry.year))
}

const buildCandidateProfileUpdatePayload = ({
  currentProfile,
  formValues,
  selectedLanguageEntries,
}: {
  currentProfile: CandidateProfile
  formValues: CvBuilderFormValues
  selectedLanguageEntries: string[]
}): CandidateProfileUpdatePayload => {
  const nextSkills = formValues.skills.map((skill) => skill.name.trim()).filter(Boolean)
  const nextExperience = formValues.careerHistory
    .filter((entry) =>
      [entry.companyName, entry.positionHeld, entry.startDate, entry.endDate]
        .some((fieldValue) => fieldValue.trim().length > 0),
    )
    .map((entry) => ({
      company: entry.companyName.trim(),
      title: entry.positionHeld.trim(),
      from: entry.startDate.trim(),
      to: entry.isCurrentRole ? 'Current' : entry.endDate.trim(),
    }))

  const nextEducation = mapEducationEntriesForPayload(formValues.tertiaryEducation, formValues.secondaryEducation)
  const pd = formValues.personalDetails

  return {
    fullName: pd.fullName.trim(),
    email: currentProfile.email,
    phone: currentProfile.phone,
    profilePhotoUrl: currentProfile.profilePhotoUrl,
    password: currentProfile.password,
    race: pd.race.trim(),
    gender: pd.gender.trim(),
    disabilityStatus: pd.disabilityStatus.trim(),
    nationality: pd.nationality.trim(),
    noticePeriod: pd.noticePeriod.trim(),
    location: pd.residentialLocation.trim(),
    currentTitle: pd.currentPosition.trim(),
    currentCompany: pd.currentCompany.trim(),
    experienceYears: calculateExperienceYears(formValues.careerHistory),
    skills: nextSkills,
    education: nextEducation,
    experience: nextExperience,
    documents: currentProfile.documents,
    languages: selectedLanguageEntries,
    profileComplete: currentProfile.profileComplete,
    applications: currentProfile.applications,
  }
}

const normalizeProfileForComparison = (
  payload: CandidateProfileUpdatePayload,
): CandidateProfileUpdatePayload => ({
  ...payload,
  fullName: payload.fullName.trim(),
  race: payload.race?.trim() ?? '',
  gender: payload.gender?.trim() ?? '',
  disabilityStatus: payload.disabilityStatus?.trim() ?? '',
  nationality: payload.nationality?.trim() ?? '',
  noticePeriod: payload.noticePeriod?.trim() ?? '',
  location: payload.location.trim(),
  currentTitle: payload.currentTitle.trim(),
  currentCompany: payload.currentCompany.trim(),
  skills: payload.skills.map((skill) => skill.trim()),
  education: payload.education.map((entry) => ({
    institution: entry.institution.trim(),
    qualification: entry.qualification.trim(),
    year: entry.year,
    educationLevel: entry.educationLevel ?? 'tertiary',
  })),
  experience: payload.experience?.map((entry) => ({
    company: entry.company.trim(),
    title: entry.title.trim(),
    from: entry.from.trim(),
    to: entry.to.trim(),
  })),
  languages: payload.languages?.map((language) => language.trim()),
})

const buildPayloadFromProfile = (profile: CandidateProfile): CandidateProfileUpdatePayload => ({
  fullName: profile.fullName,
  email: profile.email,
  phone: profile.phone,
  profilePhotoUrl: profile.profilePhotoUrl,
  password: profile.password,
  race: profile.race ?? '',
  gender: profile.gender ?? '',
  disabilityStatus: profile.disabilityStatus ?? '',
  nationality: profile.nationality ?? '',
  noticePeriod: profile.noticePeriod ?? '',
  location: profile.location,
  currentTitle: profile.currentTitle,
  currentCompany: profile.currentCompany,
  experienceYears: profile.experienceYears,
  skills: profile.skills ?? [],
  education: (profile.education ?? []).map((entry) => ({
    institution: entry.institution,
    qualification: entry.qualification,
    year: entry.year,
    educationLevel: entry.educationLevel ?? 'tertiary',
  })),
  experience: (profile.experience ?? []).map((entry) => ({
    company: entry.company,
    title: entry.title,
    from: entry.from,
    to: entry.to,
  })),
  documents: profile.documents,
  languages: profile.languages ?? [],
  profileComplete: profile.profileComplete,
  applications: profile.applications,
})

const hasProfileChanges = (
  currentProfile: CandidateProfile,
  nextPayload: CandidateProfileUpdatePayload,
): boolean => {
  const currentPayload = normalizeProfileForComparison(buildPayloadFromProfile(currentProfile))
  const normalizedNextPayload = normalizeProfileForComparison(nextPayload)

  return JSON.stringify(currentPayload) !== JSON.stringify(normalizedNextPayload)
}

export const useCvBuilderDone = ({
  activeView,
  goNext,
  candidateId,
  candidateProfile,
  getFormValues,
  selectedLanguageEntries,
}: UseCvBuilderDoneArgs) => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { mutateAsync: updateCandidateProfile, isLoading: isSavingCandidateProfile } =
    useUpdateCandidateProfileMutation()

  const handleDone = useCallback(async () => {
    if (activeView !== 'view-cv') {
      goNext()
      return
    }

    if (!candidateId || !candidateProfile) {
      dispatch(
        pushNotification({
          title: 'Unable to save CV',
          message: 'Candidate profile could not be resolved.',
          level: 'error',
        }),
      )
      return
    }

    const payload = buildCandidateProfileUpdatePayload({
      currentProfile: candidateProfile,
      formValues: getFormValues(),
      selectedLanguageEntries,
    })

    if (!hasProfileChanges(candidateProfile, payload)) {
      dispatch(
        pushNotification({
          title: 'No changes detected',
          message: 'Your profile is already up to date.',
          level: 'info',
        }),
      )
      navigate(ROUTE_PATHS.candidateDashboard)
      return
    }

    try {
      await updateCandidateProfile({ candidateId, payload })
      dispatch(
        pushNotification({
          title: 'CV saved',
          message: 'Your profile was updated successfully.',
          level: 'success',
        }),
      )
      navigate(ROUTE_PATHS.candidateDashboard)
    } catch (error) {
      const fallbackMessage = 'We could not save your CV right now. Please try again.'
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: unknown }).message ?? fallbackMessage)
          : fallbackMessage

      dispatch(
        pushNotification({
          title: 'Save failed',
          message: errorMessage,
          level: 'error',
        }),
      )
    }
  }, [
    activeView,
    goNext,
    candidateId,
    candidateProfile,
    dispatch,
    getFormValues,
    selectedLanguageEntries,
    updateCandidateProfile,
    navigate,
  ])

  return {
    handleDone,
    isSavingCandidateProfile,
  }
}
