import AxiosRequest from '@/utils/axiosHelper';
import { CREATE_TEAM_URL, GET_TEAM_ROLE_URL, GET_TEAMS_URL } from '@/api/endpoints';

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

export interface UpdateTeamPayload {
  full_name?: string;
  role?: string;
}

export interface UpdateTeamResponse {
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

export interface GetTeamsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetTeamsResponse {
  success: boolean;
  code: number;
  message: string;
  results: {
    data: TeamMemberData[];
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
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
    const response = await AxiosRequest.post(CREATE_TEAM_URL, payload);
    return response;
  },
  getTeams: async (params: GetTeamsParams): Promise<GetTeamsResponse> => {
    const response = await AxiosRequest.get(GET_TEAMS_URL, params);
    return response;
  },
  getTeamMembers: async (): Promise<any> => {
    const response = await AxiosRequest.get(GET_TEAMS_URL);
    return response;
  },
  updateTeam: async (teamId: string, payload: UpdateTeamPayload): Promise<UpdateTeamResponse> => {
    const response = await AxiosRequest.request({
      url: `${GET_TEAMS_URL}/${teamId}`,
      method: 'put',
      data: payload
    });
    return response;
  },
  deleteTeamMember: async (teamId: string): Promise<any> => {
    const response = await AxiosRequest.delete(`${GET_TEAMS_URL}/${teamId}`);
    return response;
  },
  getMemberRole: async (memberId: string): Promise<any> => {
    const response = await AxiosRequest.get(`${GET_TEAM_ROLE_URL}/${memberId}/role`);
    return response;
  },
  getTeamRole: async (memberId: string): Promise<GetTeamRoleResponse> => {
    const response = await AxiosRequest.get(`${GET_TEAM_ROLE_URL}/${memberId}/role`);
    return response;
  },
  getTeamsByRole: async (role: string): Promise<any> => {
    const response = await AxiosRequest.get(`${GET_TEAMS_URL}/role/${role}`);
    return response;
  }
};
