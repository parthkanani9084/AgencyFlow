import { STATIC_STRINGS } from '@/utils/constants';
import { Campaign, Platform } from './types';

export const mapCampaignData = (c: any): Campaign => {
  const assigneeName = c.assignee?.fullName || 'Unassigned';
  const rawPlatforms: string[] = c.adsPlatform || [];
  
  const platform = (() => {
    if (rawPlatforms.length > 1) return 'Multi';
    const first = rawPlatforms[0];
    if (!first) return 'Meta';
    const options = ['Meta', 'Facebook', 'Instagram', 'Google', 'TikTok', 'LinkedIn', 'Multi'] as const;
    return options.find((opt) => opt.toLowerCase() === first.toLowerCase()) ?? (first as Platform);
  })();

  return {
    id: c.id,
    name: c.campaignName,
    client: c.client?.clientName,
    clientId: c.clientId || c.client?.id || '',
    status: c.status === 'pause' ? 'paused' : c.status,
    stage: c.stage === 'in-draft' ? 'in draft' : c.stage,
    assignee: assigneeName,
    assigneeId: c.assignedTo || c.assignee?.id || '',
    assigneeInitials: assigneeName
      .split(' ')
      .map((n: string) => n.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    deadline: c.deadlineDate
      ? new Intl.DateTimeFormat('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: '2-digit',
        }).format(new Date(c.deadlineDate))
      : '-',
    spend: `${STATIC_STRINGS.CURRENCY_SYMBOL}${Number(c.performance?.total_ads_spend || 0).toLocaleString()}`,
    budget: `$${Number(c.dailyBudget ?? 0).toLocaleString()}`,
    leads: Number(c.performance?.total_ads_leads || 0),
    roas: Number(c.performance?.latest_ads_roas || 0),
    platform: platform as Platform,
    platforms: rawPlatforms,
    createdAt: c.createdAt,
    performanceHistory: c.performanceHistory || [],
  };
};

export const isDeadlineCritical = (deadline: string) => {
  const d = new Date(deadline);
  const now = new Date('2026-04-09');
  const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 3;
};
