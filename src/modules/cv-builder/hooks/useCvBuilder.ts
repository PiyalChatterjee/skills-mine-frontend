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
const FORM_FIELD_KEYS: (keyof PersonalDetailsFormState)[] = [
  'fullName',
  'residentialLocation',
  'currentCompany',
  'currentPosition',
  'noticePeriod',
]

const isBlank = (value: string) => value.trim().length === 0

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
    }

  const handleTextFieldChange = handleFormValueChange

  const handleSelectFieldChange = handleFormValueChange

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

  const canGoNext = activeView !== 'preview' && (activeView === 'review' || currentStepId <= LAST_STEP)

  const goNext = () => {
    if (activeView === 'preview') {
      return
    }

    if (activeView === 'review') {
      setActiveView('view-cv')
      return
    }

    if (activeView === 'view-cv') {
      setActiveView('launcher')
      setCurrentStepId(FIRST_STEP)
      return
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
  }

  const updatePosition = (
    entryId: string,
    field: keyof Omit<CareerHistoryEntry, 'id' | 'tasks' | 'projects'>,
    value: string | boolean,
  ) => {
    setCareerHistory((prev) =>
      prev.map((entry) => (entry.id === entryId ? { ...entry, [field]: value } : entry)),
    )
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
  }

  const updateSkill = (skillId: string, value: string) => {
    setSkills((prev) =>
      prev.map((skill) => (skill.id === skillId ? { ...skill, name: value } : skill)),
    )
  }

  const removeSkill = (skillId: string) => {
    setSkills((prev) => prev.filter((skill) => skill.id !== skillId))
  }

  // ─── Education ──────────────────────────────────────────────────────────────

  const addTertiaryEntry = () => {
    setTertiaryEducation((prev) => [...prev, createTertiaryEntry()])
  }

  const updateTertiaryEntry = (
    entryId: string,
    field: keyof Omit<TertiaryEducationEntry, 'id'>,
    value: string,
  ) => {
    setTertiaryEducation((prev) =>
      prev.map((entry) => (entry.id === entryId ? { ...entry, [field]: value } : entry)),
    )
  }

  const removeTertiaryEntry = (entryId: string) => {
    setTertiaryEducation((prev) => prev.filter((entry) => entry.id !== entryId))
  }

  const addSecondaryEntry = () => {
    setSecondaryEducation((prev) => [...prev, createSecondaryEntry()])
  }

  const updateSecondaryEntry = (
    entryId: string,
    field: keyof Omit<SecondaryEducationEntry, 'id'>,
    value: string,
  ) => {
    setSecondaryEducation((prev) =>
      prev.map((entry) => (entry.id === entryId ? { ...entry, [field]: value } : entry)),
    )
  }

  const removeSecondaryEntry = (entryId: string) => {
    setSecondaryEducation((prev) => prev.filter((entry) => entry.id !== entryId))
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
  }

  return {
    uploadInputRef,
    activeView,
    selectedUploadFile,
    currentStepId,
    formValues,
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
    toggleLanguage,
  }
}

export default useCvBuilder
