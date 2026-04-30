import { Task, TaskStatus, AuthUser } from '@/types';

/**
 * AI Agent Layer: Unified Task Workflow Logic
 * Responsibility: Enforce strict 3-state lifecycle, handle role normalization,
 * and validate completion requirements across all organisational roles.
 */
export const taskWorkflowAgent = {
  /**
   * Only 3 statuses allowed globally.
   */
  getAllowedStatuses: (): TaskStatus[] => {
    return ['pending', 'in_progress', 'completed'];
  },

  /**
   * Backward compatibility alias.
   */
  getManagerAllowedStatuses: (): TaskStatus[] => {
    return taskWorkflowAgent.getAllowedStatuses();
  },

  /**
   * Normalizes the status update. 
   * If any role selects 'completed', they MUST go through the modal.
   */
  determineNextStatus: (currentTask: Task, targetStatus: TaskStatus, user: AuthUser | null) => {
    if (!user) return targetStatus;

    // Standardize to only 3 statuses
    const allowed = taskWorkflowAgent.getAllowedStatuses();
    if (!allowed.includes(targetStatus)) {
      console.warn(`[Agent] Standardizing restricted status ${targetStatus} to 'pending'`);
      return 'pending';
    }

    return targetStatus;
  },

  /**
   * Validates completion metadata. 
   * Mandates notes for ALL roles.
   */
  validateCompletion: (notes?: string) => {
    if (!notes || notes.trim().length < 5) {
      throw new Error('Completion notes are mandatory for all roles (min 5 characters).');
    }
    return true;
  }
};
