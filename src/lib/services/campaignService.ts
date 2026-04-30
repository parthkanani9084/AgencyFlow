import { Campaign, AuthUser } from '@/types';
import { campaignAgent } from '../agent/campaignAgent';
import { campaignPerformanceAgent } from '../agent/campaignPerformanceAgent';

/**
 * Service Layer: Campaign Filtering & RBAC Logic
 * Responsibility: Bridge between the data layer and UI, coordinating 
 * with the AI Agent for visibility enforcement.
 */
export const campaignService = {
  /**
   * Fetches and filters campaigns based on the authenticated user's role.
   */
  getFilteredCampaigns: (campaigns: Campaign[], user: AuthUser | null): Campaign[] => {
    if (!user) return [];

    // 1. Filter campaigns via AI Agent based on RBAC rules
    const filtered = campaignAgent.enforceVisibility(campaigns, user);
    
    // 2. Normalize and sanitize data for the UI
    return campaignAgent.sanitizePayload(filtered);
  },

  /**
   * Aggregates performance metrics for campaigns based on user role.
   */
  getCampaignsWithMetrics: (campaigns: Campaign[], user: AuthUser | null) => {
    return campaigns.map(campaign => ({
      ...campaign,
      performance: campaignPerformanceAgent.aggregateMetrics(campaign, user)
    }));
  },

  /**
   * Validates access for sensitive campaign operations.
   */
  canPerformAction: (campaign: Campaign, user: AuthUser | null, action: 'edit' | 'delete' | 'view'): boolean => {
    if (!user) return false;
    
    // AI Agent Layer handles the actual validation logic
    const hasAccess = campaignAgent.validateAccess(campaign, user);
    
    if (action === 'delete') {
      return user.role === 'Owner'; // Only owners can delete
    }
    
    return hasAccess;
  }
};
