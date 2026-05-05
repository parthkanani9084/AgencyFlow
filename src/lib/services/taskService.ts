import { Task, AuthUser, TaskStatus, ActivityLog, TaskNote } from '@/types';
import { taskAgent } from '../agent/taskAgent';

export const taskService = {

  updateTaskStatus: (
    tasks: Task[], 
    task: Task, 
    requestedStatus: TaskStatus, 
    user: AuthUser | null,
    notes?: string,
    nextRoleMember?: { name: string; role: string },
    screenshot?: string
  ): { updatedTasks: Task[]; finalStatus: TaskStatus } => {
    if (!user) throw new Error('Authentication required');
    const nextStatus = requestedStatus;
    
    if (nextStatus === 'completed' && (!notes || notes.trim().length < 5)) {
      throw new Error('Completion notes are mandatory for all roles (min 5 characters).');
    }

    let roleUpdates: Partial<Task> = {};
    const timestamp = new Date().toISOString();

    if (nextStatus === 'completed') {
      const completionNote: TaskNote = {
        role: user.role as any,
        message: notes || 'Task finalized.',
        timestamp: timestamp,
        author: user.name
      };

      roleUpdates = {
        roleNotes: [...(task.roleNotes || []), completionNote],
        notes: notes, 
        screenshot: screenshot || task.screenshot
      };
      if (nextRoleMember) {
        roleUpdates = {
          ...roleUpdates,
          status: 'pending',
          assignedTo: nextRoleMember.name,
          role: nextRoleMember.role as any,
          forwardedBy: user.name
        };
      }
    }
    const log: ActivityLog = {
      id: `task-log-${Date.now()}`,
      status: nextStatus,
      userId: user.id,
      role: user.role,
      timestamp: timestamp,
      note: notes || (nextStatus === 'completed' ? 'Task completed/handed off' : undefined)
    };
    const updatedTasks = tasks.map(t => {
      if (t.id === task.id) {
        return {
          ...t,
          ...roleUpdates,
          status: (roleUpdates.status || nextStatus) as TaskStatus,
          activityLogs: [...(t.activityLogs || []), log]
        };
      }
      return t;
    });

    return {
      updatedTasks,
      finalStatus: (roleUpdates.status || nextStatus) as TaskStatus
    };
  },

  getFilteredTasks: (tasks: Task[], user: AuthUser | null) => {
    if (!user) return { tasks: [], uiFlags: {} };
    return {
      tasks: taskAgent.enforceVisibility(tasks, user),
      uiFlags: taskAgent.getUIControlFlags(user)
    };
  }
};
