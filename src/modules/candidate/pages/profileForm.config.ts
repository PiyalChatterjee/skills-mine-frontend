import type { CandidateProfile } from "@/store/slices/candidateProfileSlice";

export type ProfileFormValues = {
  fullName: string;
  email: string;
  phoneNumber: string;
  residentialLocation: string;
  preferredJobTitle: string;
  targetedIndustries: string;
  preferredLocations: string;
  employmentType: string;
  availability: string;
  certifications: { value: string }[];
  highestDegreeEarned: string;
  currentJobTitle: string;
  currentEmployer: string;
  totalYearsOfExperience: string;
  password: string;
};

export const PROFILE_SELECT_OPTIONS = {
  residentialLocation: ["Johannesburg, Gauteng", "Cape Town, Western Cape", "Durban, KwaZulu-Natal"],
  targetedIndustries: ["Technology", "Banking", "Consulting", "Digital Marketing"],
  preferredLocations: ["Hybrid", "Remote", "On-site"],
  employmentType: ["Full time", "Part time", "Contract"],
  availability: ["Immediately", "2 weeks", "1 month"],
} as const;

export const getProfileFormValues = (
  profile: CandidateProfile | null,
): ProfileFormValues => {
  const firstQualification = profile?.education?.[0]?.qualification ?? "";

  return {
    fullName: profile?.fullName ?? "",
    email: profile?.email ?? "",
    phoneNumber: profile?.phone ?? "",
    residentialLocation: profile?.location ?? "",
    preferredJobTitle: profile?.currentTitle ?? "",
    targetedIndustries: "",
    preferredLocations: profile?.location ?? "",
    employmentType: "",
    availability: "",
    certifications: [{ value: "" }],
    highestDegreeEarned: firstQualification,
    currentJobTitle: profile?.currentTitle ?? "",
    currentEmployer: profile?.currentCompany ?? "",
    totalYearsOfExperience:
      profile?.experienceYears != null ? String(profile.experienceYears) : "",
    password: profile?.password ?? "",
  };
};
