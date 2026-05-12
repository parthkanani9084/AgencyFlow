import { useMutation, useQuery } from '@tanstack/react-query';
import { taskService, CreateTaskPayload, GetTasksParams } from '../services/task.service';
import { QUERY_KEYS } from '../queryKeys';

export const useCreateTask = () => {
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => taskService.createTask(payload),
  });
};

export const useGetTasks = (params: GetTasksParams, options?: any) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TASKS, params],
    queryFn: () => taskService.getTasks(params),
    ...options,
  });
};

export const useGetTasksHistory = (params: GetTasksParams, options?: any) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TASKS, 'history', params],
    queryFn: () => taskService.getTasksHistory(params),
    ...options,
  });
};

export const useUpdateTaskStatus = () => {
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) => 
      taskService.updateTaskStatus(taskId, status),
  });
};

export const useUpdateTask = () => {
  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: any }) => 
      taskService.updateTask(taskId, payload),
  });
};

export const useDeleteTask = () => {
  return useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),
  });
};

export const useAssignTask = () => {
  return useMutation({
    mutationFn: ({ taskId, assignedTo, notes }: { taskId: string; assignedTo: string; notes: string }) => 
      taskService.assignTask(taskId, assignedTo, notes),
  });
};

export const useCompleteTask = () => {
  return useMutation({
    mutationFn: ({ taskId, notes, screenshot, assignedTo }: { taskId: string; notes: string; screenshot?: string | File; assignedTo?: string }) => 
      taskService.completeTask(taskId, notes, screenshot, assignedTo),
  });
};
