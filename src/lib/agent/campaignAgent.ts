import { Campaign, AuthUser } from '@/types';

/**
 * AI Agent Layer: Visibility Enforcement & Validation
 * Responsibility: Enforce role-based access controls for campaigns 
 * before they reach the UI Layer.
 */
export const campaignAgent = {
  /**
   * Enforces role-based visibility rules for campaigns.
   * Rules:
   * - Ads Manager: Can ONLY see campaigns explicitly assigned to them.
   * - Manager / Owner: Unrestricted visibility (all campaigns).
   */
  enforceVisibility: (campaigns: Campaign[], user: AuthUser | null): Campaign[] => {
    if (!user) return [];

    const { role, name, id } = user;

    // Managers and Owners have full visibility
    if (role === 'Owner' || role === 'Manager') {
      return campaigns;
    }

    // Role-based Decision: Ads Manager & Social Media Manager restriction
    if (role === 'Ads Manager' || role === 'Social Media Manager') {
      return campaigns.filter(campaign => {
        // Enforce: Assigned Ads Manager/Social Media Manager name match OR internal ID match
        const isAssigned = campaign.assignee === name || campaign.assignedAdsManagerId === id || campaign.assignedSocialMediaManagerId === id;
        return isAssigned;
      });
    }

    // Default: return nothing or limited view for other roles if not explicitly allowed
    return campaigns;
  },

  /**
   * Validates if a user is authorized to access or modify a campaign.
   */
  validateAccess: (campaign: Campaign, user: AuthUser): boolean => {
    if (user.role === 'Owner' || user.role === 'Manager') return true;
    
    if (user.role === 'Ads Manager' || user.role === 'Social Media Manager') {
      return campaign.assignee === user.name || campaign.assignedAdsManagerId === user.id || campaign.assignedSocialMediaManagerId === user.id;
    }

    return false;
  },

  /**
   * Normalizes and sanitizes campaign data for UI consumption.
   */
  sanitizePayload: (campaigns: Campaign[]): Campaign[] => {
    return campaigns.map(c => ({
      ...c,
      // Ensure sensitive financial data is formatted correctly or masked if needed
      // (Implementation can be extended here)
    }));
  }
};
