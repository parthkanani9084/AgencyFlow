import AxiosRequest from '@/utils/axiosHelper';
import { CLIENT_CREATE_URL, CLIENT_LIST_URL } from '@/lib/endpoints';
const CLIENT_UPDATE_URL = (id: string) => `/owner/client/${id}`;

export interface CreateClientPayload {
  client_name: string;
  brand_name: string;
  email: string;
  service_required: string[];
  package_amount: number;
  per_day_spend_amount: number;
  plan_type: string;
  reels_per_month: number;
  platform_type: 'online' | 'offline';
  weblink?: string;
  file_location?: string;
}

export interface CreateClientResponse {
  success: boolean;
  code: number;
  message: string;
  results?: any;
}

export interface UpdateClientPayload {
  client_name?: string;
  brand_name?: string;
  email?: string;
  service_required?: string[];
  package_amount?: number;
  per_day_spend_amount?: number;
}

export interface UpdateClientResponse {
  success: boolean;
  code: number;
  message: string;
  results?: any;
}

export interface GetClientsParams {
  page: number;
  limit: number;
}

export interface ClientData {
  id: string;
  ownerId: string;
  clientName: string;
  brandName: string;
  email: string;
  serviceRequired: string[];
  packageAmount: string | number;
  perDaySpendAmount: string | number;
  planType: string;
  reelsPerMonth: number;
  platformType: string;
  weblink: string | null;
  fileLocation: string | null;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetClientsResponse {
  success: boolean;
  code: number;
  message: string;
  results: {
    data: ClientData[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItem: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export const clientService = {
  createClient: async (payload: CreateClientPayload): Promise<CreateClientResponse> => {
    const response = await AxiosRequest.post(CLIENT_CREATE_URL, payload);
    return response;
  },
  getClients: async (params: GetClientsParams): Promise<GetClientsResponse> => {
    const response = await AxiosRequest.get(CLIENT_LIST_URL, params);
    return response;
  },
  updateClient: async (clientId: string, payload: UpdateClientPayload): Promise<UpdateClientResponse> => {
    const response = await AxiosRequest.put(CLIENT_UPDATE_URL(clientId), payload);
    return response;
  },
  deleteClient: async (clientId: string): Promise<any> => {
    const response = await AxiosRequest.delete(CLIENT_UPDATE_URL(clientId));
    return response;
  },
};
