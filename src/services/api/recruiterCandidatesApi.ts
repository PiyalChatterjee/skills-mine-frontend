import { apiClient } from "@/services/api/axios";
import { apiEndpoints } from "@/services/api/endpoints";
import type {
  CandidateListData,
  CandidateListParams,
  SuccessEnvelope,
} from "@/types/api";

export const recruiterCandidatesApi = {
  listCandidates(
    params?: CandidateListParams,
  ): Promise<SuccessEnvelope<CandidateListData>> {
    return apiClient
      .get<SuccessEnvelope<CandidateListData>>(apiEndpoints.candidates.list, {
        params: params ?? undefined,
      })
      .then((response) => response.data);
  },
};
