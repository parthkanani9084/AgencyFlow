import AxiosRequest from '@/utils/axiosHelper';
import { CREATE_CAMPAIGN_URL, GET_CAMPAIGN_BY_ID_URL, GET_CAMPAIGNS_URL , DELETE_CAMPAIGN_URL , UPDATE_CAMPAIGN_URL} from '@/lib/endpoints';

export interface CreateCampaignPayload {
  campaign_name: string;
  client_id: string;
  assigned_to: string;
  ads_platform: string[];
  objective: string;
  daily_budget: number;
  campaign_run_location: string;
  target_audience: string;
  media_location: string;
  deadline_date: string;
  notes: string;
  priority_level: string;
}

export interface CreateCampaignResponse {
  success: boolean;
  code: number;
  message: string;
  results?: any;
}

export interface GetCampaignsParams {
  page: number;
  limit: number;
}

export interface CampaignData {
  id: string;
  campaign_name: string;
  client_id: string;
  assigned_to: string;
  ads_platform: string[];
  objective: string;
  daily_budget: number;
  campaign_run_location: string;
  target_audience: string;
  media_location: string;
  deadline_date: string;
  notes: string;
  priority_level: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateCampaignPayload {
  campaign_name?: string;
  client_id?: string;
  assigned_to?: string;
  ads_platform?: string[];
  objective?: string;
  daily_budget?: number;
  campaign_run_location?: string;
  target_audience?: string;
  media_location?: string;
  deadline_date?: string;
  notes?: string;
  priority_level?: string;
  status?: 'active' | 'draft' | 'paused' | 'completed' | 'archived';
  stage?: 'in-draft' | 'in-review' | 'process' | 'publish';
}

export interface GetCampaignsResponse {
  success: boolean;
  code: number;
  message: string;
  results: {
    data: CampaignData[];
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

export interface DeleteCampaignResponse {
  success: boolean;
  code: number;
  message: string;
  results?: any;
}
export interface UpdateCampaignResponse {
  success: boolean;
  code: number;
  message: string;
  results?: any;
}
export const campaignService = {
  createCampaign: async (
    payload: CreateCampaignPayload
  ): Promise<CreateCampaignResponse> => {
    const response = await AxiosRequest.post(CREATE_CAMPAIGN_URL, payload);
    return response;
  },

  getCampaigns: async (
    params: GetCampaignsParams
  ): Promise<GetCampaignsResponse> => {
    const response = await AxiosRequest.get(GET_CAMPAIGNS_URL, params);
    return response;
  },
   deleteCampaign: async (campaignId: string): Promise<DeleteCampaignResponse> => {
  const response = await AxiosRequest.delete(`${DELETE_CAMPAIGN_URL}/${campaignId}`);
  return response;
},
  updateCampaign: async (campaignId: string, payload: UpdateCampaignPayload): Promise<UpdateCampaignResponse> => {
    const response = await AxiosRequest.patch(`${UPDATE_CAMPAIGN_URL}/${campaignId}`, payload);
    return response;
  },
    getCampaignById: async (campaignId: string) => {
    const response = await AxiosRequest.get(GET_CAMPAIGN_BY_ID_URL.replace(':id', campaignId));
    return response.data;
  },

};
