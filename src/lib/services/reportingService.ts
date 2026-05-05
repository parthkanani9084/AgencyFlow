import { Campaign, AuthUser } from '@/types';
import { reportingAgent } from '../agent/reportingAgent';
export const reportingService = {

  getTodayCampaignReport: (campaigns: Campaign[], user: AuthUser | null) => {
    if (!user || (user.role !== 'Ads Manager' && user.role !== 'Owner' && user.role !== 'Manager' && user.role !== 'Social Media Manager')) {
      return null;
    }
    campaigns.forEach(c => reportingAgent.validateReportingContext(c));
    return reportingAgent.aggregateTodayPerformance(campaigns, user);
  },

  getReportingStatus: (updated: number, total: number) => {
    if (total === 0) return 'no_campaigns';
    if (updated === total) return 'all_updated';
    if (updated > 0) return 'partially_updated';
    return 'pending';
  }
};
