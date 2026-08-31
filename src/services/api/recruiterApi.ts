import { apiClient, unwrapResponseData } from "@/services/api/axios";
import { apiEndpoints } from "@/services/api/endpoints";

interface TourStatusResponse {
  success: boolean;
  statusCode: number;
  data: { tourSeen: boolean };
}

export const recruiterApi = {
  /** Returns whether the currently logged-in recruiter has already seen the onboarding tour. */
  async getTourStatus(): Promise<boolean> {
    const response = await unwrapResponseData(
      apiClient.get<TourStatusResponse>(apiEndpoints.recruiter.tourStatus),
    );
    return (response as TourStatusResponse).data?.tourSeen ?? false;
  },

  /** Persists that the recruiter has seen the tour so it won't show again. */
  async markTourSeen(): Promise<void> {
    await apiClient.patch(apiEndpoints.recruiter.tourStatus, {
      tourSeen: true,
    });
  },
};
