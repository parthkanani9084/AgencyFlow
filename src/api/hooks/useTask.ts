import { useMutation, useQuery } from '@tanstack/react-query';
import { taskService, CreateTaskPayload, GetTasksParams } from '../services/task.service';

export const useCreateTask = () => {
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => taskService.createTask(payload),
  });
};

export const useGetTasks = (params: GetTasksParams) => {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => taskService.getTasks(params),
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
