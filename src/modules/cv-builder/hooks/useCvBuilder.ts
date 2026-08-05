import { type ChangeEvent, useEffect, useRef, useState } from 'react'
import {
  CAREER_HISTORY_INITIAL,
  CV_BUILDER_STEPS,
  LANGUAGES_INITIAL,
  PERSONAL_DETAILS_INITIAL_VALUES,
  SECONDARY_EDUCATION_INITIAL,
  SKILLS_INITIAL,
  TERTIARY_EDUCATION_INITIAL,
  createCareerHistoryEntry,
  createSecondaryEntry,
  createSkillEntry,
  createTertiaryEntry,
  type CareerHistoryEntry,
  type CvBuilderView,
  type Language,
  type PersonalDetailsFormState,
  type SecondaryEducationEntry,
  type SkillEntry,
  type TertiaryEducationEntry,
} from '../types/cvBuilder'

const FIRST_STEP = 1
const LAST_STEP = CV_BUILDER_STEPS.length
const PERSONAL_DETAILS_STEP_ID = 1
const FORM_FIELD_KEYS: (keyof PersonalDetailsFormState)[] = [
  'fullName',
  'residentialLocation',
  'currentCompany',
  'currentPosition',
  'noticePeriod',
]

const isBlank = (value: string) => value.trim().length === 0
const fullNamePattern = /^[a-zA-Z0-9 ]+$/

type PersonalDetailsValidationErrors = Partial<Record<keyof PersonalDetailsFormState, string>>
type CareerHistoryRequiredField = 'companyName' | 'positionHeld' | 'startDate'
type CareerHistoryEntryValidationErrors = Partial<Record<CareerHistoryRequiredField, string>>
type CareerHistoryValidationErrors = {
  form?: string
  byEntryId: Record<string, CareerHistoryEntryValidationErrors>
}

type SkillsValidationErrors = {
  form?: string
}

type TertiaryEducationValidationErrors = Partial<
  Record<'institutionName' | 'degreeOrCertification' | 'yearCompleted', string>
>

type SecondaryEducationValidationErrors = Partial<
  Record<'institutionName' | 'highestGradePassed' | 'yearCompleted', string>
>

type EducationValidationErrors = {
  form?: string
  tertiaryByEntryId: Record<string, TertiaryEducationValidationErrors>
  secondaryByEntryId: Record<string, SecondaryEducationValidationErrors>
}

type LanguagesValidationErrors = {
  form?: string
  otherLanguage?: string
}

const validatePersonalDetails = (values: PersonalDetailsFormState): PersonalDetailsValidationErrors => {
  const errors: PersonalDetailsValidationErrors = {}

  if (isBlank(values.fullName)) {
    errors.fullName = 'Full name is required'
  } else if (!fullNamePattern.test(values.fullName.trim())) {
    errors.fullName = 'Full name must be alphanumeric'
  }

  if (isBlank(values.race)) {
    errors.race = 'Race is required'
  }

  if (isBlank(values.gender)) {
    errors.gender = 'Gender is required'
  }

  if (isBlank(values.disabilityStatus)) {
    errors.disabilityStatus = 'Disability status is required'
  }

  if (isBlank(values.nationality)) {
    errors.nationality = 'Nationality is required'
  }

  if (isBlank(values.residentialLocation)) {
    errors.residentialLocation = 'Residential location is required'
  }

  if (!isBlank(values.currentCompany)) {
    if (isBlank(values.currentPosition)) {
      errors.currentPosition = 'Current position is required when current company is provided'
    }

    if (isBlank(values.noticePeriod)) {
      errors.noticePeriod = 'Notice period is required when current company is provided'
    }
  }

  return errors
}

const hasValidationErrors = (errors: PersonalDetailsValidationErrors) => Object.keys(errors).length > 0

const EMPTY_CAREER_HISTORY_ERRORS: CareerHistoryValidationErrors = {
  form: undefined,
  byEntryId: {},
}

