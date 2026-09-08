import { mandateApiClient } from "@/services/api/axios";
import { apiEndpoints } from "@/services/api/endpoints";
import type { Industry, SuccessEnvelope } from "@/types/api";

type IndustryItem = {
  industryId: string;
  industryName: string;
};

export const industryApi = {
  getIndustries() {
    return mandateApiClient
      .get<IndustryItem[]>(apiEndpoints.industries.list)
      .then((response): SuccessEnvelope<Industry[]> => ({
        success: true,
        statusCode: 200,
        message: "Industries retrieved.",
        data: response.data.map((industry) => ({
          industryId: industry.industryId,
          name: industry.industryName,
        })),
      }));
  },
};

// Resolves an industry display name to its backend id; falls back to the
// original name if no match is found so the caller still has a value to send.
export const resolveIndustryId = async (
  industryName?: string,
): Promise<string | undefined> => {
  if (!industryName) {
    return undefined;
  }

  const { data: industries } = await industryApi.getIndustries();
  const match = industries.find(
    (industry) => industry.name.toLowerCase() === industryName.toLowerCase(),
  );
  return match?.industryId ?? industryName;
};
