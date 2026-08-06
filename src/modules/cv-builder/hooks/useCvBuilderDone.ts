import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useUpdateCandidateProfileMutation } from '@/modules/candidate/hooks/useCandidateQueries'
import type { CandidateProfile } from '@/modules/candidate/types'
import { ROUTE_PATHS } from '@/routes/routePaths'
import type { CandidateProfileUpdatePayload } from '@/modules/candidate/types'
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

const monthNameToIso = (value: string): string => {
  const normalized = value.trim()
  const [month, year] = normalized.split(',').map((part) => part.trim())
  if (!month || !year || !/^\d{4}$/.test(year)) {
    return value
  }

  const monthIndex = monthNames.findIndex((name) => name.toLowerCase() === month.toLowerCase())
  if (monthIndex < 0) {
    return value
  }

  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`
}

const isoToMonthName = (value: string): string => {
  const match = value.match(/^(19|20)\d{2}-(0[1-9]|1[0-2])$/)
  if (!match) {
    return value
  }

  const year = value.slice(0, 4)
  const monthIndex = Number(value.slice(5, 7)) - 1
  const monthName = monthNames[monthIndex]
  return monthName ? `${monthName},${year}` : value
}

export const buildCvBuilderPrefillData = (profile: CandidateProfile | undefined): Partial<CvBuilderFormValues> | undefined => {
  if (!profile) {
    return undefined
  }

  const profileLanguages = profile.languages ?? []
  const languageNames = profileLanguages.map((item) => item.language)
  const knownLanguages = languageNames.filter(isKnownLanguage)
  const customOtherLanguage = languageNames.find((language) => !isKnownLanguage(language))

  const primaryExperience = profile.experience?.[0]

  return {
    personalDetails: {
      fullName: `${profile.personalDetails.firstName} ${profile.personalDetails.lastName}`.trim(),
      race: profile.personalDetails.eeStatus ?? '',
      gender: '',
      disabilityStatus: '',
      nationality: profile.personalDetails.nationality ?? '',
      residentialLocation: profile.personalDetails.location ?? '',
      currentCompany: primaryExperience?.company ?? '',
      currentPosition: primaryExperience?.jobTitle ?? profile.desiredJob.jobTitle ?? '',
      noticePeriod: profile.desiredJob.availableFrom ?? '',
    },
    careerHistory: (profile.experience ?? []).map((entry) => ({
      companyName: entry.company ?? '',
      positionHeld: entry.jobTitle ?? '',
      startDate: isoToMonthName(entry.startDate ?? ''),
      endDate: isoToMonthName(entry.endDate ?? ''),
      isCurrentRole: (entry.endDate ?? '').toLowerCase() === 'present',
      tasks: [entry.responsibilities ?? ''],
      projects: [''],
    })),
    skills: (profile.skills ?? []).map((skill) => ({ name: skill })),
    tertiaryEducation: (profile.education ?? []).map((entry) => ({
      institutionName: entry.institution ?? '',
      degreeOrCertification: entry.qualification ?? '',
      yearCompleted: String(entry.year ?? ''),
    })),
    secondaryEducation: [],
    languages: [...knownLanguages, ...(customOtherLanguage ? (['Other'] as Language[]) : [])],
    otherLanguage: customOtherLanguage ?? '',
  }
}

type UseCvBuilderDoneArgs = {
  activeView: CvBuilderView
  goNext: () => void
  userId?: string
  candidateProfile?: CandidateProfile
  getFormValues: () => CvBuilderFormValues
  selectedLanguageEntries: string[]
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
  const [firstName, ...lastNameParts] = formValues.personalDetails.fullName.trim().split(' ')
  const languages = selectedLanguageEntries
    .filter(Boolean)
    .map((language) => ({ language, proficiency: 'Conversational' }))

  return {
    personalDetails: {
      ...currentProfile.personalDetails,
      firstName: firstName || currentProfile.personalDetails.firstName,
      lastName: lastNameParts.join(' ').trim() || currentProfile.personalDetails.lastName,
      location: formValues.personalDetails.residentialLocation.trim(),
      eeStatus: formValues.personalDetails.race.trim(),
      nationality: formValues.personalDetails.nationality.trim(),
    },
    desiredJob: {
      ...currentProfile.desiredJob,
      jobTitle: formValues.personalDetails.currentPosition.trim() || currentProfile.desiredJob.jobTitle,
      availableFrom: formValues.personalDetails.noticePeriod.trim(),
    },
    education: [
      ...formValues.tertiaryEducation.map((entry) => ({
        institution: entry.institutionName.trim(),
        qualification: entry.degreeOrCertification.trim(),
        year: Number(entry.yearCompleted.trim()),
      })),
      ...formValues.secondaryEducation.map((entry) => ({
        institution: entry.institutionName.trim(),
        qualification: entry.highestGradePassed.trim(),
        year: Number(entry.yearCompleted.trim()),
      })),
    ].filter((entry) => entry.institution && entry.qualification && Number.isFinite(entry.year)),
    experience: formValues.careerHistory
      .filter((entry) => entry.companyName.trim() || entry.positionHeld.trim())
      .map((entry) => ({
        company: entry.companyName.trim(),
        jobTitle: entry.positionHeld.trim(),
        startDate: monthNameToIso(entry.startDate.trim()),
        endDate: entry.isCurrentRole ? 'Present' : monthNameToIso(entry.endDate.trim()),
        responsibilities: entry.tasks.map((task) => task.trim()).filter(Boolean).join('; '),
      })),
    skills: formValues.skills.map((skill) => skill.name.trim()).filter(Boolean),
    languages,
  }
}

export const useCvBuilderDone = ({
  activeView,
  goNext,
  userId,
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

    if (!userId || !candidateProfile) {
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

    try {
      await updateCandidateProfile({ userId, payload })
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
    userId,
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
