import { aiApiClient, unwrapResponseData } from "@/services/api/axios";
import { apiEndpoints, resolveEndpoint } from "@/services/api/endpoints";
import type {
  AiActionsResponse,
  CandidateSkillGenerationResponse,
  GenerateCandidateSkillsRequest,
  GenerateJobSkillsRequest,
  JobSkillGenerationResponse,
  ResumeParseRequest,
  ResumeParseResponse,
} from "@/types";

export const aiApi = {
  parseResume(payload: ResumeParseRequest): Promise<ResumeParseResponse> {
    return unwrapResponseData(
      aiApiClient.post<ResumeParseResponse>(
        apiEndpoints.ai.parseResume,
        payload,
        { skipUnauthorizedRedirect: true },
      ),
    );
  },

  generateCandidateSkills(
    payload: GenerateCandidateSkillsRequest,
  ): Promise<CandidateSkillGenerationResponse> {
    return unwrapResponseData(
      aiApiClient.post<CandidateSkillGenerationResponse>(
        apiEndpoints.ai.generateSkills,
        payload,
        { skipUnauthorizedRedirect: true },
      ),
    );
  },

  generateJobSkills(
    payload: GenerateJobSkillsRequest,
  ): Promise<JobSkillGenerationResponse> {
    return unwrapResponseData(
      aiApiClient.post<JobSkillGenerationResponse>(
        apiEndpoints.ai.generateJobSkills,
        payload,
      ),
    );
  },

  getCandidateAiActions(candidateId: string): Promise<AiActionsResponse> {
    return unwrapResponseData(
      aiApiClient.get<AiActionsResponse>(
        resolveEndpoint(apiEndpoints.ai.candidateActions, { candidateId }),
      ),
    );
  },
};