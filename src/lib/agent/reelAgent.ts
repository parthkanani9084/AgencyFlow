import { Reel, Task, AuthUser } from '@/types';

/**
 * AI Agent Layer: Reel Transformation & Validation
 * Responsibility: Transform reel data into task-compatible UI format
 * and ensure all business rules are enforced.
 */
export const reelAgent = {
  /**
   * Transforms a list of Reels into UI-compatible Task format.
   * Ensures scheduledDate is present and valid.
   */
  transformToTasks: (reels: Reel[], user: AuthUser | null): Task[] => {
    if (!user) return [];

    return reels
      .filter(reel => {
        // Validation: Must have a valid scheduled date
        const hasValidDate = !!reel.scheduledDate && !isNaN(Date.parse(reel.scheduledDate));
 
        const canSeeAll = user.role === 'Owner' || user.role === 'Manager' || user.role === 'Social Media Manager';
        const isClientForThisReel = user.role === 'Client' && (reel.clientName === user.name);
        const isAssigned = reel.assignedToUserId === user.id;
        
        return hasValidDate && (canSeeAll || isClientForThisReel || isAssigned);
      })
      .map(reel => {
        // AI Agent Decision: Map Reel fields to Task interface for UI reuse
        const task: Task = {
          id: reel.id,
          title: reel.title,
          assignedTo: user.name,
          role: 'Social Media Manager',
          client: 'AgencyFlow', // Fallback or fetch from campaign context
          campaign: 'Social Media Strategy', // Fallback
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

  /**
   * Enriches raw Reel data with campaign and client information.
   * Responsibility: Follow Reel -> Campaign -> Client relation.
   */
  enrichReelData: (reels: Reel[], campaigns: any[]): Reel[] => {
    return reels.map(reel => {
      const campaign = campaigns.find(c => c.id === reel.campaignId);
      return {
        ...reel,
        clientName: campaign ? (campaign.client || campaign.clientName || 'Unknown') : 'Unknown'
      };
    });
  },

  /**
   * Validates input for creating a new reel.
   */
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

  /**
   * Groups transformed tasks (reels) by their scheduled date.
   * Returns a structured array for grouped UI rendering.
   */
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

  /**
   * Validates if a reel entry is valid for the UI.
   */
  validateReel: (reel: Partial<Reel>): boolean => {
    if (!reel.title || !reel.scheduledDate || !reel.assignedToUserId) {
      console.warn('[ReelAgent] Skipping invalid reel entry:', reel.id);
      return false;
    }
    return true;
  }
};
