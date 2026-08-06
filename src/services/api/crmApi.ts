import { apiClient } from '@/services/api/axios'
import { apiEndpoints, resolveEndpoint } from '@/services/api/endpoints'
import type {
  AddCrmNoteData,
  AddCrmNoteRequest,
  CrmClientsData,
  SuccessEnvelope,
} from '@/types/api'

export const crmApi = {
  listClients(params?: { status?: string; page?: number; limit?: number }) {
    const status = params?.status
    const requestParams = {
      ...(status ? { [apiEndpoints.crm.statusParam]: status } : {}),
      ...(typeof params?.page === 'number' ? { page: params.page } : {}),
      ...(typeof params?.limit === 'number' ? { limit: params.limit } : {}),
    }

    return apiClient
      .get<SuccessEnvelope<CrmClientsData>>(apiEndpoints.crm.clients, { params: requestParams })
      .then((response) => response.data)
  },

  addClientNote(clientId: string, payload: AddCrmNoteRequest) {
    return apiClient
      .post<SuccessEnvelope<AddCrmNoteData>>(
        resolveEndpoint(apiEndpoints.crm.clientNotes, { clientId }),
        payload,
      )
      .then((response) => response.data)
  },
}
