import AxiosRequest from '@/utils/axiosHelper';
import { CREATE_REEL_URL } from '@/api/endpoints';

export interface CreateReelPayload {
  title: string;
  client_id: string;
  publish_date: string;
}

export interface CreateReelResponse {
  success: boolean;
  code: number;
  message: string;
  results?: any;
}

export const reelService = {
  createReel: async (payload: CreateReelPayload): Promise<CreateReelResponse> => {
    const response = await AxiosRequest.post(CREATE_REEL_URL, payload);
    return response;
  },
  getReels: async (params?: any): Promise<any> => {
    const response = await AxiosRequest.get(CREATE_REEL_URL, params);
    return response;
  },
  updateReelStatus: async (id: string, status: string): Promise<any> => {
    const response = await AxiosRequest.patch(`${CREATE_REEL_URL}/${id}/status`, { status });
    return response;
  },
};
