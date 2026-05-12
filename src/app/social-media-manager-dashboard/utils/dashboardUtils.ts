import { Task, TaskStatus, Reel, AuthUser } from '@/types';
import { STATIC_STRINGS, ROLES, REEL_STATUS_MAP, COMMON_STATUS } from '@/utils/constants';

export const transformReelsToTasks = (reels: Reel[], user: AuthUser | null): Task[] => {
  if (!user) return [];

  return reels
    .filter((reel) => {
      const date = reel.publishDate;
      const hasValidDate = !!date && !isNaN(Date.parse(date));
      const canSeeAll =
        user.role === ROLES.OWNER ||
        user.role === ROLES.MANAGER ||
        user.role === ROLES.SOCIAL_MEDIA_MANAGER;
      
      const clientName = reel.client?.brandName || reel.clientName;
      const isClientForThisReel = user.role === ROLES.CLIENT && clientName === user.name;
      const isAssigned = reel.assignedToUserId === user.id;

      return (
        hasValidDate &&
        (canSeeAll || isClientForThisReel || isAssigned || !reel.assignedToUserId)
      );
    })
    .map((reel) => {
      const date = reel.publishDate || new Date().toISOString();
      const clientName = reel.client?.brandName || reel.clientName || STATIC_STRINGS.NOT_AVAILABLE;

      let taskStatus: TaskStatus = COMMON_STATUS.PENDING as TaskStatus;
      const rawStatus = reel.status?.toLowerCase();
      
      if (rawStatus === REEL_STATUS_MAP.completed) taskStatus = COMMON_STATUS.COMPLETED as TaskStatus;
      else if (rawStatus === REEL_STATUS_MAP.in_progress) taskStatus = 'in_progress';
      else if (rawStatus === REEL_STATUS_MAP.pending) taskStatus = COMMON_STATUS.PENDING as TaskStatus;

      return {
        id: reel.id,
        title: reel.title,
        assignedTo: user.name,
        role: ROLES.SOCIAL_MEDIA_MANAGER,
        client: 'AgencyFlow',
        campaign: 'Social Media Strategy',
        campaignId: reel.clientId || reel.campaignId,
        deadline: date,
        status: taskStatus,
        priority: 'medium',
        type: 'REEL',
        scheduledDate: date,
        clientName: clientName,
      } as Task;
    })
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
};

export const groupTasksByDate = (tasks: Task[]): { date: string; reels: Task[] }[] => {
  const groups: Record<string, Task[]> = {};

  tasks.forEach((task) => {
    const date = new Date(task.deadline).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(task);
  });

  return Object.entries(groups).map(([date, reels]) => ({
    date,
    reels: reels.sort((a, b) => a.title.localeCompare(b.title)),
  }));
};
