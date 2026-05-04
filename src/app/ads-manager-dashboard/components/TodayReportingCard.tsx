'use client';

import React, { useMemo } from 'react';
import { TrendingUp, DollarSign, Target } from 'lucide-react';
import { AuthUser, Campaign } from '@/types';
import { STATIC_STRINGS, PAGE_ROLES } from '@/utils/constants';

interface TodayReportingCardProps {
  user: AuthUser | null;
  campaigns: Campaign[];
}

export default function TodayReportingCard({ user, campaigns }: TodayReportingCardProps) {
  const reportData = useMemo(() => {
    if (!user || !(PAGE_ROLES.ADS_TRACKING as readonly string[]).includes(user.role)) {
      return null;
    }

    const todayDate = new Date().toISOString().split('T')[0];
    
    const userCampaigns = campaigns.filter(campaign => 
      campaign.assignee === user.name || campaign.assignedAdsManagerId === user.id
    );
    const updatedCampaigns = userCampaigns.filter(campaign => 
      campaign.performanceHistory?.some(log => log.date === todayDate)
    );

    const metrics = updatedCampaigns.reduce((totals, campaign) => {
      const todayLog = campaign.performanceHistory?.find(log => log.date === todayDate);
      if (todayLog) {
        totals.spent += todayLog.addedSpend || 0;
        totals.leads += todayLog.addedLeads || 0;
      }
      return totals;
    }, { spent: 0, leads: 0 });

    return {
      totalCampaigns: userCampaigns.length,
      updatedCount: updatedCampaigns.length,
      pendingCount: userCampaigns.length - updatedCampaigns.length,
      metrics: {
        ...metrics,
        roas: metrics.spent > 0 ? (metrics.leads * 10) / metrics.spent : 0
      }
    };
  }, [campaigns, user]);

  if (!reportData) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <header className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-violet-600" />
          <h3 className="text-[13.5px] font-bold text-slate-800 uppercase">
            {STATIC_STRINGS.ADS_REPORT_TITLE}
          </h3>
        </div>
      </header>
      
      <main className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Spend Metric Card */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 transition-all hover:border-violet-200 group">
            <div className="flex items-center gap-2 mb-1.5 text-slate-500">
              <DollarSign size={14} className="group-hover:text-violet-500 transition-colors" />
              <span className="text-[11px] font-bold uppercase tracking-widest">
                {STATIC_STRINGS.ADS_REPORT_TOTAL_SPEND}
              </span>
            </div>
            <p className="text-[18px] font-black text-slate-900">
              ₹{reportData.metrics.spent.toLocaleString()}
            </p>
          </div>

          {/* Leads Metric Card */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 transition-all hover:border-pink-200 group">
            <div className="flex items-center gap-2 mb-1.5 text-slate-500">
              <Target size={14} className="group-hover:text-pink-500 transition-colors" />
              <span className="text-[11px] font-bold uppercase tracking-widest">
                {STATIC_STRINGS.ADS_REPORT_LEADS_GENERATED}
              </span>
            </div>
            <p className="text-[18px] font-black text-slate-900">
              {reportData.metrics.leads}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
