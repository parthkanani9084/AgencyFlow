import { TaskStatus } from '@/types';

export const isTaskOverdue = (deadline: string, status: string | TaskStatus) => {
  if (!deadline || deadline === 'N/A' || status === 'completed') return false;
  return new Date(deadline) < new Date();
};

export const formatTaskDeadline = (deadline: string) => {
  if (!deadline || deadline === 'N/A') return 'N/A';
  return new Date(deadline).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

export const getTaskDaysLeft = (deadline: string) => {
  if (!deadline || deadline === 'N/A') return 0;
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
};
