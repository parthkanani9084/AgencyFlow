import AxiosRequest from '@/utils/axiosHelper';

export interface CreateTeamPayload {
  full_name: string;
  email: string;
  role: string;
}

export interface CreateTeamResponse {
  success: boolean;
  code: number;
  message: string;
  results?: any;
}

export const teamService = {
  createTeam: async (payload: CreateTeamPayload): Promise<CreateTeamResponse> => {
    const response = await AxiosRequest.post('/owner/team', payload);
    return response;
  },
};
