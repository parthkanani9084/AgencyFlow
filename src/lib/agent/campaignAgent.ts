import { Campaign, AuthUser } from '@/types';

export const campaignAgent = {
  enforceVisibility: (campaigns: Campaign[], user: AuthUser | null): Campaign[] => {
    if (!user) return [];

    const { role, name, id } = user;
    if (role === 'Owner' || role === 'Manager') {
      return campaigns;
    }
    if (role === 'Ads Manager' || role === 'Social Media Manager') {
      return campaigns.filter(campaign => {
        const isAssigned = campaign.assignee === name || campaign.assignedAdsManagerId === id || campaign.assignedSocialMediaManagerId === id;
        return isAssigned;
      });
    }
    return campaigns;
  },
  validateAccess: (campaign: Campaign, user: AuthUser): boolean => {
    if (user.role === 'Owner' || user.role === 'Manager') return true;
    
    if (user.role === 'Ads Manager' || user.role === 'Social Media Manager') {
      return campaign.assignee === user.name || campaign.assignedAdsManagerId === user.id || campaign.assignedSocialMediaManagerId === user.id;
    }

    return false;
  },
  sanitizePayload: (campaigns: Campaign[]): Campaign[] => {
    return campaigns.map(c => ({
      ...c,
    }));
  }
};
