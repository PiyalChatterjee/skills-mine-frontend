export interface MandateFormValues {
  companyName: string
  clientRate: string
  contactPerson: string
  contactPersonEmail: string
  contactPersonPhone: string
  positionTitle: string
  location: string
  locationId: string
  fillByDate: string
  workType: string
  employmentType: string
  experienceLevel: string
  priority: string
  salaryMin: number | ''
  salaryMax: number | ''
  isSalaryHidden: boolean
  jobDescription: string
  requirements: string
  responsibilities: string
  benefits: string
  skills: string[]
  industries: string[]
  jobBoards: string[]
}
