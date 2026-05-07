import AxiosRequest from '@/utils/axiosHelper';
import { CREATE_TEAM_URL, GET_TEAM_ROLE_URL, GET_TEAMS_URL } from '@/lib/endpoints';

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
    const response = await AxiosRequest.post(CREATE_TEAM_URL, payload);
    return response;
  },
  getTeamMembers: async (): Promise<any> => {
    const response = await AxiosRequest.get(GET_TEAMS_URL);
    return response;
  },
  getMemberRole: async (memberId: string): Promise<any> => {
    const response = await AxiosRequest.get(`${GET_TEAM_ROLE_URL}/${memberId}/role`);
    return response;
  }
};
