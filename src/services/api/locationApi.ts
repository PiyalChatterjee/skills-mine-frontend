import { apiClient } from "@/services/api/axios";
import { apiEndpoints } from "@/services/api/endpoints";

export const locationApi = {
  getLocations() {
    return apiClient
      .get<string[]>(apiEndpoints.locations.list)
      .then((response) => response.data);
  },
};
