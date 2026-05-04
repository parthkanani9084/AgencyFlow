import { Task, AuthUser, TaskStatus, ActivityLog, TaskNote } from '@/types';
import { taskAgent } from '../agent/taskAgent';
import { taskWorkflowAgent } from '../agent/taskWorkflowAgent';

/**
 * Service Layer: Standardized Task Engine
 * Responsibility: Atomic status transitions (3-state only), unified completion metadata, and audit logging.
 */
export const taskService = {
  /**
   * Performs an atomic status update.
   * Enforces mandatory notes for 'completed' status across ALL roles.
   */
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

    // 1. Standardize & Validate Status
    const nextStatus = taskWorkflowAgent.determineNextStatus(task, requestedStatus, user);
    
    if (nextStatus === 'completed') {
      taskWorkflowAgent.validateCompletion(notes);
    }

    // 2. Normalize Metadata & Handoff Logic
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
        notes: notes, // Legacy field support
        screenshot: screenshot || task.screenshot
      };

      // Handle Automatic Handoff if next role member is provided
      if (nextRoleMember) {
        roleUpdates = {
          ...roleUpdates,
          status: 'pending', // Reset for next person
          assignedTo: nextRoleMember.name,
          role: nextRoleMember.role as any,
          forwardedBy: user.name
        };
      }
    }

    // 3. Create Audit Log
    const log: ActivityLog = {
      id: `task-log-${Date.now()}`,
      status: nextStatus,
      userId: user.id,
      role: user.role,
      timestamp: timestamp,
      note: notes || (nextStatus === 'completed' ? 'Task completed/handed off' : undefined)
    };

    // 4. Atomic State Update
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

  /**
   * RBAC Visibility.
   */
  getFilteredTasks: (tasks: Task[], user: AuthUser | null) => {
    if (!user) return { tasks: [], uiFlags: {} };
    return {
      tasks: taskAgent.enforceVisibility(tasks, user),
      uiFlags: taskAgent.getUIControlFlags(user)
    };
  }
};
