export const ADZUNA_CATEGORIES = [
  { id: 1, label: 'Accounting & Finance Jobs' },
  { id: 2, label: 'IT Jobs' },
  { id: 3, label: 'Sales Jobs' },
  { id: 4, label: 'Customer Services Jobs' },
  { id: 5, label: 'Engineering Jobs' },
  { id: 6, label: 'HR & Recruitment Jobs' },
  { id: 7, label: 'Healthcare & Nursing Jobs' },
  { id: 8, label: 'Hospitality & Catering Jobs' },
  { id: 9, label: 'PR, Advertising & Marketing Jobs' },
  { id: 10, label: 'Logistics & Warehouse Jobs' },
  { id: 11, label: 'Teaching Jobs' },
  { id: 12, label: 'Trade & Construction Jobs' },
  { id: 13, label: 'Admin Jobs' },
  { id: 14, label: 'Legal Jobs' },
  { id: 15, label: 'Creative & Design Jobs' },
  { id: 16, label: 'Graduate Jobs' },
  { id: 17, label: 'Retail Jobs' },
  { id: 18, label: 'Consultancy Jobs' },
  { id: 19, label: 'Manufacturing Jobs' },
  { id: 20, label: 'Scientific & QA Jobs' },
  { id: 21, label: 'Social work Jobs' },
  { id: 22, label: 'Travel Jobs' },
  { id: 23, label: 'Energy, Oil & Gas Jobs' },
  { id: 24, label: 'Property Jobs' },
  { id: 25, label: 'Charity & Voluntary Jobs' },
  { id: 26, label: 'Domestic help & Cleaning Jobs' },
  { id: 27, label: 'Maintenance Jobs' },
  { id: 28, label: 'Part time Jobs' },
  { id: 29, label: 'Other/General Jobs' },
] as const

export const ADZUNA_CONTRACT_TYPES = ['Permanent', 'Contract', 'Temporary', 'Internship']

export const ADZUNA_EMPLOYMENT_TYPES = ['Full Time', 'Part Time', 'Casual']

export const ADZUNA_SENIORITY_LEVELS = ['Entry level', 'Mid level', 'Mid-Senior level', 'Senior', 'Executive']

export const ADZUNA_WORKING_MODELS = ['On-site', 'Hybrid', 'Remote']

export const ADZUNA_SALARY_FREQUENCIES = ['Per Hour', 'Per Day', 'Per Month', 'Per Year']

export type AdzunaSalaryDisplay = 'exact' | 'market' | 'hide'

export const ADZUNA_SALARY_DISPLAY_OPTIONS: { value: AdzunaSalaryDisplay; label: string }[] = [
  { value: 'exact', label: 'Display Exact Range' },
  { value: 'market', label: 'Display Market Benchmark' },
  { value: 'hide', label: 'Hide Salary' },
]