const validateCareerHistory = (
  values: PersonalDetailsFormState,
  entries: CareerHistoryEntry[],
): CareerHistoryValidationErrors => {
  if (isBlank(values.currentPosition)) {
    return EMPTY_CAREER_HISTORY_ERRORS
  }

  if (entries.length === 0) {
    return {
      form: 'At least one position is required when current position is provided',
      byEntryId: {},
    }
  }

  const byEntryId: Record<string, CareerHistoryEntryValidationErrors> = {}

  entries.forEach((entry) => {
    const entryErrors: CareerHistoryEntryValidationErrors = {}

    if (isBlank(entry.companyName)) {
      entryErrors.companyName = 'Company name is required'
    }

    if (isBlank(entry.positionHeld)) {
      entryErrors.positionHeld = 'Position held is required'
    }

    if (isBlank(entry.startDate)) {
      entryErrors.startDate = 'Employment start date is required'
    }

    if (Object.keys(entryErrors).length > 0) {
      byEntryId[entry.id] = entryErrors
    }
  })

  return {
    form: undefined,
    byEntryId,
  }
}

const hasCareerHistoryValidationErrors = (errors: CareerHistoryValidationErrors) =>
  Boolean(errors.form) || Object.keys(errors.byEntryId).length > 0

const EMPTY_SKILLS_ERRORS: SkillsValidationErrors = {
  form: undefined,
}

const validateSkills = (entries: SkillEntry[]): SkillsValidationErrors => {
  const hasAtLeastOneSkill = entries.some((entry) => !isBlank(entry.name))

  if (!hasAtLeastOneSkill) {
    return {
      form: 'At least one skill is required',
    }
  }

  return EMPTY_SKILLS_ERRORS
}

const hasSkillsValidationErrors = (errors: SkillsValidationErrors) => Boolean(errors.form)

const yearCompletedPattern = /^\d{4}$/

const EMPTY_EDUCATION_ERRORS: EducationValidationErrors = {
  form: undefined,
  tertiaryByEntryId: {},
  secondaryByEntryId: {},
}

const validateEducation = (
  tertiaryEntries: TertiaryEducationEntry[],
  secondaryEntries: SecondaryEducationEntry[],
): EducationValidationErrors => {
  if (tertiaryEntries.length + secondaryEntries.length < 1) {
    return {
      form: 'At least one education entry is required',
      tertiaryByEntryId: {},
      secondaryByEntryId: {},
    }
  }

  const tertiaryByEntryId: Record<string, TertiaryEducationValidationErrors> = {}
  const secondaryByEntryId: Record<string, SecondaryEducationValidationErrors> = {}

  tertiaryEntries.forEach((entry) => {
    const entryErrors: TertiaryEducationValidationErrors = {}

    if (isBlank(entry.institutionName)) {
      entryErrors.institutionName = 'Institution name is required'
    }

    if (isBlank(entry.degreeOrCertification)) {
      entryErrors.degreeOrCertification = 'Degree or certification is required'
    }

    if (isBlank(entry.yearCompleted)) {
      entryErrors.yearCompleted = 'Year completed is required'
    } else if (!yearCompletedPattern.test(entry.yearCompleted.trim())) {
      entryErrors.yearCompleted = 'Enter a valid year (YYYY)'
    }

    if (Object.keys(entryErrors).length > 0) {
      tertiaryByEntryId[entry.id] = entryErrors
    }
  })

  secondaryEntries.forEach((entry) => {
    const entryErrors: SecondaryEducationValidationErrors = {}

    if (isBlank(entry.institutionName)) {
      entryErrors.institutionName = 'Institution name is required'
    }

    if (isBlank(entry.highestGradePassed)) {
      entryErrors.highestGradePassed = 'Highest grade passed is required'
    }

    if (isBlank(entry.yearCompleted)) {
      entryErrors.yearCompleted = 'Year completed is required'
    } else if (!yearCompletedPattern.test(entry.yearCompleted.trim())) {
      entryErrors.yearCompleted = 'Enter a valid year (YYYY)'
    }

    if (Object.keys(entryErrors).length > 0) {
      secondaryByEntryId[entry.id] = entryErrors
    }
  })

  return {
    form: undefined,
    tertiaryByEntryId,
    secondaryByEntryId,
  }
}

const hasEducationValidationErrors = (errors: EducationValidationErrors) =>
  Boolean(errors.form) ||
  Object.keys(errors.tertiaryByEntryId).length > 0 ||
  Object.keys(errors.secondaryByEntryId).length > 0

const OTHER_LANGUAGE_OPTION: Language = 'Other'

