import { Reel, Task, AuthUser } from '@/types';

export const reelAgent = {
  
  transformToTasks: (reels: Reel[], user: AuthUser | null): Task[] => {
    if (!user) return [];

    return reels
      .filter(reel => {
        const hasValidDate = !!reel.scheduledDate && !isNaN(Date.parse(reel.scheduledDate));
        const canSeeAll = user.role === 'Owner' || user.role === 'Manager' || user.role === 'Social Media Manager';
        const isClientForThisReel = user.role === 'Client' && (reel.clientName === user.name);
        const isAssigned = reel.assignedToUserId === user.id;
        
        return hasValidDate && (canSeeAll || isClientForThisReel || isAssigned);
      })
      .map(reel => {
        const task: Task = {
          id: reel.id,
          title: reel.title,
          assignedTo: user.name,
          role: 'Social Media Manager',
          client: 'AgencyFlow',
          campaign: 'Social Media Strategy', 
          campaignId: reel.campaignId,
          deadline: reel.scheduledDate,
          status: reel.status === 'Upload' ? 'completed' : (reel.status === 'Production' ? 'in_progress' : 'pending'),
          priority: 'medium',
          type: 'REEL',
          scheduledDate: reel.scheduledDate,
          clientName: reel.clientName || 'Unknown'
        };
        return task;
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  },

  enrichReelData: (reels: Reel[], campaigns: any[]): Reel[] => {
    return reels.map(reel => {
      const campaign = campaigns.find(c => c.id === reel.campaignId);
      return {
        ...reel,
        clientName: campaign ? (campaign.client || campaign.clientName || 'Unknown') : 'Unknown'
      };
    });
  },

  validateCreation: (data: { title: string; campaignId: string; scheduledDate: string }) => {
    if (!data.title || data.title.trim().length < 3) {
      throw new Error('Title must be at least 3 characters long.');
    }
    if (!data.campaignId) {
      throw new Error('Please select a campaign.');
    }
    if (!data.scheduledDate || isNaN(Date.parse(data.scheduledDate))) {
      throw new Error('A valid scheduled date is required.');
    }
    return true;
  },

  groupReelsByDate: (tasks: Task[]): { date: string; reels: Task[] }[] => {
    const groups: Record<string, Task[]> = {};

    tasks.forEach(task => {
      const date = new Date(task.deadline).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(task);
    });

    return Object.entries(groups).map(([date, reels]) => ({
      date,
      reels: reels.sort((a, b) => a.title.localeCompare(b.title))
    }));
  },
  validateReel: (reel: Partial<Reel>): boolean => {
    if (!reel.title || !reel.scheduledDate || !reel.assignedToUserId) {
      console.warn('[ReelAgent] Skipping invalid reel entry:', reel.id);
      return false;
    }
    return true;
  }
};
