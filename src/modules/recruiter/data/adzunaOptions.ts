export const ADZUNA_CATEGORIES = [
  'Accounting & Finance / Banking',
  'IT & Software',
  'Engineering',
  'Sales & Marketing',
  'Human Resources',
  'Healthcare',
]

export const ADZUNA_WORK_FIELDS = [
  'Commercial Banking',
  'Retail Banking',
  'Investment Banking',
  'Insurance',
  'Corporate Finance',
]

export const ADZUNA_CONTRACT_TYPES = ['Permanent', 'Contract', 'Temporary', 'Internship']

export const ADZUNA_EMPLOYMENT_TYPES = ['Full Time', 'Part Time', 'Casual']

export const ADZUNA_SENIORITY_LEVELS = ['Entry level', 'Mid level', 'Mid-Senior level', 'Senior', 'Executive']

export const ADZUNA_WORKING_MODELS = ['On-site', 'Hybrid', 'Remote']

export const ADZUNA_SALARY_FREQUENCIES = ['Per Hour', 'Per Day', 'Per Week', 'Per Month', 'Per Year']

export type AdzunaSalaryDisplay = 'exact' | 'market' | 'hide'

export const ADZUNA_SALARY_DISPLAY_OPTIONS: { value: AdzunaSalaryDisplay; label: string }[] = [
  { value: 'exact', label: 'Display Exact Range' },
  { value: 'market', label: 'Display Market Benchmark' },
  { value: 'hide', label: 'Hide Salary' },
]
