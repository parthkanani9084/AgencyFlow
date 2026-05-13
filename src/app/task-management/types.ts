import { TaskRole, TaskStatus } from '@/types';

export interface TaskForm {
  title: string;
  assignedTo: string;
  role: TaskRole;
  client: string;
  deadline: string;
  status: TaskStatus;
  description: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}
