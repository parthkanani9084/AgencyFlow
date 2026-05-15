import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { taskService, CreateTaskPayload, GetTasksParams } from '../services/task.service';
import { QUERY_KEYS } from '../queryKeys';

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => taskService.createTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASK_HISTORY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACTIVITY_FEEDS] });
    },
  });
};

export const useGetTasks = (params: GetTasksParams, options?: any) => {
  const queryKey = useMemo(() => [QUERY_KEYS.TASKS, params], [params]);
  return useQuery({
    queryKey,
    queryFn: () => taskService.getTasks(params),
    ...options,
  });
};

export const useGetTasksHistory = (params: GetTasksParams, options?: any) => {
  const queryKey = useMemo(() => [QUERY_KEYS.TASK_HISTORY, params], [params]);
  return useQuery<any>({
    queryKey,
    queryFn: () => taskService.getTasksHistory(params),
    ...options,
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) => 
      taskService.updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASK_HISTORY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REPORTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACTIVITY_FEEDS] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: any }) => 
      taskService.updateTask(taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASK_HISTORY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAMS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REPORTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACTIVITY_FEEDS] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASK_HISTORY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACTIVITY_FEEDS] });
    },
  });
};

export const useAssignTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, assignedTo, notes }: { taskId: string; assignedTo: string; notes: string }) => 
      taskService.assignTask(taskId, assignedTo, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASK_HISTORY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAMS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACTIVITY_FEEDS] });
    },
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, notes, screenshot, assignedTo }: { taskId: string; notes: string; screenshot?: string | File; assignedTo?: string }) => 
      taskService.completeTask(taskId, notes, screenshot, assignedTo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASK_HISTORY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REPORTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACTIVITY_FEEDS] });
    },
  });
};
