import { mandateApiClient } from "@/services/api/axios";
import { apiEndpoints } from "@/services/api/endpoints";

export const locationApi = {
  getLocations() {
    return mandateApiClient
      .get<string[]>(apiEndpoints.locations.list)
      .then((response) => response.data);
  },
};
