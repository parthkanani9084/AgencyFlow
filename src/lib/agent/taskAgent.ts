import { Task, AuthUser } from '@/types';

/**
 * AI Agent Layer: Visibility Enforcement & Validation
 * Responsibility: Enforce role-based access controls and mask sensitive data 
 * before it reaches the UI Layer.
 */
export const taskAgent = {
  /**
   * Enforces role-based visibility rules for tasks.
   * Rules:
   * - Shooter/Editor/Ads Manager: See only their own assigned tasks or tasks matching their role.
   * - Manager/Owner: See all tasks.
   */
  enforceVisibility: (tasks: Task[], user: AuthUser | null): Task[] => {
    if (!user) return [];
    
    const role = user.role;
    
    // Managers and Owners have unrestricted visibility
    if (role === 'Owner' || role === 'Manager') {
      return tasks;
    }

    // Restricted roles visibility logic
    return tasks.filter(task => {
      const isAssignedToUser = task.assignedTo === user.name || (task as any).assignedToUserId === user.id;
      const isAssignedToRole = task.role === role;
      
      // AI Agent Decision: Valid access if assigned to individual OR specifically to their functional role
      return isAssignedToUser || isAssignedToRole;
    });
  },

  /**
   * Generates UI control flags based on role-based visibility rules.
   * Helps the UI Layer determine which tabs/filters to show or hide.
   */
  getUIControlFlags: (user: AuthUser | null) => {
    if (!user) return { showOnlyMyTasks: false, hideOtherTabs: false };
    
    const isRestrictedRole = ['Shooter', 'Editor', 'Ads Manager', 'Social Media Manager'].includes(user.role);
    
    return {
      showOnlyMyTasks: isRestrictedRole,
      hideOtherTabs: isRestrictedRole
    };
  },

  /**
   * Transforms task payload for the UI context (e.g. masking campaign info).
   * Retains internal campaignId for linkage.
   */
  shapeTaskDataForUI: (tasks: Task[]): Partial<Task>[] => {
    return tasks.map(task => {
      // Stripping display fields per minimal data exposure principle
      const { campaign, ...uiTask } = task;
      return uiTask;
    });
  },

  /**
   * Validates that the task payload is sanitized and assigned correctly.
   */
  validateOwnership: (task: Task, user: AuthUser): boolean => {
    if (user.role === 'Owner' || user.role === 'Manager') return true;
    
    const isOwner = task.assignedTo === user.name || (task as any).assignedToUserId === user.id || task.role === user.role;
    if (!isOwner) {
      console.error(`[Agent] Unauthorized access attempt: User ${user.id} accessing task ${task.id}`);
      return false;
    }
    return true;
  }
};
