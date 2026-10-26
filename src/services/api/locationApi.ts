import { mandateApiClient } from "@/services/api/axios";
import { apiEndpoints } from "@/services/api/endpoints";

export type MasterLocationType = "CITY" | "COUNTRY" | "WORK_OPTION";

export type MasterLocation = {
  locationId: string;
  name: string;
  type: MasterLocationType;
  province?: string | null;
  country?: string | null;
};

/** Raw item shape returned by GET /locations/master */
type MasterLocationDto = {
  locationId: string;
  locationType: MasterLocationType;
  locationName: string;
  provinceName: string | null;
  countryName: string | null;
};

export const locationApi = {
  getLocations() {
    return mandateApiClient
      .get<string[]>(apiEndpoints.locations.list)
      .then((response) => response.data);
  },

  getMasterLocations() {
    return mandateApiClient
      .get<MasterLocationDto[]>(apiEndpoints.locations.master)
      .then((response) =>
        response.data.map((item): MasterLocation => ({
          locationId: item.locationId,
          name: item.locationName,
          type: item.locationType,
          province: item.provinceName,
          country: item.countryName,
        })),
      );
  },
};
