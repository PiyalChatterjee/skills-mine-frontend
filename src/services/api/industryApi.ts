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
