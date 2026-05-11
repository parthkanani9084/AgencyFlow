import AxiosRequest from '@/utils/axiosHelper';
import { CREATE_TASK_URL, GET_TASKS_URL, GET_TASKS_HISTORY_URL } from '@/api/endpoints';

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
  role?: string;
  isHistory?: boolean;
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
    let url = GET_TASKS_URL;
    
    if (params.isHistory) {
      url = GET_TASKS_HISTORY_URL;
      
      if (params.role) {
        params.role = params.role
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      }
    }
    
    const response = await AxiosRequest.get(url, params);
    return response;
  },
  updateTask: async (taskId: string, payload: UpdateTaskPayload): Promise<any> => {
    const response = await AxiosRequest.put(`${GET_TASKS_URL}/${taskId}`, payload);
    return response;
  },
  updateTaskStatus: async (taskId: string, status: 'pending' | 'in_progress' | string): Promise<any> => {
    const response = await AxiosRequest.patch(`${GET_TASKS_URL}/${taskId}/status`, { status });
    return response;
  },
  deleteTask: async (taskId: string): Promise<any> => {
    const response = await AxiosRequest.delete(`${GET_TASKS_URL}/${taskId}`);
    return response;
  },
  assignTask: async (taskId: string, assignedTo: string, notes: string): Promise<any> => {
    const formData = new FormData();
    formData.append('assigned_to', assignedTo);
    formData.append('completion_notes', notes);

    const response = await AxiosRequest.post(`${GET_TASKS_URL}/${taskId}/assign`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response;
  },
  completeTask: async (taskId: string, notes: string, screenshot?: string | File, assignedTo?: string): Promise<any> => {
    const formData = new FormData();
    formData.append('completion_notes', notes);
    
    if (screenshot) {
      formData.append('delivery_screenshot', screenshot);
    }
    
    if (assignedTo) {
      formData.append('assigned_to', assignedTo);
    }

    const response = await AxiosRequest.post(`${GET_TASKS_URL}/${taskId}/complete`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response;
  }
};
