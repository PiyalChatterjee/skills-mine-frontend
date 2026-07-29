export interface Job {
  jobId: string
  title: string
  company: string
  location: string
  industry: string
  employmentType: string
  workType: string
  salaryMin: number
  salaryMax: number
  salaryRange: string
  description: string
  requirements: string[]
  responsibilities: string[]
  skills: string[]
  postedDate: string
  status: string
  applicationCount: number
  recruiterId: string
}

export interface JobsResponse {
  jobs: Job[]
  total: number
  page: number
  pageSize: number
}
