import { Campaign, AuthUser } from '@/types';

export const campaignPerformanceAgent = {

  aggregateMetrics: (campaign: Campaign, user: AuthUser | null) => {
    if (!user || (user.role !== 'Owner' && user.role !== 'Manager' && user.role !== 'Ads Manager' && user.role !== 'Social Media Manager')) {
      return null;
    }
    const spentValue = Number(campaign.spent) || 0;
    
    const leads = Number(campaign.leads) || 0;
    const roas = Number(campaign.roas) || 0;
    const validatedMetrics = {
      spent: Math.max(0, spentValue),
      leads: Math.max(0, leads),
      roas: spentValue > 0 ? roas : 0, 
      actions: Math.floor(leads * 1.2) 
    };

    return {
      ...validatedMetrics,
      displaySpend: `₹${validatedMetrics.spent.toLocaleString()}`,
      displayLeads: validatedMetrics.leads.toLocaleString(),
      displayRoas: validatedMetrics.roas > 0 ? `${validatedMetrics.roas}×` : '—',
      displayActions: validatedMetrics.actions.toLocaleString()
    };
  }
};
