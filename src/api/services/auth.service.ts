import AxiosRequest from '@/utils/axiosHelper';
import { LOGIN_URL } from '@/api/endpoints';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  code: number;
  message: string;
  results: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      full_name: string;
      email: string;
      role: string;
    };
  };
}

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await AxiosRequest.post(LOGIN_URL, payload);
    return response;
  },
};
