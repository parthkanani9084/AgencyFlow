import { Campaign, AuthUser } from '@/types';

/**
 * AI Agent Layer: Reporting & Insight Generation
 * Responsibility: Aggregate and validate daily performance data 
 * for specific Ads Manager assignments.
 */
export const reportingAgent = {
  /**
   * Aggregates today's performance metrics for a set of campaigns.
   */
  aggregateTodayPerformance: (campaigns: Campaign[], user: AuthUser | null) => {
    if (!user) return null;

    const todayStr = new Date().toISOString().split('T')[0];
    
    // 1. Filter campaigns assigned to this Ads Manager
    const assignedCampaigns = campaigns.filter(c => 
      c.assignee === user.name || c.assignedAdsManagerId === user.id
    );

    // 2. Identify campaigns with logs updated today
    const updatedToday = assignedCampaigns.filter(c => 
      c.performanceHistory?.some(log => log.date === todayStr)
    );

    const pendingToday = assignedCampaigns.length - updatedToday.length;

    // 3. Aggregate total metrics for today's logs
    const todayMetrics = updatedToday.reduce((acc, c) => {
      const todayLog = c.performanceHistory?.find(log => log.date === todayStr);
      if (todayLog) {
        acc.spent += todayLog.addedSpend || 0;
        acc.leads += todayLog.addedLeads || 0;
      }
      return acc;
    }, { spent: 0, leads: 0 });

    // AI Agent Insight: Normalize and validate aggregation result
    return {
      totalCampaigns: assignedCampaigns.length,
      updatedToday: updatedToday.length,
      pendingToday: pendingToday,
      metrics: {
        spent: todayMetrics.spent,
        leads: todayMetrics.leads,
        roas: todayMetrics.spent > 0 ? (todayMetrics.leads * 10) / todayMetrics.spent : 0 // Mock ROAS calc
      }
    };
  },

  /**
   * Validates if a campaign is valid for reporting context.
   */
  validateReportingContext: (campaign: Campaign): boolean => {
    return !!campaign.id && !!campaign.assignee;
  }
};
