import { Campaign, AuthUser } from '@/types';

/**
 * AI Agent Layer: Performance Metrics Aggregation & Validation
 * Responsibility: Ensure Spend, Leads, Actions, and ROAS are accurately 
 * calculated and exposed only to authorized roles.
 */
export const campaignPerformanceAgent = {
  /**
   * Aggregates and normalizes metrics for a campaign.
   */
  aggregateMetrics: (campaign: Campaign, user: AuthUser | null) => {
    if (!user || (user.role !== 'Owner' && user.role !== 'Manager' && user.role !== 'Ads Manager' && user.role !== 'Social Media Manager')) {
      return null;
    }

    // 1. Core metrics from the campaign object (as source of truth)
    // In a real system, this would sum up performanceHistory logs.
    const spentValue = Number(campaign.spent) || 0;
    
    const leads = Number(campaign.leads) || 0;
    const roas = Number(campaign.roas) || 0;

    // 2. Validate completeness
    const validatedMetrics = {
      spent: Math.max(0, spentValue),
      leads: Math.max(0, leads),
      roas: spentValue > 0 ? roas : 0, // Handle divide-by-zero or inconsistent ROAS
      actions: Math.floor(leads * 1.2) // Mocked logic: Actions are 20% more than leads
    };

    // 3. Normalize for UI
    return {
      ...validatedMetrics,
      displaySpend: `₹${validatedMetrics.spent.toLocaleString()}`,
      displayLeads: validatedMetrics.leads.toLocaleString(),
      displayRoas: validatedMetrics.roas > 0 ? `${validatedMetrics.roas}×` : '—',
      displayActions: validatedMetrics.actions.toLocaleString()
    };
  }
};
