import AxiosRequest from '@/utils/axiosHelper';
import { CREATE_TASK_URL, GET_TASKS_URL } from '@/lib/endpoints';

export interface CreateTaskPayload {
  task_title: string;
  description: string;
  assigned_to: string;
  client_id: string;
  deadline_date: string;
}

export interface CreateTaskResponse {
  success: boolean;
  code: number;
  message: string;
  results?: any;
}

export interface GetTasksParams {
  page: number;
  limit: number;
  status?: string;
  search?: string;
}

export interface UpdateTaskPayload {
  status?: string;
  deadline_date?: string;
  task_title?: string;
  description?: string;
  assigned_to?: string;
  client_id?: string;
}

export const taskService = {
  createTask: async (payload: CreateTaskPayload): Promise<CreateTaskResponse> => {
    const response = await AxiosRequest.post(CREATE_TASK_URL, payload);
    return response;
  },
  getTasks: async (params: GetTasksParams): Promise<any> => {
    const response = await AxiosRequest.get(GET_TASKS_URL, params);
    return response;
  },
  updateTask: async (taskId: string, payload: UpdateTaskPayload): Promise<any> => {
    const response = await AxiosRequest.request({
      url: `${GET_TASKS_URL}/${taskId}`,
      method: 'put',
      data: payload
    });
    return response;
  },
  deleteTask: async (taskId: string): Promise<any> => {
    const response = await AxiosRequest.delete(`${GET_TASKS_URL}/${taskId}`);
    return response;
  },
};
