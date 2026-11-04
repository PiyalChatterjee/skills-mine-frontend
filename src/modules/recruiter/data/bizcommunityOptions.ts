export const BIZ_PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
  'Western Cape',
]

/** Best-effort lookup used to pre-select a province from the job's city. */
export const BIZ_CITY_PROVINCE: Record<string, string> = {
  Johannesburg: 'Gauteng',
  Pretoria: 'Gauteng',
  'Cape Town': 'Western Cape',
  Durban: 'KwaZulu-Natal',
  'Port Elizabeth': 'Eastern Cape',
  Gqeberha: 'Eastern Cape',
  Bloemfontein: 'Free State',
}

export const BIZ_INDUSTRIES = [
  'Facilities Services',
  'Banking & Finance',
  'Information Technology',
  'Engineering',
  'Retail',
  'Manufacturing',
]

export const BIZ_CATEGORIES = ['Sales', 'Management', 'Operations', 'Administration', 'Technical']

export const BIZ_TRAVEL_REQUIREMENTS = ['None', 'Occasional', 'Frequent', 'Extensive']

export const BIZ_REMUNERATION_PACKAGES = ['Basic', 'Basic + Commission', 'Cost to Company', 'Hourly']

export const BIZ_REMUNERATION_BASES = ['Per Hour', 'Per Day', 'Per Week', 'Per Month', 'Per Year']

export const BIZ_BENEFITS = ['Medical Aid', 'Pension Fund', 'Car Allowance', 'Cell Phone Allowance', 'Bonus']

export const BIZ_EMPLOYMENT_TYPES = ['Permanent', 'Contract', 'Temporary', 'Part Time', 'Internship']

export const BIZ_SENIORITY_LEVELS = ['Entry level', 'Junior', 'Intermediate', 'Senior', 'Management', 'Executive']

export const BIZ_EDUCATION_LEVELS = ['Matric', 'Diploma', 'Degree', 'Honours', 'Masters', 'Doctorate']

export const BIZ_EMPLOYMENT_EQUITY = ['African', 'Coloured', 'Indian', 'White', 'Not specified']
