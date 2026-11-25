import { crmApiClient } from "@/services/api/axios";
import { apiEndpoints, resolveEndpoint } from "@/services/api/endpoints";
import type {
  AddCrmNoteData,
  AddCrmNoteRequest,
  CreateCrmEmployerRequest,
  CrmClientsParams,
  CrmClientsData,
  CrmEmployerDetail,
} from "@/types/api";

export const crmApi = {
  listClients(params: CrmClientsParams = {}) {
    return crmApiClient
      .get<CrmClientsData>(apiEndpoints.crm.clients, { params })
      .then((response) => response.data);
  },

  addClientNote(clientId: string, payload: AddCrmNoteRequest) {
    return crmApiClient
      .post<AddCrmNoteData>(
        resolveEndpoint(apiEndpoints.crm.clientNotes, { clientId }), payload,
      )
      .then((response) => response.data);
  },

  createEmployer(payload: CreateCrmEmployerRequest) {
    return crmApiClient
      .post<AddCrmNoteData>(apiEndpoints.crm.employer, payload)
      .then((response) => response.data);
  },

  getEmployerByName(name: string) {
    return crmApiClient
      .get<CrmEmployerDetail>(
        resolveEndpoint(apiEndpoints.crm.employerByName, { name }),
      )
      .then((response) => response.data);
  },
};
