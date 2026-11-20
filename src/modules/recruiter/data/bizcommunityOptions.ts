/** Label -> BizCommunityAreaId integer from the API schema (South Africa, CountryId 196). */
export const BIZ_PROVINCE_IDS: Record<string, number> = {
  'Eastern Cape': 508,
  'Free State': 509,
  Gauteng: 510,
  'KwaZulu-Natal': 511,
  Mpumalanga: 512,
  'Northern Cape': 513,
  Limpopo: 514,
  'North West': 515,
  'Western Cape': 516,
  Countrywide: 999,
}

export const BIZ_PROVINCES = Object.keys(BIZ_PROVINCE_IDS)

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

/** Label -> BizCommunityTravelRequirement integer from the API schema. */
export const BIZ_TRAVEL_REQUIREMENT_IDS: Record<string, number> = {
  None: 1,
  Occasional: 2,
  Often: 3,
  International: 4,
}

export const BIZ_TRAVEL_REQUIREMENTS = Object.keys(BIZ_TRAVEL_REQUIREMENT_IDS)

/** Label -> BizCommunityRemunerationPackage integer from the API schema (5 is unused). */
export const BIZ_REMUNERATION_PACKAGE_IDS: Record<string, number> = {
  'Basic Salary': 1,
  'Cost To Company': 2,
  'Commission Only': 3,
  'Basic Plus Commission': 4,
  'Market Related': 6,
  'Negotiable Depending On Experience': 7,
  'To Be Discussed': 8,
  TCTC: 9,
}

export const BIZ_REMUNERATION_PACKAGES = Object.keys(BIZ_REMUNERATION_PACKAGE_IDS)

/** Label -> BizCommunityRemunerationBasis integer from the API schema. */
export const BIZ_REMUNERATION_BASIS_IDS: Record<string, number> = {
  'Per Month': 1,
  'Per Year': 2,
  'Per Hour': 3,
  'Per Week': 4,
  'Per Day': 5,
}

export const BIZ_REMUNERATION_BASES = Object.keys(BIZ_REMUNERATION_BASIS_IDS)

export const BIZ_EMPLOYMENT_TYPES = ['Permanent', 'Contract', 'Temporary']

/** Label -> BizCommunitySeniorityLevel integer from the API schema. */
export const BIZ_SENIORITY_LEVEL_IDS: Record<string, number> = {
  Student: 1,
  Junior: 2,
  'Junior Mid': 3,
  Mid: 4,
  Senior: 5,
  Management: 6,
  'Mid Senior': 7,
  Executive: 8,
}

export const BIZ_SENIORITY_LEVELS = Object.keys(BIZ_SENIORITY_LEVEL_IDS)

/** Label -> BizCommunityEducationLevel integer from the API schema. */
export const BIZ_EDUCATION_LEVEL_IDS: Record<string, number> = {
  None: 1,
  'High School': 2,
  Certificate: 3,
  Diploma: 4,
  Degree: 5,
  Honours: 6,
  Masters: 7,
  Doctorate: 8,
}

export const BIZ_EDUCATION_LEVELS = Object.keys(BIZ_EDUCATION_LEVEL_IDS)

/** Label -> BizCommunityEmploymentEquityPolicy integer from the API schema. */
export const BIZ_EMPLOYMENT_EQUITY_IDS: Record<string, number> = {
  None: 0,
  BEE: 1,
  Disabled: 2,
}

export const BIZ_EMPLOYMENT_EQUITY = Object.keys(BIZ_EMPLOYMENT_EQUITY_IDS)
