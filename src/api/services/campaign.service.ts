import AxiosRequest from '@/utils/axiosHelper';
import { CREATE_CAMPAIGN_URL, GET_CAMPAIGN_BY_ID_URL, GET_CAMPAIGNS_URL , DELETE_CAMPAIGN_URL , UPDATE_CAMPAIGN_URL, LOG_CAMPAIGN_PERFORMANCE_URL, LOG_CAMPAIGN_PERFORMANCE_HISTORY_URL, DELETE_CAMPAIGN_PERFORMANCE_HISTORY_URL, GET_CAMPAIGN_ACTIVITY_URL} from '@/api/endpoints';

export interface CreateCampaignPayload {
  campaign_name: string;
  client_id: string;
  assigned_to: string;
  ads_platform: string[];
  objective: string;
  daily_budget: number;
  campaign_run_location?: string;
  target_audience?: string;
  media_location?: string;
  deadline_date: string;
  notes?: string;
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
  search?: string;
  status?: string;
  stage?: string;
  priority?: string;
}

export interface CampaignData {
  id: string;
  campaignName: string;
  clientId: string;
  assignedTo: string;
  adsPlatform: string[];
  objective: string;
  dailyBudget: string;
  campaignRunLocation: string;
  targetAudience: string;
  mediaLocation: string;
  deadlineDate: string;
  notes: string;
  priorityLevel: string;
  status: string;
  stage: string;
  createdAt?: string;
  updatedAt?: string;
  client?: {
    id: string;
    brandName: string;
    clientName: string;
  };
  assignee?: {
    id: string;
    fullName: string;
    role: string;
  };
  performance?: {
    total_ads_spend: number;
    total_ads_leads: number;
    latest_ads_roas: number;
  };
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
  status?: 'active' | 'draft' | 'pause' | 'completed' | 'archived';
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

export interface LogPerformancePayload {
  ads_spend: number;
  ads_leads: number;
  ads_roas: number;
}

export interface LogPerformanceResponse {
  success: boolean;
  code: number;
  message: string;
  results?: any;
}

export interface PerformanceHistoryItem {
  id: string;
  performance_date: string;
  ads_spend: number;
  ads_leads: number;
  ads_roas: number;
  created_at: string;
}

export interface GetPerformanceHistoryResponse {
  success: boolean;
  code: number;
  message: string;
  results: {
    summary: {
      total_ads_spend: number;
      total_ads_leads: number;
      latest_ads_roas: number;
    };
    history: PerformanceHistoryItem[];
  };
}

export interface DeletePerformanceHistoryResponse {
  success: boolean;
  code: number;
  message: string;
  results?: any;
}

export interface CampaignActivityItem {
  id: string;
  campaignId: string;
  campaignName: string;
  activity: {
    type: string;
    message: string;
    updatedFieldsCount: number;
    updatedFields: Array<{
      fieldName: string;
      oldValue: any;
      newValue: any;
    }>;
  };
  actionBy: {
    id: string;
    name: string;
    role: string;
  };
  timestamps: {
    createdAt: string;
    updatedAt: string;
  };
}

export interface GetCampaignActivityResponse {
  success: boolean;
  code: number;
  message: string;
  results: {
    data: CampaignActivityItem[];
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
    const response = await AxiosRequest.delete(DELETE_CAMPAIGN_URL.replace(':id', campaignId));
    return response;
  },
  updateCampaign: async (campaignId: string, payload: UpdateCampaignPayload): Promise<UpdateCampaignResponse> => {
    const response = await AxiosRequest.put(UPDATE_CAMPAIGN_URL.replace(':id', campaignId), payload);
    return response;
  },
  getCampaignById: async (campaignId: string) => {
    const response = await AxiosRequest.get(GET_CAMPAIGN_BY_ID_URL.replace(':id', campaignId));
    return response;
  },
  logPerformance: async (campaignId: string, payload: LogPerformancePayload): Promise<LogPerformanceResponse> => {
    const response = await AxiosRequest.post(LOG_CAMPAIGN_PERFORMANCE_URL.replace(':id', campaignId), payload);
    return response;
  },
  getPerformanceHistory: async (campaignId: string): Promise<GetPerformanceHistoryResponse> => {
    const response = await AxiosRequest.get(LOG_CAMPAIGN_PERFORMANCE_HISTORY_URL.replace(':id', campaignId));
    return response;
  },
  deletePerformanceHistory: async (historyId: string): Promise<DeletePerformanceHistoryResponse> => {
    const response = await AxiosRequest.delete(DELETE_CAMPAIGN_PERFORMANCE_HISTORY_URL.replace(':id', historyId));
    return response;
  },
  getCampaignActivity: async (): Promise<GetCampaignActivityResponse> => {
    const response = await AxiosRequest.get(GET_CAMPAIGN_ACTIVITY_URL);
    return response;
  },

};
