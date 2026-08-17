import { apiClient } from "@/services/api/axios";
import { apiEndpoints } from "@/services/api/endpoints";
import type { Industry, SuccessEnvelope } from "@/types/api";

export const industryApi = {
  getIndustries() {
    return apiClient
      .get<SuccessEnvelope<Industry[]>>(apiEndpoints.industries.list)
      .then((response) => response.data);
  },
};
