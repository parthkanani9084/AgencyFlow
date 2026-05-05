import { Campaign, AuthUser } from '@/types';

export const reportingAgent = {

  aggregateTodayPerformance: (campaigns: Campaign[], user: AuthUser | null) => {
    if (!user) return null;

    const todayStr = new Date().toISOString().split('T')[0];
    
    const assignedCampaigns = campaigns.filter(c => 
      c.assignee === user.name || c.assignedAdsManagerId === user.id
    );
    const updatedToday = assignedCampaigns.filter(c => 
      c.performanceHistory?.some(log => log.date === todayStr)
    );

    const pendingToday = assignedCampaigns.length - updatedToday.length;
    const todayMetrics = updatedToday.reduce((acc, c) => {
      const todayLog = c.performanceHistory?.find(log => log.date === todayStr);
      if (todayLog) {
        acc.spent += todayLog.addedSpend || 0;
        acc.leads += todayLog.addedLeads || 0;
      }
      return acc;
    }, { spent: 0, leads: 0 });
    return {
      totalCampaigns: assignedCampaigns.length,
      updatedToday: updatedToday.length,
      pendingToday: pendingToday,
      metrics: {
        spent: todayMetrics.spent,
        leads: todayMetrics.leads,
        roas: todayMetrics.spent > 0 ? (todayMetrics.leads * 10) / todayMetrics.spent : 0 
      }
    };
  },
  validateReportingContext: (campaign: Campaign): boolean => {
    return !!campaign.id && !!campaign.assignee;
  }
};
