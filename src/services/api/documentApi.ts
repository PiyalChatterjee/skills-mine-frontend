import { documentApiClient, unwrapResponseData } from "@/services/api/axios";
import { apiEndpoints } from "@/services/api/endpoints";
import type { ResumeParseResponse, AiSubjectType } from "@/types";

type UploadResumeOptions = {
  ownerType: AiSubjectType;
  ownerId?: string;
  title?: string;
};

export const documentApi = {
  /**
   * Upload a resume file and extract structured profile data.
   * The document service internally calls the AI service to parse the resume.
   *
   * @param file - The resume file (PDF, DOC, DOCX)
   * @param fileName - The name of the file
   * @param options - Configuration options (ownerType is required, ownerId/title optional)
   * @returns Parsed resume data
   */
  async uploadAndParseResume(
    file: Blob,
    fileName: string,
    options: UploadResumeOptions,
  ): Promise<ResumeParseResponse> {
    const { ownerType, ownerId, title } = options;
    const formData = new FormData();
    formData.append("file", file, fileName);
    formData.append("owner_type", ownerType);

    if (ownerId) {
      formData.append("owner_id", ownerId);
    }

    if (title) {
      formData.append("title", title);
    }

    const raw = await unwrapResponseData(
      documentApiClient.post<Record<string, any>>(
        apiEndpoints.documents.uploadResume,
        formData,
        { skipUnauthorizedRedirect: true },
      ),
    );

    // Map the response from document service to ResumeParseResponse format
    return {
      visitor_id: raw.visitor_id,
      personal_details: raw.personal_details,
      career_history: raw.career_history,
      education: raw.education,
      job_preferences: raw.job_preferences,
    };
  },
};
