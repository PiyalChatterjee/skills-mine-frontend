import { z } from "zod";
import { emailSchema } from "@/app/validation.schema";
import type { CandidateProfile } from "@/store/slices/candidateProfileSlice";

const requiredField = (label: string) =>
  z.string().trim().min(1, `${label} is required`);

export const profileFormSchema = z.object({
  fullName: requiredField("Full name"),
  email: emailSchema,
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number"),
  residentialLocation: requiredField("Residential location"),
  preferredJobTitle: z.string(),
  targetedIndustries: z.string(),
  preferredLocations: requiredField("Preferred location"),
  employmentType: z.string(),
  availability: z.string(),
  certifications: z.array(
    z.object({
      value: z.string().trim(),
    }),
  ),
  highestDegreeEarned: requiredField("Highest degree earned"),
  currentJobTitle: z.string(),
  currentEmployer: z.string(),
  totalYearsOfExperience: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d+(\.\d+)?$/.test(value), {
      message: "Use a valid number of years",
    }),
  password: z.string(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const PROFILE_SELECT_OPTIONS = {
  residentialLocation: [
    "Johannesburg, Gauteng",
    "Cape Town, Western Cape",
    "Durban, KwaZulu-Natal",
  ],
  targetedIndustries: [
    "Technology",
    "Banking",
    "Consulting",
    "Digital Marketing",
  ],
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

export const getCandidateProfileUpdatePayload = (
  values: ProfileFormValues,
  currentProfile: CandidateProfile | null,
): Omit<CandidateProfile, "candidateId"> => {
  const trimmedCurrentTitle = values.currentJobTitle.trim();
  const trimmedPreferredTitle = values.preferredJobTitle.trim();
  const experienceText = values.totalYearsOfExperience.trim();

  const existingEducation = currentProfile?.education ?? [];
  const firstEducation = existingEducation[0];
  const nextEducation: CandidateProfile["education"] = [
    {
      institution: firstEducation?.institution ?? "Not specified",
      qualification: values.highestDegreeEarned.trim(),
      year: firstEducation?.year ?? new Date().getFullYear(),
    },
    ...existingEducation.slice(1),
  ];

  return {
    fullName: values.fullName.trim(),
    email: values.email.trim(),
    phone: values.phoneNumber.trim(),
    profilePhotoUrl: currentProfile?.profilePhotoUrl,
    password: values.password || currentProfile?.password,
    location: values.residentialLocation.trim(),
    currentTitle: trimmedCurrentTitle || trimmedPreferredTitle,
    currentCompany: values.currentEmployer.trim(),
    experienceYears:
      experienceText === ""
        ? currentProfile?.experienceYears ?? 0
        : Number(experienceText),
    skills: currentProfile?.skills ?? [],
    education: nextEducation,
  };
};