const EMPTY_LANGUAGES_ERRORS: LanguagesValidationErrors = {
  form: undefined,
  otherLanguage: undefined,
}

const buildLanguageEntries = (
  selectedLanguages: Set<Language>,
  otherLanguage: string,
): string[] => {
  const entries: string[] = Array.from(selectedLanguages).filter(
    (language) => language !== OTHER_LANGUAGE_OPTION,
  )

  if (selectedLanguages.has(OTHER_LANGUAGE_OPTION) && !isBlank(otherLanguage)) {
    entries.push(otherLanguage.trim())
  }

  return entries
}

const validateLanguages = (
  selectedLanguages: Set<Language>,
  otherLanguage: string,
): LanguagesValidationErrors => {
  if (selectedLanguages.size === 0) {
    return {
      form: 'At least one language must be selected',
      otherLanguage: undefined,
    }
  }

  if (selectedLanguages.has(OTHER_LANGUAGE_OPTION) && isBlank(otherLanguage)) {
    return {
      form: undefined,
      otherLanguage: 'Please enter the other language',
    }
  }

  return EMPTY_LANGUAGES_ERRORS
}

const hasLanguagesValidationErrors = (errors: LanguagesValidationErrors) =>
  Boolean(errors.form) || Boolean(errors.otherLanguage)

