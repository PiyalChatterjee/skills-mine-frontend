import { type ChangeEvent, useRef, useState } from 'react'
import {
  CV_BUILDER_STEPS,
  PERSONAL_DETAILS_INITIAL_VALUES,
  type PersonalDetailsFormState,
  type CvBuilderView,
} from '../types/cvBuilder'

const FIRST_STEP = 1

const useCvBuilder = () => {
  const uploadInputRef = useRef<HTMLInputElement | null>(null)

  const [activeView, setActiveView] = useState<CvBuilderView>('launcher')
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null)
  const [currentStepId, setCurrentStepId] = useState<number>(FIRST_STEP)
  const [formValues, setFormValues] = useState<PersonalDetailsFormState>(PERSONAL_DETAILS_INITIAL_VALUES)

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

  return {
    uploadInputRef,
    activeView,
    selectedUploadFile,
    currentStepId,
    formValues,
    canGoNext,
    handleUploadFileSelect,
    openUploadPicker,
    openBuildFlow,
    handleTextFieldChange,
    handleSelectFieldChange,
    goBack,
    goNext,
  }
}

export default useCvBuilder
