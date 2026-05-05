import { Campaign, AuthUser } from '@/types';
import { campaignAgent } from '../agent/campaignAgent';
import { campaignPerformanceAgent } from '../agent/campaignPerformanceAgent';

export const campaignService = {
  getFilteredCampaigns: (campaigns: Campaign[], user: AuthUser | null): Campaign[] => {
    if (!user) return [];
    const filtered = campaignAgent.enforceVisibility(campaigns, user);
    return campaignAgent.sanitizePayload(filtered);
  },
  getCampaignsWithMetrics: (campaigns: Campaign[], user: AuthUser | null) => {
    return campaigns.map(campaign => ({
      ...campaign,
      performance: campaignPerformanceAgent.aggregateMetrics(campaign, user)
    }));
  },
  canPerformAction: (campaign: Campaign, user: AuthUser | null, action: 'edit' | 'delete' | 'view'): boolean => {
    if (!user) return false;
    const hasAccess = campaignAgent.validateAccess(campaign, user);
    
    if (action === 'delete') {
      return user.role === 'Owner';
    }
    
    return hasAccess;
  }
};
