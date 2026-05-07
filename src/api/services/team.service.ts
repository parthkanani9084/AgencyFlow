import AxiosRequest from '@/utils/axiosHelper';
import { TEAM_CREATE_URL, TEAM_LIST_URL, TEAM_ROLE_URL } from '@/lib/endpoints';

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

export interface TeamMemberData {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface GetTeamsResponse {
  success: boolean;
  code: number;
  message: string;
  results: {
    data: TeamMemberData[];
  };
}

export interface GetTeamRoleResponse {
  success: boolean;
  code: number;
  message: string;
  results: {
    role: string;
  };
}

export const teamService = {
  createTeam: async (payload: CreateTeamPayload): Promise<CreateTeamResponse> => {
    const response = await AxiosRequest.post(TEAM_CREATE_URL, payload);
    return response;
  },
  getTeams: async (): Promise<GetTeamsResponse> => {
    const response = await AxiosRequest.get(TEAM_LIST_URL);
    return response;
  },
  getTeamRole: async (id: string): Promise<GetTeamRoleResponse> => {
    const response = await AxiosRequest.get(TEAM_ROLE_URL(id));
    return response;
  },
};
