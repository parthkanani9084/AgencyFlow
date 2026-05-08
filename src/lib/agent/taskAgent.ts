import { Task, AuthUser } from '@/types';

export const taskAgent = {
  enforceVisibility: (tasks: Task[], user: AuthUser | null): Task[] => {
    if (!user) return [];
    
    const role = user.role;
    if (role === 'Owner' || role === 'Manager') {
      return tasks;
    }
    return tasks.filter(task => {
      const isAssignedToUser = task.assignedTo === user.name || (task as any).assignedToUserId === user.id;
      const isAssignedToRole = task.role === role;
      

      return isAssignedToUser || isAssignedToRole;
    });
  },
  getUIControlFlags: (user: AuthUser | null) => {
    if (!user) return { showOnlyMyTasks: false, hideOtherTabs: false };
    
    const isRestrictedRole = ['Shooter', 'Editor', 'Ads Manager', 'Social Media Manager'].includes(user.role);
    
    return {
      showOnlyMyTasks: isRestrictedRole,
      hideOtherTabs: isRestrictedRole
    };
  },
  shapeTaskDataForUI: (tasks: Task[]): Partial<Task>[] => {
    return tasks.map(task => {
      const { campaign, ...uiTask } = task;
      return uiTask;
    });
  },
  validateOwnership: (task: Task, user: AuthUser): boolean => {
    if (user.role === 'Owner' || user.role === 'Manager') return true;
    
    const isOwner = task.assignedTo === user.name || (task as any).assignedToUserId === user.id || task.role === user.role;
    if (!isOwner) {
      return false;
    }
    return true;
  }
};