const useCvBuilder = (profileDefaults?: Partial<PersonalDetailsFormState>) => {
  const uploadInputRef = useRef<HTMLInputElement | null>(null)

  const [activeView, setActiveView] = useState<CvBuilderView>('launcher')
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null)
  const [currentStepId, setCurrentStepId] = useState<number>(FIRST_STEP)
  const [formValues, setFormValues] = useState<PersonalDetailsFormState>(PERSONAL_DETAILS_INITIAL_VALUES)
  const [careerHistory, setCareerHistory] = useState<CareerHistoryEntry[]>(CAREER_HISTORY_INITIAL)
  const [skills, setSkills] = useState<SkillEntry[]>(SKILLS_INITIAL)
  const [tertiaryEducation, setTertiaryEducation] = useState<TertiaryEducationEntry[]>(TERTIARY_EDUCATION_INITIAL)
  const [secondaryEducation, setSecondaryEducation] = useState<SecondaryEducationEntry[]>(SECONDARY_EDUCATION_INITIAL)
  const [selectedLanguages, setSelectedLanguages] = useState<Set<Language>>(LANGUAGES_INITIAL)
  const [otherLanguage, setOtherLanguage] = useState<string>('')
  const [personalDetailsErrors, setPersonalDetailsErrors] = useState<PersonalDetailsValidationErrors>({})
  const [careerHistoryErrors, setCareerHistoryErrors] = useState<CareerHistoryValidationErrors>(
    EMPTY_CAREER_HISTORY_ERRORS,
  )
  const [skillsErrors, setSkillsErrors] = useState<SkillsValidationErrors>(EMPTY_SKILLS_ERRORS)
  const [educationErrors, setEducationErrors] = useState<EducationValidationErrors>(
    EMPTY_EDUCATION_ERRORS,
  )
  const [languagesErrors, setLanguagesErrors] = useState<LanguagesValidationErrors>(
    EMPTY_LANGUAGES_ERRORS,
  )

  useEffect(() => {
    if (!profileDefaults) {
      return
    }

    setFormValues((currentValues) => {
      const nextValues: PersonalDetailsFormState = { ...currentValues }
      let hasChanged = false

      const assignIfEmpty = (field: keyof PersonalDetailsFormState) => {
        const candidateValue = profileDefaults[field]
        if (!candidateValue || !isBlank(currentValues[field])) {
          return
        }
        nextValues[field] = candidateValue
        hasChanged = true
      }

      FORM_FIELD_KEYS.forEach(assignIfEmpty)

      return hasChanged ? nextValues : currentValues
    })
  }, [profileDefaults])

  const handleUploadFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null
    setSelectedUploadFile(nextFile)
    event.target.value = ''
  }

  const openUploadPicker = () => {
    uploadInputRef.current?.click()
  }

  const openBuildFlow = () => {
    setActiveView('form')
    setCurrentStepId(FIRST_STEP)
  }

  const openPreview = () => {
    setActiveView('preview')
  }

  const closePreview = () => {
    setActiveView('review')
  }

  const handleFormValueChange =
    (field: keyof PersonalDetailsFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((currentValues) => ({
        ...currentValues,
        [field]: event.target.value,
      }))

      setPersonalDetailsErrors((currentErrors) => {
        if (!currentErrors[field]) {
          return currentErrors
        }

        const nextErrors = { ...currentErrors }
        delete nextErrors[field]
        return nextErrors
      })
    }

  const handleTextFieldChange = handleFormValueChange

  const handleSelectFieldChange = handleFormValueChange

  const personalDetailsValidation = validatePersonalDetails(formValues)
  const careerHistoryValidation = validateCareerHistory(formValues, careerHistory)
  const skillsValidation = validateSkills(skills)
  const educationValidation = validateEducation(tertiaryEducation, secondaryEducation)
  const languagesValidation = validateLanguages(selectedLanguages, otherLanguage)

  const isPersonalDetailsValid = !hasValidationErrors(personalDetailsValidation)
  const isCareerHistoryValid = !hasCareerHistoryValidationErrors(careerHistoryValidation)
  const isSkillsValid = !hasSkillsValidationErrors(skillsValidation)
  const isEducationValid = !hasEducationValidationErrors(educationValidation)
  const isLanguagesValid = !hasLanguagesValidationErrors(languagesValidation)

  const canViewCv =
    isPersonalDetailsValid &&
    isCareerHistoryValid &&
    isSkillsValid &&
    isEducationValid &&
    isLanguagesValid

  const goBack = () => {
    if (activeView === 'preview' || activeView === 'view-cv') {
      setActiveView('review')
      return
    }

    if (activeView === 'review') {
      setActiveView('form')
      setCurrentStepId(LAST_STEP)
      return
    }

    if (currentStepId > FIRST_STEP) {
      setCurrentStepId((prevStepId) => prevStepId - 1)
      return
    }

    setActiveView('launcher')
  }

  const canGoNext =
    activeView === 'form' &&
    ((currentStepId === 1 && isPersonalDetailsValid) ||
      (currentStepId === 2 && isCareerHistoryValid) ||
      (currentStepId === 3 && isSkillsValid) ||
      (currentStepId === 4 && isEducationValid) ||
      (currentStepId === 5 && isLanguagesValid))

  const goNext = () => {
    if (activeView === 'preview') {
      return
    }

    if (activeView === 'review') {
      setPersonalDetailsErrors(personalDetailsValidation)
      setCareerHistoryErrors(careerHistoryValidation)
      setSkillsErrors(skillsValidation)
      setEducationErrors(educationValidation)
      setLanguagesErrors(languagesValidation)

      if (!canViewCv) {
        return
      }

      setActiveView('view-cv')
      return
    }

    if (activeView === 'view-cv') {
      setActiveView('launcher')
      setCurrentStepId(FIRST_STEP)
      return
    }

    if (currentStepId === PERSONAL_DETAILS_STEP_ID) {
      setPersonalDetailsErrors(personalDetailsValidation)
      if (!isPersonalDetailsValid) {
        return
      }
    }

    if (currentStepId === 2) {
      setCareerHistoryErrors(careerHistoryValidation)
      if (!isCareerHistoryValid) {
        return
      }
    }

    if (currentStepId === 3) {
      setSkillsErrors(skillsValidation)
      if (!isSkillsValid) {
        return
      }
    }

    if (currentStepId === 4) {
      setEducationErrors(educationValidation)
      if (!isEducationValid) {
        return
      }
    }

    if (currentStepId === 5) {
      setLanguagesErrors(languagesValidation)
      if (!isLanguagesValid) {
        return
      }
    }

    if (currentStepId < LAST_STEP) {
      setCurrentStepId((prevStepId) => prevStepId + 1)
      return
    }

    setActiveView('review')
  }

  // ─── Career History ─────────────────────────────────────────────────────────

  const addPosition = () => {
    setCareerHistory((prev) => [...prev, createCareerHistoryEntry(prev.length)])
    setCareerHistoryErrors((currentErrors) =>
      currentErrors.form
        ? {
            form: undefined,
            byEntryId: currentErrors.byEntryId,
          }
        : currentErrors,
    )
  }

  const updatePosition = (
    entryId: string,
    field: keyof Omit<CareerHistoryEntry, 'id' | 'tasks' | 'projects'>,
    value: string | boolean,
  ) => {
    setCareerHistory((prev) =>
      prev.map((entry) => (entry.id === entryId ? { ...entry, [field]: value } : entry)),
    )

    if (field === 'companyName' || field === 'positionHeld' || field === 'startDate') {
      setCareerHistoryErrors((currentErrors) => {
        const entryErrors = currentErrors.byEntryId[entryId]
        if (!entryErrors?.[field]) {
          return currentErrors
        }

        const nextEntryErrors = { ...entryErrors }
        delete nextEntryErrors[field]

        const nextByEntryId = { ...currentErrors.byEntryId }
        if (Object.keys(nextEntryErrors).length === 0) {
          delete nextByEntryId[entryId]
        } else {
          nextByEntryId[entryId] = nextEntryErrors
        }

        return {
          form: currentErrors.form,
          byEntryId: nextByEntryId,
        }
      })
    }
  }

  const addTask = (entryId: string) => {
    setCareerHistory((prev) =>
      prev.map((entry) =>
        entry.id === entryId ? { ...entry, tasks: [...entry.tasks, ''] } : entry,
      ),
    )
  }

  const updateTask = (entryId: string, taskIndex: number, value: string) => {
    setCareerHistory((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry
        const nextTasks = [...entry.tasks]
        nextTasks[taskIndex] = value
        return { ...entry, tasks: nextTasks }
      }),
    )
  }

  const addProject = (entryId: string) => {
    setCareerHistory((prev) =>
      prev.map((entry) =>
        entry.id === entryId ? { ...entry, projects: [...entry.projects, ''] } : entry,
      ),
    )
  }

  const updateProject = (entryId: string, projectIndex: number, value: string) => {
    setCareerHistory((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry
        const nextProjects = [...entry.projects]
        nextProjects[projectIndex] = value
        return { ...entry, projects: nextProjects }
      }),
    )
  }

  // ─── Skills ─────────────────────────────────────────────────────────────────

  const addSkill = () => {
    setSkills((prev) => [...prev, createSkillEntry()])
    setSkillsErrors((currentErrors) =>
      currentErrors.form
        ? {
            form: undefined,
          }
        : currentErrors,
    )
  }

  const updateSkill = (skillId: string, value: string) => {
    setSkills((prev) =>
      prev.map((skill) => (skill.id === skillId ? { ...skill, name: value } : skill)),
    )

    if (!isBlank(value)) {
      setSkillsErrors((currentErrors) =>
        currentErrors.form
          ? {
              form: undefined,
            }
          : currentErrors,
      )
    }
  }

  const removeSkill = (skillId: string) => {
    setSkills((prev) => prev.filter((skill) => skill.id !== skillId))
  }

  // ─── Education ──────────────────────────────────────────────────────────────

  const addTertiaryEntry = () => {
    setTertiaryEducation((prev) => [...prev, createTertiaryEntry()])
    setEducationErrors((currentErrors) =>
      currentErrors.form
        ? {
            ...currentErrors,
            form: undefined,
          }
        : currentErrors,
    )
  }

  const updateTertiaryEntry = (
    entryId: string,
    field: keyof Omit<TertiaryEducationEntry, 'id'>,
    value: string,
  ) => {
    setTertiaryEducation((prev) =>
      prev.map((entry) => (entry.id === entryId ? { ...entry, [field]: value } : entry)),
    )

    setEducationErrors((currentErrors) => {
      const entryErrors = currentErrors.tertiaryByEntryId[entryId]
      if (!entryErrors?.[field]) {
        return currentErrors
      }

      const nextEntryErrors = { ...entryErrors }
      delete nextEntryErrors[field]

      const nextTertiaryByEntryId = { ...currentErrors.tertiaryByEntryId }
      if (Object.keys(nextEntryErrors).length === 0) {
        delete nextTertiaryByEntryId[entryId]
      } else {
        nextTertiaryByEntryId[entryId] = nextEntryErrors
      }

      return {
        ...currentErrors,
        tertiaryByEntryId: nextTertiaryByEntryId,
      }
    })
  }

  const removeTertiaryEntry = (entryId: string) => {
    setTertiaryEducation((prev) => prev.filter((entry) => entry.id !== entryId))
    setEducationErrors((currentErrors) => {
      if (!currentErrors.tertiaryByEntryId[entryId]) {
        return currentErrors
      }

      const nextTertiaryByEntryId = { ...currentErrors.tertiaryByEntryId }
      delete nextTertiaryByEntryId[entryId]
      return {
        ...currentErrors,
        tertiaryByEntryId: nextTertiaryByEntryId,
      }
    })
  }

  const addSecondaryEntry = () => {
    setSecondaryEducation((prev) => [...prev, createSecondaryEntry()])
    setEducationErrors((currentErrors) =>
      currentErrors.form
        ? {
            ...currentErrors,
            form: undefined,
          }
        : currentErrors,
    )
  }

  const updateSecondaryEntry = (
    entryId: string,
    field: keyof Omit<SecondaryEducationEntry, 'id'>,
    value: string,
  ) => {
    setSecondaryEducation((prev) =>
      prev.map((entry) => (entry.id === entryId ? { ...entry, [field]: value } : entry)),
    )

    setEducationErrors((currentErrors) => {
      const entryErrors = currentErrors.secondaryByEntryId[entryId]
      if (!entryErrors?.[field]) {
        return currentErrors
      }

      const nextEntryErrors = { ...entryErrors }
      delete nextEntryErrors[field]

      const nextSecondaryByEntryId = { ...currentErrors.secondaryByEntryId }
      if (Object.keys(nextEntryErrors).length === 0) {
        delete nextSecondaryByEntryId[entryId]
      } else {
        nextSecondaryByEntryId[entryId] = nextEntryErrors
      }

      return {
        ...currentErrors,
        secondaryByEntryId: nextSecondaryByEntryId,
      }
    })
  }

  const removeSecondaryEntry = (entryId: string) => {
    setSecondaryEducation((prev) => prev.filter((entry) => entry.id !== entryId))
    setEducationErrors((currentErrors) => {
      if (!currentErrors.secondaryByEntryId[entryId]) {
        return currentErrors
      }

      const nextSecondaryByEntryId = { ...currentErrors.secondaryByEntryId }
      delete nextSecondaryByEntryId[entryId]
      return {
        ...currentErrors,
        secondaryByEntryId: nextSecondaryByEntryId,
      }
    })
  }

  // ─── Languages ──────────────────────────────────────────────────────────────

  const toggleLanguage = (language: Language) => {
    setSelectedLanguages((prev) => {
      const next = new Set(prev)
      if (next.has(language)) {
        next.delete(language)
      } else {
        next.add(language)
      }
      return next
    })

    setLanguagesErrors((currentErrors) =>
      currentErrors.form || currentErrors.otherLanguage
        ? {
            form: undefined,
            otherLanguage: undefined,
          }
        : currentErrors,
    )
  }

  const updateOtherLanguage = (value: string) => {
    setOtherLanguage(value)

    if (!isBlank(value)) {
      setLanguagesErrors((currentErrors) =>
        currentErrors.otherLanguage
          ? {
              ...currentErrors,
              otherLanguage: undefined,
            }
          : currentErrors,
      )
    }
  }

  const selectedLanguageEntries = buildLanguageEntries(selectedLanguages, otherLanguage)

  return {
    uploadInputRef,
    activeView,
    selectedUploadFile,
    currentStepId,
    canViewCv,
    formValues,
    personalDetailsErrors,
    careerHistoryErrors,
    skillsErrors,
    educationErrors,
    languagesErrors,
    careerHistory,
    skills,
    tertiaryEducation,
    secondaryEducation,
    canGoNext,
    handleUploadFileSelect,
    openUploadPicker,
    openBuildFlow,
    openPreview,
    closePreview,
    handleTextFieldChange,
    handleSelectFieldChange,
    goBack,
    goNext,
    addPosition,
    updatePosition,
    addTask,
    updateTask,
    addProject,
    updateProject,
    addSkill,
    updateSkill,
    removeSkill,
    addTertiaryEntry,
    updateTertiaryEntry,
    removeTertiaryEntry,
    addSecondaryEntry,
    updateSecondaryEntry,
    removeSecondaryEntry,
    selectedLanguages,
    selectedLanguageEntries,
    otherLanguage,
    toggleLanguage,
    updateOtherLanguage,
  }
}

export default useCvBuilder
