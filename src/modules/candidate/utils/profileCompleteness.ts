import type { CandidateProfile } from "@/types/api";
import { profileCreationSchema } from "@/modules/candidate/schemas/profileCreationSchema";
import { getProfileCreationDefaultValues } from "@/modules/candidate/types/profileCreation";

export const isCandidateProfileCompleteForOnboarding = (
  profile: CandidateProfile,
): boolean => {
  const candidateValues = getProfileCreationDefaultValues(profile);
  return profileCreationSchema.safeParse(candidateValues).success;
};
