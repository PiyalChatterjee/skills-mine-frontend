import { apiClient } from "@/services/api/axios";
import { apiEndpoints } from "@/services/api/endpoints";
import type {
  CandidateListData,
  CandidateListItem,
  CandidateListParams,
  SuccessEnvelope,
} from "@/types/api";

type CandidateRow = {
  applicationId: string | null;
  candidateId: string;
  fullName: string;
  title: string;
  companyName: string;
  locationText: string;
  matchPercentage: number | null;
  status: string | null;
  jobProfileId: string | null;
};

type CandidatePage = {
  data: CandidateRow[];
  total: number;
  page: number;
  size: number;
};

const toCandidateListItem = (candidate: CandidateRow): CandidateListItem => ({
  candidateId: candidate.candidateId,
  fullName: candidate.fullName,
  email: "",
  phone: "",
  location: candidate.locationText,
  currentTitle: candidate.title,
  currentCompany: candidate.companyName,
  experienceYears: 0,
  skills: [],
  education: [],
  experience: [],
  documents: [],
  languages: [],
  profileComplete: 0,
  applications: candidate.applicationId ? [candidate.applicationId] : [],
});

export const recruiterCandidatesApi = {
  listCandidates(
    params?: CandidateListParams,
  ): Promise<SuccessEnvelope<CandidateListData>> {
    const page = Math.max(0, (params?.page ?? 1) - 1);
    const size = params?.limit ?? 100;
    return apiClient
      .get<CandidatePage>(apiEndpoints.candidates.list, {
        params: {
          page,
          size,
          search: params?.search,
          locationText: params?.location,
        },
      })
      .then((response): SuccessEnvelope<CandidateListData> => ({
        success: true,
        statusCode: 200,
        message: "Candidates retrieved.",
        data: {
          candidates: response.data.data.map(toCandidateListItem),
          pagination: {
            page: response.data.page + 1,
            pageSize: response.data.size,
            total: response.data.total,
            totalPages: Math.ceil(response.data.total / response.data.size),
          },
        },
      }));
  },
};
