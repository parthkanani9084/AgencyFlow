import { Campaign, AuthUser } from '@/types';
import { reportingAgent } from '../agent/reportingAgent';

/**
 * Service Layer: Reporting & Aggregation Logic
 * Responsibility: Provide a clean data source for dashboard reporting 
 * components by coordinating with the AI Agent.
 */
export const reportingService = {
  /**
   * Generates today's campaign report for the logged-in Ads Manager.
   */
  getTodayCampaignReport: (campaigns: Campaign[], user: AuthUser | null) => {
    if (!user || (user.role !== 'Ads Manager' && user.role !== 'Owner' && user.role !== 'Manager' && user.role !== 'Social Media Manager')) {
      return null;
    }

    // 1. Validate data via AI Agent (secondary layer)
    campaigns.forEach(c => reportingAgent.validateReportingContext(c));

    // 2. Aggregate metrics via AI Agent
    return reportingAgent.aggregateTodayPerformance(campaigns, user);
  },

  /**
   * Returns a status-based summary for UI badges.
   */
  getReportingStatus: (updated: number, total: number) => {
    if (total === 0) return 'no_campaigns';
    if (updated === total) return 'all_updated';
    if (updated > 0) return 'partially_updated';
    return 'pending';
  }
};
