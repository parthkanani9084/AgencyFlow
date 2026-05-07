import AxiosRequest from '@/utils/axiosHelper';
import { TEAM_CREATE_URL, TEAM_LIST_URL, TEAM_ROLE_URL } from '@/lib/endpoints';
const TEAM_UPDATE_URL = (id: string) => `/owner/team/${id}`;

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
    try {
      const response = await AxiosRequest.post(TEAM_CREATE_URL, payload);
      return response;
    } catch (error) {
      throw error;
    }
  },
  getTeams: async (params?: GetTeamsParams): Promise<GetTeamsResponse> => {
    try {
      const response = await AxiosRequest.get(TEAM_LIST_URL, params);
      return response;
    } catch (error) {
      throw error;
    }
  },
  getTeamRole: async (id: string): Promise<GetTeamRoleResponse> => {
    try {
      const response = await AxiosRequest.get(TEAM_ROLE_URL(id));
      return response;
    } catch (error) {
      throw error;
    }
  },
  updateTeam: async (teamId: string, payload: UpdateTeamPayload): Promise<UpdateTeamResponse> => {
    try {
      const response = await AxiosRequest.put(TEAM_UPDATE_URL(teamId), payload);
      return response;
    } catch (error) {
      throw error;
    }
  },
  deleteTeamMember: async (teamId: string): Promise<any> => {
    try {
      const response = await AxiosRequest.delete(TEAM_UPDATE_URL(teamId));
      return response;
    } catch (error) {
      throw error;
    }
  },
};
