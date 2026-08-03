import { type ChangeEvent, useRef, useState } from 'react'
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

const useCvBuilder = () => {
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

  const handleTextFieldChange =
    (field: keyof PersonalDetailsFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((currentValues) => ({
        ...currentValues,
        [field]: event.target.value,
      }))
    }

  const handleSelectFieldChange =
    (field: keyof PersonalDetailsFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((currentValues) => ({
        ...currentValues,
        [field]: event.target.value,
      }))
    }

  const goBack = () => {
    if (currentStepId > FIRST_STEP) {
      setCurrentStepId((prevStepId) => prevStepId - 1)
      return
    }

    setActiveView('launcher')
  }

  const canGoNext = currentStepId < CV_BUILDER_STEPS.length

  const goNext = () => {
    if (!canGoNext) {
      return
    }

    setCurrentStepId((prevStepId) => prevStepId + 1)
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
